<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';
	import ExportDataModal from '../modals/ExportDataModal.svelte';
	import ImportDataModal from '../modals/ImportDataModal.svelte';
	import ClearAllModal from '../modals/ClearAllModal.svelte';
	import AddBatchUnitConversionModal from '../modals/AddBatchUnitConversionModal.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import Dropdown from '../common/Dropdown.svelte';
	import { onMount } from 'svelte';
	import { findAllMissingConversionsFromImport } from '$lib/utils/unitSelectUtils';
	import { buildUnitLabels } from '$lib/utils/unitSelectUtils';
	import { mockData } from '$lib/data/mockData';

	let {
		costs = $bindable({}),
		recipes = $bindable({}),
		compoundIngredients = $bindable({}),
		unitConversions = $bindable([]),
		customUnitLabels = $bindable({})
	}: {
		costs: Record<string, IngredientDoc>;
		recipes: Record<string, RecipeDoc>;
		compoundIngredients: Record<string, CompoundIngredientDoc>;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
	} = $props();

	const { openOverlay, closeOverlay, updateOverlay } = getOverlayContext();
	const currencyContext = getCurrencyContext();

	const currencyOptions: { label: string; value: string }[] = [
		'¥',
		'$',
		'€',
		'£',
		'₹',
		'₽',
		'₩',
		'₪',
		'₨',
		'₦',
		'₡',
		'₵',
		'₴',
		'₸',
		'₺',
		'₼',
		'₾',
		'₿'
	].map((symbol) => ({ label: symbol, value: symbol }));

	let currencyDropdownId = $state<string | undefined>(undefined);
	let currencyButtonElement: HTMLElement;

	const openCurrencyDropdown = () => {
		currencyDropdownId = openOverlay(
			Dropdown<string>,
			{
				options: currencyOptions,
				selectOption: (option: { label: string; value: string }) => {
					currencyContext.setCurrency(option.value);
					closeCurrencyDropdown();
				}
			},
			{ transparentBackground: true }
		);
		updateCurrencyDropdown();
	};

	const updateCurrencyDropdown = () => {
		if (!currencyDropdownId) return;
		updateOverlay(
			currencyDropdownId,
			{
				options: currencyOptions,
				selectOption: (option: { label: string; value: string }) => {
					currencyContext.setCurrency(option.value);
					closeCurrencyDropdown();
				}
			},
			{ position: currencyButtonElement.getBoundingClientRect() }
		);
	};

	const closeCurrencyDropdown = () => {
		if (currencyDropdownId) {
			closeOverlay(currencyDropdownId);
			currencyDropdownId = undefined;
		}
	};

	onMount(() => {
		const handleScroll = () => updateCurrencyDropdown();
		const handleResize = () => updateCurrencyDropdown();
		window.addEventListener('scroll', handleScroll, true);
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('scroll', handleScroll, true);
			window.removeEventListener('resize', handleResize);
		};
	});

	const exportData = () => {
		openOverlay(ExportDataModal, {
			data: { costs, recipes, compoundIngredients, unitConversions, customUnitLabels },
			onclose: () => closeOverlay()
		});
	};

	const importData = () => {
		const importModalId = openOverlay(ImportDataModal, {
			onLoad: (d: {
				costs: Record<string, IngredientDoc>;
				recipes: Record<string, RecipeDoc>;
				compoundIngredients?: Record<string, CompoundIngredientDoc>;
				unitConversions?: UnitConversion[];
				customUnitLabels?: Record<string, string>;
			}) => {
				// First, set the imported data temporarily
				const importedCosts = d.costs;
				const importedRecipes = d.recipes;
				const importedCompoundIngredients = d.compoundIngredients || {};
				const importedConversions = d.unitConversions || [];
				const importedCustomUnitLabels = d.customUnitLabels || {};

				// Filter out any recipe ingredients that don't exist
				const allAvailableIds = new Set([
					...Object.keys(importedCosts),
					...Object.keys(importedCompoundIngredients)
				]);

				// Clean up recipes to remove invalid ingredient references
				const cleanedRecipes: Record<string, RecipeDoc> = {};
				for (const [recipeId, recipe] of Object.entries(importedRecipes)) {
					cleanedRecipes[recipeId] = {
						...recipe,
						ingredients: recipe.ingredients.filter((ing) => allAvailableIds.has(ing.id))
					};
				}

				// Check for missing conversions
				const missingConversionsMap = findAllMissingConversionsFromImport(
					importedCosts,
					cleanedRecipes,
					importedCompoundIngredients,
					importedConversions
				);

				if (missingConversionsMap.size > 0) {
					console.log('missing conversions found, importing batch conversions');

					// Show batch conversion modals for each ingredient with missing conversions
					const ingredientEntries = Array.from(missingConversionsMap.entries());
					let currentIndex = 0;

					const showNextConversionModal = () => {
						if (currentIndex >= ingredientEntries.length) {
							// All conversions added, complete the import
							costs = importedCosts;
							recipes = cleanedRecipes;
							compoundIngredients = importedCompoundIngredients;
							unitConversions = importedConversions;
							customUnitLabels = importedCustomUnitLabels;
							// Close the import modal after all conversions are done
							closeOverlay(importModalId);
							console.log('done importing batch conversions');
							return;
						}

						const [ingredientId, { ingredientName, missingConversions }] =
							ingredientEntries[currentIndex];
						const unitLabels = buildUnitLabels(importedCustomUnitLabels);

						const conversionModalId = openOverlay(AddBatchUnitConversionModal, {
							ingredientId,
							ingredientName,
							missingConversions,
							unitLabels,
							recipes: cleanedRecipes,
							onSave: (conversions: UnitConversion[]) => {
								importedConversions.push(...conversions);
								closeOverlay(conversionModalId);
								currentIndex++;
								showNextConversionModal();
							},
							onclose: () => closeOverlay(conversionModalId)
						});
					};

					showNextConversionModal();
				} else {
					console.log('No missing conversions, importing directly');
					// No missing conversions, import directly
					costs = importedCosts;
					recipes = cleanedRecipes;
					compoundIngredients = importedCompoundIngredients;
					unitConversions = importedConversions;
					customUnitLabels = importedCustomUnitLabels;
					// Close the import modal
					closeOverlay(importModalId);
				}
			},
			onclose: () => closeOverlay()
		});
	};

	const clearAllData = () => {
		openOverlay(ClearAllModal, {
			onConfirm: () => {
				costs = {};
				recipes = {};
				compoundIngredients = {};
				unitConversions = [];
				customUnitLabels = {};
			},
			onclose: () => closeOverlay()
		});
	};

	const loadExampleData = () => {
		costs = mockData.costs;
		recipes = mockData.recipes;
		compoundIngredients = mockData.compoundIngredients;
		unitConversions = mockData.unitConversions;
		customUnitLabels = mockData.unitLabels;
	};
</script>

<div class="settings-section">
	<div class="settings-group">
		<h3>Currency</h3>
		<div class="setting-item">
			<span class="setting-label">Currency Symbol</span>
			<button
				class="currency-dropdown-button"
				bind:this={currencyButtonElement}
				onclick={openCurrencyDropdown}
			>
				<span class="currency-value">{currencyContext.currency}</span>
				<i class="fa-solid fa-chevron-down"></i>
			</button>
		</div>
	</div>

	<div class="settings-group">
		<h3>Data Management</h3>
		<div class="settings-actions">
			<ModernButton variant="primary" onclick={exportData}>Export Data</ModernButton>
			<ModernButton variant="secondary" onclick={importData}>Import Data</ModernButton>
			<ModernButton variant="secondary" onclick={loadExampleData}>Load Example Data</ModernButton>
			<ModernButton variant="danger" onclick={clearAllData}>Clear All Data</ModernButton>
		</div>
	</div>
</div>

<style>
	.settings-section {
		display: flex;
		flex-direction: column;
		gap: 32px;
		padding: 24px;
	}

	.settings-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.settings-group h3 {
		margin: 0;
		color: var(--foreground);
		font-weight: 500;
		font-size: 1.1rem;
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.setting-item .setting-label {
		color: var(--secondary-foreground);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.settings-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.currency-dropdown-button {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 12px;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--foreground);
		font-family: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 80px;
		width: fit-content;
	}

	.currency-dropdown-button:hover {
		background: var(--hover);
		border-color: var(--border);
	}

	.currency-value {
		font-weight: 500;
	}

	.currency-dropdown-button i {
		font-size: 0.75rem;
		color: var(--secondary-foreground);
		transition: transform 0.2s ease;
	}
</style>

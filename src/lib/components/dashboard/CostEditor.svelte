<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import IngredientCostGrid from './IngredientCostGrid.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import ExportDataModal from '../modals/ExportDataModal.svelte';
	import ImportDataModal from '../modals/ImportDataModal.svelte';
	import ClearAllModal from '../modals/ClearAllModal.svelte';
	import AddBatchUnitConversionModal from '../modals/AddBatchUnitConversionModal.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import ThemeToggle from '../common/ThemeToggle.svelte';
	import { mockData } from '$lib/data/mockData';
	import RecipeSection from './RecipeSection.svelte';
	import CompoundSection from './CompoundSection.svelte';
	import ConversionsSection from './ConversionsSection.svelte';
	import { findAllMissingConversionsFromImport } from '$lib/utils/unitSelectUtils';
	import { buildUnitLabels } from '$lib/utils/unitSelectUtils';

	type TabId = 'dashboard' | 'conversions';
	let activeTab = $state<TabId>('dashboard');

	let costs = $state<Record<string, IngredientDoc>>(mockData.costs);
	let compoundIngredients = $state<Record<string, CompoundIngredientDoc>>(
		mockData.compoundIngredients
	);
	let recipes = $state<Record<string, RecipeDoc>>(mockData.recipes);
	let customUnitLabels = $state<Record<string, string>>(mockData.unitLabels);
	let unitConversions = $state<UnitConversion[]>(mockData.unitConversions);

	const { openOverlay, closeOverlay } = getOverlayContext();

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
</script>

<div class="cost-editor">
	<div class="editor-header">
		<h2>COSTRA</h2>
		<div class="header-actions">
			<ThemeToggle />
			<ModernButton variant="danger" onclick={clearAllData}>Clear All</ModernButton>
			<ModernButton variant="secondary" onclick={importData}>Import</ModernButton>
			<ModernButton variant="primary" onclick={exportData}>Export</ModernButton>
		</div>
	</div>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'dashboard'}
			onclick={() => (activeTab = 'dashboard')}
		>
			<i class="fa-solid fa-kitchen-set"></i>
			Dashboard
		</button>
		<button
			class="tab"
			class:active={activeTab === 'conversions'}
			onclick={() => (activeTab = 'conversions')}
		>
			<i class="fa-solid fa-scale-balanced"></i>
			Conversions
			{#if unitConversions.length > 0}
				<span class="tab-badge">{unitConversions.length}</span>
			{/if}
		</button>
	</div>

	{#if activeTab === 'dashboard'}
		<div class="content">
			<h2>Recipes</h2>
			<RecipeSection
				bind:recipes
				{costs}
				compounds={compoundIngredients}
				bind:unitConversions
				bind:customUnitLabels
			/>
			<h2>Ingredients</h2>
			<div class="ingredients">
				<CompoundSection
					bind:recipes={compoundIngredients}
					{costs}
					bind:unitConversions
					bind:customUnitLabels
				/>
				<IngredientCostGrid
					bind:costs
					bind:recipes
					bind:compoundIngredients
					bind:customUnitLabels
					bind:unitConversions
				/>
			</div>
		</div>
	{:else if activeTab === 'conversions'}
		<ConversionsSection {costs} {compoundIngredients} bind:unitConversions {customUnitLabels} />
	{/if}
</div>

<style>
	.cost-editor {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 2rem;
		background: var(--bg-secondary);
		border-radius: 12px;
		margin: 1rem;
		border: 1px solid var(--border-primary);
		backdrop-filter: blur(10px);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.editor-header h2 {
		color: var(--text-primary);
		font-weight: 500;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 8px;
	}

	.tabs {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--bg-tertiary);
		border-radius: 10px;
		border: 1px solid var(--border-secondary);
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		background: transparent;
		border: none;
		border-radius: 8px;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.tab:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.tab.active {
		background: var(--bg-primary);
		color: var(--text-primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.tab i {
		font-size: 14px;
	}

	.tab-badge {
		background: var(--accent-primary);
		color: white;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 7px;
		border-radius: 10px;
		min-width: 18px;
		text-align: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex-wrap: wrap;

		h2 {
			margin: 0;
			color: var(--text-primary);
		}
	}

	.ingredients {
		display: flex;
		gap: 16px;
	}
</style>

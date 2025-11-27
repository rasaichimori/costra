<script lang="ts">
	import { volumeUnitLabels, type UnitOption, type VolumeUnit } from '$lib/utils/unit';
	import type { IngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';
	import {
		getRecipesUsingIngredient,
		removeIngredientFromAllRecipes
	} from '$lib/utils/costCalculatorUtils';
	import DeleteIngredientConfirmation from '../modals/DeleteIngredientModal.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import SelectInput from '../common/SelectInput.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { randomLightColorHex } from '$lib/utils/color';
	import UnitSelectButton from './UnitSelectButton.svelte';

	let {
		costs = $bindable(),
		recipes = $bindable({}),
		customUnitLabels = $bindable({}),
		unitConversions = $bindable([])
	}: {
		costs: Record<string, IngredientDoc>;
		recipes?: Record<string, RecipeDoc>;
		customUnitLabels?: Record<string, string>;
		unitConversions?: UnitConversion[];
	} = $props();

	const { openOverlay, closeOverlay } = getOverlayContext();

	let selectedFilters = $state<string[]>([]);
	let newlyCreatedIngredients = $state<Set<string>>(new Set());
	const filteredIngredients = $derived.by(() => {
		const allIds = Object.values(costs).map((d) => d.id);
		let filtered: string[];
		if (selectedFilters.length === 0) {
			filtered = allIds;
		} else {
			filtered = allIds.filter((ingredientId) => {
				const ingredient = costs[ingredientId];
				return ingredient && selectedFilters.includes(ingredient.category);
			});
		}
		return filtered;
	});

	const categories = $derived(
		[...new Set(Object.values(costs).map((d) => d.category))].filter(
			(value) => value !== undefined && value !== ''
		)
	);

	const customUnitOptions = $derived(
		Object.entries(customUnitLabels).map(([id, label]) => ({ label, id }))
	);

	const getCategoryCount = $derived((category: string) => {
		return Object.values(costs).filter((ingredient) => ingredient.category === category).length;
	});

	const toggleFilter = (filterType: string) => {
		if (selectedFilters.includes(filterType)) {
			selectedFilters = selectedFilters.filter((f) => f !== filterType);
		} else {
			selectedFilters = [...selectedFilters, filterType];
		}
	};

	const updateCategory = (ingredientId: string, newCategory: string) => {
		costs[ingredientId] = {
			...costs[ingredientId],
			category: newCategory
		};
	};

	const initiateDeleteIngredient = (ingredientId: string) => {
		const ingredient = costs[ingredientId];
		if (!ingredient) return;

		const recipesUsing = getRecipesUsingIngredient(ingredientId, recipes);

		// If no recipes use this ingredient, delete immediately without modal
		if (recipesUsing.length === 0) {
			deleteIngredient(ingredientId);
			return;
		}

		openOverlay(DeleteIngredientConfirmation, {
			ingredientName: ingredient.name,
			recipesUsing,
			onclose: (confirm: boolean) => {
				if (confirm) {
					recipes = removeIngredientFromAllRecipes(ingredientId, recipes);
					deleteIngredient(ingredientId);
				}
				// Close modal
				closeOverlay();
			}
		});
	};

	const deleteIngredient = (ingredientId: string) => {
		// Remove from costs object
		delete costs[ingredientId];

		// Remove from newly created set if it exists there
		newlyCreatedIngredients.delete(ingredientId);
		newlyCreatedIngredients = newlyCreatedIngredients;
	};

	const addNewIngredient = () => {
		// Generate a unique ID
		const newId = crypto.randomUUID();
		// Find the next sequential number for ingredient name
		const existingIngredients = Object.values(costs);
		const ingredientPattern = /^Ingredient (\d+)$/;
		const existingNumbers = existingIngredients
			.map((ing) => ing.name.match(ingredientPattern)?.[1])
			.filter(Boolean)
			.map(Number)
			.sort((a, b) => a - b);

		let nextNumber = 1;
		for (const num of existingNumbers) {
			if (num === nextNumber) {
				nextNumber++;
			} else {
				break;
			}
		}

		// Create new ingredient with placeholder values
		const newIngredient: IngredientDoc = {
			id: newId,
			name: `Ingredient ${nextNumber}`,
			category: '',
			product: {
				cost: 10,
				amount: 1,
				unit: 'cup'
			},
			color: randomLightColorHex()
		};

		// Add to costs object
		costs[newId] = newIngredient;

		// Mark as newly created so it starts in edit mode
		newlyCreatedIngredients.add(newId);
		newlyCreatedIngredients = newlyCreatedIngredients;
	};
</script>

<div class="ingredient-cost-section">
	<div class="filter-section">
		<h3>Filter by Type:</h3>
		<div class="filter-pills">
			{#each categories as category}
				<ModernButton
					variant={selectedFilters.includes(category) ? 'primary' : 'secondary'}
					size="small"
					onclick={() => toggleFilter(category)}
				>
					{category} ({getCategoryCount(category)})
				</ModernButton>
			{/each}
		</div>
		{#if selectedFilters.length > 0}
			<ModernButton
				variant="danger"
				size="small"
				onclick={() => {
					selectedFilters = [];
				}}
				style="width: fit-content;"
			>
				<i class="fa-solid fa-times"></i>
				Clear all filters
			</ModernButton>
		{/if}
	</div>

	<div class="costs-table-container">
		<table class="costs-table">
			<thead>
				<tr>
					<th class="ingredient-header">Ingredient</th>
					<th class="category-header">Category</th>
					<th class="cost-header">Total Cost (¥)</th>
					<th class="amount-header">Amount</th>
					<th class="unit-header">Unit</th>
					<th class="actions-header">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredIngredients as ingredientId}
					{#if costs[ingredientId]}
						<tr class="cost-row">
							<td class="ingredient-cell">
								<EditableTextField
									bind:value={costs[ingredientId].name}
									isEditing={newlyCreatedIngredients.has(ingredientId)}
									onSave={() => {
										newlyCreatedIngredients.delete(ingredientId);
										newlyCreatedIngredients = newlyCreatedIngredients;
									}}
									onCancel={() => {
										newlyCreatedIngredients.delete(ingredientId);
										newlyCreatedIngredients = newlyCreatedIngredients;
									}}
								/>
							</td>
							<td class="category-cell">
								<SelectInput
									bind:value={costs[ingredientId].category}
									options={categories}
									placeholder="Select category..."
									size="small"
									onchange={(newCategory) => updateCategory(ingredientId, newCategory)}
									searchable={true}
								/>
							</td>
							<td class="cost-cell">
								<div class="cost-input-container">
									<span class="currency">¥</span>
									<TextInput
										bind:value={costs[ingredientId].product.cost}
										size="small"
										variant="inline"
										min={0}
									/>
								</div>
							</td>
							<td class="amount-cell">
								<TextInput
									bind:value={costs[ingredientId].product.amount}
									size="small"
									variant="inline"
									min={0.01}
									step={0.01}
								/>
							</td>
							<td class="unit-cell">
								{volumeUnitLabels[costs[ingredientId].product.unit as VolumeUnit]}
								<!-- <UnitSelectButton
									selectedUnitId={costs[ingredientId].product.unit}
									bind:ingredientDoc={costs[ingredientId]}
									bind:unitConversions
									addNewUnit={(unitOption: UnitOption) => {
										customUnitLabels[unitOption.id] = unitOption.label;
									}}
								/> -->
							</td>
							<td class="actions-cell">
								<ModernButton
									variant="icon"
									size="small"
									ariaLabel="Delete ingredient"
									title="Delete ingredient"
									onclick={() => initiateDeleteIngredient(ingredientId)}
								>
									<i class="fa-solid fa-trash"></i>
								</ModernButton>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
	<ModernButton variant="primary" onclick={addNewIngredient} style="width: fit-content;">
		<i class="fa-solid fa-plus"></i>
		Add Ingredient
	</ModernButton>
</div>

<style>
	.ingredient-cost-section {
		display: flex;
		flex-direction: column;
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid var(--border-primary);
		backdrop-filter: blur(10px);
		gap: 16px;
		flex: 1;
	}
	.filter-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.filter-section h3 {
		margin: 0;
		color: var(--text-primary);
		font-size: 16px;
		font-weight: 500;
	}

	.filter-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.costs-table-container {
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
	}

	.costs-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}

	.costs-table th {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		font-weight: 600;
		padding: 15px 12px;
		text-align: left;
		border-bottom: 1px solid var(--border-secondary);
	}

	.costs-table td {
		padding: 12px;
		border-bottom: 1px solid var(--border-primary);
		vertical-align: middle;
	}

	.costs-table tr:last-child td {
		border-bottom: none;
	}

	.ingredient-header {
		width: 25%;
	}

	.category-header {
		width: 20%;
	}

	.cost-header {
		width: 18%;
	}

	.amount-header {
		width: 15%;
	}

	.unit-header {
		width: 12%;
	}

	.actions-header {
		width: 10%;
		text-align: center;
	}

	.ingredient-cell,
	.category-cell,
	.cost-cell,
	.amount-cell,
	.unit-cell {
		position: relative;
	}

	.actions-cell {
		text-align: center;
	}

	.cost-input-container {
		display: flex;
		align-items: center;
		gap: 4px;
		width: 100%;
	}

	.currency {
		font-weight: 600;
		color: var(--text-primary);
	}

	@media (max-width: 768px) {
		.filter-pills {
			justify-content: center;
		}

		.costs-table-container {
			overflow-x: auto;
		}

		.costs-table {
			min-width: 880px;
		}
	}
</style>

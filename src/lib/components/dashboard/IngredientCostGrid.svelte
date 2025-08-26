<script lang="ts">
	import { units } from '$lib/utils/unit';
	import type { IngredientDoc } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import SelectInput from '../common/SelectInput.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';

	let {
		costs = $bindable()
	}: {
		costs: Record<string, IngredientDoc>;
	} = $props();

	const categories = $derived(
		[...new Set(Object.values(costs).map((d) => d.category))].filter(
			(value) => value !== undefined && value !== ''
		)
	);

	const getCategoryCount = $derived((category: string) => {
		return Object.values(costs).filter((ingredient) => ingredient.category === category).length;
	});

	let selectedFilters = $state<string[]>([]);
	let newlyCreatedIngredients = $state<Set<string>>(new Set());

	const toggleFilter = (filterType: string) => {
		if (selectedFilters.includes(filterType)) {
			selectedFilters = selectedFilters.filter((f) => f !== filterType);
		} else {
			selectedFilters = [...selectedFilters, filterType];
		}
	};

	const clearAllFilters = () => {
		selectedFilters = [];
	};

	const updateCategory = (ingredientId: string, newCategory: string) => {
		costs[ingredientId] = {
			...costs[ingredientId],
			category: newCategory
		};

		// Save to localStorage
		localStorage.setItem('ingredient-costs', JSON.stringify(costs));
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
		const existingIds = Object.keys(costs);
		let newId = `ingredient_${Date.now()}`;
		while (existingIds.includes(newId)) {
			newId = `ingredient_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
		}

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
				cost: 0,
				amount: 1,
				unit: 'cup'
			}
		};

		// Add to costs object
		costs[newId] = newIngredient;

		// Mark as newly created so it starts in edit mode
		newlyCreatedIngredients.add(newId);
		newlyCreatedIngredients = newlyCreatedIngredients;

		// Save to localStorage
		localStorage.setItem('ingredient-costs', JSON.stringify(costs));
	};

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
				onclick={clearAllFilters}
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
										type="number"
										bind:value={costs[ingredientId].product.cost}
										size="small"
										variant="inline"
										min={0}
									/>
								</div>
							</td>
							<td class="amount-cell">
								<TextInput
									type="number"
									bind:value={costs[ingredientId].product.amount}
									size="small"
									variant="inline"
									min={0.01}
									step={0.01}
								/>
							</td>
							<td class="unit-cell">
								<SelectInput
									bind:value={costs[ingredientId].product.unit}
									options={Array.from(units)}
									placeholder="Select unit..."
									size="small"
									searchable={false}
								/>
							</td>
							<td class="actions-cell">
								<ModernButton
									variant="icon"
									size="small"
									ariaLabel="Delete ingredient"
									title="Delete ingredient"
									onclick={() => deleteIngredient(ingredientId)}
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
		background: rgba(255, 255, 255, 0.9);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.08);
		backdrop-filter: blur(10px);
		gap: 16px;
	}
	.filter-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.filter-section h3 {
		margin: 0;
		color: #333333;
		font-size: 16px;
		font-weight: 500;
	}

	.filter-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.costs-table-container {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.costs-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}

	.costs-table th {
		background: rgba(0, 0, 0, 0.05);
		color: #333333;
		font-weight: 600;
		padding: 15px 12px;
		text-align: left;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.costs-table td {
		padding: 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		vertical-align: middle;
	}

	.cost-row:nth-child(even) {
		background: rgba(0, 0, 0, 0.02);
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
		color: #333333;
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

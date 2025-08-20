<script lang="ts">
	import { units } from '$lib/utils/unit';
	import type { IngredientDoc } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import SearchableSelect from '../common/SearchableSelect.svelte';

	let {
		costs = $bindable()
	}: {
		costs: Record<string, IngredientDoc>;
	} = $props();

	const categories = $derived([...new Set(Object.values(costs).map((d) => d.category))]);
	const allCategories = $derived(categories.filter(Boolean)); // Remove empty categories

	let selectedFilters = $state<string[]>([]);
	let editingIngredient = $state<string | null>(null);
	let editingName = $state<string>('');

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

	const startEditing = (ingredientId: string) => {
		editingIngredient = ingredientId;
		editingName = costs[ingredientId].name;
	};

	const cancelEditing = () => {
		editingIngredient = null;
		editingName = '';
	};

	const saveNameChange = (ingredientId: string) => {
		if (editingName.trim()) {
			// Update the costs object
			costs[ingredientId] = {
				...costs[ingredientId],
				name: editingName.trim()
			};

			// Save to localStorage
			localStorage.setItem('ingredient-costs', JSON.stringify(costs));
		}
		cancelEditing();
	};

	const updateCategory = (ingredientId: string, newCategory: string) => {
		costs[ingredientId] = {
			...costs[ingredientId],
			category: newCategory
		};

		// Save to localStorage
		localStorage.setItem('ingredient-costs', JSON.stringify(costs));
	};

	let openAddModal = $state(false);

	const filteredIngredients = $derived.by(() => {
		const allIds = Object.values(costs).map((d) => d.id);
		let filtered: string[];
		if (selectedFilters.length === 0) {
			filtered = allIds;
		} else {
			filtered = [];
			selectedFilters.forEach((category) => {
				if (categories.includes(category)) filtered.push(category);
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
					{category} ({categories.length})
				</ModernButton>
			{/each}
		</div>
		{#if selectedFilters.length > 0}
			<ModernButton variant="danger" size="small" onclick={clearAllFilters}>
				<i class="fa-solid fa-times"></i>
				Clear all filters
			</ModernButton>
		{/if}
	</div>

	<div class="costs-grid">
		<div class="grid-header">
			<span>Ingredient</span>
			<span>Category</span>
			<span>Total Cost (¥)</span>
			<span>Amount</span>
			<span>Unit</span>
		</div>
		<!-- Compound ingredients at the top with different styling -->
		<!-- {#each compoundCosts as category}
			{#each category as costs}
				{#if costs[ingredient]}
					<div class="cost-row base-row">
						<div class="ingredient-name">
							{ingredient}
						</div>
						<div class="cost-input-group">
							<span class="currency">¥</span>
							<input type="number" min="0" bind:value={costs[ingredient].cost} class="cost-input" />
						</div>
						<div class="amount-input-group">
							<input
								type="number"
								min="0.01"
								step="0.01"
								bind:value={costs[ingredient].amount}
								class="amount-input"
							/>
						</div>
						<div class="unit-input-group">
							<select bind:value={costs[ingredient].unit} class="unit-select">
								{#each units as unit}
									<option value={unit}>{unit}</option>
								{/each}
							</select>
						</div>
					</div>
				{/if}
			{/each}
		{/each} -->

		<!-- Other ingredients -->
		{#each filteredIngredients as ingredientId}
			{#if costs[ingredientId]}
				<div class="cost-row">
					<div class="ingredient-name-container">
						{#if editingIngredient === ingredientId}
							<TextInput
								bind:value={editingName}
								size="small"
								variant="inline"
								placeholder="Ingredient name"
								ariaLabel="Edit ingredient name"
							/>
							<ModernButton
								variant="icon"
								size="small"
								ariaLabel="Save name"
								title="Save changes"
								onclick={() => saveNameChange(ingredientId)}
							>
								<i class="fa-solid fa-check"></i>
							</ModernButton>
							<ModernButton
								variant="icon"
								size="small"
								ariaLabel="Cancel editing"
								title="Cancel editing"
								onclick={cancelEditing}
							>
								<i class="fa-solid fa-times"></i>
							</ModernButton>
						{:else}
							<span class="ingredient-name">{costs[ingredientId].name}</span>
							<ModernButton
								variant="icon"
								size="small"
								ariaLabel="Edit ingredient name"
								title="Edit ingredient name"
								onclick={() => startEditing(ingredientId)}
							>
								<i class="fa-solid fa-pencil"></i>
							</ModernButton>
						{/if}
					</div>
					<div class="category-input-group">
						<SearchableSelect
							bind:value={costs[ingredientId].category}
							options={allCategories}
							placeholder="Select category..."
							size="small"
							onchange={(newCategory) => updateCategory(ingredientId, newCategory)}
						/>
					</div>
					<div class="cost-input-group">
						<span class="currency">¥</span>
						<TextInput
							type="number"
							bind:value={costs[ingredientId].product.cost}
							size="small"
							variant="inline"
							min={0}
						/>
					</div>
					<div class="amount-input-group">
						<TextInput
							type="number"
							bind:value={costs[ingredientId].product.amount}
							size="small"
							variant="inline"
							min={0.01}
							step={0.01}
						/>
					</div>
					<div class="unit-input-group">
						<select bind:value={costs[ingredientId].product.unit} class="unit-select">
							{#each units as unit}
								<option value={unit}>{unit}</option>
							{/each}
						</select>
					</div>
				</div>
			{/if}
		{/each}
	</div>
	<ModernButton
		variant="primary"
		onclick={() => {
			// add row
		}}
	>
		<i class="fa-solid fa-plus"></i>
		Add Ingredient
	</ModernButton>
</div>

<style>
	.ingredient-cost-section {
		margin-bottom: 20px;
		background: rgba(255, 255, 255, 0.9);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.08);
		backdrop-filter: blur(10px);
	}

	.filter-section {
		margin-bottom: 20px;
	}

	.filter-section h3 {
		margin: 0 0 15px 0;
		color: #333333;
		font-size: 16px;
		font-weight: 500;
	}

	.filter-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 15px;
	}

	.costs-grid {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.grid-header {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr;
		gap: 15px;
		padding: 15px;
		background: rgba(0, 0, 0, 0.05);
		color: #333333;
		font-weight: 600;
		text-align: center;
	}

	.grid-header span:first-child {
		text-align: left;
	}

	.cost-row {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr;
		gap: 15px;
		padding: 10px 15px;
		align-items: center;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.cost-row:last-child {
		border-bottom: none;
	}

	.cost-row:nth-child(even) {
		background: rgba(0, 0, 0, 0.02);
	}

	.ingredient-name-container {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.ingredient-name {
		font-weight: 500;
		color: #333333;
		text-transform: capitalize;
		flex: 1;
	}

	.cost-input-group,
	.amount-input-group,
	.unit-input-group,
	.category-input-group {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.currency {
		font-weight: 600;
		color: #333333;
	}

	.unit-select {
		padding: 4px 6px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		text-align: center;
		font-weight: 400;
		width: 100%;
		background: rgba(255, 255, 255, 0.9);
		color: #333333;
		cursor: pointer;
		font-size: 12px;
	}

	.unit-select:focus {
		outline: none;
		border-color: rgba(0, 0, 0, 0.4);
		background: rgba(255, 255, 255, 1);
	}

	@media (max-width: 768px) {
		.filter-pills {
			justify-content: center;
		}

		.costs-grid {
			overflow-x: auto;
		}

		.grid-header,
		.cost-row {
			min-width: 800px;
		}
	}
</style>

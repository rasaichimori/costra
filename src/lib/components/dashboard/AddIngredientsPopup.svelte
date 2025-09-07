<script lang="ts">
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';

	interface Props {
		availableIngredients: IngredientDoc[];
		recipe: RecipeDoc;
		onAddIngredient?: (ingredientId: string) => void;
	}

	let { availableIngredients, recipe, onAddIngredient }: Props = $props();
	let searchTerm = $state('');
	// allow multiple category filters
	let selectedFilters: string[] = $state([]);
	// derive categories from incoming list (unique)
	const categories = $derived(
		Array.from(new Set(availableIngredients.map((i) => i.category))).sort()
	);
	// reactive filtered list based on searchTerm and selectedCategory
	const filteredIngredients = $derived(
		availableIngredients.filter((ingredient) => {
			const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory =
				selectedFilters.length > 0 ? selectedFilters.includes(ingredient.category) : true;
			return matchesSearch && matchesCategory;
		}) as IngredientDoc[]
	);

	const clearFilters = () => {
		selectedFilters = [];
	};
</script>

<div class="add-ingredients">
	<!-- Filter Pills Section -->
	{#if categories.length > 0}
		<div class="filter-pills">
			{#each categories as category}
				<ModernButton
					variant={selectedFilters.includes(category) ? 'primary' : 'secondary'}
					size="small"
					onclick={() => {
						if (selectedFilters.includes(category)) {
							selectedFilters = selectedFilters.filter((c) => c !== category);
						} else {
							selectedFilters = [...selectedFilters, category];
						}
					}}
				>
					{category === '' ? '(Uncategorized)' : category}
				</ModernButton>
			{/each}
			{#if selectedFilters.length > 0}
				<ModernButton variant="danger" size="small" onclick={clearFilters}>Clear</ModernButton>
			{/if}
		</div>
	{/if}

	{#if filteredIngredients.length > 0}
		<!-- Search -->
		<TextInput
			bind:value={searchTerm}
			size={'small'}
			variant="inline"
			placeholder={!searchTerm ? 'Search ingredients...' : ''}
		/>

		<!-- Available Ingredients -->
		<div class="available-ingredients">
			{#each filteredIngredients as ingredient}
				<button
					class="add-ingredient-btn"
					onclick={() => {
						recipe.ingredients.push({
							id: ingredient.id,
							portion: { amount: 1, unit: 'cup' },
							hidden: false
						});
						onAddIngredient?.(ingredient.id);
					}}
				>
					<i class="fa-solid fa-plus"></i>
					{ingredient.name}
				</button>
			{/each}
		</div>
	{:else}
		<p>No ingredients left to add</p>
	{/if}
</div>

<style>
	.add-ingredients {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
		min-width: 260px;
		max-width: 320px;

		p {
			margin: 0;
		}
	}

	.available-ingredients {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		max-height: 240px;
		overflow-y: auto;
	}

	.add-ingredient-btn {
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid rgba(0, 0, 0, 0.12);
		color: #333333;
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 6px;
		transition:
			background 0.15s,
			border-color 0.15s,
			transform 0.15s;
	}

	.add-ingredient-btn:hover {
		background: rgba(255, 255, 255, 1);
		border-color: rgba(0, 0, 0, 0.25);
		transform: translateY(-1px);
	}

	.add-ingredient-btn:active {
		transform: translateY(0);
	}

	/* Pills styling similar to IngredientCostGrid */
	.filter-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
</style>

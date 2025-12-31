<script lang="ts">
	import type {
		IngredientDoc,
		RecipeDoc,
		CompoundIngredientDoc,
		UnitConversion
	} from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import CreateIngredientPopup from './CreateIngredientPopup.svelte';

	interface Props {
		availableIngredients: IngredientDoc[];
		availableCompounds?: CompoundIngredientDoc[];
		recipe: RecipeDoc;
		costs?: Record<string, IngredientDoc>;
		recipes?: Record<string, RecipeDoc>;
		unitConversions?: UnitConversion[];
		customUnitLabels?: Record<string, string>;
		onAddIngredient?: (ingredientId: string) => void;
	}

	let {
		availableIngredients,
		availableCompounds = [],
		recipe,
		costs,
		recipes = {},
		unitConversions = [],
		customUnitLabels = {},
		onAddIngredient
	}: Props = $props();
	let searchTerm = $state('');
	// allow multiple category filters
	let selectedFilters: string[] = $state([]);

	const { openOverlay, closeOverlay } = getOverlayContext();

	const categories = $derived([
		...Array.from(new Set(availableCompounds.map((i) => i.category))).sort(),
		...Array.from(new Set(availableIngredients.map((i) => i.category))).sort()
	]);

	const combinedIngredients = $derived([...availableCompounds, ...availableIngredients]);
	// reactive filtered list based on searchTerm and selectedCategory
	const filteredIngredients = $derived(
		combinedIngredients.filter((ingredient) => {
			const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
			let matchesCategory = false;
			if (selectedFilters.length === 0) {
				matchesCategory = true;
			} else {
				matchesCategory = selectedFilters.includes(ingredient.category);
			}

			return matchesSearch && matchesCategory;
		})
	);

	const clearFilters = () => {
		selectedFilters = [];
	};

	const openCreateIngredientPopup = () => {
		if (!costs) return;

		const firstCategory = selectedFilters.length > 0 ? selectedFilters[0] : '';

		openOverlay(
			CreateIngredientPopup,
			{
				costs,
				recipes,
				unitConversions,
				customUnitLabels,
				initialCategory: firstCategory,
				initialName: searchTerm.trim(),
				onclose: (createdIngredientId) => {
					if (createdIngredientId) {
						// Add the newly created ingredient to the recipe
						const newIngredient = costs[createdIngredientId];
						if (newIngredient) {
							recipe.ingredients.push({
								id: createdIngredientId,
								portion: { amount: 1, unit: newIngredient.product.unit },
								hidden: false
							});
							onAddIngredient?.(createdIngredientId);
						}
					}
					closeOverlay();
				}
			},
			{ transparentBackground: true }
		);
	};
</script>

<div class="add-ingredients">
	<!-- Filter Pills Section -->
	{#if categories.length > 0}
		<div class="filter-pills">
			{#each categories as category}
				<ModernButton
					variant={selectedFilters.includes(category) ? 'primary' : 'secondary'}
					style={category === 'Compound' ? 'border-color: var(--primary);' : ''}
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

	<!-- Search -->
	<TextInput
		bind:value={searchTerm}
		size={'small'}
		variant="inline"
		placeholder={!searchTerm ? 'Search ingredients...' : ''}
		autofocus={true}
		clearable={true}
		icon="fa-solid fa-magnifying-glass"
	/>

	{#if filteredIngredients.length > 0}
		<!-- Available Ingredients -->
		<div class="available-ingredients">
			{#each filteredIngredients as ingredient}
				<button
					class="add-ingredient-btn"
					class:compound={ingredient.category === 'Compound'}
					onclick={() => {
						if ('yield' in ingredient) {
							const compound = ingredient as CompoundIngredientDoc;
							recipe.ingredients.push({
								id: compound.id,
								portion: { amount: 1, unit: compound.viewedUnit },
								hidden: false
							});
						} else {
							// regular ingredient
							recipe.ingredients.push({
								id: ingredient.id,
								portion: { amount: 1, unit: ingredient.product.unit },
								hidden: false
							});
						}
						onAddIngredient?.(ingredient.id);
					}}
				>
					<i class="fa-solid fa-plus"></i>
					{ingredient.name}
				</button>
			{/each}
		</div>
	{:else if searchTerm.trim()}
		<div class="no-results">
			<p class="no-ingredients-message">No ingredients found matching "{searchTerm}"</p>
			{#if costs}
				<ModernButton variant="primary" onclick={openCreateIngredientPopup}>
					<i class="fa-solid fa-plus"></i>
					Create "{searchTerm}"
				</ModernButton>
			{/if}
		</div>
	{:else}
		<p class="no-ingredients-message">No ingredients left to add</p>
	{/if}
</div>

<style>
	.add-ingredients {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 10px;
		box-shadow: 0 6px 18px var(--shadow-heavy);
		min-width: 260px;
		max-width: 320px;
		color: var(--foreground);

		p {
			margin: 0;
		}
	}

	.no-ingredients-message {
		color: var(--secondary-foreground);
		font-style: italic;
		text-align: center;
		padding: 20px;
	}

	.no-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 20px;
	}

	.available-ingredients {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		max-height: 240px;
		overflow-y: auto;
	}

	.add-ingredient-btn {
		background: var(--muted);
		border: 1px solid var(--border);
		color: var(--foreground);
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
		background: var(--background);
		border-color: var(--border);
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

	/* Highlight for compound category */
	.compound {
		border-color: var(--primary);
	}
</style>

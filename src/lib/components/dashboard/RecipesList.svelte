<script lang="ts">
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import { calculateRecipeCosts, getTotalRecipeCost } from '$lib/utils/costCalculatorUtils';
	import RecipeListItem from './RecipeListItem.svelte';
	import AddRecipeButton from './AddRecipeButton.svelte';

	interface Props {
		recipes: Record<string, RecipeDoc>;
		costs: Record<string, IngredientDoc>;
		selectedRecipeId?: string;
	}

	let { recipes, selectedRecipeId = $bindable(), costs }: Props = $props();
</script>

<div class="recipes-list">
	{#each Object.entries(recipes) as [id, recipe]}
		<RecipeListItem
			label={recipe.name}
			selected={id === selectedRecipeId}
			cost={getTotalRecipeCost(calculateRecipeCosts(recipe, costs))}
			onclick={() => (selectedRecipeId = id)}
		/>
	{/each}
	<AddRecipeButton
		onclick={() => {
			/* future add action */
		}}
	/>
</div>

<style>
	.recipes-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.03);
		border: 1px solid rgba(0, 0, 0, 0.08);
		padding: 1rem;
		border-radius: 10px;
		max-height: 80vh;
		overflow-y: auto;
		width: 220px;
	}
</style>

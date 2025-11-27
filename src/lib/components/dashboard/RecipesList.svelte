<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import {
		calculateRecipeCosts,
		getAllCosts,
		getTotalRecipeCost
	} from '$lib/utils/costCalculatorUtils';
	import RecipeListItem from './RecipeListItem.svelte';

	interface Props {
		recipes: Record<string, RecipeDoc>;
		costs: Record<string, IngredientDoc>;
		compounds: Record<string, CompoundIngredientDoc>;
		unitConversions: UnitConversion[];
		selectedRecipeId?: string;
		setIsEditingName: (isEditing: boolean) => void;
	}

	let {
		recipes = $bindable(),
		selectedRecipeId = $bindable(),
		costs,
		compounds,
		unitConversions,
		setIsEditingName
	}: Props = $props();

	let newlyCreatedRecipes = $state<Set<string>>(new Set());

	const addRecipe = () => {
		const newId = crypto.randomUUID();

		// Find the next sequential number for ingredient name
		const existingRecipes = Object.values(recipes);
		const recipePattern = /^Recipe (\d+)$/;
		const existingNumbers = existingRecipes
			.map((recipe) => recipe.name.match(recipePattern)?.[1])
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
		const newRecipe: RecipeDoc = {
			id: newId,
			name: `Recipe ${nextNumber}`,
			ingredients: []
		};
		recipes[newId] = newRecipe;

		newlyCreatedRecipes.add(newId);
		selectedRecipeId = newId;
		setIsEditingName(true);
	};

	const getRecipeCost = (recipe: RecipeDoc) => {
		const allCosts = getAllCosts(costs, compounds, unitConversions);

		// Reactive calculations
		const recipeCosts = calculateRecipeCosts(recipe, allCosts, unitConversions);
		return getTotalRecipeCost(recipeCosts);
	};
</script>

<div class="recipes-list">
	{#each Object.entries(recipes) as [id, recipe]}
		<RecipeListItem
			label={recipe.name}
			selected={id === selectedRecipeId}
			cost={0}
			onclick={() => {
				selectedRecipeId = id;
				setIsEditingName(false);
			}}
		/>
	{/each}
	<button class="add-recipe-btn" onclick={addRecipe}> ＋ Create New Recipe </button>
</div>

<style>
	.recipes-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		padding: 1rem;
		border-radius: 10px;
		max-height: 80vh;
		overflow-y: auto;
		width: 220px;
	}
	.add-recipe-btn {
		display: block;
		width: 100%;
		padding: 0.6rem 0.9rem;
		font-size: 0.85rem;
		background: var(--bg-hover);
		border: 1px dashed var(--border-dashed);
		border-radius: 6px;
		color: var(--text-primary);
		font-weight: 500;
		cursor: pointer;
		transition: background 0.25s ease;
	}

	.add-recipe-btn:hover {
		background: var(--bg-active);
	}
</style>

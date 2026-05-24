<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		RecipeSize,
		UnitConversion
	} from '$lib/data/schema';
	import {
		calculateRecipeCosts,
		getAllCosts,
		getTotalRecipeCost
	} from '$lib/utils/costCalculatorUtils';
	import { createRecipeSize, recipeSizeToCostInput } from '$lib/utils/recipeUtils';
	import RecipeListItem from './RecipeListItem.svelte';
	import SidebarAddButton from './SidebarAddButton.svelte';
	import { m } from '$lib/paraglide/messages.js';

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

	const allCosts = $derived(getAllCosts(costs, compounds, unitConversions));

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
		const defaultSize = createRecipeSize(m.defaultRecipeSizeName({ number: 1 }));
		const newRecipe: RecipeDoc = {
			id: newId,
			name: m.defaultRecipeName({ number: nextNumber }),
			sizes: [defaultSize],
			activeSizeId: defaultSize.id
		};
		recipes[newId] = newRecipe;

		selectedRecipeId = newId;
		setIsEditingName(true);
	};

	const getSizeCost = (recipeId: string, size: RecipeSize) => {
		const recipeCosts = calculateRecipeCosts(
			recipeSizeToCostInput(recipeId, size),
			allCosts,
			unitConversions
		);
		return getTotalRecipeCost(recipeCosts);
	};
</script>

<div class="recipes-list">
	{#each Object.entries(recipes) as [id, recipe] (id)}
		{@const firstSize = recipe.sizes[0]}
		<RecipeListItem
			label={recipe.name}
			selected={id === selectedRecipeId}
			cost={getSizeCost(recipe.id, firstSize)}
			unit={firstSize.name}
			onclick={() => {
				selectedRecipeId = id;
				setIsEditingName(false);
			}}
		/>
	{/each}
	<SidebarAddButton onclick={addRecipe}>{m.createNewRecipe()}</SidebarAddButton>
</div>

<style>
	.recipes-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--muted);
		border: 1px solid var(--border);
		padding: 1rem;
		border-radius: 12px;
		max-height: 80vh;
		overflow-y: auto;
		width: 220px;
		min-width: 180px;
		box-shadow: var(--shadow-light);
		flex-shrink: 0;
	}

	@media (max-width: 900px) {
		.recipes-list {
			width: 100%;
			max-height: none;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
		}
	}

	@media (max-width: 480px) {
		.recipes-list {
			padding: 0.75rem;
			gap: 0.4rem;
		}
	}
</style>

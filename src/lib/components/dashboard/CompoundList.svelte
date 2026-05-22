<script lang="ts">
	import type { CompoundIngredientDoc, IngredientDoc, UnitConversion } from '$lib/data/schema';
	import { randomLightColorHex } from '$lib/utils/color';
	import { calculateRecipeCosts, getTotalRecipeCost } from '$lib/utils/costCalculatorUtils';
	import { getConversionFactor } from '$lib/utils/unit';
	import RecipeListItem from './RecipeListItem.svelte';
	import SidebarAddButton from './SidebarAddButton.svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		recipes: Record<string, CompoundIngredientDoc>;
		costs: Record<string, IngredientDoc>;
		unitConversions?: UnitConversion[];
		selectedRecipeId?: string;
		setIsEditingName: (isEditing: boolean) => void;
	}

	let {
		recipes = $bindable(),
		selectedRecipeId = $bindable(),
		costs,
		unitConversions = [],
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
		const newRecipe: CompoundIngredientDoc = {
			id: newId,
			name: m.defaultCompoundName({ number: nextNumber }),
			ingredients: [],
			yield: {
				amount: 1,
				unit: 'pint'
			},
			viewedUnit: 'pint',
			category: m.categoryCompound(),
			color: randomLightColorHex()
		};

		recipes[newId] = newRecipe;

		newlyCreatedRecipes.add(newId);
		selectedRecipeId = newId;
		setIsEditingName(true);
	};

	const getPerUnitCost = (recipe: CompoundIngredientDoc) => {
		const recipeCosts = calculateRecipeCosts(recipe, costs, unitConversions);
		const totalCost = getTotalRecipeCost(recipeCosts);
		const convertedYield =
			getConversionFactor(recipe.yield.unit, recipe.viewedUnit, recipe.id, unitConversions) *
			recipe.yield.amount;
		return totalCost / convertedYield;
	};
</script>

<div class="recipes-list">
	{#each Object.entries(recipes) as [id, recipe] (id)}
		<RecipeListItem
			label={recipe.name}
			selected={id === selectedRecipeId}
			cost={getPerUnitCost(recipe)}
			unit={recipe.viewedUnit}
			onclick={() => {
				selectedRecipeId = id;
				setIsEditingName(false);
			}}
		/>
	{/each}
	<SidebarAddButton onclick={addRecipe}>{m.createNewCompound()}</SidebarAddButton>
</div>

<style>
	.recipes-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--muted);
		border: 1px solid var(--border);
		padding: 1rem;
		border-radius: 10px;
		max-height: 80vh;
		overflow-y: auto;
		width: 220px;
		min-width: 180px;
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

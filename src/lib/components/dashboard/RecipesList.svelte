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
	import {
		createRecipeSize,
		getNextSequentialNumber,
		recipeSizeToCostInput
	} from '$lib/utils/recipeUtils';
	import ReorderableList from './ReorderableList.svelte';
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

	const getSizeCost = (recipeId: string, size: RecipeSize) => {
		const recipeCosts = calculateRecipeCosts(
			recipeSizeToCostInput(recipeId, size),
			allCosts,
			unitConversions
		);
		return getTotalRecipeCost(recipeCosts);
	};

	const getLabel = (recipe: RecipeDoc) => recipe.name;
	const getCost = (recipe: RecipeDoc) => getSizeCost(recipe.id, recipe.sizes[0]);
	const getUnit = (recipe: RecipeDoc) =>
		recipe.sizes.length > 1 ? recipe.sizes[0].name : undefined;

	const addRecipe = () => {
		const newId = crypto.randomUUID();
		const nextNumber = getNextSequentialNumber(
			Object.values(recipes).map((recipe) => recipe.name),
			/^Recipe (\d+)$/
		);

		const defaultSize = createRecipeSize(m.defaultRecipeSizeName({ number: 1 }));
		const newRecipe: RecipeDoc = {
			id: newId,
			name: m.defaultRecipeName({ number: nextNumber }),
			sizes: [defaultSize],
			activeSizeId: defaultSize.id,
			sizesEnabled: false
		};
		recipes[newId] = newRecipe;

		selectedRecipeId = newId;
		setIsEditingName(true);
	};
</script>

<ReorderableList
	bind:items={recipes}
	bind:selectedId={selectedRecipeId}
	{getLabel}
	{getCost}
	{getUnit}
	onSelect={() => setIsEditingName(false)}
	onAdd={addRecipe}
	addLabel={m.createNewRecipe()}
/>

<script lang="ts">
	import type { CompoundIngredientDoc, IngredientDoc, UnitConversion } from '$lib/data/schema';
	import { randomLightColorHex } from '$lib/utils/color';
	import { NEW_INGREDIENT_PLACEHOLDER_UNIT } from '$lib/utils/ingredientUtils';
	import { getCompoundPerUnitCost } from '$lib/utils/costCalculatorUtils';
	import { getNextSequentialNumber } from '$lib/utils/recipeUtils';
	import ReorderableList from './ReorderableList.svelte';
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

	const getLabel = (recipe: CompoundIngredientDoc) => recipe.name;
	const getCost = (recipe: CompoundIngredientDoc) =>
		getCompoundPerUnitCost(recipe, costs, unitConversions);
	const getUnit = (recipe: CompoundIngredientDoc) => recipe.viewedUnit;

	const addRecipe = () => {
		const newId = crypto.randomUUID();
		const nextNumber = getNextSequentialNumber(
			Object.values(recipes).map((recipe) => recipe.name),
			/^Recipe (\d+)$/
		);

		const newRecipe: CompoundIngredientDoc = {
			id: newId,
			name: m.defaultCompoundName({ number: nextNumber }),
			ingredients: [],
			yield: {
				amount: 1,
				unit: NEW_INGREDIENT_PLACEHOLDER_UNIT
			},
			viewedUnit: NEW_INGREDIENT_PLACEHOLDER_UNIT,
			category: m.categoryCompound(),
			color: randomLightColorHex()
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
	addLabel={m.createNewCompound()}
/>

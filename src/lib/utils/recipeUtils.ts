import type { CompoundIngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';

export const insertRecordAfter = <T>(
	record: Record<string, T>,
	afterKey: string,
	newKey: string,
	newValue: T
): Record<string, T> => {
	const result: Record<string, T> = {};
	let inserted = false;

	for (const [key, value] of Object.entries(record)) {
		result[key] = value;
		if (key === afterKey) {
			result[newKey] = newValue;
			inserted = true;
		}
	}

	if (!inserted) {
		result[newKey] = newValue;
	}

	return result;
};

const cloneRecipeIngredients = (recipe: RecipeDoc): RecipeDoc['ingredients'] =>
	recipe.ingredients.map((ingredient) => ({
		id: ingredient.id,
		portion: { ...ingredient.portion },
		hidden: ingredient.hidden ?? false
	}));

export const createDuplicateRecipe = (
	recipe: RecipeDoc,
	newId: string,
	duplicateName: string
): RecipeDoc => ({
	id: newId,
	name: duplicateName,
	ingredients: cloneRecipeIngredients(recipe)
});

export const createDuplicateCompound = (
	compound: CompoundIngredientDoc,
	newId: string,
	duplicateName: string
): CompoundIngredientDoc => ({
	...createDuplicateRecipe(compound, newId, duplicateName),
	category: compound.category,
	color: compound.color,
	yield: { ...compound.yield },
	viewedUnit: compound.viewedUnit
});

export const duplicateUnitConversionsForIngredient = (
	unitConversions: UnitConversion[],
	sourceIngredientId: string,
	targetIngredientId: string
): UnitConversion[] => {
	const copies = unitConversions
		.filter((conversion) => conversion.ingredientId === sourceIngredientId)
		.map((conversion) => ({ ...conversion, ingredientId: targetIngredientId }));

	return [...unitConversions, ...copies];
};

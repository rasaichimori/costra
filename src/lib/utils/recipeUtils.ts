import type {
	CompoundIngredientDoc,
	LegacyRecipeDoc,
	RecipeDoc,
	RecipeIngredientEntry,
	RecipeLikeDoc,
	RecipeSize,
	RecipeWithIngredients,
	UnitConversion
} from '$lib/data/schema';

export const DEFAULT_SIZE_NAME = 'Regular';

export const getRecipeLikeIngredients = (doc: RecipeLikeDoc): RecipeIngredientEntry[] => {
	if ('sizes' in doc) {
		return doc.sizes.flatMap((size) => size.ingredients);
	}
	return doc.ingredients;
};

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

export const cloneRecipeIngredients = (
	ingredients: RecipeIngredientEntry[]
): RecipeIngredientEntry[] =>
	ingredients.map((ingredient) => ({
		id: ingredient.id,
		portion: { ...ingredient.portion },
		hidden: ingredient.hidden ?? false
	}));

export const createRecipeSize = (
	name: string,
	ingredients: RecipeIngredientEntry[] = [],
	id = crypto.randomUUID()
): RecipeSize => ({
	id,
	name,
	ingredients: cloneRecipeIngredients(ingredients)
});

export const isLegacyRecipeDoc = (recipe: RecipeDoc | LegacyRecipeDoc): recipe is LegacyRecipeDoc =>
	'ingredients' in recipe && !('sizes' in recipe);

export const normalizeRecipeDoc = (recipe: RecipeDoc | LegacyRecipeDoc): RecipeDoc => {
	if (!isLegacyRecipeDoc(recipe)) {
		if (recipe.sizes.length === 0) {
			const size = createRecipeSize(DEFAULT_SIZE_NAME);
			return { ...recipe, sizes: [size], activeSizeId: size.id };
		}

		const activeSizeId = recipe.sizes.some((size) => size.id === recipe.activeSizeId)
			? recipe.activeSizeId
			: recipe.sizes[0].id;

		return { ...recipe, activeSizeId };
	}

	const size = createRecipeSize(DEFAULT_SIZE_NAME, recipe.ingredients);
	return {
		id: recipe.id,
		name: recipe.name,
		sizes: [size],
		activeSizeId: size.id
	};
};

export const normalizeRecipes = (
	recipes: Record<string, RecipeDoc | LegacyRecipeDoc>
): Record<string, RecipeDoc> =>
	Object.fromEntries(
		Object.entries(recipes).map(([id, recipe]) => [id, normalizeRecipeDoc(recipe)])
	);

export const getActiveSize = (recipe: RecipeDoc): RecipeSize =>
	recipe.sizes.find((size) => size.id === recipe.activeSizeId) ?? recipe.sizes[0];

export const recipeSizeToCostInput = (
	recipeId: string,
	size: RecipeSize
): RecipeWithIngredients => ({
	id: recipeId,
	ingredients: size.ingredients
});

export const reorderRecipeSizes = (
	sizes: RecipeSize[],
	fromIndex: number,
	toIndex: number
): RecipeSize[] => {
	const next = [...sizes];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	return next;
};

export const getActiveIngredients = (recipe: RecipeDoc): RecipeIngredientEntry[] =>
	getActiveSize(recipe).ingredients;

export const recipeToCostInput = (recipe: RecipeDoc): RecipeWithIngredients =>
	recipeSizeToCostInput(recipe.id, getActiveSize(recipe));

export const getNextRecipeSizeNumber = (recipe: RecipeDoc): number => {
	const pattern = /^Size (\d+)$/;
	const existingNumbers = recipe.sizes
		.map((size) => size.name.match(pattern)?.[1])
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

	return nextNumber;
};

export const createDuplicateRecipe = (
	recipe: RecipeDoc,
	newId: string,
	duplicateName: string
): RecipeDoc => {
	const sizes =
		recipe.sizes.length > 0
			? recipe.sizes.map((size) => createRecipeSize(size.name, size.ingredients))
			: [createRecipeSize(DEFAULT_SIZE_NAME)];

	return {
		id: newId,
		name: duplicateName,
		sizes,
		activeSizeId: sizes[0].id
	};
};

export const createDuplicateCompound = (
	compound: CompoundIngredientDoc,
	newId: string,
	duplicateName: string
): CompoundIngredientDoc => ({
	id: newId,
	name: duplicateName,
	ingredients: cloneRecipeIngredients(compound.ingredients),
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

export const iterateRecipeIngredients = (
	recipe: RecipeDoc,
	callback: (ingredient: RecipeIngredientEntry, size: RecipeSize) => void
): void => {
	for (const size of recipe.sizes) {
		for (const ingredient of size.ingredients) {
			callback(ingredient, size);
		}
	}
};

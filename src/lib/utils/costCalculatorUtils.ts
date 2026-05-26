import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	RecipeIngredientEntry,
	RecipeWithIngredients,
	UnitConversion
} from '$lib/data/schema';
import { iterateRecipeIngredients } from '$lib/utils/recipeUtils';
import { getConversionFactor, type Unit } from '$lib/utils/unit';
import { isUnsetUnit } from '$lib/utils/ingredientUtils';

export type IngredientProduct = {
	cost: number;
	amount: number;
	unit: Unit;
};

export const getAllCosts = (
	costs: Record<string, IngredientDoc>,
	compounds: Record<string, CompoundIngredientDoc>,
	conversions: UnitConversion[]
): Record<string, IngredientDoc> => {
	return { ...costs, ...compoundsToIngredients(compounds, costs, conversions) };
};

export const compoundsToIngredients = (
	compounds: Record<string, CompoundIngredientDoc>,
	costs: Record<string, IngredientDoc>,
	conversions: UnitConversion[]
): Record<string, IngredientDoc> => {
	return Object.values(compounds).reduce(
		(acc, compound) => ({
			...acc,
			[compound.id]: {
				...compound,
				product: {
					cost: getTotalRecipeCost(calculateRecipeCosts(compound, costs, conversions)),
					amount: compound.yield.amount,
					unit: compound.yield.unit
				}
			}
		}),
		{}
	);
};

/**
 * Calculate costs for a specific recipe.
 */
export const calculateRecipeCosts = (
	recipe: RecipeWithIngredients,
	costs: Record<string, IngredientDoc>,
	conversions: UnitConversion[]
) => {
	const recipeCosts: Record<string, number> = {};

	recipe.ingredients.forEach((ingredient) => {
		if (ingredient.hidden) return; // Skip hidden ingredients
		const ingredientDoc = costs[ingredient.id];
		if (!ingredientDoc) {
			// Skip missing ingredients instead of throwing
			console.warn(`Ingredient ${ingredient.id} not found in costs, skipping cost calculation`);
			return;
		}

		const ingredientPrice = ingredientDoc.product.cost;
		try {
			const conversionFactor = getConversionFactor(
				ingredient.portion.unit,
				ingredientDoc.product.unit,
				ingredient.id,
				conversions
			);

			const productUnitPortion = conversionFactor * ingredient.portion.amount;
			const ratioUsed = productUnitPortion / ingredientDoc.product.amount;
			recipeCosts[ingredient.id] = ingredientPrice * ratioUsed;
		} catch (error) {
			console.warn(
				`Failed to convert ${ingredient.portion.unit} to ${ingredientDoc.product.unit} for ingredient ${ingredient.id}:`,
				error
			);
			// Set cost to 0 if conversion fails
			recipeCosts[ingredient.id] = 0;
		}
	});

	return recipeCosts;
};

/** Cost of one unit of the recipe portion unit, or null when conversion is unavailable. */
export const getIngredientPerUnitCost = (
	ingredient: RecipeIngredientEntry,
	ingredientDoc: IngredientDoc,
	unitConversions: UnitConversion[]
): number | null => {
	if (isUnsetUnit(ingredient.portion.unit as string)) {
		return null;
	}

	const ingredientPrice = ingredientDoc.product.cost;
	try {
		const conversionFactor = getConversionFactor(
			ingredient.portion.unit,
			ingredientDoc.product.unit,
			ingredient.id,
			unitConversions
		);
		const productUnitPortion = conversionFactor;
		const ratioUsed = productUnitPortion / ingredientDoc.product.amount;
		return ingredientPrice * ratioUsed;
	} catch {
		return null;
	}
};

/** Format per-unit cost for display; grams allow up to 2 decimal places. */
export const formatPerUnitCost = (cost: number, unitId: string): string => {
	if (unitId === 'g') {
		return String(parseFloat(cost.toFixed(2)));
	}
	return cost.toFixed(0);
};

/**
 * Get total cost for a recipe
 */
export function getTotalRecipeCost(recipeCosts: Record<string, number>): number {
	return Object.values(recipeCosts).reduce((total, cost) => total + cost, 0);
}

/** Yield amount expressed in the compound's viewed unit, or null when no conversion exists. */
export const getCompoundConvertedYield = (
	compound: CompoundIngredientDoc,
	unitConversions: UnitConversion[]
): number | null => {
	const { yield: yieldPortion, viewedUnit, id } = compound;

	if (isUnsetUnit(yieldPortion.unit as string) || isUnsetUnit(viewedUnit as string)) {
		return null;
	}

	if (yieldPortion.unit === viewedUnit) {
		return yieldPortion.amount;
	}

	try {
		return (
			getConversionFactor(yieldPortion.unit as string, viewedUnit as string, id, unitConversions) *
			yieldPortion.amount
		);
	} catch {
		return null;
	}
};

export const getCompoundPerUnitCost = (
	compound: CompoundIngredientDoc,
	costs: Record<string, IngredientDoc>,
	unitConversions: UnitConversion[]
): number => {
	const totalCost = getTotalRecipeCost(calculateRecipeCosts(compound, costs, unitConversions));
	const convertedYield = getCompoundConvertedYield(compound, unitConversions);

	if (convertedYield === null || convertedYield === 0) {
		return 0;
	}

	return totalCost / convertedYield;
};

/**
 * Get available ingredients for a recipe (excluding those already in recipe and optionally excluded ones)
 */
export const getAvailableIngredients = (
	recipe: RecipeWithIngredients,
	costs: Record<string, IngredientDoc>
) =>
	Object.values(costs).filter(
		(ingredient) =>
			!recipe.ingredients.some((recipeIngredient) => recipeIngredient.id === ingredient.id)
	);

/**
 * Find all recipes that use a specific ingredient
 */
export const getRecipesUsingIngredient = (
	ingredientId: string,
	recipes: Record<string, RecipeDoc>
): RecipeDoc[] => {
	return Object.values(recipes).filter((recipe) => {
		let usesIngredient = false;
		iterateRecipeIngredients(recipe, (ingredient) => {
			if (ingredient.id === ingredientId) {
				usesIngredient = true;
			}
		});
		return usesIngredient;
	});
};

/**
 * Remove an ingredient from all recipes
 */
export const removeIngredientFromAllRecipes = (
	ingredientId: string,
	recipes: Record<string, RecipeDoc>
): Record<string, RecipeDoc> => {
	const updatedRecipes = { ...recipes };

	Object.keys(updatedRecipes).forEach((recipeId) => {
		const recipe = updatedRecipes[recipeId];
		updatedRecipes[recipeId] = {
			...recipe,
			sizes: recipe.sizes.map((size) => ({
				...size,
				ingredients: size.ingredients.filter((ingredient) => ingredient.id !== ingredientId)
			}))
		};
	});

	return updatedRecipes;
};

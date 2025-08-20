import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
import { convertUnit, type Unit } from '$lib/utils/unit';

export type IngredientProduct = {
	cost: number;
	amount: number;
	unit: Unit;
};

/**
 * Calculate costs for a specific recipe.
 */
export const calculateRecipeCosts = (recipe: RecipeDoc, costs: Record<string, IngredientDoc>) => {
	const recipeCosts: Record<string, number> = {};

	recipe.ingredients.forEach((ingredient) => {
		const ingredientDoc = costs[ingredient.id];
		if (!ingredientDoc) return;

		const ingredientPrice = ingredientDoc.product.cost;
		const productUnitPortion = convertUnit(
			ingredient.portion.amount,
			ingredient.portion.unit,
			ingredientDoc.product.unit
		);
		const ratioUsed = productUnitPortion / ingredientDoc.product.amount;
		recipeCosts[ingredient.id] = ingredientPrice * ratioUsed;
	});

	return recipeCosts;
};

/**
 * Get total cost for a recipe
 */
export function getTotalRecipeCost(recipeCosts: Record<string, number>): number {
	return Object.values(recipeCosts).reduce((total, cost) => total + cost, 0);
}

/**
 * Get available ingredients for a recipe (excluding those already in recipe and optionally excluded ones)
 */
export const getAvailableIngredients = (recipe: RecipeDoc, costs: Record<string, IngredientDoc>) =>
	Object.values(costs).filter((ingredient) => !(ingredient.id in recipe));

import type { CompoundIngredientDoc, IngredientDoc, RecipeDoc } from '$lib/data/schema';
import { convertUnit, type Unit } from '$lib/utils/unit';

export type IngredientProduct = {
	cost: number;
	amount: number;
	unit: Unit;
};

export const getAllCosts = (
	costs: Record<string, IngredientDoc>,
	compounds: Record<string, CompoundIngredientDoc>
): Record<string, IngredientDoc> => {
	return { ...costs, ...compoundsToIngredients(compounds, costs) };
};

export const compoundsToIngredients = (
	compounds: Record<string, CompoundIngredientDoc>,
	costs: Record<string, IngredientDoc>
): Record<string, IngredientDoc> => {
	return Object.values(compounds).reduce(
		(acc, compound) => ({
			...acc,
			[compound.id]: {
				...compound,
				product: {
					cost: getTotalRecipeCost(calculateRecipeCosts(compound, costs)),
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
export const calculateRecipeCosts = (recipe: RecipeDoc, costs: Record<string, IngredientDoc>) => {
	const recipeCosts: Record<string, number> = {};

	recipe.ingredients.forEach((ingredient) => {
		if (ingredient.hidden) return; // Skip hidden ingredients
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
	return Object.values(recipes).filter((recipe) =>
		recipe.ingredients.some((ingredient) => ingredient.id === ingredientId)
	);
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
		updatedRecipes[recipeId] = {
			...updatedRecipes[recipeId],
			ingredients: updatedRecipes[recipeId].ingredients.filter(
				(ingredient) => ingredient.id !== ingredientId
			)
		};
	});

	return updatedRecipes;
};

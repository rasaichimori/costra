import type { RecipeDoc } from '$lib/data/schema';
import { getPortionUnitsForIngredient } from '$lib/utils/unitSelectUtils';

/** Sentinel unit id until the user picks a real unit. */
export const UNSET_UNIT = '';

/** @deprecated Use UNSET_UNIT */
export const NEW_INGREDIENT_PLACEHOLDER_UNIT = UNSET_UNIT;

export const isUnsetUnit = (unit: string): boolean => unit === UNSET_UNIT;

/** @deprecated Use isUnsetUnit */
export const isPlaceholderProductUnit = isUnsetUnit;

export const committedPortionUnitsForIngredient = (
	ingredientId: string,
	recipes: Record<string, RecipeDoc>
): string[] =>
	getPortionUnitsForIngredient(ingredientId, recipes).filter((unit) => !isUnsetUnit(unit));

export const isIngredientUsedWithCommittedUnits = (
	ingredientId: string,
	recipes: Record<string, RecipeDoc>
): boolean => committedPortionUnitsForIngredient(ingredientId, recipes).length > 0;

/** Whether a unit change between committed units should prompt for conversions. */
export const shouldPromptForUnitConversion = (options: {
	oldUnit: string;
	newUnit: string;
	ingredientId: string;
	recipes: Record<string, RecipeDoc>;
}): boolean => {
	if (options.oldUnit === options.newUnit) {
		return false;
	}
	if (isUnsetUnit(options.oldUnit) || isUnsetUnit(options.newUnit)) {
		return false;
	}
	return isIngredientUsedWithCommittedUnits(options.ingredientId, options.recipes);
};

/** True when product/yield and portion/viewed units are still unset. */
export const isInitialUnitSelection = (options: {
	productUnit: string;
	portionUnit?: string;
}): boolean => {
	if (!isUnsetUnit(options.productUnit)) {
		return false;
	}
	if (options.portionUnit === undefined) {
		return true;
	}
	return isUnsetUnit(options.portionUnit) || options.portionUnit === options.productUnit;
};

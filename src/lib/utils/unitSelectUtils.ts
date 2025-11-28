import type { RecipeDoc, UnitConversion } from '$lib/data/schema';
import {
	hasConversion,
	massUnitLabels,
	massUnits,
	volumeUnitLabels,
	volumeUnits,
	type UnitOption,
	type UnitOptionGroup
} from '$lib/utils/unit';

/**
 * Build a combined labels object from standard units and custom units
 */
export const buildUnitLabels = (
	customUnitLabels: Record<string, string>
): Record<string, string> => {
	return {
		...volumeUnitLabels,
		...massUnitLabels,
		...customUnitLabels
	};
};

/**
 * Build unit option groups for the unit select popup
 */
export const buildUnitGroups = (customUnitLabels: Record<string, string>): UnitOptionGroup[] => {
	const volumeOptions: UnitOption[] = volumeUnits.map((unit) => ({
		label: volumeUnitLabels[unit],
		id: unit
	}));

	const massOptions: UnitOption[] = massUnits.map((unit) => ({
		label: massUnitLabels[unit],
		id: unit
	}));

	const customOptions: UnitOption[] = Object.entries(customUnitLabels).map(([id, label]) => ({
		label,
		id
	}));

	return [
		{ label: 'Volume', options: volumeOptions },
		{ label: 'Mass', options: massOptions },
		{ label: 'Custom', options: customOptions }
	];
};

/**
 * Get all unique portion unit IDs used for an ingredient across all recipes
 */
export const getPortionUnitsForIngredient = (
	ingredientId: string,
	recipes: Record<string, RecipeDoc>
): string[] => {
	const unitIds = new Set<string>();

	for (const recipe of Object.values(recipes)) {
		for (const ingredient of recipe.ingredients) {
			if (ingredient.id === ingredientId && !ingredient.hidden) {
				unitIds.add(ingredient.portion.unitId as string);
			}
		}
	}

	return Array.from(unitIds);
};

/**
 * Find all recipes that use an ingredient with a specific unit
 */
export const getRecipesUsingIngredientWithUnit = (
	ingredientId: string,
	unitId: string,
	recipes: Record<string, RecipeDoc>
): RecipeDoc[] => {
	return Object.values(recipes).filter((recipe) =>
		recipe.ingredients.some(
			(ingredient) =>
				ingredient.id === ingredientId && !ingredient.hidden && ingredient.portion.unitId === unitId
		)
	);
};

/**
 * Find all missing conversions between portion units and a target unit
 * Returns conversions needed FROM each portion unit TO the target unit
 */
export const findMissingConversions = (
	portionUnits: string[],
	targetUnit: string,
	ingredientId: string,
	conversions: UnitConversion[]
): {
	inputUnit: string;
	outputUnit: string;
}[] => {
	const missing: {
		inputUnit: string;
		outputUnit: string;
	}[] = [];

	for (const portionUnit of portionUnits) {
		if (portionUnit === targetUnit) {
			continue;
		}

		if (!hasConversion(portionUnit, targetUnit, ingredientId, conversions)) {
			missing.push({
				inputUnit: portionUnit,
				outputUnit: targetUnit
			});
		}
	}

	return missing;
};

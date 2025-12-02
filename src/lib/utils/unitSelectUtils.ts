import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';
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
				unitIds.add(ingredient.portion.unit as string);
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
				ingredient.id === ingredientId && !ingredient.hidden && ingredient.portion.unit === unitId
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

/**
 * Find all missing conversions needed for imported data
 * Returns a map of ingredientId -> missing conversions array
 */
export const findAllMissingConversionsFromImport = (
	costs: Record<string, IngredientDoc>,
	recipes: Record<string, RecipeDoc>,
	compoundIngredients: Record<string, CompoundIngredientDoc>,
	conversions: UnitConversion[]
): Map<
	string,
	{
		ingredientName: string;
		missingConversions: { inputUnit: string; outputUnit: string }[];
	}
> => {
	const missingMap = new Map<
		string,
		{
			ingredientName: string;
			missingConversions: { inputUnit: string; outputUnit: string }[];
		}
	>();

	// Helper to add a missing conversion
	const addMissingConversion = (
		ingredientId: string,
		ingredientName: string,
		inputUnit: string,
		outputUnit: string
	) => {
		const existing = missingMap.get(ingredientId);
		const conversion = { inputUnit, outputUnit };

		if (existing) {
			const alreadyExists = existing.missingConversions.some(
				(c) => c.inputUnit === conversion.inputUnit && c.outputUnit === conversion.outputUnit
			);
			if (!alreadyExists) {
				existing.missingConversions.push(conversion);
			}
		} else {
			missingMap.set(ingredientId, {
				ingredientName,
				missingConversions: [conversion]
			});
		}
	};

	// Check regular recipe ingredients: portion unit -> product unit
	// This includes recipes that reference compound ingredients
	for (const recipe of Object.values(recipes)) {
		for (const ingredient of recipe.ingredients) {
			if (ingredient.hidden) continue;

			// Check if it's a base ingredient
			const ingredientDoc = costs[ingredient.id];
			let productUnit: string;
			let ingredientName: string;

			if (ingredientDoc) {
				productUnit = ingredientDoc.product.unit as string;
				ingredientName = ingredientDoc.name;
			} else {
				// Check if it's a compound ingredient
				const compoundDoc = compoundIngredients[ingredient.id];
				if (!compoundDoc) continue;
				productUnit = compoundDoc.yield.unit as string;
				ingredientName = compoundDoc.name;
			}

			const portionUnit = ingredient.portion.unit as string;

			if (
				portionUnit !== productUnit &&
				!hasConversion(portionUnit, productUnit, ingredient.id, conversions)
			) {
				addMissingConversion(ingredient.id, ingredientName, portionUnit, productUnit);
			}
		}
	}

	// Check compound ingredients: yield unit -> viewed unit
	for (const compound of Object.values(compoundIngredients)) {
		const yieldUnit = compound.yield.unit as string;
		const viewedUnit = compound.viewedUnit as string;

		if (
			yieldUnit !== viewedUnit &&
			!hasConversion(yieldUnit, viewedUnit, compound.id, conversions)
		) {
			addMissingConversion(compound.id, compound.name, yieldUnit, viewedUnit);
		}

		// Also check compound ingredient's own ingredients: portion unit -> product unit
		for (const ingredient of compound.ingredients) {
			if (ingredient.hidden) continue;

			const ingredientDoc = costs[ingredient.id];
			if (!ingredientDoc) continue;

			const portionUnit = ingredient.portion.unit as string;
			const productUnit = ingredientDoc.product.unit as string;

			if (
				portionUnit !== productUnit &&
				!hasConversion(portionUnit, productUnit, ingredient.id, conversions)
			) {
				addMissingConversion(ingredient.id, ingredientDoc.name, portionUnit, productUnit);
			}
		}
	}

	return missingMap;
};

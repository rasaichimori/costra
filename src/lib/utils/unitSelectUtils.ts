import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	RecipeLikeDoc,
	UnitConversion
} from '$lib/data/schema';
import {
	hasConversion,
	massUnitLabels,
	massUnits,
	volumeUnitLabels,
	volumeUnits,
	type MassUnit,
	type UnitOption,
	type UnitOptionGroup,
	type VolumeUnit
} from '$lib/utils/unit';
import { isUnsetUnit } from '$lib/utils/ingredientUtils';
import { getRecipeLikeIngredients, iterateRecipeIngredients } from '$lib/utils/recipeUtils';

/**
 * Build a combined labels object from standard units and custom units
 */
export const buildUnitLabels = (
	customUnitLabels: Record<string, string>,
	unsetLabel?: string
): Record<string, string> => {
	const labels: Record<string, string> = {
		...volumeUnitLabels,
		...massUnitLabels,
		...customUnitLabels
	};
	if (unsetLabel !== undefined) {
		labels[''] = unsetLabel;
	}
	return labels;
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
	recipes: Record<string, RecipeLikeDoc>
): string[] => {
	const unitIds = new Set<string>();

	for (const doc of Object.values(recipes)) {
		for (const ingredient of getRecipeLikeIngredients(doc)) {
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
	recipes: Record<string, RecipeLikeDoc>
): RecipeLikeDoc[] => {
	return Object.values(recipes).filter((doc) =>
		getRecipeLikeIngredients(doc).some(
			(ingredient) =>
				ingredient.id === ingredientId && !ingredient.hidden && ingredient.portion.unit === unitId
		)
	);
};

/**
 * Get the unit category type
 */
const getUnitType = (unit: string): 'volume' | 'mass' | 'custom' => {
	if (volumeUnits.includes(unit as VolumeUnit)) return 'volume';
	if (massUnits.includes(unit as MassUnit)) return 'mass';
	return 'custom';
};

/**
 * Find all missing conversions between portion units and a target unit
 * Returns conversions needed FROM each portion unit TO the target unit
 *
 * Smart deduplication: If multiple conversions are needed between the same
 * unit types (e.g., tbs→g and cup→g), only one is requested since standard
 * conversions within a type can derive the others.
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

	const targetType = getUnitType(targetUnit);

	// Track which cross-type conversions we've already added
	// Key: "fromType:toType" e.g. "volume:mass"
	const crossTypeConversionsAdded = new Set<string>();

	for (const portionUnit of portionUnits) {
		if (portionUnit === targetUnit) {
			continue;
		}

		if (!hasConversion(portionUnit, targetUnit, ingredientId, conversions)) {
			const portionType = getUnitType(portionUnit);

			// For cross-type conversions, only add one representative
			if (portionType !== targetType && portionType !== 'custom' && targetType !== 'custom') {
				const crossTypeKey = `${portionType}:${targetType}`;
				const reverseKey = `${targetType}:${portionType}`;

				if (
					crossTypeConversionsAdded.has(crossTypeKey) ||
					crossTypeConversionsAdded.has(reverseKey)
				) {
					continue;
				}
				crossTypeConversionsAdded.add(crossTypeKey);
			}

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
 *
 * Smart deduplication: If multiple conversions are needed between the same
 * unit types (e.g., g→tbs and g→cup), only one is requested since standard
 * conversions within a type can derive the others.
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

	// Track which cross-type conversions we've already added per ingredient
	// Key: "ingredientId:fromType:toType" e.g. "abc123:mass:volume"
	const crossTypeConversionsAdded = new Set<string>();

	// Helper to add a missing conversion (with smart deduplication)
	const addMissingConversion = (
		ingredientId: string,
		ingredientName: string,
		inputUnit: string,
		outputUnit: string
	) => {
		const inputType = getUnitType(inputUnit);
		const outputType = getUnitType(outputUnit);

		// For cross-type conversions (e.g., mass↔volume), only add one representative
		// since standard conversions within a type can derive the others
		if (inputType !== outputType && inputType !== 'custom' && outputType !== 'custom') {
			const crossTypeKey = `${ingredientId}:${inputType}:${outputType}`;
			const reverseKey = `${ingredientId}:${outputType}:${inputType}`;

			// If we already have a conversion between these types, skip
			if (
				crossTypeConversionsAdded.has(crossTypeKey) ||
				crossTypeConversionsAdded.has(reverseKey)
			) {
				return;
			}
			crossTypeConversionsAdded.add(crossTypeKey);
		}

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
		iterateRecipeIngredients(recipe, (ingredient) => {
			if (ingredient.hidden) return;

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
				if (!compoundDoc) return;
				productUnit = compoundDoc.yield.unit as string;
				ingredientName = compoundDoc.name;
			}

			const portionUnit = ingredient.portion.unit as string;

			if (
				!isUnsetUnit(portionUnit) &&
				!isUnsetUnit(productUnit) &&
				portionUnit !== productUnit &&
				!hasConversion(portionUnit, productUnit, ingredient.id, conversions)
			) {
				addMissingConversion(ingredient.id, ingredientName, portionUnit, productUnit);
			}
		});
	}

	// Check compound ingredients: yield unit -> viewed unit
	for (const compound of Object.values(compoundIngredients)) {
		const yieldUnit = compound.yield.unit as string;
		const viewedUnit = compound.viewedUnit as string;

		if (
			!isUnsetUnit(yieldUnit) &&
			!isUnsetUnit(viewedUnit) &&
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
				!isUnsetUnit(portionUnit) &&
				!isUnsetUnit(productUnit) &&
				portionUnit !== productUnit &&
				!hasConversion(portionUnit, productUnit, ingredient.id, conversions)
			) {
				addMissingConversion(ingredient.id, ingredientDoc.name, portionUnit, productUnit);
			}
		}
	}

	return missingMap;
};

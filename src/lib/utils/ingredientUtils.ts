/** Auto-assigned product unit for new ingredients until the user picks a real one. */
export const NEW_INGREDIENT_PLACEHOLDER_UNIT = 'cup';

export const isPlaceholderProductUnit = (unit: string): boolean =>
	unit === NEW_INGREDIENT_PLACEHOLDER_UNIT;

/**
 * Portion units that still use the placeholder should not force cross-type conversions
 * while the user is making their first unit choice.
 */
export const portionUnitsExcludingPlaceholder = (
	portionUnits: string[],
	allowFirstUnitPick: boolean
): string[] => {
	if (!allowFirstUnitPick) {
		return portionUnits;
	}
	return portionUnits.filter((unit) => unit !== NEW_INGREDIENT_PLACEHOLDER_UNIT);
};

/** True when product (and optionally recipe portion) units are still the auto placeholder. */
export const isFirstIngredientUnitPick = (options: {
	allowFirstUnitPick: boolean;
	productUnit: string;
	portionUnit?: string;
}): boolean => {
	if (!options.allowFirstUnitPick || !isPlaceholderProductUnit(options.productUnit)) {
		return false;
	}
	if (options.portionUnit === undefined) {
		return true;
	}
	return (
		isPlaceholderProductUnit(options.portionUnit) || options.portionUnit === options.productUnit
	);
};

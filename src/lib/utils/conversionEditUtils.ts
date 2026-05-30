import type { UnitConversion } from '$lib/data/schema';

/** Plain copy — cannot use structuredClone on Svelte $state reactive arrays. */
export const cloneUnitConversions = (conversions: UnitConversion[]): UnitConversion[] =>
	conversions.map((conversion) => ({ ...conversion }));

export const getOutputAmount = (conversion: UnitConversion): number =>
	conversion.outputAmount ?? 1;

export const findConversionGlobalIndex = (
	conversions: UnitConversion[],
	ingredientId: string,
	localIndex: number
): number => {
	let count = 0;
	for (let i = 0; i < conversions.length; i++) {
		if (conversions[i].ingredientId === ingredientId) {
			if (count === localIndex) return i;
			count++;
		}
	}
	return -1;
};

export const updateConversionAt = (
	conversions: UnitConversion[],
	globalIndex: number,
	patch: Partial<UnitConversion>
): UnitConversion[] => {
	if (globalIndex < 0 || globalIndex >= conversions.length) return conversions;
	return conversions.map((conversion, index) =>
		index === globalIndex ? { ...conversion, ...patch } : conversion
	);
};

/** factor = input units per one output unit; UI shows leftAmount inputUnit = rightAmount outputUnit */
export const conversionFactorFromDisplayAmounts = (
	leftAmount: number,
	rightAmount: number
): number | null => {
	if (leftAmount <= 0 || rightAmount <= 0) return null;
	return leftAmount / rightAmount;
};

export const buildUnitConversionFromDisplayAmounts = (
	ingredientId: string,
	inputUnit: string,
	outputUnit: string,
	leftAmount: number,
	rightAmount: number
): UnitConversion | null => {
	const conversionFactor = conversionFactorFromDisplayAmounts(leftAmount, rightAmount);
	if (conversionFactor === null) return null;
	return {
		ingredientId,
		inputUnit,
		outputUnit,
		conversionFactor,
		outputAmount: rightAmount
	};
};

export const updateConversionFactorFromDisplayAmounts = (
	conversions: UnitConversion[],
	globalIndex: number,
	leftAmount: number,
	rightAmount: number
): UnitConversion[] => {
	const newFactor = conversionFactorFromDisplayAmounts(leftAmount, rightAmount);
	if (globalIndex < 0 || newFactor === null) return conversions;
	return updateConversionAt(conversions, globalIndex, {
		conversionFactor: newFactor,
		outputAmount: rightAmount
	});
};

export const deleteConversionAt = (
	conversions: UnitConversion[],
	globalIndex: number
): UnitConversion[] => {
	if (globalIndex < 0) return conversions;
	return conversions.filter((_, index) => index !== globalIndex);
};

export const unitConversionsEqual = (a: UnitConversion[], b: UnitConversion[]): boolean =>
	JSON.stringify(a) === JSON.stringify(b);

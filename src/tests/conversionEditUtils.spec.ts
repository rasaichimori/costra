import { describe, expect, it } from 'vitest';
import type { UnitConversion } from '$lib/data/schema';
import {
	cloneUnitConversions,
	buildUnitConversionFromDisplayAmounts,
	conversionFactorFromDisplayAmounts,
	deleteConversionAt,
	findConversionGlobalIndex,
	unitConversionsEqual,
	updateConversionAt,
	updateConversionFactorFromDisplayAmounts
} from '$lib/utils/conversionEditUtils';

const sampleConversions: UnitConversion[] = [
	{ ingredientId: 'flour', inputUnit: 'g', outputUnit: 'cup', conversionFactor: 125 },
	{ ingredientId: 'flour', inputUnit: 'g', outputUnit: 'kg', conversionFactor: 1000 },
	{ ingredientId: 'milk', inputUnit: 'ml', outputUnit: 'cup', conversionFactor: 240 }
];

describe('conversionEditUtils', () => {
	it('finds global index by ingredient-local index', () => {
		expect(findConversionGlobalIndex(sampleConversions, 'flour', 0)).toBe(0);
		expect(findConversionGlobalIndex(sampleConversions, 'flour', 1)).toBe(1);
		expect(findConversionGlobalIndex(sampleConversions, 'milk', 0)).toBe(2);
		expect(findConversionGlobalIndex(sampleConversions, 'missing', 0)).toBe(-1);
	});

	it('updates conversion immutably', () => {
		const updated = updateConversionAt(sampleConversions, 0, { conversionFactor: 130 });
		expect(updated[0].conversionFactor).toBe(130);
		expect(sampleConversions[0].conversionFactor).toBe(125);
		expect(updated).not.toBe(sampleConversions);
	});

	it('derives factor from left and right display amounts', () => {
		expect(conversionFactorFromDisplayAmounts(250, 2)).toBe(125);
		expect(conversionFactorFromDisplayAmounts(125, 2)).toBe(62.5);
		expect(conversionFactorFromDisplayAmounts(0, 1)).toBeNull();
	});

	it('builds unit conversion with factor and outputAmount from display amounts', () => {
		const conversion = buildUnitConversionFromDisplayAmounts(
			'flour',
			'g',
			'cup',
			250,
			2
		);
		expect(conversion).toEqual({
			ingredientId: 'flour',
			inputUnit: 'g',
			outputUnit: 'cup',
			conversionFactor: 125,
			outputAmount: 2
		});
		expect(buildUnitConversionFromDisplayAmounts('flour', 'g', 'cup', 0, 1)).toBeNull();
	});

	it('updates factor when right side amount changes', () => {
		const updated = updateConversionFactorFromDisplayAmounts(sampleConversions, 0, 125, 2);
		expect(updated[0].conversionFactor).toBe(62.5);
		expect(updated[0].outputAmount).toBe(2);
	});

	it('updates factor when left side amount changes', () => {
		const updated = updateConversionFactorFromDisplayAmounts(sampleConversions, 0, 250, 2);
		expect(updated[0].conversionFactor).toBe(125);
	});

	it('deletes conversion immutably', () => {
		const updated = deleteConversionAt(sampleConversions, 1);
		expect(updated).toHaveLength(2);
		expect(updated.some((c) => c.outputUnit === 'kg')).toBe(false);
	});

	it('detects equal conversion arrays', () => {
		const clone = cloneUnitConversions(sampleConversions);
		expect(unitConversionsEqual(sampleConversions, clone)).toBe(true);
		expect(
			unitConversionsEqual(
				sampleConversions,
				updateConversionAt(sampleConversions, 0, { conversionFactor: 999 })
			)
		).toBe(false);
	});
});

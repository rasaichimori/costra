import type { UnitConversion } from '$lib/data/schema';
import {
	convertMassUnit,
	convertVolumeUnit,
	getConversionFactor,
	hasConversion,
	TbsMultipliers
} from '$lib/utils/unit';
import { describe, expect, it } from 'vitest';

describe('convertVolumeUnit', () => {
	it('returns same amount for same unit', () => {
		expect(convertVolumeUnit(5, 'cup', 'cup')).toBe(5);
	});

	it('converts cup to tablespoons', () => {
		expect(convertVolumeUnit(1, 'cup', 'tbs')).toBe(16);
	});

	it('converts tablespoons to cup', () => {
		expect(convertVolumeUnit(16, 'tbs', 'cup')).toBe(1);
	});

	it('converts oz to tbs', () => {
		expect(convertVolumeUnit(1, 'oz', 'tbs')).toBe(0.5);
	});
});

describe('convertMassUnit', () => {
	it('returns same amount for same unit', () => {
		expect(convertMassUnit(100, 'g', 'g')).toBe(100);
	});

	it('converts grams to kilograms', () => {
		expect(convertMassUnit(1000, 'g', 'kg')).toBe(1);
	});

	it('converts kilograms to grams', () => {
		expect(convertMassUnit(1, 'kg', 'g')).toBe(1000);
	});
});

describe('getConversionFactor', () => {
	const ingredientId = 'testIngredient';

	describe('same unit conversions', () => {
		it('returns 1 for same unit', () => {
			expect(getConversionFactor('cup', 'cup', ingredientId, [])).toBe(1);
			expect(getConversionFactor('g', 'g', ingredientId, [])).toBe(1);
			expect(getConversionFactor('customUnit', 'customUnit', ingredientId, [])).toBe(1);
		});
	});

	describe('volume-to-volume conversions', () => {
		it('converts cup to tbs', () => {
			expect(getConversionFactor('cup', 'tbs', ingredientId, [])).toBe(16);
		});

		it('converts oz to cup', () => {
			const expected = TbsMultipliers.oz / TbsMultipliers.cup;
			expect(getConversionFactor('oz', 'cup', ingredientId, [])).toBeCloseTo(expected);
		});
	});

	describe('mass-to-mass conversions', () => {
		it('converts g to kg', () => {
			expect(getConversionFactor('g', 'kg', ingredientId, [])).toBe(0.001);
		});

		it('converts kg to g', () => {
			expect(getConversionFactor('kg', 'g', ingredientId, [])).toBe(1000);
		});
	});

	describe('custom unit conversions', () => {
		it('uses direct conversion from array', () => {
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 }
			];
			expect(getConversionFactor('bunch', 'cup', ingredientId, conversions)).toBe(2);
		});

		it('uses inverse conversion when direction is swapped', () => {
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 }
			];
			expect(getConversionFactor('cup', 'bunch', ingredientId, conversions)).toBe(0.5);
		});

		it('only uses conversions for the correct ingredient', () => {
			const conversions: UnitConversion[] = [
				{
					ingredientId: 'otherIngredient',
					inputUnit: 'bunch',
					outputUnit: 'cup',
					conversionFactor: 2
				}
			];
			expect(() => getConversionFactor('bunch', 'cup', ingredientId, conversions)).toThrow();
		});
	});

	describe('multi-step conversions via BFS', () => {
		it('finds path custom -> volume -> volume', () => {
			// bunch -> cup -> oz
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 }
			];
			const cupToOz = TbsMultipliers.cup / TbsMultipliers.oz;
			const expected = 2 * cupToOz;
			expect(getConversionFactor('bunch', 'oz', ingredientId, conversions)).toBeCloseTo(expected);
		});

		it('finds path custom -> volume -> mass', () => {
			// bunch -> cup -> g (needs cup -> g conversion)
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 },
				{ ingredientId, inputUnit: 'cup', outputUnit: 'g', conversionFactor: 240 }
			];
			expect(getConversionFactor('bunch', 'g', ingredientId, conversions)).toBeCloseTo(480);
		});

		it('finds path custom -> volume -> volume -> mass', () => {
			// bunch -> cup -> oz -> g
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 },
				{ ingredientId, inputUnit: 'oz', outputUnit: 'g', conversionFactor: 28.35 }
			];
			const cupToOz = TbsMultipliers.cup / TbsMultipliers.oz;
			const expected = 2 * cupToOz * 28.35;
			expect(getConversionFactor('bunch', 'g', ingredientId, conversions)).toBeCloseTo(expected);
		});

		it('finds path custom -> mass -> mass', () => {
			// pack -> kg -> g
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'pack', outputUnit: 'kg', conversionFactor: 0.5 }
			];
			expect(getConversionFactor('pack', 'g', ingredientId, conversions)).toBeCloseTo(500);
		});

		it('finds path mass -> volume via custom unit', () => {
			// g -> oz -> cup
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'oz', outputUnit: 'g', conversionFactor: 28.35 }
			];
			const ozToCup = TbsMultipliers.oz / TbsMultipliers.cup;
			const expected = (1 / 28.35) * ozToCup;
			expect(getConversionFactor('g', 'cup', ingredientId, conversions)).toBeCloseTo(expected);
		});

		it('finds reverse multi-step path', () => {
			// g -> cup -> bunch (reverse of bunch -> cup -> g)
			const conversions: UnitConversion[] = [
				{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 },
				{ ingredientId, inputUnit: 'cup', outputUnit: 'g', conversionFactor: 240 }
			];
			expect(getConversionFactor('g', 'bunch', ingredientId, conversions)).toBeCloseTo(1 / 480);
		});
	});

	describe('error handling', () => {
		it('throws when no conversion path exists', () => {
			const conversions: UnitConversion[] = [];
			expect(() => getConversionFactor('bunch', 'g', ingredientId, conversions)).toThrow(
				/No conversion path found/
			);
		});

		it('throws when conversion exists for different ingredient', () => {
			const conversions: UnitConversion[] = [
				{ ingredientId: 'other', inputUnit: 'bunch', outputUnit: 'g', conversionFactor: 100 }
			];
			expect(() => getConversionFactor('bunch', 'g', ingredientId, conversions)).toThrow();
		});
	});
});

describe('hasConversion', () => {
	const ingredientId = 'testIngredient';

	it('returns true for same unit', () => {
		expect(hasConversion('cup', 'cup', ingredientId, [])).toBe(true);
	});

	it('returns true for volume-to-volume', () => {
		expect(hasConversion('cup', 'tbs', ingredientId, [])).toBe(true);
	});

	it('returns true when conversion exists', () => {
		const conversions: UnitConversion[] = [
			{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 }
		];
		expect(hasConversion('bunch', 'cup', ingredientId, conversions)).toBe(true);
	});

	it('returns true for reverse conversion', () => {
		const conversions: UnitConversion[] = [
			{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 }
		];
		expect(hasConversion('cup', 'bunch', ingredientId, conversions)).toBe(true);
	});

	it('returns true for multi-step conversion', () => {
		const conversions: UnitConversion[] = [
			{ ingredientId, inputUnit: 'bunch', outputUnit: 'cup', conversionFactor: 2 },
			{ ingredientId, inputUnit: 'oz', outputUnit: 'g', conversionFactor: 28.35 }
		];
		expect(hasConversion('bunch', 'g', ingredientId, conversions)).toBe(true);
	});

	it('returns false when no path exists', () => {
		expect(hasConversion('bunch', 'g', ingredientId, [])).toBe(false);
	});
});

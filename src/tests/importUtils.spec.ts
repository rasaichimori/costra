import type { ImportInputData } from '$lib/utils/importUtils';
import type {
	CompoundIngredientDoc,
	IngredientDoc,
	LegacyRecipeDoc,
	UnitConversion
} from '$lib/data/schema';
import { mockData } from '$lib/data/mockData';
import {
	ImportValidationError,
	parseAndPrepareImportData,
	prepareImportData,
	validateImportData
} from '$lib/utils/importUtils';
import { describe, expect, it } from 'vitest';

const createIngredient = (
	id: string,
	name: string,
	cost: number,
	amount: number,
	unit: string
): IngredientDoc => ({
	id,
	name,
	category: 'test',
	product: { cost, amount, unit },
	color: '#ffffff'
});

const createRecipe = (
	id: string,
	name: string,
	ingredients: { id: string; amount: number; unit: string; hidden?: boolean }[]
): LegacyRecipeDoc => ({
	id,
	name,
	ingredients: ingredients.map((i) => ({
		id: i.id,
		portion: { amount: i.amount, unit: i.unit },
		hidden: i.hidden ?? false
	}))
});

const createCompound = (
	id: string,
	name: string,
	yieldAmount: number,
	yieldUnit: string,
	ingredients: { id: string; amount: number; unit: string }[]
): CompoundIngredientDoc => ({
	id,
	name,
	category: 'compound',
	color: '#cccccc',
	yield: { amount: yieldAmount, unit: yieldUnit },
	viewedUnit: yieldUnit,
	ingredients: ingredients.map((i) => ({
		id: i.id,
		portion: { amount: i.amount, unit: i.unit },
		hidden: false
	}))
});

const validImport: ImportInputData = {
	costs: {
		flour: createIngredient('flour', 'Flour', 100, 1000, 'g')
	},
	recipes: {
		cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 100, unit: 'g' }])
	}
};

const mockImportData: ImportInputData = {
	costs: mockData.costs,
	recipes: mockData.recipes,
	compoundIngredients: mockData.compoundIngredients,
	unitConversions: mockData.unitConversions,
	customUnitLabels: mockData.unitLabels
};

describe('validateImportData', () => {
	it('accepts valid minimal data', () => {
		expect(validateImportData(validImport)).toBeNull();
	});

	it('accepts full mock export shape', () => {
		expect(validateImportData(mockImportData)).toBeNull();
	});

	it('rejects non-object data', () => {
		expect(validateImportData(null)).toBeTruthy();
		expect(validateImportData([])).toBeTruthy();
	});

	it('rejects missing costs and recipes', () => {
		expect(validateImportData({ costs: {} })).toContain('costs');
		expect(validateImportData({ recipes: {} })).toContain('costs');
	});

	it('rejects malformed ingredient in costs', () => {
		const data = {
			...validImport,
			costs: { flour: { id: 'flour', name: 'Flour' } }
		};
		expect(validateImportData(data)).toContain('flour');
	});

	it('rejects recipe with invalid ingredient entry', () => {
		const data = {
			...validImport,
			recipes: {
				cake: {
					id: 'cake',
					name: 'Cake',
					ingredients: [{ id: 'flour', hidden: false }]
				}
			}
		};
		expect(validateImportData(data)).toContain('cake');
	});

	it('rejects recipe referencing missing ingredient', () => {
		const data = {
			...validImport,
			recipes: {
				cake: createRecipe('cake', 'Cake', [{ id: 'missing', amount: 1, unit: 'g' }])
			}
		};
		expect(validateImportData(data)).toContain('missing');
	});

	it('rejects compound referencing missing ingredient', () => {
		const data: ImportInputData = {
			...validImport,
			compoundIngredients: {
				dough: createCompound('dough', 'Dough', 1, 'batch', [
					{ id: 'missing', amount: 1, unit: 'g' }
				])
			}
		};
		expect(validateImportData(data)).toContain('missing');
	});

	it('allows recipe to reference compound ingredient id', () => {
		const data: ImportInputData = {
			costs: validImport.costs,
			recipes: {
				cake: createRecipe('cake', 'Cake', [{ id: 'dough', amount: 1, unit: 'batch' }])
			},
			compoundIngredients: {
				dough: createCompound('dough', 'Dough', 1, 'batch', [
					{ id: 'flour', amount: 100, unit: 'g' }
				])
			}
		};
		expect(validateImportData(data)).toBeNull();
	});

	it('rejects invalid unit conversions array', () => {
		const data = { ...validImport, unitConversions: {} };
		expect(validateImportData(data)).toContain('unitConversions');
	});

	it('rejects invalid custom unit labels', () => {
		const data = { ...validImport, customUnitLabels: { pack: 12 } };
		expect(validateImportData(data)).toContain('pack');
	});
});

describe('prepareImportData', () => {
	it('normalizes legacy recipes to sizes on import', () => {
		const prepared = prepareImportData(validImport);
		expect(prepared.recipes.cake.sizes).toHaveLength(1);
		expect(prepared.recipes.cake.sizes[0].ingredients).toHaveLength(1);
		expect(prepared.recipes.cake.activeSizeId).toBe(prepared.recipes.cake.sizes[0].id);
	});

	it('normalizes unit conversions on import', () => {
		const data: ImportInputData = {
			...validImport,
			unitConversions: [
				{
					ingredientId: 'flour',
					inputUnit: 'cup',
					outputUnit: 'g',
					conversionFactor: 125
				}
			]
		};

		const prepared = prepareImportData(data);
		expect(prepared.unitConversions?.[0]).toEqual({
			ingredientId: 'flour',
			inputUnit: 'g',
			outputUnit: 'cup',
			conversionFactor: 125
		});
	});
});

describe('parseAndPrepareImportData', () => {
	it('parses valid JSON and normalizes conversions', () => {
		const json = JSON.stringify({
			...validImport,
			unitConversions: [
				{
					ingredientId: 'flour',
					inputUnit: 'cup',
					outputUnit: 'g',
					conversionFactor: 125
				}
			] satisfies UnitConversion[]
		});

		const data = parseAndPrepareImportData(json);
		expect(data.unitConversions?.[0].inputUnit).toBe('g');
	});

	it('throws ImportValidationError for invalid data', () => {
		expect(() => parseAndPrepareImportData(JSON.stringify({ costs: {} }))).toThrow(
			ImportValidationError
		);
	});

	it('throws SyntaxError for invalid JSON', () => {
		expect(() => parseAndPrepareImportData('{')).toThrow(SyntaxError);
	});
});

import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';
import {
	buildUnitGroups,
	buildUnitLabels,
	findAllMissingConversionsFromImport,
	findMissingConversions,
	getPortionUnitsForIngredient,
	getRecipesUsingIngredientWithUnit
} from '$lib/utils/unitSelectUtils';
import { describe, expect, it } from 'vitest';

// Test fixtures
const createIngredient = (id: string, name: string, unit: string): IngredientDoc => ({
	id,
	name,
	category: 'test',
	product: { cost: 100, amount: 1000, unit },
	color: '#ffffff'
});

const createRecipe = (
	id: string,
	name: string,
	ingredients: { id: string; amount: number; unit: string; hidden?: boolean }[]
): RecipeDoc => ({
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
	yieldUnit: string,
	viewedUnit: string,
	ingredients: { id: string; amount: number; unit: string }[]
): CompoundIngredientDoc => ({
	id,
	name,
	category: 'compound',
	color: '#cccccc',
	yield: { amount: 500, unit: yieldUnit },
	viewedUnit,
	ingredients: ingredients.map((i) => ({
		id: i.id,
		portion: { amount: i.amount, unit: i.unit },
		hidden: false
	}))
});

describe('buildUnitLabels', () => {
	it('combines standard and custom unit labels', () => {
		const customLabels = {
			bunch: 'Bunch',
			pack: 'Pack'
		};

		const result = buildUnitLabels(customLabels);

		// Standard volume units
		expect(result['cup']).toBe('Cup');
		expect(result['tbs']).toBe('Tablespoon');

		// Standard mass units
		expect(result['g']).toBe('Gram');
		expect(result['kg']).toBe('Kilogram');

		// Custom units
		expect(result['bunch']).toBe('Bunch');
		expect(result['pack']).toBe('Pack');
	});

	it('works with empty custom labels', () => {
		const result = buildUnitLabels({});

		expect(result['cup']).toBe('Cup');
		expect(result['g']).toBe('Gram');
	});

	it('custom labels override standard if same key', () => {
		const customLabels = {
			cup: 'My Custom Cup'
		};

		const result = buildUnitLabels(customLabels);

		expect(result['cup']).toBe('My Custom Cup');
	});
});

describe('buildUnitGroups', () => {
	it('creates three groups: Volume, Mass, Custom', () => {
		const customLabels = { bunch: 'Bunch' };
		const groups = buildUnitGroups(customLabels);

		expect(groups).toHaveLength(3);
		expect(groups[0].label).toBe('Volume');
		expect(groups[1].label).toBe('Mass');
		expect(groups[2].label).toBe('Custom');
	});

	it('Volume group contains all volume units', () => {
		const groups = buildUnitGroups({});
		const volumeGroup = groups.find((g) => g.label === 'Volume');

		expect(volumeGroup?.options.map((o) => o.id)).toContain('cup');
		expect(volumeGroup?.options.map((o) => o.id)).toContain('tbs');
		expect(volumeGroup?.options.map((o) => o.id)).toContain('ml');
		expect(volumeGroup?.options.map((o) => o.id)).toContain('litre');
	});

	it('Mass group contains all mass units', () => {
		const groups = buildUnitGroups({});
		const massGroup = groups.find((g) => g.label === 'Mass');

		expect(massGroup?.options.map((o) => o.id)).toContain('g');
		expect(massGroup?.options.map((o) => o.id)).toContain('kg');
	});

	it('Custom group contains custom units', () => {
		const customLabels = {
			bunch: 'Bunch',
			piece: 'Piece'
		};
		const groups = buildUnitGroups(customLabels);
		const customGroup = groups.find((g) => g.label === 'Custom');

		expect(customGroup?.options).toHaveLength(2);
		expect(customGroup?.options.map((o) => o.id)).toContain('bunch');
		expect(customGroup?.options.map((o) => o.id)).toContain('piece');
	});

	it('Custom group is empty when no custom labels', () => {
		const groups = buildUnitGroups({});
		const customGroup = groups.find((g) => g.label === 'Custom');

		expect(customGroup?.options).toHaveLength(0);
	});
});

describe('getPortionUnitsForIngredient', () => {
	it('extracts units used for ingredient across recipes', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }]),
			bread: createRecipe('bread', 'Bread', [{ id: 'flour', amount: 2, unit: 'cup' }]),
			cookies: createRecipe('cookies', 'Cookies', [{ id: 'flour', amount: 100, unit: 'g' }])
		};

		const units = getPortionUnitsForIngredient('flour', recipes);

		expect(units).toContain('g');
		expect(units).toContain('cup');
		expect(units).toHaveLength(2); // 'g' appears twice but should be unique
	});

	it('excludes hidden ingredients', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [
				{ id: 'flour', amount: 200, unit: 'g', hidden: false },
				{ id: 'flour', amount: 2, unit: 'cup', hidden: true }
			])
		};

		const units = getPortionUnitsForIngredient('flour', recipes);

		expect(units).toContain('g');
		expect(units).not.toContain('cup');
	});

	it('returns empty array when ingredient not found', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'sugar', amount: 100, unit: 'g' }])
		};

		const units = getPortionUnitsForIngredient('flour', recipes);

		expect(units).toHaveLength(0);
	});
});

describe('getRecipesUsingIngredientWithUnit', () => {
	it('finds recipes using ingredient with specific unit', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }]),
			bread: createRecipe('bread', 'Bread', [{ id: 'flour', amount: 2, unit: 'cup' }]),
			cookies: createRecipe('cookies', 'Cookies', [{ id: 'flour', amount: 100, unit: 'g' }])
		};

		const result = getRecipesUsingIngredientWithUnit('flour', 'g', recipes);

		expect(result).toHaveLength(2);
		expect(result.map((r) => r.id)).toContain('cake');
		expect(result.map((r) => r.id)).toContain('cookies');
		expect(result.map((r) => r.id)).not.toContain('bread');
	});

	it('excludes hidden ingredients', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g', hidden: true }])
		};

		const result = getRecipesUsingIngredientWithUnit('flour', 'g', recipes);

		expect(result).toHaveLength(0);
	});

	it('returns empty when no match', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }])
		};

		const result = getRecipesUsingIngredientWithUnit('flour', 'cup', recipes);

		expect(result).toHaveLength(0);
	});
});

describe('findMissingConversions', () => {
	it('returns missing conversions for portion units to target', () => {
		const portionUnits = ['cup', 'tbs'];
		const targetUnit = 'g';
		const ingredientId = 'flour';
		const conversions: UnitConversion[] = [];

		const missing = findMissingConversions(portionUnits, targetUnit, ingredientId, conversions);

		// Should find missing volume -> mass conversion (only one needed due to deduplication)
		expect(missing.length).toBeGreaterThan(0);
		expect(missing.some((m) => m.outputUnit === 'g')).toBe(true);
	});

	it('skips same unit conversion', () => {
		const portionUnits = ['g', 'kg'];
		const targetUnit = 'g';
		const ingredientId = 'flour';
		const conversions: UnitConversion[] = [];

		const missing = findMissingConversions(portionUnits, targetUnit, ingredientId, conversions);

		// g to g should be skipped, kg to g is same type (mass)
		expect(missing).toHaveLength(0);
	});

	it('skips units that already have conversions', () => {
		const portionUnits = ['cup'];
		const targetUnit = 'g';
		const ingredientId = 'flour';
		const conversions: UnitConversion[] = [
			{ ingredientId: 'flour', inputUnit: 'g', outputUnit: 'cup', conversionFactor: 125 }
		];

		const missing = findMissingConversions(portionUnits, targetUnit, ingredientId, conversions);

		expect(missing).toHaveLength(0);
	});

	it('deduplicates cross-type conversions', () => {
		// cup and tbs are both volume, g is mass
		// Only one volume->mass conversion should be needed
		const portionUnits = ['cup', 'tbs', 'oz'];
		const targetUnit = 'g';
		const ingredientId = 'flour';
		const conversions: UnitConversion[] = [];

		const missing = findMissingConversions(portionUnits, targetUnit, ingredientId, conversions);

		// Should only have one conversion (volume -> mass)
		expect(missing).toHaveLength(1);
	});
});

describe('findAllMissingConversionsFromImport', () => {
	it('finds missing conversions for recipe ingredients', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 'g')
		};

		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 2, unit: 'cup' }])
		};

		const compounds: Record<string, CompoundIngredientDoc> = {};
		const conversions: UnitConversion[] = [];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		expect(missingMap.has('flour')).toBe(true);
		const flourMissing = missingMap.get('flour');
		expect(flourMissing?.ingredientName).toBe('Flour');
		expect(flourMissing?.missingConversions.length).toBeGreaterThan(0);
	});

	it('finds missing conversions for compound yield vs viewedUnit', () => {
		const costs: Record<string, IngredientDoc> = {};

		const recipes: Record<string, RecipeDoc> = {};

		const compounds: Record<string, CompoundIngredientDoc> = {
			dough: createCompound('dough', 'Dough', 'g', 'cup', [])
		};

		const conversions: UnitConversion[] = [];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		expect(missingMap.has('dough')).toBe(true);
	});

	it('finds missing conversions for compound sub-ingredients', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 'g')
		};

		const recipes: Record<string, RecipeDoc> = {};

		const compounds: Record<string, CompoundIngredientDoc> = {
			dough: createCompound('dough', 'Dough', 'g', 'g', [{ id: 'flour', amount: 2, unit: 'cup' }])
		};

		const conversions: UnitConversion[] = [];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		expect(missingMap.has('flour')).toBe(true);
	});

	it('skips ingredients with matching units', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 'g')
		};

		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }])
		};

		const compounds: Record<string, CompoundIngredientDoc> = {};
		const conversions: UnitConversion[] = [];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		expect(missingMap.has('flour')).toBe(false);
	});

	it('skips hidden ingredients', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 'g')
		};

		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 2, unit: 'cup', hidden: true }])
		};

		const compounds: Record<string, CompoundIngredientDoc> = {};
		const conversions: UnitConversion[] = [];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		expect(missingMap.has('flour')).toBe(false);
	});

	it('handles recipes referencing compound ingredients', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 'g')
		};

		const compounds: Record<string, CompoundIngredientDoc> = {
			dough: createCompound('dough', 'Dough', 'g', 'g', [{ id: 'flour', amount: 200, unit: 'g' }])
		};

		const recipes: Record<string, RecipeDoc> = {
			bread: createRecipe('bread', 'Bread', [{ id: 'dough', amount: 1, unit: 'cup' }])
		};

		const conversions: UnitConversion[] = [];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		// dough is used with 'cup' but yields 'g'
		expect(missingMap.has('dough')).toBe(true);
	});

	it('deduplicates cross-type conversions per ingredient', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 'g')
		};

		// Multiple recipes using flour with different volume units
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 2, unit: 'cup' }]),
			bread: createRecipe('bread', 'Bread', [{ id: 'flour', amount: 8, unit: 'tbs' }])
		};

		const compounds: Record<string, CompoundIngredientDoc> = {};
		const conversions: UnitConversion[] = [];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		// Should only have one missing conversion for flour (volume -> mass)
		const flourMissing = missingMap.get('flour');
		expect(flourMissing?.missingConversions).toHaveLength(1);
	});

	it('returns empty map when all conversions exist', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 'g')
		};

		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 2, unit: 'cup' }])
		};

		const compounds: Record<string, CompoundIngredientDoc> = {};
		const conversions: UnitConversion[] = [
			{ ingredientId: 'flour', inputUnit: 'g', outputUnit: 'cup', conversionFactor: 125 }
		];

		const missingMap = findAllMissingConversionsFromImport(
			costs,
			recipes,
			compounds,
			conversions
		);

		expect(missingMap.size).toBe(0);
	});
});


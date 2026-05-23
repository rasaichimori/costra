import type { CompoundIngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';
import {
	createDuplicateCompound,
	createDuplicateRecipe,
	duplicateUnitConversionsForIngredient,
	insertRecordAfter
} from '$lib/utils/recipeUtils';
import { describe, expect, it } from 'vitest';

const createRecipe = (
	id: string,
	name: string,
	ingredients: RecipeDoc['ingredients'] = []
): RecipeDoc => ({
	id,
	name,
	ingredients
});

const createCompound = (
	id: string,
	name: string,
	overrides: Partial<CompoundIngredientDoc> = {}
): CompoundIngredientDoc => ({
	id,
	name,
	category: 'Compound',
	color: '#ffffff',
	yield: { amount: 1, unit: 'batch' },
	viewedUnit: 'batch',
	ingredients: [],
	...overrides
});

describe('insertRecordAfter', () => {
	it('inserts a new entry immediately after the target key', () => {
		const record = { a: 1, b: 2, c: 3 };
		const result = insertRecordAfter(record, 'b', 'copy', 99);

		expect(Object.keys(result)).toEqual(['a', 'b', 'copy', 'c']);
		expect(result.copy).toBe(99);
	});

	it('appends when the target key is missing', () => {
		const record = { a: 1, b: 2 };
		const result = insertRecordAfter(record, 'missing', 'copy', 99);

		expect(Object.keys(result)).toEqual(['a', 'b', 'copy']);
	});
});

describe('createDuplicateRecipe', () => {
	it('copies recipe content with a new id and name', () => {
		const original = createRecipe('cake', 'Vanilla Cake', [
			{ id: 'flour', portion: { amount: 250, unit: 'g' }, hidden: false },
			{ id: 'sugar', portion: { amount: 200, unit: 'g' }, hidden: true }
		]);

		const duplicate = createDuplicateRecipe(original, 'cake-copy', 'Vanilla Cake - copy');

		expect(duplicate.id).toBe('cake-copy');
		expect(duplicate.name).toBe('Vanilla Cake - copy');
		expect(duplicate.ingredients).toEqual(original.ingredients);
		expect(duplicate.ingredients).not.toBe(original.ingredients);
		expect(duplicate.ingredients[0].portion).not.toBe(original.ingredients[0].portion);
	});
});

describe('createDuplicateCompound', () => {
	it('copies compound-specific fields', () => {
		const original = createCompound('cakeMix', 'Cake Mix', {
			category: 'Compound',
			color: '#abc123',
			yield: { amount: 2, unit: 'batch' },
			viewedUnit: 'cup',
			ingredients: [{ id: 'flour', portion: { amount: 100, unit: 'g' }, hidden: false }]
		});

		const duplicate = createDuplicateCompound(original, 'cakeMix-copy', 'Cake Mix - copy');

		expect(duplicate).toMatchObject({
			id: 'cakeMix-copy',
			name: 'Cake Mix - copy',
			category: 'Compound',
			color: '#abc123',
			yield: { amount: 2, unit: 'batch' },
			viewedUnit: 'cup'
		});
		expect(duplicate.ingredients).toEqual(original.ingredients);
	});
});

describe('duplicateUnitConversionsForIngredient', () => {
	it('copies conversions for a compound to its duplicate id', () => {
		const conversions: UnitConversion[] = [
			{ ingredientId: 'cakeMix', inputUnit: 'batch', outputUnit: 'cup', conversionFactor: 4 },
			{ ingredientId: 'flour', inputUnit: 'g', outputUnit: 'cup', conversionFactor: 125 }
		];

		const result = duplicateUnitConversionsForIngredient(conversions, 'cakeMix', 'cakeMix-copy');

		expect(result).toHaveLength(3);
		expect(result[2]).toEqual({
			ingredientId: 'cakeMix-copy',
			inputUnit: 'batch',
			outputUnit: 'cup',
			conversionFactor: 4
		});
	});
});

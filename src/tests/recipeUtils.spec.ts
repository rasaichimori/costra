import type { CompoundIngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';
import {
	createDuplicateCompound,
	createDuplicateRecipe,
	createRecipeSize,
	DEFAULT_SIZE_NAME,
	duplicateUnitConversionsForIngredient,
	getActiveSize,
	getNextRecipeSizeNumber,
	insertRecordAfter,
	normalizeRecipeDoc
} from '$lib/utils/recipeUtils';
import { describe, expect, it } from 'vitest';

const createRecipe = (
	id: string,
	name: string,
	ingredients: { id: string; amount: number; unit: string; hidden?: boolean }[] = []
): RecipeDoc => {
	const size = createRecipeSize(
		DEFAULT_SIZE_NAME,
		ingredients.map((i) => ({
			id: i.id,
			portion: { amount: i.amount, unit: i.unit },
			hidden: i.hidden ?? false
		}))
	);
	return {
		id,
		name,
		sizes: [size],
		activeSizeId: size.id
	};
};

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

describe('normalizeRecipeDoc', () => {
	it('migrates legacy recipes with ingredients to sizes', () => {
		const legacy = {
			id: 'cake',
			name: 'Cake',
			ingredients: [{ id: 'flour', portion: { amount: 100, unit: 'g' }, hidden: false }]
		};

		const normalized = normalizeRecipeDoc(legacy);

		expect(normalized.sizes).toHaveLength(1);
		expect(normalized.sizes[0].name).toBe(DEFAULT_SIZE_NAME);
		expect(normalized.sizes[0].ingredients).toEqual(legacy.ingredients);
		expect(normalized.activeSizeId).toBe(normalized.sizes[0].id);
	});
});

describe('getActiveSize', () => {
	it('returns the active size when activeSizeId is set', () => {
		const recipe = createRecipe('cake', 'Cake');
		const secondSize = createRecipeSize('Large');
		recipe.sizes.push(secondSize);
		recipe.activeSizeId = secondSize.id;

		expect(getActiveSize(recipe).id).toBe(secondSize.id);
	});
});

describe('getNextRecipeSizeNumber', () => {
	it('returns the next unused sequential size number', () => {
		const recipe = createRecipe('cake', 'Cake');
		recipe.sizes.push(createRecipeSize('Size 1'));
		recipe.sizes.push(createRecipeSize('Size 2'));

		expect(getNextRecipeSizeNumber(recipe)).toBe(3);
	});
});

describe('createDuplicateRecipe', () => {
	it('copies all sizes with a new id and name', () => {
		const original = createRecipe('cake', 'Vanilla Cake', [
			{ id: 'flour', amount: 250, unit: 'g', hidden: false },
			{ id: 'sugar', amount: 200, unit: 'g', hidden: true }
		]);
		original.sizes.push(createRecipeSize('Large', original.sizes[0].ingredients));

		const duplicate = createDuplicateRecipe(original, 'cake-copy', 'Vanilla Cake - copy');

		expect(duplicate.id).toBe('cake-copy');
		expect(duplicate.name).toBe('Vanilla Cake - copy');
		expect(duplicate.sizes).toHaveLength(2);
		expect(duplicate.sizes[0].ingredients).toEqual(original.sizes[0].ingredients);
		expect(duplicate.sizes[0].ingredients).not.toBe(original.sizes[0].ingredients);
		expect(duplicate.sizes[0].ingredients[0].portion).not.toBe(
			original.sizes[0].ingredients[0].portion
		);
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

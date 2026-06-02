import type { CompoundIngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';
import {
	createDuplicateCompound,
	createDuplicateRecipe,
	createRecipeSize,
	calculateFoodCostPercent,
	calculateSellingPriceFromFoodCostPercent,
	DEFAULT_SIZE_NAME,
	duplicateUnitConversionsForIngredient,
	disableRecipeSizes,
	enableRecipeSizes,
	getActiveSize,
	getNextRecipeSizeNumber,
	insertRecordAfter,
	normalizeRecipeDoc,
	reorderRecipeSizes,
	recipeSizeToCostInput,
	shouldShowSizeTabs
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
		expect(normalized.sizes[0].sellingPrice).toBe(0);
	});

	it('defaults missing sellingPrice on sizes to zero', () => {
		const normalized = normalizeRecipeDoc({
			id: 'cake',
			name: 'Cake',
			sizes: [
				{
					id: 'size-1',
					name: DEFAULT_SIZE_NAME,
					ingredients: [{ id: 'flour', portion: { amount: 100, unit: 'g' }, hidden: false }]
				}
			],
			activeSizeId: 'size-1'
		} as RecipeDoc);

		expect(normalized.sizes[0].sellingPrice).toBe(0);
	});

	it('migrates legacy recipe-level sellingPrice onto sizes', () => {
		const normalized = normalizeRecipeDoc({
			id: 'cake',
			name: 'Cake',
			sellingPrice: 1200,
			sizes: [
				{
					id: 'size-1',
					name: DEFAULT_SIZE_NAME,
					ingredients: [{ id: 'flour', portion: { amount: 100, unit: 'g' }, hidden: false }]
				}
			],
			activeSizeId: 'size-1'
		} as RecipeDoc & { sellingPrice: number });

		expect(normalized.sizes[0].sellingPrice).toBe(1200);
	});
});

describe('shouldShowSizeTabs', () => {
	it('returns false for a single-size recipe without sizesEnabled', () => {
		const recipe = createRecipe('cake', 'Cake');
		expect(shouldShowSizeTabs(recipe)).toBe(false);
	});

	it('returns true after enabling sizes on a single-size recipe', () => {
		const recipe = createRecipe('cake', 'Cake');
		enableRecipeSizes(recipe);
		expect(shouldShowSizeTabs(recipe)).toBe(true);
	});

	it('returns false after disabling sizes on a single-size recipe', () => {
		const recipe = createRecipe('cake', 'Cake');
		enableRecipeSizes(recipe);
		disableRecipeSizes(recipe);
		expect(shouldShowSizeTabs(recipe)).toBe(false);
		expect(recipe.sizes).toHaveLength(1);
	});

	it('returns true for multi-size recipes', () => {
		const recipe = createRecipe('cake', 'Cake');
		recipe.sizes.push(createRecipeSize('Large'));
		expect(shouldShowSizeTabs(recipe)).toBe(true);
	});

	it('normalizes sizesEnabled from multi-size recipes', () => {
		const recipe = createRecipe('cake', 'Cake');
		recipe.sizes.push(createRecipeSize('Large'));
		expect(normalizeRecipeDoc(recipe).sizesEnabled).toBe(true);
	});

	it('normalizes sizesEnabled to false for single-size recipes', () => {
		const recipe = createRecipe('cake', 'Cake');
		expect(normalizeRecipeDoc(recipe).sizesEnabled).toBe(false);
	});
});

describe('calculateFoodCostPercent', () => {
	it('returns food cost percentage rounded to two decimal places', () => {
		expect(calculateFoodCostPercent(18, 6.23)).toBe(34.61);
	});

	it('drops trailing zero decimals in the rounded value', () => {
		expect(calculateFoodCostPercent(10, 5)).toBe(50);
	});

	it('returns null when selling price is zero or negative', () => {
		expect(calculateFoodCostPercent(0, 10)).toBeNull();
		expect(calculateFoodCostPercent(-5, 10)).toBeNull();
	});
});

describe('calculateSellingPriceFromFoodCostPercent', () => {
	it('returns selling price from food cost percentage and total cost', () => {
		expect(calculateSellingPriceFromFoodCostPercent(34.6, 6.23)).toBeCloseTo(18, 0);
	});

	it('round-trips with calculateFoodCostPercent when selling price is rounded', () => {
		const sellingPrice = 18;
		const totalCost = 6.23;
		const percent = calculateFoodCostPercent(sellingPrice, totalCost);
		expect(percent).toBe(34.61);
		const derivedPrice = calculateSellingPriceFromFoodCostPercent(percent!, totalCost);
		expect(derivedPrice).not.toBeNull();
		expect(Math.round(derivedPrice!)).toBe(sellingPrice);
	});

	it('returns null when food cost percent is zero or negative', () => {
		expect(calculateSellingPriceFromFoodCostPercent(0, 10)).toBeNull();
		expect(calculateSellingPriceFromFoodCostPercent(-5, 10)).toBeNull();
	});
});

describe('recipeSizeToCostInput', () => {
	it('builds cost input from a specific size', () => {
		const recipe = createRecipe('cake', 'Cake', [{ id: 'flour', amount: 100, unit: 'g' }]);
		const large = createRecipeSize('Large', recipe.sizes[0].ingredients);
		recipe.sizes.push(large);

		expect(recipeSizeToCostInput(recipe.id, large)).toEqual({
			id: 'cake',
			ingredients: large.ingredients
		});
	});
});

describe('reorderRecipeSizes', () => {
	it('moves a size from one index to another', () => {
		const small = createRecipeSize('Small');
		const medium = createRecipeSize('Medium');
		const large = createRecipeSize('Large');

		expect(reorderRecipeSizes([small, medium, large], 2, 0).map((size) => size.name)).toEqual([
			'Large',
			'Small',
			'Medium'
		]);
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

	it('copies sellingPrice for each size', () => {
		const original = createRecipe('cake', 'Vanilla Cake');
		original.sizes[0].sellingPrice = 1500;
		original.sizes.push(
			createRecipeSize('Large', original.sizes[0].ingredients, crypto.randomUUID(), 2200)
		);

		const duplicate = createDuplicateRecipe(original, 'cake-copy', 'Vanilla Cake - copy');

		expect(duplicate.sizes[0].sellingPrice).toBe(1500);
		expect(duplicate.sizes[1].sellingPrice).toBe(2200);
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

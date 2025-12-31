import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';
import {
	calculateRecipeCosts,
	compoundsToIngredients,
	getAllCosts,
	getAvailableIngredients,
	getRecipesUsingIngredient,
	getTotalRecipeCost,
	removeIngredientFromAllRecipes
} from '$lib/utils/costCalculatorUtils';
import { describe, expect, it } from 'vitest';

// Test fixtures
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

describe('calculateRecipeCosts', () => {
	it('calculates cost for simple recipe with same units', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [{ id: 'flour', amount: 500, unit: 'g' }]);

		const recipeCosts = calculateRecipeCosts(recipe, costs, []);

		// 500g of flour at 100 yen per 1000g = 50 yen
		expect(recipeCosts['flour']).toBe(50);
	});

	it('calculates cost for multiple ingredients', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g'),
			sugar: createIngredient('sugar', 'Sugar', 80, 500, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [
			{ id: 'flour', amount: 200, unit: 'g' },
			{ id: 'sugar', amount: 100, unit: 'g' }
		]);

		const recipeCosts = calculateRecipeCosts(recipe, costs, []);

		// flour: 200g at 100 yen per 1000g = 20 yen
		// sugar: 100g at 80 yen per 500g = 16 yen
		expect(recipeCosts['flour']).toBe(20);
		expect(recipeCosts['sugar']).toBe(16);
	});

	it('skips hidden ingredients', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g'),
			sugar: createIngredient('sugar', 'Sugar', 80, 500, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [
			{ id: 'flour', amount: 200, unit: 'g', hidden: false },
			{ id: 'sugar', amount: 100, unit: 'g', hidden: true }
		]);

		const recipeCosts = calculateRecipeCosts(recipe, costs, []);

		expect(recipeCosts['flour']).toBe(20);
		expect(recipeCosts['sugar']).toBeUndefined();
	});

	it('handles missing ingredients gracefully', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [
			{ id: 'flour', amount: 200, unit: 'g' },
			{ id: 'missingIngredient', amount: 100, unit: 'g' }
		]);

		const recipeCosts = calculateRecipeCosts(recipe, costs, []);

		expect(recipeCosts['flour']).toBe(20);
		expect(recipeCosts['missingIngredient']).toBeUndefined();
	});

	it('uses unit conversions when needed', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [{ id: 'flour', amount: 1, unit: 'cup' }]);

		const conversions: UnitConversion[] = [
			{ ingredientId: 'flour', inputUnit: 'g', outputUnit: 'cup', conversionFactor: 125 }
		];

		const recipeCosts = calculateRecipeCosts(recipe, costs, conversions);

		// 1 cup = 125g (from conversion), at 100 yen per 1000g = 12.5 yen
		expect(recipeCosts['flour']).toBeCloseTo(12.5, 2);
	});

	it('sets cost to 0 when conversion fails', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [{ id: 'flour', amount: 1, unit: 'cup' }]);

		// No conversion provided
		const recipeCosts = calculateRecipeCosts(recipe, costs, []);

		expect(recipeCosts['flour']).toBe(0);
	});
});

describe('getTotalRecipeCost', () => {
	it('sums all costs', () => {
		const recipeCosts = {
			flour: 20,
			sugar: 16,
			butter: 30
		};

		expect(getTotalRecipeCost(recipeCosts)).toBe(66);
	});

	it('returns 0 for empty costs', () => {
		expect(getTotalRecipeCost({})).toBe(0);
	});

	it('handles single ingredient', () => {
		expect(getTotalRecipeCost({ flour: 50 })).toBe(50);
	});
});

describe('compoundsToIngredients', () => {
	it('converts compound to ingredient with calculated cost', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g'),
			sugar: createIngredient('sugar', 'Sugar', 80, 500, 'g')
		};

		const compounds: Record<string, CompoundIngredientDoc> = {
			dough: createCompound('dough', 'Dough', 500, 'g', [
				{ id: 'flour', amount: 300, unit: 'g' },
				{ id: 'sugar', amount: 50, unit: 'g' }
			])
		};

		const result = compoundsToIngredients(compounds, costs, []);

		expect(result['dough']).toBeDefined();
		expect(result['dough'].product.amount).toBe(500);
		expect(result['dough'].product.unit).toBe('g');
		// flour: 300g at 100/1000 = 30, sugar: 50g at 80/500 = 8, total = 38
		expect(result['dough'].product.cost).toBe(38);
	});

	it('handles empty compounds', () => {
		const result = compoundsToIngredients({}, {}, []);
		expect(result).toEqual({});
	});
});

describe('getAllCosts', () => {
	it('combines regular costs and compound costs', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g')
		};

		const compounds: Record<string, CompoundIngredientDoc> = {
			dough: createCompound('dough', 'Dough', 500, 'g', [{ id: 'flour', amount: 300, unit: 'g' }])
		};

		const result = getAllCosts(costs, compounds, []);

		expect(result['flour']).toBeDefined();
		expect(result['dough']).toBeDefined();
	});

	it('compound costs override regular costs with same id', () => {
		const costs: Record<string, IngredientDoc> = {
			item: createIngredient('item', 'Item', 100, 1000, 'g')
		};

		const compounds: Record<string, CompoundIngredientDoc> = {
			item: createCompound('item', 'Compound Item', 500, 'g', [])
		};

		const result = getAllCosts(costs, compounds, []);

		// Compound should override regular cost
		expect(result['item'].name).toBe('Compound Item');
	});
});

describe('getAvailableIngredients', () => {
	it('excludes ingredients already in recipe', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g'),
			sugar: createIngredient('sugar', 'Sugar', 80, 500, 'g'),
			butter: createIngredient('butter', 'Butter', 200, 200, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }]);

		const available = getAvailableIngredients(recipe, costs);

		expect(available).toHaveLength(2);
		expect(available.map((i) => i.id)).toContain('sugar');
		expect(available.map((i) => i.id)).toContain('butter');
		expect(available.map((i) => i.id)).not.toContain('flour');
	});

	it('returns all ingredients when recipe is empty', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g'),
			sugar: createIngredient('sugar', 'Sugar', 80, 500, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', []);

		const available = getAvailableIngredients(recipe, costs);

		expect(available).toHaveLength(2);
	});

	it('returns empty when all ingredients are used', () => {
		const costs: Record<string, IngredientDoc> = {
			flour: createIngredient('flour', 'Flour', 100, 1000, 'g')
		};

		const recipe = createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }]);

		const available = getAvailableIngredients(recipe, costs);

		expect(available).toHaveLength(0);
	});
});

describe('getRecipesUsingIngredient', () => {
	it('finds recipes using specific ingredient', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }]),
			bread: createRecipe('bread', 'Bread', [{ id: 'flour', amount: 500, unit: 'g' }]),
			pudding: createRecipe('pudding', 'Pudding', [{ id: 'sugar', amount: 100, unit: 'g' }])
		};

		const result = getRecipesUsingIngredient('flour', recipes);

		expect(result).toHaveLength(2);
		expect(result.map((r) => r.id)).toContain('cake');
		expect(result.map((r) => r.id)).toContain('bread');
		expect(result.map((r) => r.id)).not.toContain('pudding');
	});

	it('returns empty array when ingredient not used', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }])
		};

		const result = getRecipesUsingIngredient('butter', recipes);

		expect(result).toHaveLength(0);
	});

	it('handles empty recipes', () => {
		const result = getRecipesUsingIngredient('flour', {});
		expect(result).toHaveLength(0);
	});
});

describe('removeIngredientFromAllRecipes', () => {
	it('removes ingredient from all recipes', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [
				{ id: 'flour', amount: 200, unit: 'g' },
				{ id: 'sugar', amount: 100, unit: 'g' }
			]),
			bread: createRecipe('bread', 'Bread', [
				{ id: 'flour', amount: 500, unit: 'g' },
				{ id: 'butter', amount: 50, unit: 'g' }
			])
		};

		const result = removeIngredientFromAllRecipes('flour', recipes);

		expect(result['cake'].ingredients).toHaveLength(1);
		expect(result['cake'].ingredients[0].id).toBe('sugar');
		expect(result['bread'].ingredients).toHaveLength(1);
		expect(result['bread'].ingredients[0].id).toBe('butter');
	});

	it('does not modify original recipes', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }])
		};

		removeIngredientFromAllRecipes('flour', recipes);

		expect(recipes['cake'].ingredients).toHaveLength(1);
	});

	it('handles ingredient not in any recipe', () => {
		const recipes: Record<string, RecipeDoc> = {
			cake: createRecipe('cake', 'Cake', [{ id: 'flour', amount: 200, unit: 'g' }])
		};

		const result = removeIngredientFromAllRecipes('butter', recipes);

		expect(result['cake'].ingredients).toHaveLength(1);
	});

	it('handles empty recipes', () => {
		const result = removeIngredientFromAllRecipes('flour', {});
		expect(result).toEqual({});
	});
});

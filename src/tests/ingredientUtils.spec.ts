import { describe, expect, it } from 'vitest';
import {
	isInitialUnitSelection,
	isIngredientUsedWithCommittedUnits,
	isUnsetUnit,
	NEW_INGREDIENT_PLACEHOLDER_UNIT,
	shouldPromptForUnitConversion,
	UNSET_UNIT
} from '$lib/utils/ingredientUtils';
import type { RecipeDoc } from '$lib/data/schema';

const recipeWithIngredient = (
	ingredientId: string,
	portionUnit: string,
	recipeId = 'recipe1'
): Record<string, RecipeDoc> => ({
	[recipeId]: {
		id: recipeId,
		name: 'Test',
		ingredients: [{ id: ingredientId, portion: { amount: 1, unit: portionUnit }, hidden: false }]
	}
});

describe('ingredientUtils', () => {
	it('identifies the unset unit sentinel', () => {
		expect(isUnsetUnit('')).toBe(true);
		expect(isUnsetUnit('g')).toBe(false);
		expect(UNSET_UNIT).toBe('');
		expect(NEW_INGREDIENT_PLACEHOLDER_UNIT).toBe('');
	});

	it('detects initial unit selection while product and portion are unset', () => {
		expect(isInitialUnitSelection({ productUnit: '', portionUnit: '' })).toBe(true);
		expect(isInitialUnitSelection({ productUnit: 'g', portionUnit: '' })).toBe(false);
		expect(isInitialUnitSelection({ productUnit: '', portionUnit: 'g' })).toBe(false);
	});

	it('detects ingredient usage with committed portion units only', () => {
		expect(isIngredientUsedWithCommittedUnits('flour', recipeWithIngredient('flour', 'g'))).toBe(
			true
		);
		expect(isIngredientUsedWithCommittedUnits('flour', recipeWithIngredient('flour', ''))).toBe(
			false
		);
		expect(isIngredientUsedWithCommittedUnits('flour', {})).toBe(false);
	});

	it('prompts for conversion only when used with committed units', () => {
		expect(
			shouldPromptForUnitConversion({
				oldUnit: 'g',
				newUnit: 'ml',
				ingredientId: 'flour',
				recipes: recipeWithIngredient('flour', 'g')
			})
		).toBe(true);

		expect(
			shouldPromptForUnitConversion({
				oldUnit: 'g',
				newUnit: 'ml',
				ingredientId: 'flour',
				recipes: {}
			})
		).toBe(false);

		expect(
			shouldPromptForUnitConversion({
				oldUnit: '',
				newUnit: 'g',
				ingredientId: 'flour',
				recipes: recipeWithIngredient('flour', 'g')
			})
		).toBe(false);
	});
});

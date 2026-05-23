import { describe, expect, it } from 'vitest';
import {
	isFirstIngredientUnitPick,
	isPlaceholderProductUnit,
	NEW_INGREDIENT_PLACEHOLDER_UNIT,
	portionUnitsExcludingPlaceholder
} from '$lib/utils/ingredientUtils';

describe('ingredientUtils', () => {
	it('identifies the placeholder product unit', () => {
		expect(isPlaceholderProductUnit('cup')).toBe(true);
		expect(isPlaceholderProductUnit('g')).toBe(false);
		expect(NEW_INGREDIENT_PLACEHOLDER_UNIT).toBe('cup');
	});

	it('filters placeholder portion units during first unit pick', () => {
		expect(portionUnitsExcludingPlaceholder(['cup', 'tbs'], true)).toEqual(['tbs']);
		expect(portionUnitsExcludingPlaceholder(['cup', 'tbs'], false)).toEqual(['cup', 'tbs']);
	});

	it('detects first product unit pick', () => {
		expect(
			isFirstIngredientUnitPick({
				allowFirstUnitPick: true,
				productUnit: 'cup'
			})
		).toBe(true);
		expect(
			isFirstIngredientUnitPick({
				allowFirstUnitPick: false,
				productUnit: 'cup'
			})
		).toBe(false);
		expect(
			isFirstIngredientUnitPick({
				allowFirstUnitPick: true,
				productUnit: 'g'
			})
		).toBe(false);
	});

	it('detects first recipe portion unit pick', () => {
		expect(
			isFirstIngredientUnitPick({
				allowFirstUnitPick: true,
				productUnit: 'cup',
				portionUnit: 'cup'
			})
		).toBe(true);
		expect(
			isFirstIngredientUnitPick({
				allowFirstUnitPick: true,
				productUnit: 'cup',
				portionUnit: 'g'
			})
		).toBe(false);
	});
});

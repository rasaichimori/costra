import { getUnitCategory, getUnitsByCategory } from '$lib/utils/unitCategoryUtils';
import { describe, expect, it } from 'vitest';

describe('getUnitCategory', () => {
	describe('volume units', () => {
		it('identifies pint as Volume', () => {
			expect(getUnitCategory('pint')).toBe('Volume');
		});

		it('identifies cup as Volume', () => {
			expect(getUnitCategory('cup')).toBe('Volume');
		});

		it('identifies tbs as Volume', () => {
			expect(getUnitCategory('tbs')).toBe('Volume');
		});

		it('identifies oz as Volume', () => {
			expect(getUnitCategory('oz')).toBe('Volume');
		});

		it('identifies tsp as Volume', () => {
			expect(getUnitCategory('tsp')).toBe('Volume');
		});

		it('identifies can as Volume', () => {
			expect(getUnitCategory('can')).toBe('Volume');
		});

		it('identifies ml as Volume', () => {
			expect(getUnitCategory('ml')).toBe('Volume');
		});

		it('identifies litre as Volume', () => {
			expect(getUnitCategory('litre')).toBe('Volume');
		});
	});

	describe('mass units', () => {
		it('identifies g as Mass', () => {
			expect(getUnitCategory('g')).toBe('Mass');
		});

		it('identifies kg as Mass', () => {
			expect(getUnitCategory('kg')).toBe('Mass');
		});
	});

	describe('custom units', () => {
		it('identifies unknown units as Custom', () => {
			expect(getUnitCategory('bunch')).toBe('Custom');
		});

		it('identifies pack as Custom', () => {
			expect(getUnitCategory('pack')).toBe('Custom');
		});

		it('identifies piece as Custom', () => {
			expect(getUnitCategory('piece')).toBe('Custom');
		});

		it('identifies arbitrary string as Custom', () => {
			expect(getUnitCategory('myCustomUnit')).toBe('Custom');
		});

		it('handles empty string as Custom', () => {
			expect(getUnitCategory('')).toBe('Custom');
		});
	});
});

describe('getUnitsByCategory', () => {
	const customUnitLabels = {
		bunch: 'Bunch',
		pack: 'Pack',
		piece: 'Piece'
	};

	describe('Volume category', () => {
		it('returns all volume units', () => {
			const units = getUnitsByCategory('Volume', customUnitLabels);

			expect(units).toContainEqual({ id: 'pint', label: 'Pint' });
			expect(units).toContainEqual({ id: 'cup', label: 'Cup' });
			expect(units).toContainEqual({ id: 'tbs', label: 'Tablespoon' });
			expect(units).toContainEqual({ id: 'oz', label: 'Ounce' });
			expect(units).toContainEqual({ id: 'tsp', label: 'Teaspoon' });
			expect(units).toContainEqual({ id: 'can', label: 'Can' });
			expect(units).toContainEqual({ id: 'ml', label: 'Milliliter' });
			expect(units).toContainEqual({ id: 'litre', label: 'Litre' });
		});

		it('returns correct number of volume units', () => {
			const units = getUnitsByCategory('Volume', customUnitLabels);
			expect(units).toHaveLength(8);
		});
	});

	describe('Mass category', () => {
		it('returns all mass units', () => {
			const units = getUnitsByCategory('Mass', customUnitLabels);

			expect(units).toContainEqual({ id: 'g', label: 'Gram' });
			expect(units).toContainEqual({ id: 'kg', label: 'Kilogram' });
		});

		it('returns correct number of mass units', () => {
			const units = getUnitsByCategory('Mass', customUnitLabels);
			expect(units).toHaveLength(2);
		});
	});

	describe('Custom category', () => {
		it('returns custom units from labels', () => {
			const units = getUnitsByCategory('Custom', customUnitLabels);

			expect(units).toContainEqual({ id: 'bunch', label: 'Bunch' });
			expect(units).toContainEqual({ id: 'pack', label: 'Pack' });
			expect(units).toContainEqual({ id: 'piece', label: 'Piece' });
		});

		it('returns correct number of custom units', () => {
			const units = getUnitsByCategory('Custom', customUnitLabels);
			expect(units).toHaveLength(3);
		});

		it('returns empty array when no custom units', () => {
			const units = getUnitsByCategory('Custom', {});
			expect(units).toHaveLength(0);
		});
	});

	describe('unit structure', () => {
		it('each unit has id and label properties', () => {
			const volumeUnits = getUnitsByCategory('Volume', {});
			const massUnits = getUnitsByCategory('Mass', {});
			const customUnits = getUnitsByCategory('Custom', customUnitLabels);

			[...volumeUnits, ...massUnits, ...customUnits].forEach((unit) => {
				expect(unit).toHaveProperty('id');
				expect(unit).toHaveProperty('label');
				expect(typeof unit.id).toBe('string');
				expect(typeof unit.label).toBe('string');
			});
		});
	});
});


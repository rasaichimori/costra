import { clampDragTop, getVerticalDragBounds } from '$lib/utils/dragControls';
import { describe, expect, it } from 'vitest';

describe('getVerticalDragBounds', () => {
	it('bounds the drag between the first item top and the last slot top', () => {
		// 3 items, 40px tall each, stacked from y=100 (no gap): bottoms at 140/180/220
		const bounds = getVerticalDragBounds(100, 220, 40);
		expect(bounds.minTop).toBe(100);
		expect(bounds.maxTop).toBe(180);
	});

	it('never lets maxTop fall below minTop when the dragged item is taller than the list', () => {
		const bounds = getVerticalDragBounds(100, 130, 80);
		expect(bounds.minTop).toBe(100);
		expect(bounds.maxTop).toBe(100);
	});
});

describe('clampDragTop', () => {
	it('returns the value untouched when within bounds', () => {
		expect(clampDragTop(150, 100, 180)).toBe(150);
	});

	it('clamps to the last position instead of dragging past it', () => {
		expect(clampDragTop(500, 100, 180)).toBe(180);
	});

	it('clamps to the first position instead of dragging above it', () => {
		expect(clampDragTop(-50, 100, 180)).toBe(100);
	});
});

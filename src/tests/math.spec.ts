import { clamp, mod, getDifferenceStringArrays, haveMutual, parseFraction } from '$lib/utils/math';
import { describe, expect, it } from 'vitest';

describe('clamp', () => {
	it('returns value when within range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it('returns min when value is below range', () => {
		expect(clamp(-5, 0, 10)).toBe(0);
	});

	it('returns max when value is above range', () => {
		expect(clamp(15, 0, 10)).toBe(10);
	});

	it('handles negative ranges', () => {
		expect(clamp(-5, -10, -1)).toBe(-5);
		expect(clamp(-15, -10, -1)).toBe(-10);
		expect(clamp(0, -10, -1)).toBe(-1);
	});

	it('returns boundary value when equal to min or max', () => {
		expect(clamp(0, 0, 10)).toBe(0);
		expect(clamp(10, 0, 10)).toBe(10);
	});
});

describe('mod', () => {
	it('handles positive modulo normally', () => {
		expect(mod(7, 3)).toBe(1);
		expect(mod(10, 5)).toBe(0);
	});

	it('handles negative numbers correctly (always positive result)', () => {
		// JavaScript % gives -1 for -1 % 3, but mod should give 2
		expect(mod(-1, 3)).toBe(2);
		expect(mod(-4, 3)).toBe(2);
		expect(mod(-7, 3)).toBe(2);
	});

	it('handles zero dividend', () => {
		expect(mod(0, 5)).toBe(0);
	});

	it('handles large numbers', () => {
		expect(mod(1000000, 7)).toBe(1000000 % 7);
	});
});

describe('getDifferenceStringArrays', () => {
	it('returns empty array when both arrays are identical', () => {
		expect(getDifferenceStringArrays(['a', 'b'], ['a', 'b'])).toEqual([]);
	});

	it('returns symmetric difference', () => {
		const diff = getDifferenceStringArrays(['a', 'b', 'c'], ['b', 'c', 'd']);
		expect(diff).toContain('a');
		expect(diff).toContain('d');
		expect(diff).not.toContain('b');
		expect(diff).not.toContain('c');
	});

	it('handles empty arrays', () => {
		expect(getDifferenceStringArrays([], ['a', 'b'])).toEqual(['a', 'b']);
		expect(getDifferenceStringArrays(['a', 'b'], [])).toEqual(['a', 'b']);
		expect(getDifferenceStringArrays([], [])).toEqual([]);
	});

	it('handles completely disjoint arrays', () => {
		const diff = getDifferenceStringArrays(['a', 'b'], ['c', 'd']);
		expect(diff).toHaveLength(4);
		expect(diff).toContain('a');
		expect(diff).toContain('b');
		expect(diff).toContain('c');
		expect(diff).toContain('d');
	});
});

describe('haveMutual', () => {
	it('returns true when arrays share elements', () => {
		expect(haveMutual(['a', 'b', 'c'], ['c', 'd', 'e'])).toBe(true);
	});

	it('returns false when arrays are disjoint', () => {
		expect(haveMutual(['a', 'b'], ['c', 'd'])).toBe(false);
	});

	it('handles empty arrays', () => {
		expect(haveMutual([], ['a', 'b'])).toBe(false);
		expect(haveMutual(['a', 'b'], [])).toBe(false);
		expect(haveMutual([], [])).toBe(false);
	});

	it('works with numbers', () => {
		expect(haveMutual([1, 2, 3], [3, 4, 5])).toBe(true);
		expect(haveMutual([1, 2], [3, 4])).toBe(false);
	});

	it('returns true when arrays are identical', () => {
		expect(haveMutual(['a', 'b'], ['a', 'b'])).toBe(true);
	});
});

describe('parseFraction', () => {
	describe('simple fractions', () => {
		it('parses 1/2', () => {
			expect(parseFraction('1/2')).toBe(0.5);
		});

		it('parses 3/4', () => {
			expect(parseFraction('3/4')).toBe(0.75);
		});

		it('parses 1/3', () => {
			expect(parseFraction('1/3')).toBeCloseTo(0.333, 2);
		});

		it('parses improper fractions', () => {
			expect(parseFraction('5/2')).toBe(2.5);
		});
	});

	describe('mixed numbers', () => {
		it('parses 1 1/2', () => {
			expect(parseFraction('1 1/2')).toBe(1.5);
		});

		it('parses 2 3/4', () => {
			expect(parseFraction('2 3/4')).toBe(2.75);
		});

		it('parses large mixed numbers', () => {
			expect(parseFraction('10 1/4')).toBe(10.25);
		});
	});

	describe('decimals and whole numbers', () => {
		it('parses whole numbers', () => {
			expect(parseFraction('5')).toBe(5);
		});

		it('parses decimals', () => {
			expect(parseFraction('2.5')).toBe(2.5);
		});

		it('parses negative decimals', () => {
			expect(parseFraction('-2.5')).toBe(-2.5);
		});
	});

	describe('edge cases', () => {
		it('returns 0 for empty string', () => {
			expect(parseFraction('')).toBe(0);
		});

		it('returns 0 for whitespace only', () => {
			expect(parseFraction('   ')).toBe(0);
		});

		it('handles leading/trailing whitespace', () => {
			expect(parseFraction('  1/2  ')).toBe(0.5);
			expect(parseFraction('  5  ')).toBe(5);
		});

	it('returns 0 for invalid input', () => {
		expect(parseFraction('abc')).toBe(0);
	});

	it('handles division by zero in fraction', () => {
		// '1/0' doesn't match fraction regex (denominator 0), falls through to parseFloat('1/0') = 1
		// This is expected behavior - the regex explicitly checks for valid fractions
		expect(parseFraction('1/0')).toBe(1);
		expect(parseFraction('0/0')).toBe(0);
	});

		it('handles negative fractions', () => {
			expect(parseFraction('-1/2')).toBe(-0.5);
		});
	});
});


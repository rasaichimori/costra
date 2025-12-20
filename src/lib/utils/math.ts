export const clamp = (value: number, min: number, max: number): number =>
	Math.max(min, Math.min(max, value));

export const mod = (n: number, m: number) => {
	return ((n % m) + m) % m;
};

export const getDifferenceStringArrays = (arrA: string[], arrB: string[]) => {
	const setA = new Set(arrA);
	const setB = new Set(arrB);

	const diff = [
		...arrA.filter((item) => !setB.has(item)),
		...arrB.filter((item) => !setA.has(item))
	];

	return diff;
};

export const haveMutual = <T>(a: T[], b: T[]): boolean => {
	const setA = new Set(a);
	for (const item of b) {
		if (setA.has(item)) return true;
	}
	return false;
};

/**
 * Parses a string that may contain fractions, mixed numbers, or decimals into a number.
 * Supports formats like:
 * - "1/2" -> 0.5
 * - "3/4" -> 0.75
 * - "1 1/2" -> 1.5
 * - "2.5" -> 2.5
 * - "5" -> 5
 * - Empty string -> 0
 */
export const parseFraction = (input: string): number => {
	if (!input || input.trim() === '') {
		return 0;
	}

	const trimmed = input.trim();

	// Try parsing as a mixed number (e.g., "1 1/2")
	const mixedNumberMatch = trimmed.match(/^(-?\d+)\s+(-?\d+)\/(-?\d+)$/);
	if (mixedNumberMatch) {
		const whole = parseFloat(mixedNumberMatch[1]);
		const numerator = parseFloat(mixedNumberMatch[2]);
		const denominator = parseFloat(mixedNumberMatch[3]);
		if (denominator !== 0) {
			return whole + numerator / denominator;
		}
	}

	// Try parsing as a simple fraction (e.g., "1/2")
	const fractionMatch = trimmed.match(/^(-?\d+)\/(-?\d+)$/);
	if (fractionMatch) {
		const numerator = parseFloat(fractionMatch[1]);
		const denominator = parseFloat(fractionMatch[2]);
		if (denominator !== 0) {
			return numerator / denominator;
		}
	}

	// Try parsing as a decimal or whole number
	const decimal = parseFloat(trimmed);
	if (!isNaN(decimal)) {
		return decimal;
	}

	// If nothing matches, return 0
	return 0;
};

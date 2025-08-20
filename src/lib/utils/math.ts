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

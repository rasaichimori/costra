export const units = ['pint', 'cup', 'pack', 'tbs', 'oz', 'tsp', 'hint', 'can', 'g', 'ml'] as const;
export type Unit = (typeof units)[number];

export type Portion = {
	amount: number;
	unit: Unit;
};

export const TbsMultipliers: { [key in Unit]: number } = {
	tbs: 1,
	pint: 38.43,
	oz: 0.5,
	tsp: 0.3333,
	hint: 0.001,
	cup: 16,
	pack: 7,
	can: 28,
	g: 1 / 15,
	ml: 1 / 14.7868
};

export const convertUnit = (amount: number, inputUnit: Unit, outputUnit: Unit): number => {
	const tbsAmount = TbsMultipliers[inputUnit] * amount;
	return tbsAmount / TbsMultipliers[outputUnit];
};

import type { UnitConversion } from '$lib/data/schema';

export const volumeUnits = ['pint', 'cup', 'tbs', 'oz', 'tsp', 'can', 'ml', 'litre'] as const;
export type VolumeUnit = (typeof volumeUnits)[number];
export const volumeUnitLabels: Record<VolumeUnit, string> = {
	pint: 'Pint',
	cup: 'Cup',
	tbs: 'Tablespoon',
	oz: 'Ounce',
	tsp: 'Teaspoon',
	can: 'Can',
	ml: 'Milliliter',
	litre: 'Litre'
};

export const massUnits = ['g', 'kg'] as const;
export type MassUnit = (typeof massUnits)[number];
export const massUnitLabels: Record<MassUnit, string> = {
	g: 'Gram',
	kg: 'Kilogram'
};

export type Unit = VolumeUnit | MassUnit;

export type Portion = {
	amount: number;
	unit: Unit | string;
};

export type UnitOption = { id: string; label: string };
export type UnitOptionGroup = { label: string; options: UnitOption[] };

export const TbsMultipliers: { [key in VolumeUnit]: number } = {
	tbs: 1,
	pint: 38.43,
	oz: 0.5,
	tsp: 0.3333,
	cup: 16,
	can: 28,
	ml: 1 / 14.7868,
	litre: 1000 / 14.7868
};

export const MassUnitConversionFactors: { [key in MassUnit]: number } = {
	g: 1,
	kg: 1000
};

export const convertVolumeUnit = (
	amount: number,
	inputUnit: VolumeUnit,
	outputUnit: VolumeUnit
): number => {
	const tbsAmount = TbsMultipliers[inputUnit] * amount;
	return tbsAmount / TbsMultipliers[outputUnit];
};

export const convertMassUnit = (
	amount: number,
	inputUnit: MassUnit,
	outputUnit: MassUnit
): number => {
	return (amount * MassUnitConversionFactors[inputUnit]) / MassUnitConversionFactors[outputUnit];
};

export const convertUnit = (amount: number, inputUnit: Unit, outputUnit: Unit): number => {
	if (typeof inputUnit === 'string') {
		inputUnit = inputUnit as Unit;
	}
	if (typeof outputUnit === 'string') {
		outputUnit = outputUnit as Unit;
	}
	return convertVolumeUnit(amount, inputUnit as VolumeUnit, outputUnit as VolumeUnit);
};

/**
 * Check if a conversion exists between two units.
 * Uses the same logic as getConversionFactor but returns false instead of throwing.
 */
export const hasConversion = (
	inputUnit: Unit | string,
	outputUnit: Unit | string,
	ingredientId: string,
	conversions: UnitConversion[]
): boolean => {
	try {
		getConversionFactor(inputUnit, outputUnit, ingredientId, conversions);
		return true;
	} catch {
		return false;
	}
};

/**
 * Get the conversion factor between two units.
 * For same-type conversions (volume-to-volume or mass-to-mass), uses standard conversion functions.
 * For cross-type conversions or custom units, looks up in the conversions array.
 */
export const getConversionFactor = (
	inputUnit: Unit | string,
	outputUnit: Unit | string,
	ingredientId: string,
	conversions: UnitConversion[]
): number => {
	// If input and output are the same unit, conversion factor is 1
	if (inputUnit === outputUnit) {
		return 1;
	}

	// Build adjacency list for the conversion graph
	// Map from unit -> list of [targetUnit, conversionFactor]
	const graph = new Map<string, Array<[string, number]>>();

	// Helper to add edge to graph
	const addEdge = (from: string, to: string, factor: number) => {
		if (!graph.has(from)) {
			graph.set(from, []);
		}
		graph.get(from)!.push([to, factor]);
	};

	// Add all volume-to-volume conversions
	for (const from of volumeUnits) {
		for (const to of volumeUnits) {
			if (from !== to) {
				const factor = convertVolumeUnit(1, from, to);
				addEdge(from, to, factor);
			}
		}
	}

	// Add all mass-to-mass conversions
	for (const from of massUnits) {
		for (const to of massUnits) {
			if (from !== to) {
				const factor = convertMassUnit(1, from, to);
				addEdge(from, to, factor);
			}
		}
	}

	// Add custom conversions from the conversions array
	for (const conv of conversions) {
		if (conv.ingredientId === ingredientId) {
			// The stored conversion factor represents: inputAmount × factor = outputAmount
			// Example: inputUnit="g", outputUnit="cup", factor=140 means "gAmount × 140 = cupAmount"
			// This means: 140g = 1 cup, or equivalently: 1g = (1/140) cup
			// To convert from inputUnit to outputUnit: outputAmount = inputAmount × factor
			// To convert from outputUnit to inputUnit: inputAmount = outputAmount / factor = outputAmount × (1/factor)
			// Add forward direction: inputUnit → outputUnit
			addEdge(conv.inputUnit, conv.outputUnit, conv.conversionFactor);
			// Add reverse direction: outputUnit → inputUnit
			addEdge(conv.outputUnit, conv.inputUnit, 1 / conv.conversionFactor);
		}
	}

	// BFS to find shortest path from inputUnit to outputUnit
	const queue: Array<[string, number]> = [[inputUnit, 1]];
	const visited = new Set<string>();
	visited.add(inputUnit);

	while (queue.length > 0) {
		const [currentUnit, currentFactor] = queue.shift()!;

		// Get all neighbors of current unit
		const neighbors = graph.get(currentUnit) || [];

		for (const [nextUnit, stepFactor] of neighbors) {
			// Skip if already visited
			if (visited.has(nextUnit)) {
				continue;
			}

			const newFactor = currentFactor * stepFactor;

			// Found the target!
			if (nextUnit === outputUnit) {
				return newFactor;
			}

			// Mark as visited and add to queue
			visited.add(nextUnit);
			queue.push([nextUnit, newFactor]);
		}
	}

	// If no path found, throw error
	throw Error(
		`No conversion path found from ${inputUnit} to ${outputUnit} for ingredient ${ingredientId}`
	);
};

/**
 * Determines if unit1 is smaller than unit2 based on standard conversion factors.
 * Returns null if comparison cannot be determined (custom units).
 *
 * For cross-type conversions (mass ↔ volume), mass is considered "smaller"
 * since 1 cup ≈ 240g, making "How many grams in one cup?" the natural question.
 */
export const isSmallerUnit = (unit1: Unit | string, unit2: Unit | string): boolean | null => {
	const unit1IsVolume = volumeUnits.includes(unit1 as VolumeUnit);
	const unit1IsMass = massUnits.includes(unit1 as MassUnit);
	const unit2IsVolume = volumeUnits.includes(unit2 as VolumeUnit);
	const unit2IsMass = massUnits.includes(unit2 as MassUnit);

	// Check if both are volume units
	if (unit1IsVolume && unit2IsVolume) {
		const factor1 = TbsMultipliers[unit1 as VolumeUnit];
		const factor2 = TbsMultipliers[unit2 as VolumeUnit];
		return factor1 < factor2;
	}

	// Check if both are mass units
	if (unit1IsMass && unit2IsMass) {
		const factor1 = MassUnitConversionFactors[unit1 as MassUnit];
		const factor2 = MassUnitConversionFactors[unit2 as MassUnit];
		return factor1 < factor2;
	}

	// Cross-type conversion: mass is considered "smaller" than volume
	// This makes "How many grams in one cup?" the natural question format
	if (unit1IsMass && unit2IsVolume) {
		return true; // mass < volume
	}
	if (unit1IsVolume && unit2IsMass) {
		return false; // volume > mass
	}

	// Cannot determine for custom units
	return null;
};

/**
 * Normalizes a unit conversion so that the smaller unit comes first.
 * If the output unit is smaller, swaps the units and inverts the factor.
 */
export const normalizeUnitConversion = (conversion: UnitConversion): UnitConversion => {
	const outputIsSmaller = isSmallerUnit(conversion.outputUnit, conversion.inputUnit);

	if (outputIsSmaller === true) {
		// Swap units and invert factor
		return {
			...conversion,
			inputUnit: conversion.outputUnit,
			outputUnit: conversion.inputUnit,
			conversionFactor: 1 / conversion.conversionFactor
		};
	}

	// Already in correct order
	return conversion;
};

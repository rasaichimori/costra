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
	unitId: Unit | string;
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

	// Check if both units are volume units
	const isInputVolume = volumeUnits.includes(inputUnit as VolumeUnit);
	const isOutputVolume = volumeUnits.includes(outputUnit as VolumeUnit);

	// Check if both units are mass units
	const isInputMass = massUnits.includes(inputUnit as MassUnit);
	const isOutputMass = massUnits.includes(outputUnit as MassUnit);

	// If both are volume units, use volume conversion
	if (isInputVolume && isOutputVolume) {
		return convertVolumeUnit(1, inputUnit as VolumeUnit, outputUnit as VolumeUnit);
	}
	// If both are mass units, use mass conversion
	if (isInputMass && isOutputMass) {
		return convertMassUnit(1, inputUnit as MassUnit, outputUnit as MassUnit);
	}
	// Otherwise (different types or custom units), use conversions array
	const conversion = conversions.find(
		(c) =>
			c.ingredientId === ingredientId && c.inputUnit === inputUnit && c.outputUnit === outputUnit
	);
	if (conversion !== undefined) {
		return conversion.conversionFactor;
	}

	// If not found, check for swapped conversion (output -> input) and return inverse
	const swappedConversion = conversions.find(
		(c) =>
			c.ingredientId === ingredientId && c.inputUnit === outputUnit && c.outputUnit === inputUnit
	);
	if (swappedConversion !== undefined) {
		return 1 / swappedConversion.conversionFactor;
	}

	// Try to find indirect conversion through intermediate units
	// Helper function to find conversion factor between two units
	const findConversionFactor = (from: Unit | string, to: Unit | string): number | null => {
		// If same unit, return 1
		if (from === to) {
			return 1;
		}
		// Check if both are volume units
		const isFromVolume = volumeUnits.includes(from as VolumeUnit);
		const isToVolume = volumeUnits.includes(to as VolumeUnit);
		// Check if both are mass units
		const isFromMass = massUnits.includes(from as MassUnit);
		const isToMass = massUnits.includes(to as MassUnit);

		// If both are volume units, use volume conversion
		if (isFromVolume && isToVolume) {
			return convertVolumeUnit(1, from as VolumeUnit, to as VolumeUnit);
		}
		// If both are mass units, use mass conversion
		if (isFromMass && isToMass) {
			return convertMassUnit(1, from as MassUnit, to as MassUnit);
		}
		// Otherwise, look in conversions array
		const direct = conversions.find(
			(c) => c.ingredientId === ingredientId && c.inputUnit === from && c.outputUnit === to
		);
		if (direct !== undefined) {
			return direct.conversionFactor;
		}
		// Swapped conversion
		const swapped = conversions.find(
			(c) => c.ingredientId === ingredientId && c.inputUnit === to && c.outputUnit === from
		);
		if (swapped !== undefined) {
			return 1 / swapped.conversionFactor;
		}
		return null;
	};

	// Determine unit types
	const isInputCustom = !isInputVolume && !isInputMass;
	const isOutputCustom = !isOutputVolume && !isOutputMass;

	// Try to find indirect conversion through intermediate units
	// Case 1: Custom -> Volume (try mass as intermediate: custom -> mass -> volume)
	if (isInputCustom && isOutputVolume) {
		for (const intermediateMass of massUnits) {
			const firstFactor = findConversionFactor(inputUnit, intermediateMass);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateMass, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
	}

	// Case 2: Volume -> Custom (try mass as intermediate: volume -> mass -> custom)
	if (isInputVolume && isOutputCustom) {
		for (const intermediateMass of massUnits) {
			const firstFactor = findConversionFactor(inputUnit, intermediateMass);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateMass, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
	}

	// Case 3: Custom -> Mass (try volume as intermediate: custom -> volume -> mass)
	if (isInputCustom && isOutputMass) {
		for (const intermediateVolume of volumeUnits) {
			const firstFactor = findConversionFactor(inputUnit, intermediateVolume);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateVolume, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
	}

	// Case 4: Mass -> Custom (try volume as intermediate: mass -> volume -> custom)
	if (isInputMass && isOutputCustom) {
		for (const intermediateVolume of volumeUnits) {
			const firstFactor = findConversionFactor(inputUnit, intermediateVolume);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateVolume, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
	}

	// Case 5: Volume -> Mass (try other volume units or custom as intermediate)
	if (isInputVolume && isOutputMass) {
		// First, try other volume units as intermediate (e.g., oz -> cup -> g)
		for (const intermediateVolume of volumeUnits) {
			// Skip if intermediate is same as input
			if (intermediateVolume === inputUnit) {
				continue;
			}
			const firstFactor = findConversionFactor(inputUnit, intermediateVolume);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateVolume, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
		// Then try custom units as intermediate
		const customUnits = new Set<string>();
		conversions
			.filter((c) => c.ingredientId === ingredientId)
			.forEach((c) => {
				if (
					!volumeUnits.includes(c.inputUnit as VolumeUnit) &&
					!massUnits.includes(c.inputUnit as MassUnit)
				) {
					customUnits.add(c.inputUnit);
				}
				if (
					!volumeUnits.includes(c.outputUnit as VolumeUnit) &&
					!massUnits.includes(c.outputUnit as MassUnit)
				) {
					customUnits.add(c.outputUnit);
				}
			});
		for (const intermediateCustom of customUnits) {
			const firstFactor = findConversionFactor(inputUnit, intermediateCustom);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateCustom, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
	}

	// Case 6: Mass -> Volume (try other mass units or custom as intermediate)
	if (isInputMass && isOutputVolume) {
		// First, try other mass units as intermediate (e.g., g -> kg -> cup)
		for (const intermediateMass of massUnits) {
			// Skip if intermediate is same as input
			if (intermediateMass === inputUnit) {
				continue;
			}
			const firstFactor = findConversionFactor(inputUnit, intermediateMass);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateMass, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
		// Then try custom units as intermediate
		const customUnits = new Set<string>();
		conversions
			.filter((c) => c.ingredientId === ingredientId)
			.forEach((c) => {
				if (
					!volumeUnits.includes(c.inputUnit as VolumeUnit) &&
					!massUnits.includes(c.inputUnit as MassUnit)
				) {
					customUnits.add(c.inputUnit);
				}
				if (
					!volumeUnits.includes(c.outputUnit as VolumeUnit) &&
					!massUnits.includes(c.outputUnit as MassUnit)
				) {
					customUnits.add(c.outputUnit);
				}
			});
		for (const intermediateCustom of customUnits) {
			const firstFactor = findConversionFactor(inputUnit, intermediateCustom);
			if (firstFactor !== null) {
				const secondFactor = findConversionFactor(intermediateCustom, outputUnit);
				if (secondFactor !== null) {
					return firstFactor * secondFactor;
				}
			}
		}
	}

	// Case 7: Custom -> Custom (try volume -> mass or mass -> volume as intermediate)
	if (isInputCustom && isOutputCustom) {
		// Try: custom -> volume -> mass -> custom
		for (const intermediateVolume of volumeUnits) {
			for (const intermediateMass of massUnits) {
				const factor1 = findConversionFactor(inputUnit, intermediateVolume);
				if (factor1 !== null) {
					const factor2 = findConversionFactor(intermediateVolume, intermediateMass);
					if (factor2 !== null) {
						const factor3 = findConversionFactor(intermediateMass, outputUnit);
						if (factor3 !== null) {
							return factor1 * factor2 * factor3;
						}
					}
				}
				// Try: custom -> mass -> volume -> custom
				const factor1b = findConversionFactor(inputUnit, intermediateMass);
				if (factor1b !== null) {
					const factor2b = findConversionFactor(intermediateMass, intermediateVolume);
					if (factor2b !== null) {
						const factor3b = findConversionFactor(intermediateVolume, outputUnit);
						if (factor3b !== null) {
							return factor1b * factor2b * factor3b;
						}
					}
				}
			}
		}
	}

	// If neither direction is found, throw error
	console.trace();
	throw Error(
		`conversion ${inputUnit}-${outputUnit} for ingredient ${ingredientId} should exist but is not found`
	);
};

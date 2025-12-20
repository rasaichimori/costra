import { volumeUnits, massUnits, volumeUnitLabels, massUnitLabels } from '$lib/utils/unit';

export type UnitCategory = 'Volume' | 'Mass' | 'Custom';

/**
 * Get the category of a unit
 */
export const getUnitCategory = (unit: string): UnitCategory => {
	if ((volumeUnits as readonly string[]).includes(unit)) return 'Volume';
	if ((massUnits as readonly string[]).includes(unit)) return 'Mass';
	return 'Custom';
};

/**
 * Get units by category
 */
export const getUnitsByCategory = (
	category: UnitCategory,
	customUnitLabels: Record<string, string>
): { id: string; label: string }[] => {
	if (category === 'Volume') {
		return volumeUnits.map((u) => ({ id: u, label: volumeUnitLabels[u] }));
	}
	if (category === 'Mass') {
		return massUnits.map((u) => ({ id: u, label: massUnitLabels[u] }));
	}
	// Custom units
	return Object.entries(customUnitLabels).map(([id, label]) => ({ id, label }));
};


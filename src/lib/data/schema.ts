import type { Portion, Unit } from '$lib/utils/unit';

export interface IngredientDoc {
	/** Stable machine-readable id (e.g. "frozenMango") */
	id: string;
	/** Friendly display name (e.g. "Frozen Mango") */
	name: string;
	/** Category controls filtering & colours in UI */
	category: string;
	product: {
		/** Cost of purchasing the package in yen */
		cost: number;
		/** Amount contained in the package (e.g. 1000) */
		amount: number;
		/** Unit of the package (e.g. "g", "ml", "pack") */
		unit: Unit | string;
	};
	/** Hex or CSS colour string for chart slice */
	color: string;
}

export interface RecipeDoc {
	id: string;
	name: string;
	ingredients: {
		id: string;
		portion: Portion;
		/** When true, ingredient is hidden from calculations & charts */
		hidden: boolean;
	}[];
}

export interface CompoundIngredientDoc extends RecipeDoc {
	/** Category controls filtering & colours in UI */
	category: string;
	/** Hex or CSS colour string for chart slice */
	color: string;
	/** Amount of the compound ingredient that comes out of the recipe */
	yield: Portion;
	/** Unit of the yield displayed in the recipe */
	viewedUnit: Unit | string;
}

// Bascially how many inputs are in one output
export interface UnitConversion {
	ingredientId: string; // this could be an ingredient id or a compound id
	inputUnit: Unit | string; // Gram
	outputUnit: Unit | string; // KG
	conversionFactor: number; // 1000
}

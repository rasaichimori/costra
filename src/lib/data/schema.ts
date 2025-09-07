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
		unit: Unit;
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

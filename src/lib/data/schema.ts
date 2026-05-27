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

export interface RecipeIngredientEntry {
	id: string;
	portion: Portion;
	/** When true, ingredient is hidden from calculations & charts */
	hidden: boolean;
}

export interface RecipeSize {
	id: string;
	name: string;
	ingredients: RecipeIngredientEntry[];
	sellingPrice: number;
}

export interface RecipeDoc {
	id: string;
	name: string;
	sizes: RecipeSize[];
	/** Which size tab is selected in the recipe editor */
	activeSizeId: string;
}

/** Recipes and compounds that expose an ingredient list for cost calculation */
export interface RecipeWithIngredients {
	id: string;
	ingredients: RecipeIngredientEntry[];
}

export interface CompoundIngredientDoc extends RecipeWithIngredients {
	name: string;
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

export type RecipeLikeDoc = RecipeDoc | CompoundIngredientDoc;

/** Legacy recipe shape stored in older exports / localStorage */
export interface LegacyRecipeDoc {
	id: string;
	name: string;
	ingredients: RecipeIngredientEntry[];
}

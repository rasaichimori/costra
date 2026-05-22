import { browser } from '$app/environment';
import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';

const STORAGE_KEY = 'costra_app_data';

export interface AppData {
	costs: Record<string, IngredientDoc>;
	compoundIngredients: Record<string, CompoundIngredientDoc>;
	recipes: Record<string, RecipeDoc>;
	customUnitLabels: Record<string, string>;
	unitConversions: UnitConversion[];
}

/**
 * Save all app data to localStorage
 */
export function saveAppData(data: AppData): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		console.warn('Failed to save app data to localStorage:', error);
	}
}

/**
 * Load all app data from localStorage
 */
export function loadAppData(): AppData | null {
	if (!browser) return null;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored) as AppData;
		}
	} catch (error) {
		console.warn('Failed to load app data from localStorage:', error);
	}

	return null;
}

/**
 * Check if there's saved data in localStorage
 */
export function hasSavedData(): boolean {
	if (!browser) return false;

	try {
		return localStorage.getItem(STORAGE_KEY) !== null;
	} catch {
		return false;
	}
}

/**
 * Clear all app data from localStorage
 */
export function clearAppData(): void {
	if (!browser) return;

	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.warn('Failed to clear app data from localStorage:', error);
	}
}

// Legacy storage keys (for backwards compatibility)
const LEGACY_STORAGE_KEYS = {
	INGREDIENT_COSTS: 'lanibowls_ingredient_costs',
	RECIPES: 'lanibowls_recipes'
} as const;

/**
 * Save data to localStorage with error handling
 */
function saveToLocalStorage<T>(key: string, data: T): void {
	if (!browser) return;

	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.warn(`Failed to save to localStorage (${key}):`, error);
	}
}

/**
 * Load data from localStorage with error handling
 */
function loadFromLocalStorage<T>(key: string, fallback: T): T {
	if (!browser) return fallback;

	try {
		const stored = localStorage.getItem(key);
		if (stored) {
			return JSON.parse(stored) as T;
		}
	} catch (error) {
		console.warn(`Failed to load from localStorage (${key}):`, error);
	}

	return fallback;
}

/**
 * Clear specific data from localStorage
 */
function clearFromLocalStorage(key: string): void {
	if (!browser) return;

	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.warn(`Failed to clear from localStorage (${key}):`, error);
	}
}

// Legacy storage functions (kept for backwards compatibility)
export const storage = {
	costs: {
		save: <T>(data: T) => saveToLocalStorage(LEGACY_STORAGE_KEYS.INGREDIENT_COSTS, data),
		load: <T>(fallback: T): T =>
			loadFromLocalStorage(LEGACY_STORAGE_KEYS.INGREDIENT_COSTS, fallback),
		clear: () => clearFromLocalStorage(LEGACY_STORAGE_KEYS.INGREDIENT_COSTS)
	},
	recipes: {
		save: <T>(data: T) => saveToLocalStorage(LEGACY_STORAGE_KEYS.RECIPES, data),
		load: <T>(fallback: T): T => loadFromLocalStorage(LEGACY_STORAGE_KEYS.RECIPES, fallback),
		clear: () => clearFromLocalStorage(LEGACY_STORAGE_KEYS.RECIPES)
	}
};

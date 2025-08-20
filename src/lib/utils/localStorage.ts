import { browser } from '$app/environment';

const STORAGE_KEYS = {
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

// Specific storage functions for the admin panel
export const storage = {
	costs: {
		save: <T>(data: T) => saveToLocalStorage(STORAGE_KEYS.INGREDIENT_COSTS, data),
		load: <T>(fallback: T): T => loadFromLocalStorage(STORAGE_KEYS.INGREDIENT_COSTS, fallback),
		clear: () => clearFromLocalStorage(STORAGE_KEYS.INGREDIENT_COSTS)
	},
	recipes: {
		save: <T>(data: T) => saveToLocalStorage(STORAGE_KEYS.RECIPES, data),
		load: <T>(fallback: T): T => loadFromLocalStorage(STORAGE_KEYS.RECIPES, fallback),
		clear: () => clearFromLocalStorage(STORAGE_KEYS.RECIPES)
	}
};

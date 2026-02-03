import { getContext, setContext } from 'svelte';
import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';
import { historyManager } from '$lib/utils/history';
import { mockData } from '$lib/data/mockData';
import { loadAppData, saveAppData, hasSavedData, clearAppData } from '$lib/utils/localStorage';

class DataState {
	costs = $state<Record<string, IngredientDoc>>({});
	compoundIngredients = $state<Record<string, CompoundIngredientDoc>>({});
	recipes = $state<Record<string, RecipeDoc>>({});
	customUnitLabels = $state<Record<string, string>>({});
	unitConversions = $state<UnitConversion[]>([]);

	// Selection state for dashboard
	selectedRecipeId = $state<string | undefined>(undefined);
	selectedCompoundId = $state<string | undefined>(undefined);

	private isRestoring = $state(false);
	private isInitialized = false;
	private saveTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor(useMockData = false) {
		// First, try to load from localStorage
		const savedData = loadAppData();
		
		if (savedData) {
			// Restore from localStorage
			this.costs = savedData.costs;
			this.compoundIngredients = savedData.compoundIngredients;
			this.recipes = savedData.recipes;
			this.customUnitLabels = savedData.customUnitLabels;
			this.unitConversions = savedData.unitConversions;
		} else if (useMockData) {
			// No saved data, use mock data if requested
			this.costs = mockData.costs;
			this.compoundIngredients = mockData.compoundIngredients;
			this.recipes = mockData.recipes;
			this.customUnitLabels = mockData.unitLabels;
			this.unitConversions = mockData.unitConversions;
		}
		
		// Initialize history with initial state
		historyManager.initialize({
			costs: this.costs,
			compoundIngredients: this.compoundIngredients,
			recipes: this.recipes,
			customUnitLabels: this.customUnitLabels,
			unitConversions: this.unitConversions
		});
		this.isInitialized = true;
	}

	/**
	 * Check if there's saved data in localStorage
	 */
	hasSavedData(): boolean {
		return hasSavedData();
	}

	/**
	 * Initialize with mock data (for prefilled example)
	 */
	initializeWithMockData() {
		this.costs = mockData.costs;
		this.compoundIngredients = mockData.compoundIngredients;
		this.recipes = mockData.recipes;
		this.customUnitLabels = mockData.unitLabels;
		this.unitConversions = mockData.unitConversions;

		// Select first recipe and compound
		const recipeIds = Object.keys(this.recipes);
		const compoundIds = Object.keys(this.compoundIngredients);
		this.selectedRecipeId = recipeIds.length > 0 ? this.recipes[recipeIds[0]].id : undefined;
		this.selectedCompoundId = compoundIds.length > 0 ? this.compoundIngredients[compoundIds[0]].id : undefined;

		const currentState = {
			costs: this.costs,
			compoundIngredients: this.compoundIngredients,
			recipes: this.recipes,
			customUnitLabels: this.customUnitLabels,
			unitConversions: this.unitConversions
		};

		// Reinitialize history with new state
		historyManager.initialize(currentState);
		
		// Save to localStorage
		saveAppData(currentState);
	}

	/**
	 * Clear all data (for blank slate)
	 */
	clearAllData() {
		this.costs = {};
		this.compoundIngredients = {};
		this.recipes = {};
		this.customUnitLabels = {};
		this.unitConversions = [];
		
		const emptyState = {
			costs: this.costs,
			compoundIngredients: this.compoundIngredients,
			recipes: this.recipes,
			customUnitLabels: this.customUnitLabels,
			unitConversions: this.unitConversions
		};
		
		// Reinitialize history with empty state
		historyManager.initialize(emptyState);
		
		// Clear localStorage
		clearAppData();
	}

	/**
	 * Save current state to history and localStorage (debounced)
	 * Components can call this after making changes, or use the reactive version
	 */
	saveState() {
		if (this.isRestoring || !this.isInitialized) {
			return;
		}

		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}

		this.saveTimeout = setTimeout(() => {
			const currentState = {
				costs: this.costs,
				compoundIngredients: this.compoundIngredients,
				recipes: this.recipes,
				customUnitLabels: this.customUnitLabels,
				unitConversions: this.unitConversions
			};
			
			// Save to history for undo/redo
			historyManager.saveState(currentState);
			
			// Persist to localStorage
			saveAppData(currentState);
		}, 300);
	}

	canUndo() {
		return historyManager.canUndo();
	}

	canRedo() {
		return historyManager.canRedo();
	}

	async undo() {
		if (!this.canUndo()) return;
		const state = historyManager.getUndoState();
		if (state) {
			await this.restoreState(state);
		}
	}

	async redo() {
		if (!this.canRedo()) return;
		const state = historyManager.getRedoState();
		if (state) {
			await this.restoreState(state);
		}
	}

	private async restoreState(state: {
		costs: Record<string, IngredientDoc>;
		compoundIngredients: Record<string, CompoundIngredientDoc>;
		recipes: Record<string, RecipeDoc>;
		customUnitLabels: Record<string, string>;
		unitConversions: UnitConversion[];
	}) {
		// Set flag before restoring to prevent saveState from running
		this.isRestoring = true;
		
		// Restore state
		this.costs = state.costs;
		this.compoundIngredients = state.compoundIngredients;
		this.recipes = state.recipes;
		this.customUnitLabels = state.customUnitLabels;
		this.unitConversions = state.unitConversions;
		
		// Persist to localStorage after undo/redo
		saveAppData(state);
		
		// Wait for DOM to update before allowing saves again
		await new Promise((resolve) => setTimeout(resolve, 0));
		this.isRestoring = false;
	}
}

const DATA_KEY = Symbol('data');

export function setDataContext(useMockData = false) {
	const dataState = new DataState(useMockData);
	setContext(DATA_KEY, dataState);
	return dataState;
}

export function getDataContext(): DataState {
	return getContext(DATA_KEY);
}


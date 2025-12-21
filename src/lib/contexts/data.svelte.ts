import { getContext, setContext } from 'svelte';
import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';
import { historyManager } from '$lib/utils/history';
import { mockData } from '$lib/data/mockData';

class DataState {
	costs = $state<Record<string, IngredientDoc>>(mockData.costs);
	compoundIngredients = $state<Record<string, CompoundIngredientDoc>>(
		mockData.compoundIngredients
	);
	recipes = $state<Record<string, RecipeDoc>>(mockData.recipes);
	customUnitLabels = $state<Record<string, string>>(mockData.unitLabels);
	unitConversions = $state<UnitConversion[]>(mockData.unitConversions);

	private isRestoring = $state(false);
	private isInitialized = false;
	private saveTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor() {
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
	 * Save current state to history (debounced)
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
			historyManager.saveState({
				costs: this.costs,
				compoundIngredients: this.compoundIngredients,
				recipes: this.recipes,
				customUnitLabels: this.customUnitLabels,
				unitConversions: this.unitConversions
			});
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
		
		// Wait for DOM to update before allowing saves again
		await new Promise((resolve) => setTimeout(resolve, 0));
		this.isRestoring = false;
	}
}

const DATA_KEY = Symbol('data');

export function setDataContext() {
	const dataState = new DataState();
	setContext(DATA_KEY, dataState);
	return dataState;
}

export function getDataContext(): DataState {
	return getContext(DATA_KEY);
}


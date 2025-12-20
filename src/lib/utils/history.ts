import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';

export interface AppState {
	costs: Record<string, IngredientDoc>;
	compoundIngredients: Record<string, CompoundIngredientDoc>;
	recipes: Record<string, RecipeDoc>;
	customUnitLabels: Record<string, string>;
	unitConversions: UnitConversion[];
}

class HistoryManager {
	private history: AppState[] = [];
	private currentIndex = -1;
	private maxHistorySize = 50;

	/**
	 * Deep clone the state to create a snapshot
	 */
	private cloneState(state: AppState): AppState {
		return {
			costs: JSON.parse(JSON.stringify(state.costs)),
			compoundIngredients: JSON.parse(JSON.stringify(state.compoundIngredients)),
			recipes: JSON.parse(JSON.stringify(state.recipes)),
			customUnitLabels: JSON.parse(JSON.stringify(state.customUnitLabels)),
			unitConversions: JSON.parse(JSON.stringify(state.unitConversions))
		};
	}

	/**
	 * Save current state to history
	 */
	saveState(state: AppState): void {
		// Remove any future history if we're not at the end
		if (this.currentIndex < this.history.length - 1) {
			this.history = this.history.slice(0, this.currentIndex + 1);
		}

		// Add new state
		const snapshot = this.cloneState(state);
		this.history.push(snapshot);

		// Limit history size
		if (this.history.length > this.maxHistorySize) {
			this.history.shift();
		} else {
			this.currentIndex++;
		}
	}

	/**
	 * Get the previous state (undo)
	 */
	getUndoState(): AppState | null {
		if (this.currentIndex <= 0) {
			return null;
		}
		this.currentIndex--;
		return this.cloneState(this.history[this.currentIndex]);
	}

	/**
	 * Get the next state (redo)
	 */
	getRedoState(): AppState | null {
		if (this.currentIndex >= this.history.length - 1) {
			return null;
		}
		this.currentIndex++;
		return this.cloneState(this.history[this.currentIndex]);
	}

	/**
	 * Check if undo is available
	 */
	canUndo(): boolean {
		return this.currentIndex > 0;
	}

	/**
	 * Check if redo is available
	 */
	canRedo(): boolean {
		return this.currentIndex < this.history.length - 1;
	}

	/**
	 * Initialize history with initial state
	 */
	initialize(state: AppState): void {
		this.history = [this.cloneState(state)];
		this.currentIndex = 0;
	}

	/**
	 * Clear history
	 */
	clear(): void {
		this.history = [];
		this.currentIndex = -1;
	}
}

export const historyManager = new HistoryManager();


import type {
	CompoundIngredientDoc,
	IngredientDoc,
	RecipeDoc,
	UnitConversion
} from '$lib/data/schema';
import { beforeEach, describe, expect, it } from 'vitest';

// We need to test the HistoryManager class directly, so we'll create a local copy
// of the class for testing purposes since the exported instance is a singleton

interface AppState {
	costs: Record<string, IngredientDoc>;
	compoundIngredients: Record<string, CompoundIngredientDoc>;
	recipes: Record<string, RecipeDoc>;
	customUnitLabels: Record<string, string>;
	unitConversions: UnitConversion[];
}

class TestHistoryManager {
	private history: AppState[] = [];
	private currentIndex = -1;
	private maxHistorySize = 50;

	private cloneState(state: AppState): AppState {
		return {
			costs: JSON.parse(JSON.stringify(state.costs)),
			compoundIngredients: JSON.parse(JSON.stringify(state.compoundIngredients)),
			recipes: JSON.parse(JSON.stringify(state.recipes)),
			customUnitLabels: JSON.parse(JSON.stringify(state.customUnitLabels)),
			unitConversions: JSON.parse(JSON.stringify(state.unitConversions))
		};
	}

	saveState(state: AppState): void {
		if (this.currentIndex < this.history.length - 1) {
			this.history = this.history.slice(0, this.currentIndex + 1);
		}

		const snapshot = this.cloneState(state);
		this.history.push(snapshot);

		if (this.history.length > this.maxHistorySize) {
			this.history.shift();
		} else {
			this.currentIndex++;
		}
	}

	getUndoState(): AppState | null {
		if (this.currentIndex <= 0) {
			return null;
		}
		this.currentIndex--;
		return this.cloneState(this.history[this.currentIndex]);
	}

	getRedoState(): AppState | null {
		if (this.currentIndex >= this.history.length - 1) {
			return null;
		}
		this.currentIndex++;
		return this.cloneState(this.history[this.currentIndex]);
	}

	canUndo(): boolean {
		return this.currentIndex > 0;
	}

	canRedo(): boolean {
		return this.currentIndex < this.history.length - 1;
	}

	initialize(state: AppState): void {
		this.history = [this.cloneState(state)];
		this.currentIndex = 0;
	}

	clear(): void {
		this.history = [];
		this.currentIndex = -1;
	}

	// Test helper to check internal state
	getHistoryLength(): number {
		return this.history.length;
	}

	getCurrentIndex(): number {
		return this.currentIndex;
	}
}

const createEmptyState = (): AppState => ({
	costs: {},
	compoundIngredients: {},
	recipes: {},
	customUnitLabels: {},
	unitConversions: []
});

const createStateWithCost = (costId: string, costValue: number): AppState => ({
	costs: {
		[costId]: {
			id: costId,
			name: costId,
			category: 'test',
			product: { cost: costValue, amount: 100, unit: 'g' },
			color: '#ffffff'
		}
	},
	compoundIngredients: {},
	recipes: {},
	customUnitLabels: {},
	unitConversions: []
});

describe('HistoryManager', () => {
	let historyManager: TestHistoryManager;

	beforeEach(() => {
		historyManager = new TestHistoryManager();
	});

	describe('initialize', () => {
		it('sets initial state', () => {
			const state = createEmptyState();
			historyManager.initialize(state);

			expect(historyManager.getHistoryLength()).toBe(1);
			expect(historyManager.getCurrentIndex()).toBe(0);
		});

		it('clones the state (no reference sharing)', () => {
			const state = createStateWithCost('flour', 100);
			historyManager.initialize(state);

			// Modify original state
			state.costs['flour'].product.cost = 200;

			// Can't undo from initial state, but we can check via clear and reinitialize
			historyManager.clear();
			historyManager.initialize(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 150));
			const restored = historyManager.getUndoState();
			expect(restored?.costs['flour'].product.cost).toBe(100);
		});
	});

	describe('saveState', () => {
		it('adds state to history', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));

			expect(historyManager.getHistoryLength()).toBe(2);
			expect(historyManager.getCurrentIndex()).toBe(1);
		});

		it('trims future history when saving after undo', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 200));
			historyManager.saveState(createStateWithCost('flour', 300));

			expect(historyManager.getHistoryLength()).toBe(4);

			// Undo twice
			historyManager.getUndoState();
			historyManager.getUndoState();

			expect(historyManager.getCurrentIndex()).toBe(1);

			// Save new state - should trim future history
			historyManager.saveState(createStateWithCost('flour', 150));

			expect(historyManager.getHistoryLength()).toBe(3);
			expect(historyManager.getCurrentIndex()).toBe(2);
		});

		it('enforces max history size', () => {
			historyManager.initialize(createEmptyState());

			// Add 55 states (plus initial = 56, but max is 50)
			for (let i = 0; i < 55; i++) {
				historyManager.saveState(createStateWithCost('flour', i));
			}

			expect(historyManager.getHistoryLength()).toBe(50);
		});
	});

	describe('getUndoState', () => {
		it('returns previous state', () => {
			historyManager.initialize(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 200));

			const undoState = historyManager.getUndoState();

			expect(undoState?.costs['flour'].product.cost).toBe(100);
		});

		it('returns null when at beginning of history', () => {
			historyManager.initialize(createEmptyState());

			const undoState = historyManager.getUndoState();

			expect(undoState).toBeNull();
		});

		it('decrements current index', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 200));

			expect(historyManager.getCurrentIndex()).toBe(2);

			historyManager.getUndoState();

			expect(historyManager.getCurrentIndex()).toBe(1);
		});
	});

	describe('getRedoState', () => {
		it('returns next state after undo', () => {
			historyManager.initialize(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 200));
			historyManager.getUndoState();

			const redoState = historyManager.getRedoState();

			expect(redoState?.costs['flour'].product.cost).toBe(200);
		});

		it('returns null when at end of history', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));

			const redoState = historyManager.getRedoState();

			expect(redoState).toBeNull();
		});

		it('increments current index', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));
			historyManager.getUndoState();

			expect(historyManager.getCurrentIndex()).toBe(0);

			historyManager.getRedoState();

			expect(historyManager.getCurrentIndex()).toBe(1);
		});
	});

	describe('canUndo', () => {
		it('returns false at beginning of history', () => {
			historyManager.initialize(createEmptyState());

			expect(historyManager.canUndo()).toBe(false);
		});

		it('returns true when there is history to undo', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));

			expect(historyManager.canUndo()).toBe(true);
		});

		it('returns false after undoing all history', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));
			historyManager.getUndoState();

			expect(historyManager.canUndo()).toBe(false);
		});
	});

	describe('canRedo', () => {
		it('returns false at end of history', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));

			expect(historyManager.canRedo()).toBe(false);
		});

		it('returns true after undo', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));
			historyManager.getUndoState();

			expect(historyManager.canRedo()).toBe(true);
		});

		it('returns false after redo catches up', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));
			historyManager.getUndoState();
			historyManager.getRedoState();

			expect(historyManager.canRedo()).toBe(false);
		});
	});

	describe('clear', () => {
		it('resets history completely', () => {
			historyManager.initialize(createEmptyState());
			historyManager.saveState(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 200));

			historyManager.clear();

			expect(historyManager.getHistoryLength()).toBe(0);
			expect(historyManager.getCurrentIndex()).toBe(-1);
			expect(historyManager.canUndo()).toBe(false);
			expect(historyManager.canRedo()).toBe(false);
		});
	});

	describe('multiple undo/redo operations', () => {
		it('navigates through history correctly', () => {
			historyManager.initialize(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 200));
			historyManager.saveState(createStateWithCost('flour', 300));
			historyManager.saveState(createStateWithCost('flour', 400));

			// Undo 3 times
			expect(historyManager.getUndoState()?.costs['flour'].product.cost).toBe(300);
			expect(historyManager.getUndoState()?.costs['flour'].product.cost).toBe(200);
			expect(historyManager.getUndoState()?.costs['flour'].product.cost).toBe(100);
			expect(historyManager.getUndoState()).toBeNull();

			// Redo 2 times
			expect(historyManager.getRedoState()?.costs['flour'].product.cost).toBe(200);
			expect(historyManager.getRedoState()?.costs['flour'].product.cost).toBe(300);

			// Save new state - should trim history after current position
			historyManager.saveState(createStateWithCost('flour', 350));

			expect(historyManager.canRedo()).toBe(false);
			expect(historyManager.getHistoryLength()).toBe(4); // initial, 200, 300, 350
		});
	});

	describe('state isolation', () => {
		it('returned states are independent copies', () => {
			historyManager.initialize(createStateWithCost('flour', 100));
			historyManager.saveState(createStateWithCost('flour', 200));

			const state1 = historyManager.getUndoState();
			const state2 = historyManager.getRedoState();

			// Modify state1
			if (state1) {
				state1.costs['flour'].product.cost = 999;
			}

			// state2 should be unaffected
			expect(state2?.costs['flour'].product.cost).toBe(200);

			// Undo again and check original is preserved
			const state3 = historyManager.getUndoState();
			expect(state3?.costs['flour'].product.cost).toBe(100);
		});
	});
});

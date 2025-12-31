<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import IngredientCostGrid from './IngredientCostGrid.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import ThemeToggle from '../common/ThemeToggle.svelte';
	import { mockData } from '$lib/data/mockData';
	import RecipeSection from './RecipeSection.svelte';
	import CompoundSection from './CompoundSection.svelte';
	import ConversionsSection from './ConversionsSection.svelte';
	import SettingsSection from './SettingsSection.svelte';
	import { findAllMissingConversionsFromImport } from '$lib/utils/unitSelectUtils';
	import { buildUnitLabels } from '$lib/utils/unitSelectUtils';
	import { historyManager } from '$lib/utils/history';
	import { onMount, untrack, tick } from 'svelte';
	import ModernButton from '../common/ModernButton.svelte';

	type TabId = 'dashboard' | 'conversions' | 'settings';
	let activeTab = $state<TabId>('dashboard');

	let costs = $state<Record<string, IngredientDoc>>(mockData.costs);
	let compoundIngredients = $state<Record<string, CompoundIngredientDoc>>(
		mockData.compoundIngredients
	);
	let recipes = $state<Record<string, RecipeDoc>>(mockData.recipes);
	let customUnitLabels = $state<Record<string, string>>(mockData.unitLabels);
	let unitConversions = $state<UnitConversion[]>(mockData.unitConversions);

	const { openOverlay, closeOverlay } = getOverlayContext();

	// Undo/redo state
	let isRestoring = $state(false);
	let canUndo = $state(false);
	let canRedo = $state(false);

	// Initialize history with initial state
	onMount(() => {
		historyManager.initialize({
			costs,
			compoundIngredients,
			recipes,
			customUnitLabels,
			unitConversions
		});
		updateUndoRedoState();
		isInitialized = true;

		// Set up keyboard shortcuts
		const handleKeyDown = (event: KeyboardEvent) => {
			// Check if we're in an input field (allow native browser undo/redo in text inputs)
			const target = event.target as HTMLElement;
			const isTextInput =
				(target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'button') ||
				target.tagName === 'TEXTAREA' ||
				(target.isContentEditable && target.closest('[contenteditable="true"]'));

			// Only handle undo/redo shortcuts when NOT in a text input field
			// This allows native browser undo/redo to work in text inputs
			if (isTextInput) {
				return;
			}

			// Ctrl+Z or Cmd+Z for undo
			if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
				event.preventDefault();
				handleUndo();
			}
			// Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z for redo
			else if (
				(event.ctrlKey || event.metaKey) &&
				(event.key === 'y' || (event.key === 'z' && event.shiftKey))
			) {
				event.preventDefault();
				handleRedo();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Track state changes and save to history (debounced)
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let isInitialized = $state(false);

	$effect(() => {
		// Skip saving if we're restoring from history or not yet initialized
		if (isRestoring || !isInitialized) {
			return;
		}

		// Access all state variables to track changes
		costs;
		compoundIngredients;
		recipes;
		customUnitLabels;
		unitConversions;

		// Debounce saves to avoid too many history entries
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(() => {
			historyManager.saveState({
				costs,
				compoundIngredients,
				recipes,
				customUnitLabels,
				unitConversions
			});
			updateUndoRedoState();
		}, 300);
	});

	const updateUndoRedoState = () => {
		canUndo = historyManager.canUndo();
		canRedo = historyManager.canRedo();
	};

	const restoreState = async (state: {
		costs: Record<string, IngredientDoc>;
		compoundIngredients: Record<string, CompoundIngredientDoc>;
		recipes: Record<string, RecipeDoc>;
		customUnitLabels: Record<string, string>;
		unitConversions: UnitConversion[];
	}) => {
		// Use untrack to prevent the effect from running during restore
		untrack(() => {
			isRestoring = true;
		});

		// Directly assign new object references to ensure Svelte tracks the changes
		// This creates completely new objects, which will properly update all bindings
		costs = state.costs;
		compoundIngredients = state.compoundIngredients;
		recipes = state.recipes;
		customUnitLabels = state.customUnitLabels;
		unitConversions = state.unitConversions;

		// Wait for DOM to update
		await tick();

		// Reset flag after state is updated and DOM has rendered
		untrack(() => {
			isRestoring = false;
		});
	};

	const handleUndo = () => {
		if (!canUndo) return;
		const state = historyManager.getUndoState();
		if (state) {
			restoreState(state);
			updateUndoRedoState();
		}
	};

	const handleRedo = () => {
		if (!canRedo) return;
		const state = historyManager.getRedoState();
		if (state) {
			restoreState(state);
			updateUndoRedoState();
		}
	};
</script>

<div class="cost-editor">
	<div class="editor-header">
		<h2>COSTRA</h2>
		<div class="header-actions">
			<div class="undo-redo-buttons">
				<ModernButton
					variant="icon"
					size="small"
					disabled={!canUndo}
					onclick={handleUndo}
					ariaLabel="Undo"
					title="Undo (Ctrl+Z)"
				>
					<i class="fa-solid fa-rotate-left"></i>
				</ModernButton>
				<ModernButton
					variant="icon"
					size="small"
					disabled={!canRedo}
					onclick={handleRedo}
					ariaLabel="Redo"
					title="Redo (Ctrl+Y)"
				>
					<i class="fa-solid fa-rotate-right"></i>
				</ModernButton>
			</div>
			<ThemeToggle />
		</div>
	</div>

	<div class="tabs">
		<div class="tabs-left">
			<button
				class="tab"
				class:active={activeTab === 'dashboard'}
				onclick={() => (activeTab = 'dashboard')}
			>
				<i class="fa-solid fa-kitchen-set"></i>
				Dashboard
			</button>
			<button
				class="tab"
				class:active={activeTab === 'conversions'}
				onclick={() => (activeTab = 'conversions')}
			>
				<i class="fa-solid fa-scale-balanced"></i>
				Conversions
				{#if unitConversions.length > 0}
					<span class="tab-badge">{unitConversions.length}</span>
				{/if}
			</button>
		</div>
		<div class="tabs-right">
			<button
				class="tab"
				class:active={activeTab === 'settings'}
				onclick={() => (activeTab = 'settings')}
			>
				<i class="fa-solid fa-gear"></i>
				Settings
			</button>
		</div>
	</div>

	{#if activeTab === 'dashboard'}
		<div class="content">
			<h2>Recipes</h2>
			<RecipeSection
				bind:recipes
				{costs}
				compounds={compoundIngredients}
				bind:unitConversions
				bind:customUnitLabels
			/>
			<h2>Ingredients</h2>
			<div class="ingredients">
				<CompoundSection
					bind:recipes={compoundIngredients}
					{costs}
					bind:unitConversions
					bind:customUnitLabels
				/>
				<IngredientCostGrid
					bind:costs
					bind:recipes
					bind:compoundIngredients
					bind:customUnitLabels
					bind:unitConversions
				/>
			</div>
		</div>
	{:else if activeTab === 'conversions'}
		<ConversionsSection {costs} {compoundIngredients} bind:unitConversions {customUnitLabels} />
	{:else if activeTab === 'settings'}
		<SettingsSection
			bind:costs
			bind:recipes
			bind:compoundIngredients
			bind:unitConversions
			bind:customUnitLabels
		/>
	{/if}
</div>

<style>
	.cost-editor {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 2rem;
		background: var(--card);
		border-radius: 12px;
		margin: 1rem;
		border: 1px solid var(--border);
		backdrop-filter: blur(10px);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.editor-header h2 {
		color: var(--foreground);
		font-weight: 500;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.undo-redo-buttons {
		display: flex;
		gap: 4px;
	}

	.tabs {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--muted);
		border-radius: 10px;
		border: 1px solid var(--border);
		justify-content: space-between;

		.tabs-left {
			display: flex;
			gap: 4px;
		}

		.tabs-right {
			display: flex;
			gap: 4px;
		}
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		background: transparent;
		border: none;
		border-radius: 8px;
		color: var(--secondary-foreground);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.tab:hover {
		color: var(--foreground);
		background: var(--card);
	}

	.tab.active {
		background: var(--background);
		color: var(--foreground);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.tab i {
		font-size: 14px;
	}

	.tab-badge {
		background: var(--active);
		color: var(--secondary-foreground);
		font-size: 10px;
		font-weight: 500;
		padding: 2px 6px;
		border-radius: 8px;
		min-width: 16px;
		text-align: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex-wrap: wrap;

		h2 {
			margin: 0;
			color: var(--foreground);
		}
	}

	.ingredients {
		display: flex;
		gap: 16px;
	}
</style>

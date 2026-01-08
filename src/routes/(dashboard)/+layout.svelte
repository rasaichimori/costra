<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import ModernButton from '$lib/components/common/ModernButton.svelte';
	import { setDataContext, getDataContext } from '$lib/contexts/data.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import WelcomeModal from '$lib/components/modals/WelcomeModal.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	const WELCOME_CHOICE_KEY = 'costra_welcome_choice';

	// Initialize data context (will start empty, user will choose)
	const dataState = setDataContext(false);
	const { openOverlay } = getOverlayContext();

	// Track undo/redo state changes using $derived instead of $effect
	let undoRedoVersion = $state(0);
	const canUndo = $derived(dataState.canUndo());
	const canRedo = $derived(dataState.canRedo());

	const handleUndo = async () => {
		await dataState.undo();
		undoRedoVersion++; // Trigger reactivity
	};

	const handleRedo = async () => {
		await dataState.redo();
		undoRedoVersion++; // Trigger reactivity
	};

	// Get current route to determine active tab
	const currentPath = $derived(page.url.pathname);
	const activeTab = $derived(() => {
		if (currentPath === '/conversions') return 'conversions';
		if (currentPath === '/settings') return 'settings';
		return 'dashboard';
	});

	const handleTabClick = (tab: 'dashboard' | 'conversions' | 'settings') => {
		if (tab === 'dashboard') {
			goto('/dashboard');
		} else {
			goto(`/${tab}`);
		}
	};

	const handleWelcomeChoice = (choice: 'blank' | 'prefilled') => {
		if (!browser) return;

		// Save the choice to localStorage
		localStorage.setItem(WELCOME_CHOICE_KEY, choice);

		if (choice === 'blank') {
			dataState.clearAllData();
		} else {
			dataState.initializeWithMockData();
		}
	};

	onMount(() => {
		// Check if user has already made a choice
		if (browser) {
			const savedChoice = localStorage.getItem(WELCOME_CHOICE_KEY);
			if (!savedChoice) {
				// First time user - show welcome modal
				openOverlay(WelcomeModal, {
					onChooseBlank: () => handleWelcomeChoice('blank'),
					onChoosePrefilled: () => handleWelcomeChoice('prefilled'),
					onclose: () => {}
				});
			} else {
				// User has made a choice before, initialize accordingly
				if (savedChoice === 'prefilled') {
					dataState.initializeWithMockData();
				}
				// If blank, data is already empty, no need to call clearAllData()
			}
		}

		// Set up keyboard shortcuts
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			const isTextInput =
				(target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'button') ||
				target.tagName === 'TEXTAREA' ||
				(target.isContentEditable && target.closest('[contenteditable="true"]'));

			if (isTextInput) {
				return;
			}

			if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
				event.preventDefault();
				handleUndo();
			} else if (
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

	// Minimal $effect only for history tracking - necessary for undo/redo functionality
	// This is the only $effect we use, and it's essential for the feature
	$effect(() => {
		// Access state to track changes
		dataState.costs;
		dataState.compoundIngredients;
		dataState.recipes;
		dataState.customUnitLabels;
		dataState.unitConversions;

		// Save state to history (debounced internally)
		dataState.saveState();
	});

	// Get unitConversions for badge display
	const unitConversions = $derived(dataState.unitConversions);
</script>

<div class="dashboard-layout">
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
				class:active={activeTab() === 'dashboard'}
				onclick={() => handleTabClick('dashboard')}
			>
				<i class="fa-solid fa-kitchen-set"></i>
				Dashboard
			</button>
			<button
				class="tab"
				class:active={activeTab() === 'conversions'}
				onclick={() => handleTabClick('conversions')}
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
				class:active={activeTab() === 'settings'}
				onclick={() => handleTabClick('settings')}
			>
				<i class="fa-solid fa-gear"></i>
				Settings
			</button>
		</div>
	</div>

	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	.dashboard-layout {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 2rem;
		background: var(--card);
		border-radius: 16px;
		margin: 1rem;
		border: 1px solid var(--border);
		box-shadow: var(--shadow-light);
		min-height: calc(100vh - 2rem);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.editor-header h2 {
		color: var(--foreground);
		font-weight: 700;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		letter-spacing: -0.03em;
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
		border-radius: 12px;
		border: 1px solid var(--border);
		justify-content: space-between;
	}

	.tabs-left {
		display: flex;
		gap: 4px;
	}

	.tabs-right {
		display: flex;
		gap: 4px;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		background: var(--tab-bg);
		border: 1px solid transparent;
		border-radius: 8px;
		color: var(--muted-foreground);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: inherit;
		letter-spacing: -0.01em;
	}

	.tab:hover {
		color: var(--foreground);
		background: var(--tab-bg-hover);
		border-color: var(--border);
	}

	.tab.active {
		background: var(--card);
		color: var(--foreground);
		box-shadow: var(--shadow-light);
		border-color: var(--border);
	}

	.tab i {
		font-size: 14px;
		opacity: 0.8;
	}

	.tab.active i {
		opacity: 1;
	}

	.tab-badge {
		background: var(--accent);
		color: var(--accent-foreground);
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 6px;
		min-width: 16px;
		text-align: center;
	}

	.content {
		flex: 1;
	}
</style>

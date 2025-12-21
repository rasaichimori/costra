<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
	import ModernButton from '$lib/components/common/ModernButton.svelte';
	import { setDataContext, getDataContext } from '$lib/contexts/data.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Initialize data context
	const dataState = setDataContext();

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

	onMount(() => {
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
		background: var(--bg-secondary);
		border-radius: 12px;
		margin: 1rem;
		border: 1px solid var(--border-primary);
		backdrop-filter: blur(10px);
		min-height: calc(100vh - 2rem);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.editor-header h2 {
		color: var(--text-primary);
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
		background: var(--bg-tertiary);
		border-radius: 10px;
		border: 1px solid var(--border-secondary);
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
		background: transparent;
		border: none;
		border-radius: 8px;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.tab:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.tab.active {
		background: var(--bg-primary);
		color: var(--text-primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.tab i {
		font-size: 14px;
	}

	.tab-badge {
		background: var(--bg-active);
		color: var(--text-secondary);
		font-size: 10px;
		font-weight: 500;
		padding: 2px 6px;
		border-radius: 8px;
		min-width: 16px;
		text-align: center;
	}

	.content {
		flex: 1;
	}
</style>


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
</script>

<div class="cost-editor">
	<div class="editor-header">
		<h2>COSTRA</h2>
		<div class="header-actions">
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
		background: var(--bg-secondary);
		border-radius: 12px;
		margin: 1rem;
		border: 1px solid var(--border-primary);
		backdrop-filter: blur(10px);
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
	}

	.tabs {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--bg-tertiary);
		border-radius: 10px;
		border: 1px solid var(--border-secondary);
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
		display: flex;
		flex-direction: column;
		gap: 16px;
		flex-wrap: wrap;

		h2 {
			margin: 0;
			color: var(--text-primary);
		}
	}

	.ingredients {
		display: flex;
		gap: 16px;
	}
</style>

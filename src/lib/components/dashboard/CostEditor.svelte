<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import IngredientCostGrid from './IngredientCostGrid.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import ExportDataModal from '../modals/ExportDataModal.svelte';
	import ImportDataModal from '../modals/ImportDataModal.svelte';
	import ClearAllModal from '../modals/ClearAllModal.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import ThemeToggle from '../common/ThemeToggle.svelte';
	import { mockData } from '$lib/data/mockData';
	import RecipeSection from './RecipeSection.svelte';
	import CompoundSection from './CompoundSection.svelte';

	let costs = $state<Record<string, IngredientDoc>>(mockData.costs);
	let compoundIngredients = $state<Record<string, CompoundIngredientDoc>>(
		mockData.compoundIngredients
	);
	let recipes = $state<Record<string, RecipeDoc>>(mockData.recipes);
	let customUnitLabels = $state<Record<string, string>>(mockData.unitLabels);
	let unitConversions = $state<UnitConversion[]>(mockData.unitConversions);

	const { openOverlay, closeOverlay } = getOverlayContext();

	const exportData = () => {
		openOverlay(ExportDataModal, {
			data: { costs, recipes, compoundIngredients },
			onclose: () => closeOverlay()
		});
	};

	const importData = () => {
		openOverlay(ImportDataModal, {
			onLoad: (d: {
				costs: Record<string, IngredientDoc>;
				recipes: Record<string, RecipeDoc>;
				compoundIngredients?: Record<string, CompoundIngredientDoc>;
			}) => {
				costs = d.costs;
				recipes = d.recipes;
				if (d.compoundIngredients) {
					compoundIngredients = d.compoundIngredients;
				}
			},
			onclose: () => closeOverlay()
		});
	};

	const clearAllData = () => {
		openOverlay(ClearAllModal, {
			onConfirm: () => {
				costs = {};
				recipes = {};
			},
			onclose: () => closeOverlay()
		});
	};
</script>

<div class="cost-editor">
	<div class="editor-header">
		<h2>COSTRA</h2>
		<div class="header-actions">
			<ThemeToggle />
			<ModernButton variant="danger" onclick={clearAllData}>Clear All</ModernButton>
			<ModernButton variant="secondary" onclick={importData}>Import</ModernButton>
			<ModernButton variant="primary" onclick={exportData}>Export</ModernButton>
		</div>
	</div>
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
			<IngredientCostGrid bind:costs bind:recipes bind:customUnitLabels bind:unitConversions />
		</div>
	</div>
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

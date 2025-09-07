<script lang="ts">
	import RecipeEditor from './RecipeEditor.svelte';
	import RecipesList from './RecipesList.svelte';
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import IngredientCostGrid from './IngredientCostGrid.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import ExportDataModal from '../modals/ExportDataModal.svelte';
	import ImportDataModal from '../modals/ImportDataModal.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import RecipeEditorPlaceholder from './RecipeEditorPlaceholder.svelte';

	let costs = $state<Record<string, IngredientDoc>>({
		coconutMilk: {
			id: 'coconutMilk',
			name: 'Coconut Milk',
			category: 'liquid',
			product: {
				cost: 10,
				amount: 1,
				unit: 'cup'
			},
			color: '#DB8585'
		}
	});
	let recipes = $state<Record<string, RecipeDoc>>({
		acaiBase: {
			id: 'acaiBase',
			name: 'Acai Base',
			ingredients: [
				{
					id: 'coconutMilk',
					portion: { amount: 1, unit: 'cup' },
					hidden: false
				}
			]
		},
		mangoBase: {
			id: 'mangoBase',
			name: 'Mango Base',
			ingredients: [
				{
					id: 'coconutMilk',
					portion: { amount: 1, unit: 'cup' },
					hidden: false
				}
			]
		}
	});

	const deleteRecipe = (id: string) => {
		// Remove recipe from collection
		const { [id]: _removed, ...rest } = recipes;
		recipes = rest;
		if (selectedRecipeId === id) {
			selectedRecipeId = undefined;
		}
	};

	const { openOverlay, closeOverlay } = getOverlayContext();

	let selectedRecipeId = $state<string | undefined>();

	const exportData = () => {
		openOverlay(ExportDataModal, {
			data: { costs, recipes },
			onclose: () => closeOverlay()
		});
	};

	const importData = () => {
		openOverlay(ImportDataModal, {
			onLoad: (d: { costs: Record<string, IngredientDoc>; recipes: Record<string, RecipeDoc> }) => {
				costs = d.costs;
				recipes = d.recipes;
			},
			onclose: () => closeOverlay()
		});
	};

	let isEditingName = $state(false);
</script>

<div class="cost-editor">
	<div class="editor-header">
		<h2>
			<i class="fa-solid fa-dollar-sign"></i>
			Cost Editor
		</h2>
		<div class="header-actions">
			<ModernButton variant="secondary" onclick={importData}>Import</ModernButton>
			<ModernButton variant="primary" onclick={exportData}>Export</ModernButton>
		</div>
	</div>
	<div class="content">
		<div class="recipes">
			<RecipesList
				{recipes}
				{costs}
				bind:selectedRecipeId
				setIsEditingName={(isEditing: boolean) => {
					isEditingName = isEditing;
				}}
			/>
			{#if selectedRecipeId}
				<RecipeEditor
					bind:recipe={recipes[selectedRecipeId]}
					{costs}
					unit={'cup'}
					onDelete={() => deleteRecipe(selectedRecipeId!)}
					bind:isEditingName
				/>
			{:else}
				<RecipeEditorPlaceholder />
			{/if}
		</div>
		<IngredientCostGrid bind:costs bind:recipes />
	</div>
</div>

<style>
	.cost-editor {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12px;
		margin: 1rem;
		border: 1px solid rgba(0, 0, 0, 0.08);
		backdrop-filter: blur(10px);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.editor-header h2 {
		color: #333333;
		font-weight: 500;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	.editor-header h2 i {
		color: rgba(0, 0, 0, 0.6);
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
	}
	.recipes {
		display: flex;
		gap: 16px;
	}
</style>

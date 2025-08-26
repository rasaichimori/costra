<script lang="ts">
	import CostCalculator from './CostCalculator.svelte';
	import { storage } from '$lib/utils/localStorage';
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import IngredientCostGrid from './IngredientCostGrid.svelte';

	let costs = $state<Record<string, IngredientDoc>>({
		coconutMilk: {
			id: 'coconutMilk',
			name: 'Coconut Milk',
			category: 'liquid',
			product: {
				cost: 10,
				amount: 1,
				unit: 'cup'
			}
		}
	});
	let recipes = $state<Record<string, RecipeDoc>>({
		acaiBase: {
			id: 'acaiBase',
			name: 'Acai Base',
			ingredients: [
				{
					id: 'coconutMilk',
					portion: { amount: 1, unit: 'cup' }
				}
			]
		}
	});

	// Save function for manual save
	function saveChanges() {
		storage.costs.save(costs);
	}
</script>

<div class="cost-editor">
	<div class="editor-header">
		<h2>
			<i class="fa-solid fa-dollar-sign"></i>
			Cost Editor
		</h2>
		<button class="save-button" onclick={saveChanges}>
			<i class="fa-solid fa-save"></i>
			Save Changes
		</button>
	</div>
	{#each Object.entries(recipes) as [id, recipe]}
		<CostCalculator bind:recipe={recipes[id]} {costs} unit={'cup'} />
	{/each}

	<IngredientCostGrid bind:costs />
</div>

<style>
	.cost-editor {
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
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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

	.save-button {
		background: rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.2);
		color: #333333;
		padding: 0.8rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
		font-weight: 400;
	}

	.save-button:hover {
		background: rgba(0, 0, 0, 0.1);
		border-color: rgba(0, 0, 0, 0.3);
		transform: translateY(-1px);
	}

	.save-button i {
		font-size: 0.8rem;
	}
</style>

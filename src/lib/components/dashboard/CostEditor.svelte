<script lang="ts">
	import CostCalculator from './CostCalculator.svelte';
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
					portion: { amount: 1, unit: 'cup' },
					color: '#ff0000',
					hidden: false
				}
			]
		}
	});
</script>

<div class="cost-editor">
	<div class="editor-header">
		<h2>
			<i class="fa-solid fa-dollar-sign"></i>
			Cost Editor
		</h2>
	</div>
	{#each Object.entries(recipes) as [id, recipe]}
		<CostCalculator bind:recipe={recipes[id]} {costs} unit={'cup'} />
	{/each}

	<IngredientCostGrid bind:costs bind:recipes />
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
</style>

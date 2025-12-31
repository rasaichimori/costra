<script lang="ts">
	import IngredientCostGrid from '$lib/components/dashboard/IngredientCostGrid.svelte';
	import RecipeSection from '$lib/components/dashboard/RecipeSection.svelte';
	import CompoundSection from '$lib/components/dashboard/CompoundSection.svelte';
	import { getDataContext } from '$lib/contexts/data.svelte';

	const data = getDataContext();
</script>

<div class="dashboard-content">
	<h2>Recipes</h2>
	<RecipeSection
		bind:recipes={data.recipes}
		costs={data.costs}
		compounds={data.compoundIngredients}
		bind:unitConversions={data.unitConversions}
		bind:customUnitLabels={data.customUnitLabels}
	/>
	<h2>Ingredients</h2>
	<div class="ingredients">
		<CompoundSection
			bind:recipes={data.compoundIngredients}
			costs={data.costs}
			bind:unitConversions={data.unitConversions}
			bind:customUnitLabels={data.customUnitLabels}
		/>
		<IngredientCostGrid
			bind:costs={data.costs}
			bind:recipes={data.recipes}
			bind:compoundIngredients={data.compoundIngredients}
			bind:customUnitLabels={data.customUnitLabels}
			bind:unitConversions={data.unitConversions}
		/>
	</div>
</div>

<style>
	.dashboard-content {
		display: flex;
		flex-direction: column;
		gap: 16px;

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


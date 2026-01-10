<script lang="ts">
	import type { CompoundIngredientDoc, IngredientDoc, UnitConversion } from '$lib/data/schema';
	import { getDataContext } from '$lib/contexts/data.svelte';
	import CompoundEditor from './CompoundEditor.svelte';
	import CompoundList from './CompoundList.svelte';
	import RecipeEditorPlaceholder from './RecipeEditorPlaceholder.svelte';

	let {
		costs,
		recipes = $bindable({}),
		customUnitLabels = $bindable({}),
		unitConversions = $bindable([])
	}: {
		costs: Record<string, IngredientDoc>;
		recipes: Record<string, CompoundIngredientDoc>;
		customUnitLabels?: Record<string, string>;
		unitConversions?: UnitConversion[];
	} = $props();

	const data = getDataContext();
	let isEditingName = $state(false);

	const deleteRecipe = (id: string) => {
		// Remove recipe from collection
		const { [id]: _removed, ...rest } = recipes;
		recipes = rest;
		if (data.selectedCompoundId === id) {
			data.selectedCompoundId = undefined;
		}
	};
</script>

<div class="recipes">
	<CompoundList
		{recipes}
		{costs}
		bind:selectedRecipeId={data.selectedCompoundId}
		setIsEditingName={(isEditing: boolean) => {
			isEditingName = isEditing;
		}}
		{unitConversions}
	/>
	{#if data.selectedCompoundId && recipes[data.selectedCompoundId]}
		<CompoundEditor
			bind:recipe={recipes[data.selectedCompoundId]}
			{costs}
			bind:unitConversions
			bind:customUnitLabels
			onDelete={() => deleteRecipe(data.selectedCompoundId!)}
			bind:isEditingName
		/>
	{:else}
		<RecipeEditorPlaceholder />
	{/if}
</div>

<style>
	.recipes {
		display: flex;
		gap: 16px;
		flex: 1;
	}

	@media (max-width: 900px) {
		.recipes {
			flex-direction: column;
		}
	}
</style>

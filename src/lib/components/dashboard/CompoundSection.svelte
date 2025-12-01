<script lang="ts">
	import type { CompoundIngredientDoc, IngredientDoc, UnitConversion } from '$lib/data/schema';
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

	let selectedRecipeId = $state<string | undefined>(Object.values(recipes)?.[0]?.id);
	let isEditingName = $state(false);

	const deleteRecipe = (id: string) => {
		// Remove recipe from collection
		const { [id]: _removed, ...rest } = recipes;
		recipes = rest;
		if (selectedRecipeId === id) {
			selectedRecipeId = undefined;
		}
	};
</script>

<div class="recipes">
	<CompoundList
		{recipes}
		{costs}
		bind:selectedRecipeId
		setIsEditingName={(isEditing: boolean) => {
			isEditingName = isEditing;
		}}
		{unitConversions}
	/>
	{#if selectedRecipeId}
		<CompoundEditor
			bind:recipe={recipes[selectedRecipeId]}
			{costs}
			bind:unitConversions
			bind:customUnitLabels
			onDelete={() => deleteRecipe(selectedRecipeId!)}
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
</style>

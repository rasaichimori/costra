<script lang="ts">
	import type { IngredientDoc, RecipeDoc, CompoundIngredientDoc } from '$lib/data/schema';
	import RecipeEditor from './RecipeEditor.svelte';
	import RecipeEditorPlaceholder from './RecipeEditorPlaceholder.svelte';
	import RecipesList from './RecipesList.svelte';

	let {
		costs,
		recipes = $bindable({}),
		compounds
	}: {
		costs: Record<string, IngredientDoc>;
		recipes: Record<string, RecipeDoc>;
		compounds: Record<string, CompoundIngredientDoc>;
	} = $props();

	let selectedRecipeId = $state<string | undefined>();
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
			{compounds}
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

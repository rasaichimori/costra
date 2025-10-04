<script lang="ts">
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import RecipeEditor from './RecipeEditor.svelte';
	import RecipeEditorPlaceholder from './RecipeEditorPlaceholder.svelte';
	import RecipesList from './RecipesList.svelte';

	let {
		costs = $bindable(),
		recipes = $bindable({})
	}: {
		costs: Record<string, IngredientDoc>;
		recipes: Record<string, RecipeDoc>;
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

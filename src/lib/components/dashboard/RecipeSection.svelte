<script lang="ts">
	import type {
		IngredientDoc,
		RecipeDoc,
		CompoundIngredientDoc,
		UnitConversion
	} from '$lib/data/schema';
	import RecipeEditor from './RecipeEditor.svelte';
	import RecipeEditorPlaceholder from './RecipeEditorPlaceholder.svelte';
	import RecipesList from './RecipesList.svelte';

	let {
		costs,
		recipes = $bindable({}),
		compounds,
		customUnitLabels = $bindable({}),
		unitConversions = $bindable([])
	}: {
		costs: Record<string, IngredientDoc>;
		recipes: Record<string, RecipeDoc>;
		compounds: Record<string, CompoundIngredientDoc>;
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
	<RecipesList
		{recipes}
		{costs}
		{compounds}
		{unitConversions}
		bind:selectedRecipeId
		setIsEditingName={(isEditing: boolean) => {
			isEditingName = isEditing;
		}}
	/>
	{#if selectedRecipeId && recipes[selectedRecipeId]}
		<RecipeEditor
			bind:recipe={recipes[selectedRecipeId]}
			{costs}
			{compounds}
			onDelete={() => deleteRecipe(selectedRecipeId!)}
			bind:unitConversions
			bind:customUnitLabels
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

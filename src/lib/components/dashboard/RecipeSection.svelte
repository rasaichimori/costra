<script lang="ts">
	import type {
		IngredientDoc,
		RecipeDoc,
		CompoundIngredientDoc,
		UnitConversion
	} from '$lib/data/schema';
	import { getDataContext } from '$lib/contexts/data.svelte';
	import RecipeEditor from './RecipeEditor.svelte';
	import RecipeEditorPlaceholder from './RecipeEditorPlaceholder.svelte';
	import RecipesList from './RecipesList.svelte';
	import { createDuplicateRecipe, insertRecordAfter } from '$lib/utils/recipeUtils';
	import { m } from '$lib/paraglide/messages.js';

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

	const data = getDataContext();
	let isEditingName = $state(false);

	const deleteRecipe = (id: string) => {
		recipes = Object.fromEntries(
			Object.entries(recipes).filter(([recipeId]) => recipeId !== id)
		) as typeof recipes;
		if (data.selectedRecipeId === id) {
			data.selectedRecipeId = undefined;
		}
	};

	const duplicateRecipe = (id: string) => {
		const original = recipes[id];
		if (!original) return;

		const newId = crypto.randomUUID();
		recipes = insertRecordAfter(
			recipes,
			id,
			newId,
			createDuplicateRecipe(original, newId, m.recipeDuplicateName({ name: original.name }))
		);
		data.selectedRecipeId = newId;
		isEditingName = true;
	};
</script>

<div class="recipes">
	<RecipesList
		{recipes}
		{costs}
		{compounds}
		{unitConversions}
		bind:selectedRecipeId={data.selectedRecipeId}
		setIsEditingName={(isEditing: boolean) => {
			isEditingName = isEditing;
		}}
	/>
	{#if data.selectedRecipeId && recipes[data.selectedRecipeId]}
		<RecipeEditor
			bind:recipe={recipes[data.selectedRecipeId]}
			{costs}
			{compounds}
			onDelete={() => deleteRecipe(data.selectedRecipeId!)}
			onDuplicate={() => duplicateRecipe(data.selectedRecipeId!)}
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

	@media (max-width: 900px) {
		.recipes {
			flex-direction: column;
		}
	}
</style>

<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import { getDataContext } from '$lib/contexts/data.svelte';
	import CompoundEditor from './CompoundEditor.svelte';
	import CompoundList from './CompoundList.svelte';
	import RecipeEditorPlaceholder from './RecipeEditorPlaceholder.svelte';
	import {
		createDuplicateCompound,
		duplicateUnitConversionsForIngredient,
		insertRecordAfter
	} from '$lib/utils/recipeUtils';
	import { m } from '$lib/paraglide/messages.js';

	let {
		costs,
		recipes = $bindable({}),
		regularRecipes = {},
		customUnitLabels = $bindable({}),
		unitConversions = $bindable([])
	}: {
		costs: Record<string, IngredientDoc>;
		recipes: Record<string, CompoundIngredientDoc>;
		regularRecipes?: Record<string, RecipeDoc>;
		customUnitLabels?: Record<string, string>;
		unitConversions?: UnitConversion[];
	} = $props();

	const data = getDataContext();
	let isEditingName = $state(false);

	const allRecipes = $derived<Record<string, RecipeDoc>>({
		...regularRecipes,
		...recipes
	});

	const deleteRecipe = (id: string) => {
		// Remove recipe from collection
		const rest = { ...recipes };
		delete rest[id];
		recipes = rest;
		if (data.selectedCompoundId === id) {
			data.selectedCompoundId = undefined;
		}
	};

	const duplicateCompound = (id: string) => {
		const original = recipes[id];
		if (!original) return;

		const newId = crypto.randomUUID();
		recipes = insertRecordAfter(
			recipes,
			id,
			newId,
			createDuplicateCompound(original, newId, m.recipeDuplicateName({ name: original.name }))
		);
		unitConversions = duplicateUnitConversionsForIngredient(unitConversions, id, newId);
		data.selectedCompoundId = newId;
		isEditingName = true;
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
			{allRecipes}
			bind:unitConversions
			bind:customUnitLabels
			onDelete={() => deleteRecipe(data.selectedCompoundId!)}
			onDuplicate={() => duplicateCompound(data.selectedCompoundId!)}
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

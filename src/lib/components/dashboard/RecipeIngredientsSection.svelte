<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeIngredientEntry,
		UnitConversion
	} from '$lib/data/schema';
	import AddRecipeIngredientsButton from './AddRecipeIngredientsButton.svelte';
	import RecipeIngredientListItem from './RecipeIngredientListItem.svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		/** Scopes list item keys so reused ingredient ids remount when recipe/size changes */
		ingredientListKey: string;
		ingredients: RecipeIngredientEntry[];
		ingredientDocs: Record<string, IngredientDoc>;
		recipeCosts: Record<string, number>;
		costs: Record<string, IngredientDoc>;
		compounds?: Record<string, CompoundIngredientDoc>;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		availableIngredients: IngredientDoc[];
		availableCompounds?: CompoundIngredientDoc[];
		missingIngredientMessage?: (id: string) => string;
	}

	let {
		ingredientListKey,
		ingredients = $bindable(),
		ingredientDocs,
		recipeCosts,
		costs,
		compounds = {},
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		availableIngredients,
		availableCompounds,
		missingIngredientMessage
	}: Props = $props();

	let draggingId = $state<string | null>(null);

	const swap = (from: number, to: number) => {
		const moved = ingredients.splice(from, 1)[0];
		ingredients.splice(to, 0, moved);
	};

	const isCompoundIngredient = (id: string) => id in compounds;
</script>

<div class="recipe-ingredients-section">
	<h3>{m.ingredientBreakdownTitle()}</h3>
	{#if ingredients.length > 0}
		<div class="ingredient-list" role="list">
			{#each ingredients as ingredient, idx (`${ingredientListKey}:${ingredient.id}`)}
				<RecipeIngredientListItem
					bind:ingredient={ingredients[idx]}
					ingredientDoc={ingredientDocs[ingredient.id]}
					lineCost={recipeCosts[ingredient.id]}
					isCompound={isCompoundIngredient(ingredient.id)}
					{costs}
					{compounds}
					bind:unitConversions
					bind:customUnitLabels
					{draggingId}
					{missingIngredientMessage}
					onDraggingChange={(id) => (draggingId = id)}
					onSwapWith={(targetId) =>
						swap(
							idx,
							ingredients.findIndex((i) => i.id === targetId)
						)}
					onDelete={() => {
						ingredients = ingredients.filter((i) => i.id !== ingredient.id);
					}}
				/>
			{/each}
		</div>
	{:else}
		<div class="no-ingredients-message">{m.noIngredientsAdded()}</div>
	{/if}
	<AddRecipeIngredientsButton
		{availableIngredients}
		{availableCompounds}
		bind:ingredients
		{costs}
		recipes={{}}
		{unitConversions}
		{customUnitLabels}
	/>
</div>

<style>
	.recipe-ingredients-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.recipe-ingredients-section h3 {
		color: var(--foreground);
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.ingredient-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.no-ingredients-message {
		color: var(--muted-foreground);
		font-style: italic;
		padding: 12px;
		text-align: center;
		background: var(--muted);
		border-radius: 10px;
		border: 1px dashed var(--border);
	}

	@media (max-width: 768px) {
		.ingredient-list {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
			margin: 0 -14px;
			padding: 0 14px;
		}
	}

	@media (max-width: 480px) {
		.recipe-ingredients-section h3 {
			font-size: 14px;
		}

		.ingredient-list {
			margin: 0 -10px;
			padding: 0 10px;
		}
	}
</style>

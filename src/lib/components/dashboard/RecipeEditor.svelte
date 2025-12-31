<script lang="ts">
	import {
		calculateRecipeCosts,
		getTotalRecipeCost,
		getAvailableIngredients,
		getAllCosts
	} from '../../utils/costCalculatorUtils';
	import type {
		IngredientDoc,
		RecipeDoc,
		CompoundIngredientDoc,
		UnitConversion
	} from '$lib/data/schema';
	import TextInput from '../common/TextInput.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import CostBreakdown from './CostBreakdown.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';
	import { startDrag } from '$lib/utils/dragControls';
	import AddRecipeIngredientsButton from './AddRecipeIngredientsButton.svelte';
	import RecipeUnitSelectButton from './RecipeUnitSelectButton.svelte';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
		compounds: Record<string, CompoundIngredientDoc>;
		isEditingName: boolean;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		onDelete?: () => void;
	}

	let {
		recipe = $bindable(),
		costs,
		compounds,
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		onDelete,
		isEditingName = $bindable()
	}: Props = $props();

	let draggingId = $state<string | null>(null);
	const ingredientEls: Record<string, HTMLElement> = $state({});

	const swap = (from: number, to: number) => {
		const moved = recipe.ingredients.splice(from, 1)[0];
		recipe.ingredients.splice(to, 0, moved);
	};

	const allCosts = $derived(getAllCosts(costs, compounds, unitConversions));

	// Reactive calculations
	const recipeCosts = $derived(calculateRecipeCosts(recipe, allCosts, unitConversions));
	const totalCost = $derived(getTotalRecipeCost(recipeCosts));
	const availableIngredients = $derived(getAvailableIngredients(recipe, costs));
	const availableCompounds = $derived(
		Object.values(compounds).filter((c) => !recipe.ingredients.some((i) => i.id === c.id))
	);
	const currencyContext = getCurrencyContext();
</script>

<div class="recipe-cost-calculator">
	<div class="header">
		<div class="title">
			<div class="title-label">
				<EditableTextField
					bind:value={recipe.name}
					bind:isEditing={isEditingName}
					onSave={() => {
						isEditingName = false;
					}}
				/>
			</div>
			<div class="cost-amount">
				{currencyContext.currency}{totalCost.toFixed(0)}
			</div>
		</div>
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel="Delete recipe"
			title="Delete recipe"
			onclick={() => onDelete?.()}
		>
			<i class="fa-solid fa-trash"></i>
			Delete Recipe
		</ModernButton>
	</div>
	<div class="recipe-section">
		<div class="recipe-breakdown">
			<h3>Ingredient Breakdown:</h3>
			{#if recipe.ingredients.length > 0}
				<div class="ingredient-list">
					{#each recipe.ingredients as ingredient, idx (ingredient.id)}
						<div
							bind:this={ingredientEls[ingredient.id]}
							class="ingredient-cost-item"
							role="listitem"
							data-id={ingredient.id}
							class:compound={ingredient.id in compounds}
							class:hidden={ingredient.hidden}
							class:dragging={ingredient.id === draggingId}
						>
							<span
								class="drag-handle"
								role="button"
								tabindex="-1"
								aria-label="Drag to reorder"
								title="Drag to reorder"
								onpointerdown={(e) => {
									draggingId = ingredient.id;
									startDrag(
										e,
										(moveEvent) => {
											moveEvent.preventDefault();
											const targetEl = document.elementFromPoint(
												moveEvent.clientX,
												moveEvent.clientY
											) as HTMLElement;
											const targetId = targetEl.dataset.id;
											if (targetId && targetId !== ingredient.id) {
												swap(
													idx,
													recipe.ingredients.findIndex((i) => i.id === targetId)
												);
											}
										},
										() => (draggingId = null)
									);
								}}
							>
								<i class="fa-solid fa-grip-vertical"></i>
							</span>
							<div class="ingredient-details">
								<span class="ingredient-name">{allCosts[ingredient.id]?.name ?? ingredient.id}</span
								>
								<div class="amount-input-group">
									<TextInput
										value={ingredient.portion.amount}
										onchange={(value) => {
											ingredient.portion.amount = value;
										}}
										size="small"
										variant="inline"
										min={0}
										step={1}
										spinner={true}
									/>
								</div>
								<div class="unit-input-group">
									{#if allCosts[ingredient.id]}
										<RecipeUnitSelectButton
											recipePortion={ingredient.portion}
											ingredientDoc={allCosts[ingredient.id]}
											bind:unitConversions
											bind:customUnitLabels
											updateRecipePortionUnit={(unitId: string) => {
												ingredient.portion.unit = unitId;
											}}
										/>
									{:else}
										<span class="error-text">Missing ingredient: {ingredient.id}</span>
									{/if}
								</div>
							</div>
							<div class="ingredient-cost">
								{currencyContext.currency}{recipeCosts[ingredient.id]?.toFixed(0) || '0'}
							</div>
							<div class="color-input-group">
								{#if allCosts[ingredient.id]}
									<input
										type="color"
										class="color-picker"
										value={allCosts[ingredient.id].color}
										oninput={(e) => {
											if (ingredient.id in compounds) {
												compounds[ingredient.id].color = e.currentTarget.value;
											} else if (ingredient.id in costs) {
												costs[ingredient.id].color = e.currentTarget.value;
											}
										}}
									/>
								{/if}
							</div>
							<!-- Hide/Show Button -->
							<ModernButton
								variant="icon"
								size="small"
								ariaLabel={ingredient.hidden ? 'Show ingredient' : 'Hide ingredient'}
								title={ingredient.hidden ? 'Show ingredient' : 'Hide ingredient'}
								onclick={() => {
									ingredient.hidden = !ingredient.hidden;
								}}
							>
								<i class={`fa-solid ${ingredient.hidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
							</ModernButton>
							<!-- Delete Button -->
							<ModernButton
								variant="icon"
								size="small"
								ariaLabel="Delete ingredient"
								title="Delete ingredient"
								onclick={() => {
									recipe.ingredients = recipe.ingredients.filter((i) => i.id !== ingredient.id);
								}}
							>
								<i class="fa-solid fa-trash"></i>
							</ModernButton>
						</div>
					{/each}
				</div>
			{:else}
				<div class="no-ingredients-message">No ingredients added yet</div>
			{/if}
			<AddRecipeIngredientsButton
				{availableIngredients}
				{availableCompounds}
				{recipe}
				{costs}
				recipes={{}}
				{unitConversions}
				{customUnitLabels}
			/>
		</div>
		<CostBreakdown bind:recipe costs={allCosts} {compounds} {unitConversions} />
	</div>
</div>

<style>
	.recipe-cost-calculator {
		background: var(--card);
		border: 1px solid var(--border);
		padding: 18px;
		border-radius: 12px;
		box-shadow: var(--shadow-light);
		flex: 1;
	}

	.recipe-cost-calculator h3 {
		color: var(--foreground);
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}

	.title-label {
		color: var(--secondary-foreground);
		font-size: 16px;
		font-weight: 500;
		width: fit-content;
		min-width: 150px;
		letter-spacing: -0.01em;
	}

	.title {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 32px;
		font-weight: 700;
		color: var(--foreground);
		letter-spacing: -0.03em;
	}

	.cost-amount {
		background: linear-gradient(135deg, var(--foreground) 0%, var(--secondary-foreground) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.recipe-section {
		display: flex;
		flex-wrap: wrap;
		gap: 32px;
	}

	.recipe-breakdown {
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-top: 18px;
		gap: 8px;
		padding-top: 15px;
		border-top: 1px solid var(--border);
		text-align: left;
	}
	.ingredient-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ingredient-cost-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 10px;
		font-size: 12px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.ingredient-cost-item:hover {
		background: var(--secondary);
		border-color: var(--border);
	}

	.drag-handle {
		cursor: grab;
		margin-right: 8px;
		color: var(--muted-foreground);
		display: flex;
		align-items: center;
		transition: color 0.15s ease;
	}

	.drag-handle:hover {
		color: var(--secondary-foreground);
	}

	.drag-handle:active {
		cursor: grabbing;
		color: var(--primary);
	}

	.ingredient-details {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.ingredient-name {
		font-weight: 500;
		color: var(--foreground);
		text-transform: capitalize;
		min-width: 80px;
		width: 120px;
		font-size: 12px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		letter-spacing: -0.01em;
	}

	.ingredient-cost {
		font-weight: 600;
		color: var(--foreground);
		min-width: 40px;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}

	.amount-input-group,
	.unit-input-group {
		display: flex;
		align-items: center;
		gap: 4px;
		width: 80px;
	}

	.color-input-group {
		display: flex;
		align-items: center;
	}

	.color-picker {
		border: 2px solid var(--border);
		background: transparent;
		width: 22px;
		height: 22px;
		padding: 0;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.color-picker:hover {
		border-color: var(--border);
		transform: scale(1.1);
	}

	.color-picker::-webkit-color-swatch-wrapper {
		padding: 2px;
	}

	.color-picker::-webkit-color-swatch {
		border: none;
		border-radius: 3px;
	}

	.color-picker::-moz-color-swatch {
		border: none;
		border-radius: 3px;
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

	/* Hidden row greyed out */
	.ingredient-cost-item.hidden {
		opacity: 0.35;
		filter: grayscale(0.3);
	}

	.ingredient-cost-item.compound {
		border-color: var(--primary);
		background: linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%);
	}

	.ingredient-cost-item.dragging {
		opacity: 0.6;
		transform: scale(0.98);
		box-shadow: var(--shadow-medium);
	}
</style>

<script lang="ts">
	import {
		calculateRecipeCosts,
		getTotalRecipeCost,
		getAvailableIngredients,
		getAllCosts
	} from '../../utils/costCalculatorUtils';
	import type { IngredientDoc, RecipeDoc, CompoundIngredientDoc } from '$lib/data/schema';
	import { units, type Unit } from '$lib/utils/unit';
	import SelectInput from '../common/SelectInput.svelte';
	import TextInput from '../common/TextInput.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import AddIngredientsButton from './AddIngredientsPopup.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount, onDestroy, tick } from 'svelte';
	import CostBreakdown from './CostBreakdown.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';
	import { startDrag } from '$lib/utils/dragControls';

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
		compounds: Record<string, CompoundIngredientDoc>;
		isEditingName: boolean;
		onDelete?: () => void;
	}

	let {
		recipe = $bindable(),
		costs,
		compounds,
		onDelete,
		isEditingName = $bindable()
	}: Props = $props();

	const { openOverlay, updateOverlay } = getOverlayContext();

	let addBtnElement: HTMLButtonElement | undefined;
	let addPopupId = $state<string | undefined>(undefined);

	let draggingId = $state<string | null>(null);
	const ingredientEls: Record<string, HTMLElement> = {};

	const swap = (from: number, to: number) => {
		const moved = recipe.ingredients.splice(from, 1)[0];
		recipe.ingredients.splice(to, 0, moved);
	};

	const openAddPopup = (btn: HTMLButtonElement) => {
		addBtnElement = btn;
		addPopupId = openOverlay(
			AddIngredientsButton,
			{
				availableIngredients,
				availableCompounds,
				recipe,
				onAddIngredient: async () => {
					await tick();
					updateAddPopup();
				}
			},
			{ transparentBackground: true, position: addBtnElement.getBoundingClientRect() }
		);
		updateAddPopup();
	};

	const updateAddPopup = () => {
		if (!addPopupId || !addBtnElement) return;
		updateOverlay(
			addPopupId,
			{ availableIngredients, availableCompounds, recipe },
			{ position: addBtnElement.getBoundingClientRect() }
		);
	};

	onMount(() => {
		window.addEventListener('scroll', updateAddPopup, true);
		window.addEventListener('resize', updateAddPopup);
		return () => {
			window.removeEventListener('scroll', updateAddPopup, true);
			window.removeEventListener('resize', updateAddPopup);
		};
	});

	const allCosts = $derived(getAllCosts(costs, compounds));

	// Reactive calculations
	const recipeCosts = $derived(calculateRecipeCosts(recipe, allCosts));
	const totalCost = $derived(getTotalRecipeCost(recipeCosts));
	const availableIngredients = $derived(getAvailableIngredients(recipe, costs));
	const availableCompounds = $derived(
		Object.values(compounds).filter((c) => !recipe.ingredients.some((i) => i.id === c.id))
	);
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
				¥{totalCost.toFixed(0)}
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
								<span class="ingredient-name">{allCosts[ingredient.id].name}</span>
								<div class="amount-input-group">
									<TextInput
										value={ingredient.portion.amount}
										onchange={(value) => {
											ingredient.portion.amount = value;
										}}
										size="small"
										variant="inline"
										min={1}
										step={1}
										spinner={true}
									/>
								</div>
								<div class="unit-input-group">
									<SelectInput
										value={ingredient.portion.unit}
										options={[...units]}
										placeholder="Select unit..."
										size="small"
										searchable={false}
										onchange={(newUnit) => {
											ingredient.portion.unit = newUnit as Unit;
										}}
									/>
								</div>
							</div>
							<div class="ingredient-cost">
								¥{recipeCosts[ingredient.id]?.toFixed(0) || '0'}
							</div>
							<div class="color-input-group">
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
			<ModernButton
				onclick={(e) => openAddPopup(e.currentTarget as HTMLButtonElement)}
				style="width: fit-content;"
			>
				<i class="fa-solid fa-plus"></i>
				Add Ingredients
			</ModernButton>
		</div>
		<CostBreakdown bind:recipe costs={allCosts} />
	</div>
</div>

<style>
	.recipe-cost-calculator {
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		padding: 18px;
		border-radius: 8px;
		backdrop-filter: blur(10px);
		flex: 1;
	}

	.recipe-cost-calculator h3 {
		color: var(--text-primary);
		font-weight: 500;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}

	.title-label {
		color: var(--text-primary);
		font-size: 16px;
		font-weight: 500;
		width: fit-content;
		min-width: 150px;
	}

	.title {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 32px;
		font-weight: 600;
		color: var(--text-primary);
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
		border-top: 1px solid var(--border-secondary);
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
		background: var(--bg-tertiary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		font-size: 12px;
	}

	.drag-handle {
		cursor: grab;
		margin-right: 8px;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.ingredient-details {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.ingredient-name {
		font-weight: 500;
		color: var(--text-primary);
		text-transform: capitalize;
		min-width: 80px;
		width: 120px;
		font-size: 12px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.ingredient-cost {
		font-weight: 600;
		color: var(--text-primary);
		min-width: 40px;
		font-size: 12px;
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
		border: none;
		background: transparent;
		width: 20px;
		height: 20px;
		padding: 0;
	}

	.no-ingredients-message {
		color: var(--text-secondary);
		font-style: italic;
		padding: 12px;
		text-align: center;
	}

	/* Hidden row greyed out */
	.ingredient-cost-item.hidden {
		opacity: 0.4;
	}

	.ingredient-cost-item.compound {
		border-color: var(--accent-warning, #ff9500);
	}

	.ingredient-cost-item.dragging {
		opacity: 0.5;
	}
</style>

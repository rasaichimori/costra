<script lang="ts">
	import {
		calculateRecipeCosts,
		getTotalRecipeCost,
		getAvailableIngredients
	} from '../../utils/costCalculatorUtils';
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import { units, type Unit } from '$lib/utils/unit';
	import SelectInput from '../common/SelectInput.svelte';
	import TextInput from '../common/TextInput.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import AddIngredientsButton from './AddIngredientsPopup.svelte';
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount, tick } from 'svelte';
	import CostBreakdown from './CostBreakdown.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
		isEditingName: boolean;
		unit?: Unit;
	}

	let { recipe = $bindable(), costs, unit, isEditingName = $bindable() }: Props = $props();

	const { openOverlay, updateOverlay } = getOverlayContext();

	let addBtnElement: HTMLButtonElement | undefined;
	let addPopupId = $state<string | undefined>(undefined);

	const openAddPopup = (btn: HTMLButtonElement) => {
		addBtnElement = btn;
		addPopupId = openOverlay(
			AddIngredientsButton,
			{
				availableIngredients,
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
			{ availableIngredients, recipe },
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

	// Reactive calculations
	const recipeCosts = $derived(calculateRecipeCosts(recipe, costs));
	const totalCost = $derived(getTotalRecipeCost(recipeCosts));
	const availableIngredients = $derived(getAvailableIngredients(recipe, costs));
</script>

<div class="recipe-cost-calculator">
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
			{#if unit}
				/ {unit}
			{/if}
		</div>
	</div>
	<div class="recipe-section">
		<div class="recipe-breakdown">
			<h3>Ingredient Breakdown:</h3>
			{#if recipe.ingredients.length > 0}
				<div class="ingredient-list">
					{#each recipe.ingredients as ingredient}
						<div class="ingredient-cost-item" class:hidden={ingredient.hidden}>
							<div class="ingredient-details">
								<span class="ingredient-name"
									>{costs[ingredient.id]?.name ?? "ingredient doesn't exist"}</span
								>
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
									value={ingredient.color}
									oninput={(e) => {
										ingredient.color = (e.target as HTMLInputElement).value;
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
				<div>No ingredients added yet</div>
			{/if}
			<ModernButton
				onclick={(e) => openAddPopup(e.currentTarget as HTMLButtonElement)}
				style="width: fit-content;"
			>
				<i class="fa-solid fa-plus"></i>
				Add Ingredients
			</ModernButton>
		</div>
		<CostBreakdown bind:recipe {costs} />
	</div>
</div>

<style>
	.recipe-cost-calculator {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding: 18px;
		border-radius: 8px;
		backdrop-filter: blur(10px);
		flex: 1;
	}

	.recipe-cost-calculator h3 {
		color: #333333;
		font-weight: 500;
	}

	.title-label {
		margin: 8px 0;
		color: #333333;
		font-size: 16px;
		font-weight: 500;
		width: fit-content;
		min-width: 150px;
	}

	.title {
		font-size: 32px;
		font-weight: 600;
		color: #333333;
	}

	.recipe-section {
		display: flex;
		gap: 32px;
	}

	.recipe-breakdown {
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-top: 18px;
		gap: 8px;
		padding-top: 15px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
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
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 6px;
		font-size: 12px;
	}

	.ingredient-details {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.ingredient-name {
		font-weight: 500;
		color: #333333;
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
		color: #333333;
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

	/* Hidden row greyed out */
	.ingredient-cost-item.hidden {
		opacity: 0.4;
	}
</style>

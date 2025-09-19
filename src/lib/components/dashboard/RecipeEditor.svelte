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
		onDelete?: () => void;
	}

	let {
		recipe = $bindable(),
		costs,
		unit,
		onDelete,
		isEditingName = $bindable()
	}: Props = $props();

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
				{#if unit}
					/ {unit}
				{/if}
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
					{#each recipe.ingredients as ingredient}
						<div class="ingredient-cost-item" class:hidden={ingredient.hidden}>
							<div class="ingredient-details">
								<span class="ingredient-name">{costs[ingredient.id].name}</span>
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
								<input type="color" class="color-picker" bind:value={costs[ingredient.id].color} />
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
		<CostBreakdown bind:recipe {costs} />
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
</style>

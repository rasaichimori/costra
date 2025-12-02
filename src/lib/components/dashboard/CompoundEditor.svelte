<script lang="ts">
	import {
		calculateRecipeCosts,
		getTotalRecipeCost,
		getAvailableIngredients,
		compoundsToIngredients
	} from '../../utils/costCalculatorUtils';
	import type { CompoundIngredientDoc, IngredientDoc, UnitConversion } from '$lib/data/schema';
	import {
		getConversionFactor,
		massUnitLabels,
		volumeUnitLabels,
		type UnitOption
	} from '$lib/utils/unit';
	import TextInput from '../common/TextInput.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import CostBreakdown from './CostBreakdown.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';
	import AddRecipeIngredientsButton from './AddRecipeIngredientsButton.svelte';
	import UnitChevronDropdownButton from './UnitChevronDropdownButton.svelte';
	import RecipeUnitSelectButton from './RecipeUnitSelectButton.svelte';

	interface Props {
		recipe: CompoundIngredientDoc;
		costs: Record<string, IngredientDoc>;
		isEditingName: boolean;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		onDelete?: () => void;
	}

	let {
		recipe = $bindable(),
		costs,
		unitConversions = $bindable(),
		onDelete,
		customUnitLabels = $bindable(),
		isEditingName = $bindable()
	}: Props = $props();

	// Reactive calculations
	const recipeCosts = $derived(calculateRecipeCosts(recipe, costs, unitConversions));
	const totalCost = $derived(getTotalRecipeCost(recipeCosts));
	const availableIngredients = $derived(getAvailableIngredients(recipe, costs));
	const convertedYield = $derived(
		getConversionFactor(recipe.yield.unit, recipe.viewedUnit, recipe.id, unitConversions) *
			recipe.yield.amount
	);
	const perUnitCost = $derived(totalCost / convertedYield);

	const unitLabels = $derived<Record<string, string>>({
		...volumeUnitLabels,
		...massUnitLabels,
		...customUnitLabels
	});

	const compoundDoc = $derived(
		compoundsToIngredients({ [recipe.id]: recipe }, costs, unitConversions)[recipe.id]
	);
</script>

<div class="recipe-cost-calculator">
	<div class="header">
		<div class="header-left">
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
					¥{perUnitCost.toFixed(0)} / {unitLabels[recipe.viewedUnit]}
					<UnitChevronDropdownButton
						bind:customUnitLabels
						bind:unitConversions
						selectedUnitId={recipe.viewedUnit}
						ingredientDoc={compoundDoc}
						selectUnit={(unitId: string) => (recipe.viewedUnit = unitId)}
					/>
				</div>
			</div>
			<div class="recipe-yield">
				<div class="yield-row">
					<div class="total-cost-row">
						<span>Total Cost:</span>
						<div class="ingredient-cost">
							¥{totalCost.toFixed(0)}
						</div>
					</div>
					<div class="yield-row-item">
						<span class="total-cost">yield:</span>
						<div class="amount-input-group">
							<TextInput
								value={recipe.yield.amount}
								oninput={(value) => {
									recipe.yield.amount = value;
								}}
								onchange={(value) => {
									recipe.yield.amount = value;
								}}
								size="small"
								variant="inline"
								min={1}
								step={1}
								spinner={true}
							/>
						</div>
						<div class="unit-input-group">
							<RecipeUnitSelectButton
								recipePortion={recipe.yield}
								ingredientDoc={compoundDoc}
								bind:unitConversions
								bind:customUnitLabels
								updateRecipePortionUnit={(unitId: string) => {
									recipe.yield.unit = unitId;
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel="Delete"
			title="Delete Ingredient"
			onclick={() => onDelete?.()}
		>
			<i class="fa-solid fa-trash"></i>
			Delete
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
								<span class="ingredient-name">{costs[ingredient.id]?.name ?? ingredient.id}</span>
								<div class="amount-input-group">
									<TextInput
										value={ingredient.portion.amount}
										onchange={(value) => {
											ingredient.portion.amount = value;
										}}
										oninput={(value) => {
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
									{#if costs[ingredient.id]}
										<RecipeUnitSelectButton
											recipePortion={ingredient.portion}
											ingredientDoc={costs[ingredient.id]}
											bind:unitConversions
											bind:customUnitLabels
											updateRecipePortionUnit={(unitId: string) => {
												ingredient.portion.unit = unitId;
											}}
										/>
									{:else}
										<span class="error-text">Missing: {ingredient.id}</span>
									{/if}
								</div>
							</div>
							<div class="ingredient-cost">
								¥{recipeCosts[ingredient.id]?.toFixed(0) || '0'}
							</div>
							<div class="color-input-group">
								{#if costs[ingredient.id]}
									<input
										type="color"
										class="color-picker"
										bind:value={costs[ingredient.id].color}
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
			<AddRecipeIngredientsButton {availableIngredients} {recipe} />
		</div>
		<CostBreakdown bind:recipe {costs} {unitConversions} />
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

	.header-left {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 32px;
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

	.recipe-yield {
		display: flex;
		flex-direction: column-reverse;
	}

	.yield-row {
		display: flex;
		flex-direction: column;
		gap: 8px;

		span {
			font-weight: 500;
			color: var(--text-primary);
			text-transform: capitalize;
			min-width: 60px;
			font-size: 12px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
	.total-cost-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.yield-row-item {
		display: flex;
		align-items: center;
		gap: 8px;
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

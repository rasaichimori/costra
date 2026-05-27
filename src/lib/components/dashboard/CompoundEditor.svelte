<script lang="ts">
	import {
		calculateRecipeCosts,
		getAvailableIngredients,
		getCompoundPerUnitCost,
		getTotalRecipeCost,
		compoundsToIngredients
	} from '../../utils/costCalculatorUtils';
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeLikeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import TextInput from '../common/TextInput.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import CostBreakdown from './CostBreakdown.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';
	import UnitChevronDropdownButton from './UnitChevronDropdownButton.svelte';
	import RecipeUnitSelectButton from './RecipeUnitSelectButton.svelte';
	import RecipeIngredientsSection from './RecipeIngredientsSection.svelte';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';
	import { buildUnitLabels, getCompactUnitLabel } from '$lib/utils/unitSelectUtils';
	import { isUnsetUnit } from '$lib/utils/ingredientUtils';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		recipe: CompoundIngredientDoc;
		costs: Record<string, IngredientDoc>;
		allRecipes: Record<string, RecipeLikeDoc>;
		isEditingName: boolean;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		onDelete?: () => void;
		onDuplicate?: () => void;
	}

	let {
		recipe = $bindable(),
		costs,
		allRecipes,
		unitConversions = $bindable(),
		onDelete,
		customUnitLabels = $bindable(),
		onDuplicate,
		isEditingName = $bindable()
	}: Props = $props();

	// Reactive calculations
	const recipeCosts = $derived(calculateRecipeCosts(recipe, costs, unitConversions));
	const totalCost = $derived(getTotalRecipeCost(recipeCosts));
	const availableIngredients = $derived(getAvailableIngredients(recipe, costs));
	const perUnitCost = $derived(getCompoundPerUnitCost(recipe, costs, unitConversions));

	const unitLabels = $derived(buildUnitLabels(customUnitLabels, m.unitUnsetLabel()));

	const compoundDoc = $derived(
		compoundsToIngredients({ [recipe.id]: recipe }, costs, unitConversions)[recipe.id]
	);
	const currencyContext = getCurrencyContext();
</script>

<div class="recipe-cost-calculator">
	<div class="header">
		<div class="header-left">
			<div class="title">
				<div class="title-label">
					<div class="title-name-row">
						<EditableTextField
							bind:value={recipe.name}
							bind:isEditing={isEditingName}
							onSave={() => {
								isEditingName = false;
							}}
						/>
						{#if onDuplicate && !isEditingName}
							<ModernButton
								variant="icon"
								size="small"
								ariaLabel={m.duplicateCompoundAriaLabel()}
								title={m.duplicateCompoundTitle()}
								onclick={() => onDuplicate?.()}
							>
								<i class="fa-solid fa-copy"></i>
							</ModernButton>
						{/if}
					</div>
				</div>
				<div class="cost-amount">
					{currencyContext.currency}{perUnitCost.toFixed(0)} / {getCompactUnitLabel(
						recipe.viewedUnit as string,
						unitLabels
					)}
					<UnitChevronDropdownButton
						bind:customUnitLabels
						bind:unitConversions
						selectedUnitId={recipe.viewedUnit}
						ingredientDoc={compoundDoc}
						{allRecipes}
						unsetLabel={m.unitUnsetLabel()}
						selectUnit={(unitId: string) => {
							recipe.viewedUnit = unitId;
							if (isUnsetUnit(recipe.yield.unit as string)) {
								recipe.yield.unit = unitId;
							}
						}}
					/>
				</div>
			</div>
			<div class="recipe-yield">
				<div class="yield-row">
					<div class="total-cost-row">
						<span>{m.totalCostLabel()}</span>
						<div class="ingredient-cost">
							{currencyContext.currency}{totalCost.toFixed(0)}
						</div>
					</div>
					<div class="yield-row-item">
						<span class="total-cost">{m.yieldLabel()}</span>
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
								min={0}
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
								{allRecipes}
								promptOnlyWhenUsed={true}
								updateRecipePortionUnit={(unitId: string) => {
									recipe.yield.unit = unitId;
									if (isUnsetUnit(recipe.viewedUnit as string)) {
										recipe.viewedUnit = unitId;
									}
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
			ariaLabel={m.deleteCompoundAriaLabel()}
			title={m.deleteCompoundTitle()}
			onclick={() => onDelete?.()}
		>
			<i class="fa-solid fa-trash"></i>
			{m.deleteCompound()}
		</ModernButton>
	</div>
	<div class="recipe-section">
		<div class="recipe-breakdown">
			<RecipeIngredientsSection
				bind:ingredients={recipe.ingredients}
				ingredientDocs={costs}
				{recipeCosts}
				{costs}
				bind:unitConversions
				bind:customUnitLabels
				{availableIngredients}
				missingIngredientMessage={(id) => m.missingIngredientShort({ id })}
			/>
		</div>
		<CostBreakdown
			bind:ingredients={recipe.ingredients}
			chartId={recipe.id}
			{costs}
			{unitConversions}
		/>
	</div>
</div>

<style>
	.recipe-cost-calculator {
		background: var(--card);
		border: 1px solid var(--border);
		padding: 18px;
		border-radius: 8px;
		backdrop-filter: blur(10px);
		flex: 1;
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
		color: var(--foreground);
		font-size: 16px;
		font-weight: 500;
		width: fit-content;
		min-width: 150px;
	}

	.title-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.title {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 32px;
		font-weight: 600;
		color: var(--foreground);
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
			color: var(--foreground);
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
		border-top: 1px solid var(--border);
		text-align: left;
	}
	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.recipe-cost-calculator {
			padding: 14px;
		}

		.header {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.header-left {
			width: 100%;
			gap: 8px 16px;
		}

		.title {
			font-size: 24px;
		}

		.title-label {
			font-size: 14px;
			min-width: 120px;
		}

		.cost-amount {
			font-size: 20px;
		}

		.recipe-section {
			gap: 20px;
		}
	}

	@media (max-width: 480px) {
		.recipe-cost-calculator {
			padding: 10px;
			border-radius: 6px;
		}

		.title {
			font-size: 18px;
			gap: 4px;
		}

		.title-label {
			font-size: 12px;
		}

		.cost-amount {
			font-size: 16px;
		}

		.yield-row {
			gap: 6px;
		}

		.recipe-section {
			gap: 16px;
		}

		.recipe-breakdown {
			margin-top: 12px;
			padding-top: 12px;
		}
	}
</style>

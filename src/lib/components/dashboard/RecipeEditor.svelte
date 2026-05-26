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
	import ModernButton from '../common/ModernButton.svelte';
	import CostBreakdown from './CostBreakdown.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';
	import RecipeSizeTabs from './RecipeSizeTabs.svelte';
	import RecipeIngredientsSection from './RecipeIngredientsSection.svelte';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';
	import { getActiveSize, recipeSizeToCostInput, recipeToCostInput } from '$lib/utils/recipeUtils';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
		compounds: Record<string, CompoundIngredientDoc>;
		isEditingName: boolean;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		onDelete?: () => void;
		onDuplicate?: () => void;
	}

	let {
		recipe = $bindable(),
		costs,
		compounds,
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		onDelete,
		onDuplicate,
		isEditingName = $bindable()
	}: Props = $props();

	let editingSizeId = $state<string | undefined>(undefined);

	const activeSize = $derived(getActiveSize(recipe));
	const costRecipe = $derived(recipeToCostInput(recipe));

	const allCosts = $derived(getAllCosts(costs, compounds, unitConversions));

	const recipeCosts = $derived(calculateRecipeCosts(costRecipe, allCosts, unitConversions));
	const totalCost = $derived(getTotalRecipeCost(recipeCosts));
	const sizeCosts = $derived(
		Object.fromEntries(
			recipe.sizes.map((size) => [
				size.id,
				getTotalRecipeCost(
					calculateRecipeCosts(recipeSizeToCostInput(recipe.id, size), allCosts, unitConversions)
				)
			])
		)
	);
	const availableIngredients = $derived(getAvailableIngredients(costRecipe, costs));
	const availableCompounds = $derived(
		Object.values(compounds).filter((c) => !activeSize.ingredients.some((i) => i.id === c.id))
	);
	const currencyContext = getCurrencyContext();
</script>

<div class="recipe-cost-calculator">
	<div class="header">
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
							ariaLabel={m.duplicateRecipeAriaLabel()}
							title={m.duplicateRecipeTitle()}
							onclick={() => onDuplicate?.()}
						>
							<i class="fa-solid fa-copy"></i>
						</ModernButton>
					{/if}
				</div>
			</div>
			<div class="cost-amount">
				{currencyContext.currency}{totalCost.toFixed(0)}
			</div>
		</div>
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel={m.deleteRecipeAriaLabel()}
			title={m.deleteRecipeTitle()}
			onclick={() => onDelete?.()}
		>
			<i class="fa-solid fa-trash"></i>
			{m.deleteRecipe()}
		</ModernButton>
	</div>
	<div class="recipe-section">
		<div class="recipe-breakdown">
			{#key recipe.id}
				<RecipeSizeTabs bind:recipe bind:editingSizeId {sizeCosts} />
			{/key}
			<div class="breakdown-content">
				<RecipeIngredientsSection
					bind:ingredients={activeSize.ingredients}
					ingredientDocs={allCosts}
					{recipeCosts}
					{costs}
					{compounds}
					bind:unitConversions
					bind:customUnitLabels
					{availableIngredients}
					{availableCompounds}
				/>
			</div>
		</div>
		<CostBreakdown
			bind:ingredients={activeSize.ingredients}
			chartId={recipe.id}
			costs={allCosts}
			{compounds}
			{unitConversions}
		/>
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
		min-width: 0;
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
		min-width: 0;
	}

	.recipe-breakdown {
		display: flex;
		flex-direction: column;
		flex: 1;
		max-width: 100%;
		margin-top: 18px;
		padding-top: 15px;
		border-top: 1px solid var(--border);
		text-align: left;
	}

	.breakdown-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		background: var(--card);
	}

	@media (max-width: 768px) {
		.recipe-cost-calculator {
			padding: 14px;
		}

		.header {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.title {
			font-size: 24px;
		}

		.title-label {
			font-size: 14px;
			min-width: 120px;
		}

		.recipe-section {
			gap: 20px;
		}
	}

	@media (max-width: 480px) {
		.recipe-cost-calculator {
			padding: 10px;
			border-radius: 8px;
		}

		.title {
			font-size: 20px;
			gap: 4px;
		}

		.title-label {
			font-size: 12px;
		}

		.recipe-section {
			gap: 16px;
		}

		.recipe-breakdown {
			margin-top: 12px;
			padding-top: 12px;
		}

		.breakdown-content {
			padding: 8px;
		}
	}
</style>

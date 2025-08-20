<script lang="ts">
	import {
		calculateRecipeCosts,
		getTotalRecipeCost,
		getAvailableIngredients
	} from '../../utils/costCalculatorUtils';
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import { units, type Unit } from '$lib/utils/unit';

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
		unit?: Unit;
	}

	let { recipe = $bindable(), costs, unit }: Props = $props();

	// Reactive calculations
	const recipeCosts = $derived(calculateRecipeCosts(recipe, costs));
	const totalCost = $derived(getTotalRecipeCost(recipeCosts));
	const availableIngredients = $derived(getAvailableIngredients(recipe, costs));
</script>

<div class="cost-calculator">
	<div class="selected-cost">
		<div class="cost-display">
			<h4>
				{recipe.name}
			</h4>
			<div class="cost-amount">
				¥{totalCost.toFixed(0)}
				{#if unit}
					/ {unit}
				{/if}
			</div>
		</div>
		<div class="ingredient-section">
			<div class="ingredient-breakdown">
				<h3>Ingredient Breakdown:</h3>
				<div class="ingredient-list">
					{#each recipe.ingredients as ingredient}
						<div class="ingredient-cost-item">
							<div class="ingredient-details">
								<span class="ingredient-name"
									>{costs[ingredient.id]?.name ?? "ingredient doesn't exist"}</span
								>
								<div class="amount-input-group">
									<input
										type="number"
										min="0.01"
										step="0.01"
										bind:value={ingredient.portion.amount}
										class="amount-input"
									/>
								</div>
								<div class="unit-input-group">
									<select
										value={ingredient.portion.unit}
										onchange={(e) => {
											ingredient.portion.unit = (e.target as HTMLSelectElement).value as Unit;
										}}
										class="unit-select"
									>
										{#each units as unit}
											<option value={unit}>{unit}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="ingredient-cost">
								¥{recipeCosts[ingredient.id]?.toFixed(0) || '0'}
							</div>
							<button
								class="remove-ingredient-btn"
								onclick={() => {
									recipe.ingredients = recipe.ingredients.filter((i) => i.id !== ingredient.id);
								}}
								aria-label="Remove ingredient"
							>
								<i class="fa-solid fa-trash"></i>
							</button>
						</div>
					{/each}
				</div>
			</div>

			<div class="add-ingredients">
				<h3>Add New Ingredients:</h3>
				<div class="available-ingredients">
					{#each availableIngredients as ingredient}
						<button
							class="add-ingredient-btn"
							onclick={() => {
								recipe.ingredients.push({
									id: ingredient.id,
									portion: { amount: 1, unit: 'cup' }
								});
							}}
						>
							<i class="fa-solid fa-plus"></i>
							{ingredient.name}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
<style>
	.cost-calculator {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding: 18px;
		border-radius: 8px;
		margin-bottom: 20px;
		backdrop-filter: blur(10px);
	}

	.cost-calculator h3 {
		color: #333333;
		font-weight: 500;
	}

	.cost-calculator h4 {
		margin: 8px 0;
		color: #333333;
		font-size: 16px;
		font-weight: 500;
	}

	.selectors {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 20px;
		margin-bottom: 18px;
	}

	.selection-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.selection-pills {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}

	.selection-pill {
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.2);
		color: #333333;
		padding: 10px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 400;
		transition: all 0.2s;
		text-transform: capitalize;
	}

	.selection-pill:hover {
		background: rgba(255, 255, 255, 0.9);
		border-color: rgba(0, 0, 0, 0.3);
		transform: translateY(-1px);
	}

	.selection-pill.active {
		background: rgba(0, 0, 0, 0.1);
		color: #333333;
		border-color: rgba(0, 0, 0, 0.4);
	}

	.selected-cost {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(0, 0, 0, 0.15);
		padding: 18px;
		border-radius: 8px;
		text-align: center;
		backdrop-filter: blur(10px);
	}

	.cost-display h4 {
		margin: 0 0 15px 0;
		color: #333333;
		font-size: 18px;
		font-weight: 500;
	}

	.cost-amount {
		font-size: 32px;
		font-weight: 600;
		color: #333333;
		margin-bottom: 15px;
	}

	.ingredient-section {
		display: flex;
		gap: 32px;
	}

	.add-ingredients,
	.ingredient-breakdown {
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-top: 18px;
		gap: 8px;
		padding-top: 15px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		text-align: left;
	}

	.available-ingredients {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.add-ingredient-btn {
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.2);
		color: #333333;
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 6px;
		transition: all 0.2s;
	}

	.add-ingredient-btn:hover {
		background: rgba(255, 255, 255, 0.9);
		border-color: rgba(0, 0, 0, 0.3);
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
		font-size: 12px;
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
	}

	.amount-input,
	.unit-select {
		padding: 4px 8px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		text-align: center;
		font-weight: 400;
		width: 100%;
		background: rgba(255, 255, 255, 0.9);
		color: #333333;
		cursor: pointer;
		font-size: 12px;
	}

	.amount-input:focus,
	.unit-select:focus {
		outline: none;
		border-color: rgba(0, 0, 0, 0.4);
		background: rgba(255, 255, 255, 1);
	}

	.remove-ingredient-btn {
		background: rgba(255, 100, 100, 0.8);
		color: white;
		border: none;
		padding: 6px 8px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-ingredient-btn:hover {
		background: rgba(255, 100, 100, 1);
		transform: scale(1.1);
	}

	@media (max-width: 768px) {
		.selectors {
			grid-template-columns: 1fr;
			gap: 15px;
		}

		.selection-pills {
			justify-content: center;
		}

		.ingredient-section {
			flex-direction: column;
			gap: 20px;
		}
	}
</style>

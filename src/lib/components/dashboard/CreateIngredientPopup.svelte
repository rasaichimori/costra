<script lang="ts">
	import type { IngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import SelectInput from '../common/SelectInput.svelte';
	import EditableTextField from '../common/EditableTextField.svelte';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';
	import { randomLightColorHex } from '$lib/utils/color';
	import ProductUnitSelectButton from './ProductUnitSelectButton.svelte';

	interface Props {
		costs: Record<string, IngredientDoc>;
		recipes: Record<string, RecipeDoc>;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		initialCategory?: string;
		initialName?: string;
		onclose?: (createdIngredientId?: string) => void;
	}

	let {
		costs = $bindable(),
		recipes,
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		initialCategory = '',
		initialName = '',
		onclose
	}: Props = $props();

	const currencyContext = getCurrencyContext();

	// Create a temporary ingredient for editing
	const newId = crypto.randomUUID();
	const categories = $derived(
		[...new Set(Object.values(costs).map((d) => d.category))].filter(
			(value) => value !== undefined && value !== ''
		)
	);

	// Find the next sequential number for ingredient name
	const getNextIngredientNumber = () => {
		const existingIngredients = Object.values(costs);
		const ingredientPattern = /^Ingredient (\d+)$/;
		const existingNumbers = existingIngredients
			.map((ing) => ing.name.match(ingredientPattern)?.[1])
			.filter(Boolean)
			.map(Number)
			.sort((a, b) => a - b);

		let num = 1;
		for (const existingNum of existingNumbers) {
			if (existingNum === num) {
				num++;
			} else {
				break;
			}
		}
		return num;
	};

	let ingredientName = $state(initialName || `Ingredient ${getNextIngredientNumber()}`);
	let category = $state(initialCategory);
	let cost = $state(10);
	let amount = $state(1);
	let unit = $state<string>('cup');

	// Create a temporary ingredient doc for ProductUnitSelectButton
	let tempIngredientDoc = $state<IngredientDoc>({
		id: newId,
		name: ingredientName,
		category: category || '',
		product: {
			cost: cost,
			amount: amount,
			unit: unit
		},
		color: '#ffffff'
	});

	// Keep tempIngredientDoc in sync with field changes (except unit which is handled by callback)
	$effect(() => {
		tempIngredientDoc.name = ingredientName;
		tempIngredientDoc.category = category || '';
		tempIngredientDoc.product.cost = cost;
		tempIngredientDoc.product.amount = amount;
		// Don't update unit here - it's handled by onUnitChange callback
	});

	const updateCategory = (newCategory: string) => {
		category = newCategory;
	};

	const createIngredient = () => {
		if (!ingredientName.trim()) {
			return;
		}

		const newIngredient: IngredientDoc = {
			id: newId,
			name: ingredientName.trim(),
			category: category || '',
			product: {
				cost: cost,
				amount: amount,
				unit: unit
			},
			color: randomLightColorHex()
		};

		// Add to costs object
		costs[newId] = newIngredient;

		// Close popup and return the created ingredient ID
		onclose?.(newId);
	};

	const cancel = () => {
		onclose?.();
	};
</script>

<div class="create-ingredient-popup">
	<h3>Create Ingredient</h3>
	<div class="form-fields">
		<div class="field-group">
			<label>Name</label>
			<TextInput bind:value={ingredientName} size="small" variant="inline" placeholder="Ingredient name" />
		</div>
		<div class="field-group">
			<label>Category</label>
			<SelectInput
				bind:value={category}
				options={categories}
				placeholder="Select category..."
				size="small"
				onchange={updateCategory}
				searchable={true}
			/>
		</div>
		<div class="field-group">
			<label>Total Cost ({currencyContext.currency})</label>
			<div class="cost-input-container">
				<span class="currency">{currencyContext.currency}</span>
				<TextInput bind:value={cost} size="small" variant="inline" min={0} />
			</div>
		</div>
		<div class="field-group">
			<label>Portion</label>
			<div class="portion-row">
				<TextInput bind:value={amount} size="small" variant="inline" min={0.01} step={0.01} />
				<ProductUnitSelectButton
					bind:ingredientDoc={tempIngredientDoc}
					{recipes}
					bind:unitConversions
					bind:customUnitLabels
					onUnitChange={(newUnit) => {
						unit = newUnit;
						tempIngredientDoc.product.unit = newUnit;
					}}
				/>
			</div>
		</div>
	</div>
	<div class="actions">
		<ModernButton variant="secondary" onclick={cancel}>Cancel</ModernButton>
		<ModernButton variant="primary" onclick={createIngredient}>Create</ModernButton>
	</div>
</div>

<style>
	.create-ingredient-popup {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: 10px;
		box-shadow: 0 6px 18px var(--shadow-heavy);
		min-width: 300px;
		max-width: 400px;
		color: var(--text-primary);
	}

	h3 {
		margin: 0;
		color: var(--text-primary);
		font-size: 18px;
		font-weight: 600;
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	label {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.cost-input-container {
		display: flex;
		align-items: center;
		gap: 4px;
		width: 100%;
	}

	.currency {
		font-weight: 600;
		color: var(--text-primary);
	}

	.portion-row {
		display: flex;
		gap: 8px;
		align-items: center;
		width: 100%;
	}

	.portion-row :global(.text-input) {
		flex: 0 0 auto;
		min-width: 80px;
	}

	.portion-row :global(button) {
		flex: 1 1 auto;
	}

	.actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
		margin-top: 8px;
	}
</style>


<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import { getUnitCategory, getUnitsByCategory } from '$lib/utils/unitCategoryUtils';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';

	let {
		conversion,
		ingredientName,
		inputAmount = 1,
		customUnitLabels,
		onInputAmountChange,
		onOutputAmountChange,
		onInputUnitChange,
		onOutputUnitChange,
		onDelete
	}: {
		conversion: UnitConversion;
		ingredientName: string;
		inputAmount: number;
		customUnitLabels: Record<string, string>;
		onInputAmountChange: (amount: number) => void;
		onOutputAmountChange: (amount: number) => void;
		onInputUnitChange: (unit: string) => void;
		onOutputUnitChange: (unit: string) => void;
		onDelete: () => void;
	} = $props();

	// Schema: inputUnit × conversionFactor = outputUnit
	// "How many inputs are in one output" - e.g., 165g = 1 cup means factor = 165
	// Data stored as: smaller → larger (g → cup with factor 165)
	// Display: "{factor} {inputUnit} of {ingredient} = 1 {outputUnit}"

	// Display values - directly use conversion props
	const displayFirstAmount = $derived(inputAmount * conversion.conversionFactor);
	const displaySecondAmount = $derived(inputAmount);

	// Categories for the dropdowns
	const firstCategory = $derived(getUnitCategory(conversion.inputUnit as string));
	const secondCategory = $derived(getUnitCategory(conversion.outputUnit as string));
	const firstUnits = $derived(getUnitsByCategory(firstCategory, customUnitLabels));
	const secondUnits = $derived(getUnitsByCategory(secondCategory, customUnitLabels));
</script>

<div class="conversion-row">
	<div class="conversion-category">
		<span class="category-badge input">{firstCategory}</span>
		<span class="arrow">→</span>
		<span class="category-badge output">{secondCategory}</span>
	</div>
	<div class="conversion-editor">
		<div class="conversion-part">
			<TextInput
				value={displayFirstAmount}
				size="small"
				variant="inline"
				min={0.001}
				step={0.001}
				onchange={(newVal) => {
					// User changed the smaller unit amount (first position)
					// This updates the factor: newFactor = newVal / inputAmount
					onOutputAmountChange(newVal as number);
				}}
				style="width:fit-content;"
			/>
			<select
				class="unit-select"
				value={conversion.inputUnit}
				onchange={(e) => {
					// First unit = stored inputUnit (smaller)
					onInputUnitChange(e.currentTarget.value);
				}}
			>
				{#each firstUnits as unit}
					<option value={unit.id}>{unit.label}</option>
				{/each}
			</select>
			<span class="of-text">of {ingredientName} =</span>
		</div>
		<div class="conversion-part">
			<TextInput
				value={displaySecondAmount}
				size="small"
				variant="inline"
				min={0.001}
				step={0.001}
				onchange={(newVal) => {
					// User changed the larger unit amount (second position)
					// This updates the base amount for display scaling
					onInputAmountChange(newVal as number);
				}}
			/>
			<select
				class="unit-select"
				value={conversion.outputUnit}
				onchange={(e) => {
					// Second unit = stored outputUnit (larger)
					onOutputUnitChange(e.currentTarget.value);
				}}
			>
				{#each secondUnits as unit}
					<option value={unit.id}>{unit.label}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="conversion-actions">
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel="Delete conversion"
			title="Delete conversion"
			onclick={onDelete}
		>
			<i class="fa-solid fa-trash"></i>
		</ModernButton>
	</div>
</div>

<style>
	.conversion-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 16px;
		border-bottom: 1px solid var(--border-primary);
	}

	.conversion-row:last-child {
		border-bottom: none;
	}

	.conversion-category {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 160px;
	}

	.category-badge {
		background: var(--bg-active);
		color: var(--text-secondary);
		font-size: 10px;
		font-weight: 500;
		padding: 2px 6px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.category-badge.input {
		background: var(--bg-active);
		color: var(--text-secondary);
	}

	.category-badge.output {
		background: var(--bg-active);
		color: var(--text-secondary);
	}

	.arrow {
		color: var(--text-secondary);
		font-size: 14px;
	}

	.conversion-editor {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		flex-wrap: wrap;
	}

	.conversion-part {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.of-text {
		color: var(--text-secondary);
		font-size: 13px;
		white-space: nowrap;
	}

	.unit-select {
		padding: 0px 5px;
		border: 1px solid var(--border-secondary);
		border-radius: 6px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 13px;
		font-family: inherit;
		cursor: pointer;
		min-width: 100px;
		transition: all 0.15s ease;
	}

	.unit-select:hover {
		border-color: var(--border-primary);
	}

	.unit-select:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.2);
	}

	.conversion-actions {
		display: flex;
		gap: 4px;
	}

	@media (max-width: 768px) {
		.conversion-row {
			flex-wrap: wrap;
		}

		.conversion-category {
			min-width: 100%;
			margin-bottom: 8px;
		}

		.conversion-editor {
			width: 100%;
		}
	}
</style>

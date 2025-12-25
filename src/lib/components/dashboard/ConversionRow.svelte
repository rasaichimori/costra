<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import { getUnitCategory, getUnitsByCategory } from '$lib/utils/unitCategoryUtils';
	import { isSmallerUnit } from '$lib/utils/unit';
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

	// Determine display order: smaller unit first
	// Normalize for display if needed (for backwards compatibility with non-normalized conversions)
	const outputIsSmaller = isSmallerUnit(conversion.outputUnit, conversion.inputUnit);
	const isNormalized = $derived(outputIsSmaller === false || outputIsSmaller === null);

	const displayInputUnit = $derived(!isNormalized ? conversion.outputUnit : conversion.inputUnit);
	const displayOutputUnit = $derived(!isNormalized ? conversion.inputUnit : conversion.outputUnit);
	const displayFactor = $derived(
		!isNormalized ? 1 / conversion.conversionFactor : conversion.conversionFactor
	);

	// For display: show "X smallerUnit = Y largerUnit"
	// If normalized: inputUnit (smaller) × factor = outputUnit (larger)
	// If not normalized: outputUnit (smaller) × (1/factor) = inputUnit (larger)
	const displayInputAmount = $derived(
		!isNormalized ? inputAmount * conversion.conversionFactor : inputAmount
	);
	const displayOutputAmount = $derived(
		!isNormalized ? inputAmount : inputAmount * conversion.conversionFactor
	);

	const inputCategory = $derived(getUnitCategory(displayInputUnit as string));
	const outputCategory = $derived(getUnitCategory(displayOutputUnit as string));
	const inputUnits = $derived(getUnitsByCategory(inputCategory, customUnitLabels));
	const outputUnits = $derived(getUnitsByCategory(outputCategory, customUnitLabels));
</script>

<div class="conversion-row">
	<div class="conversion-category">
		<span class="category-badge input">{inputCategory}</span>
		<span class="arrow">→</span>
		<span class="category-badge output">{outputCategory}</span>
	</div>
	<div class="conversion-editor">
		<div class="conversion-part">
			<TextInput
				value={displayInputAmount}
				size="small"
				variant="inline"
				min={0.001}
				step={0.001}
				onchange={(newVal) => {
					// Convert display amount back to stored format
					if (!isNormalized) {
						// Stored as larger → smaller, display as smaller → larger
						// displayInputAmount is the smaller unit (outputUnit in stored)
						// Convert back: stored outputAmount = displayInputAmount
						onOutputAmountChange(newVal as number);
					} else {
						// Already normalized: stored inputUnit is smaller
						onInputAmountChange(newVal as number);
					}
				}}
				style="width:fit-content;"
			/>
			<select
				class="unit-select"
				value={displayInputUnit}
				onchange={(e) => {
					// Convert display unit back to stored format
					if (!isNormalized) {
						onOutputUnitChange(e.currentTarget.value);
					} else {
						onInputUnitChange(e.currentTarget.value);
					}
				}}
			>
				{#each inputUnits as unit}
					<option value={unit.id}>{unit.label}</option>
				{/each}
			</select>
			<span class="of-text">of {ingredientName} =</span>
		</div>
		<div class="conversion-part">
			<TextInput
				value={displayOutputAmount}
				size="small"
				variant="inline"
				min={0.001}
				step={0.001}
				onchange={(newVal) => {
					// Convert display amount back to stored format
					if (!isNormalized) {
						// Stored as larger → smaller, display as smaller → larger
						// displayOutputAmount is the larger unit (inputUnit in stored)
						onInputAmountChange(newVal as number);
					} else {
						// Already normalized: stored outputUnit is larger
						onOutputAmountChange(newVal as number);
					}
				}}
			/>
			<select
				class="unit-select"
				value={displayOutputUnit}
				onchange={(e) => {
					// Convert display unit back to stored format
					if (!isNormalized) {
						onInputUnitChange(e.currentTarget.value);
					} else {
						onOutputUnitChange(e.currentTarget.value);
					}
				}}
			>
				{#each outputUnits as unit}
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

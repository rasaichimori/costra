<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import { getUnitCategory, getUnitsByCategory } from '$lib/utils/unitCategoryUtils';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import type { UnitCategory } from '$lib/utils/unitCategoryUtils';

	let {
		conversion,
		ingredientName,
		customUnitLabels,
		onLeftAmountChange,
		onRightAmountChange,
		onInputUnitChange,
		onOutputUnitChange,
		onDelete
	}: {
		conversion: UnitConversion;
		ingredientName: string;
		customUnitLabels: Record<string, string>;
		onLeftAmountChange: (amount: number) => void;
		onRightAmountChange: (amount: number) => void;
		onInputUnitChange: (unit: string) => void;
		onOutputUnitChange: (unit: string) => void;
		onDelete: () => void;
	} = $props();

	// Schema: conversionFactor input units = 1 output unit
	// Editor shows: (factor × outputAmount) inputUnit = outputAmount outputUnit
	const outputAmount = $derived(conversion.outputAmount ?? 1);
	const displayLeftAmount = $derived(conversion.conversionFactor * outputAmount);
	const displayRightAmount = $derived(outputAmount);

	// Categories for the dropdowns
	const firstCategory = $derived(getUnitCategory(conversion.inputUnit as string));
	const secondCategory = $derived(getUnitCategory(conversion.outputUnit as string));
	const firstUnits = $derived(getUnitsByCategory(firstCategory, customUnitLabels));
	const secondUnits = $derived(getUnitsByCategory(secondCategory, customUnitLabels));

	const categoryLabel = (category: UnitCategory) => {
		if (category === 'Volume') return m.unitCategoryVolume();
		if (category === 'Mass') return m.unitCategoryMass();
		return m.unitCategoryCustom();
	};
</script>

<div class="conversion-row">
	<div class="conversion-category">
		<span class="category-badge input">{categoryLabel(firstCategory)}</span>
		<span class="arrow">→</span>
		<span class="category-badge output">{categoryLabel(secondCategory)}</span>
	</div>
	<div class="conversion-editor">
		<div class="conversion-part">
			<TextInput
				value={displayLeftAmount}
				size="small"
				variant="inline"
				min={0.001}
				step={0.001}
				onchange={(newVal) => onLeftAmountChange(newVal as number)}
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
				{#each firstUnits as unit (unit.id)}
					<option value={unit.id}>{unit.label}</option>
				{/each}
			</select>
			<span class="of-text">{m.conversionOfEquals({ name: ingredientName })}</span>
		</div>
		<div class="conversion-part">
			<TextInput
				value={displayRightAmount}
				size="small"
				variant="inline"
				min={0.001}
				step={0.001}
				onchange={(newVal) => onRightAmountChange(newVal as number)}
			/>
			<select
				class="unit-select"
				value={conversion.outputUnit}
				onchange={(e) => {
					// Second unit = stored outputUnit (larger)
					onOutputUnitChange(e.currentTarget.value);
				}}
			>
				{#each secondUnits as unit (unit.id)}
					<option value={unit.id}>{unit.label}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="conversion-actions">
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel={m.deleteConversionAriaLabel()}
			title={m.deleteConversionTitle()}
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
		border-bottom: 1px solid var(--border);
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
		background: var(--active);
		color: var(--secondary-foreground);
		font-size: 10px;
		font-weight: 500;
		padding: 2px 6px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.category-badge.input {
		background: var(--active);
		color: var(--secondary-foreground);
	}

	.category-badge.output {
		background: var(--active);
		color: var(--secondary-foreground);
	}

	.arrow {
		color: var(--secondary-foreground);
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
		color: var(--secondary-foreground);
		font-size: 13px;
		white-space: nowrap;
	}

	.unit-select {
		padding: 0px 5px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--card);
		color: var(--foreground);
		font-size: 13px;
		font-family: inherit;
		cursor: pointer;
		min-width: 100px;
		transition: all 0.15s ease;
	}

	.unit-select:hover {
		border-color: var(--border);
	}

	.unit-select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px var(--accent);
	}

	.conversion-actions {
		display: flex;
		gap: 4px;
	}

	@media (max-width: 768px) {
		.conversion-row {
			flex-wrap: wrap;
			padding: 10px 12px;
			gap: 12px;
		}

		.conversion-category {
			min-width: 100%;
			margin-bottom: 0;
		}

		.conversion-editor {
			width: 100%;
			gap: 10px;
		}

		.conversion-part {
			gap: 6px;
		}

		.of-text {
			font-size: 12px;
		}

		.unit-select {
			font-size: 12px;
			min-width: 80px;
		}
	}

	@media (max-width: 480px) {
		.conversion-row {
			padding: 8px 10px;
			gap: 10px;
		}

		.conversion-category {
			gap: 6px;
		}

		.category-badge {
			font-size: 9px;
			padding: 2px 5px;
		}

		.arrow {
			font-size: 12px;
		}

		.conversion-part {
			flex-wrap: wrap;
			gap: 4px;
		}

		.of-text {
			font-size: 11px;
		}

		.unit-select {
			font-size: 11px;
			min-width: 70px;
			padding: 0px 4px;
		}
	}
</style>

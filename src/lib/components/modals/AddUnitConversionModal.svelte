<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import { isSmallerUnit } from '$lib/utils/unit';
	import {
		buildUnitConversionFromDisplayAmounts,
		conversionFactorFromDisplayAmounts
	} from '$lib/utils/conversionEditUtils';
	import { getCompactUnitLabel } from '$lib/utils/unitSelectUtils';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		ingredientId: string;
		ingredientName: string;
		inputUnit: string;
		outputUnit: string;
		unitLabels: Record<string, string>;
		onSave: (conversion: UnitConversion) => void;
		onclose?: () => void;
	}

	let {
		ingredientId,
		ingredientName,
		inputUnit: originalInputUnit,
		outputUnit: originalOutputUnit,
		unitLabels,
		onSave,
		onclose
	}: Props = $props();

	const outputIsSmaller = $derived(isSmallerUnit(originalOutputUnit, originalInputUnit));
	const smallerUnit = $derived(outputIsSmaller === true ? originalOutputUnit : originalInputUnit);
	const largerUnit = $derived(outputIsSmaller === true ? originalInputUnit : originalOutputUnit);

	let leftAmount = $state(1);
	let rightAmount = $state(1);
	let error = $state('');

	const getUnitLabel = (unitId: string): string => getCompactUnitLabel(unitId, unitLabels);

	const handleSave = () => {
		const factor = conversionFactorFromDisplayAmounts(leftAmount, rightAmount);
		if (factor === null) {
			error = m.conversionFactorMustBePositive();
			return;
		}
		if (!isFinite(factor)) {
			error = m.conversionFactorMustBeValidNumber();
			return;
		}

		const conversion = buildUnitConversionFromDisplayAmounts(
			ingredientId,
			smallerUnit,
			largerUnit,
			leftAmount,
			rightAmount
		);
		if (!conversion) {
			error = m.conversionFactorMustBePositive();
			return;
		}

		onSave(conversion);
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSave();
		} else if (e.key === 'Escape') {
			onclose?.();
		}
	};
</script>

<div class="conversion-modal">
	<h3>{m.addUnitConversionTitle()}</h3>
	<p class="question">
		{m.addUnitConversionQuestion({
			smaller: getUnitLabel(smallerUnit),
			largerAmount: rightAmount,
			larger: getUnitLabel(largerUnit),
			ingredient: ingredientName
		})}
	</p>
	<div class="conversion-editor">
		<div class="conversion-part">
			<TextInput
				bind:value={leftAmount}
				min={0.001}
				step={0.001}
				size="small"
				variant="inline"
				autofocus={true}
				onkeydown={handleKeydown}
			/>
			<span class="unit-label">{getUnitLabel(smallerUnit)}</span>
			<span class="of-text">{m.conversionOfEquals({ name: ingredientName })}</span>
		</div>
		<div class="conversion-part">
			<TextInput
				bind:value={rightAmount}
				min={0.001}
				step={0.001}
				size="small"
				variant="inline"
				onkeydown={handleKeydown}
			/>
			<span class="unit-label">{getUnitLabel(largerUnit)}</span>
		</div>
	</div>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<p class="hint">
		{m.conversionFactorHint({
			leftAmount,
			rightAmount,
			smaller: getUnitLabel(smallerUnit),
			larger: getUnitLabel(largerUnit)
		})}
	</p>
	<div class="actions">
		<ModernButton variant="secondary" onclick={() => onclose?.()}>{m.cancel()}</ModernButton>
		<ModernButton variant="primary" onclick={handleSave}>{m.save()}</ModernButton>
	</div>
</div>

<style>
	.conversion-modal {
		width: 400px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		color: var(--foreground);
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 24px;
	}

	.conversion-modal h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.question {
		margin: 0;
		color: var(--secondary-foreground);
		line-height: 1.5;
		font-size: 0.9375rem;
	}

	.conversion-editor {
		display: flex;
		gap: 12px;
	}

	.conversion-part {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.conversion-part :global(.input-container) {
		width: 4.5rem;
		flex: none;
	}

	.unit-label {
		font-size: 13px;
		color: var(--foreground);
		font-weight: 500;
	}

	.of-text {
		color: var(--secondary-foreground);
		font-size: 13px;
		white-space: nowrap;
	}

	.error {
		margin: 0;
		font-size: 0.875rem;
		color: var(--destructive, #ef4444);
	}

	.hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--secondary-foreground);
		font-style: italic;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}
</style>

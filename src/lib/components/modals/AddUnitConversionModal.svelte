<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import { isSmallerUnit } from '$lib/utils/unit';
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

	// Determine which unit is smaller for display purposes
	const outputIsSmaller = isSmallerUnit(originalOutputUnit, originalInputUnit);

	// Determine display order: smaller unit first if we can determine sizes
	const smallerUnit = $derived(outputIsSmaller === true ? originalOutputUnit : originalInputUnit);
	const largerUnit = $derived(outputIsSmaller === true ? originalInputUnit : originalOutputUnit);

	let conversionFactor = $state<number>(1);
	let error = $state<string>('');

	const handleSave = () => {
		if (conversionFactor <= 0) {
			error = m.conversionFactorMustBePositive();
			return;
		}
		if (!isFinite(conversionFactor)) {
			error = m.conversionFactorMustBeValidNumber();
			return;
		}

		// Store normalized: smaller unit first
		// If outputIsSmaller is true, we're displaying smaller → larger, so store it that way
		// The factor represents: 1 largerUnit = factor smallerUnit
		// So: smallerUnit × factor = largerUnit, meaning inputUnit × factor = outputUnit
		const finalInputUnit = smallerUnit;
		const finalOutputUnit = largerUnit;
		const finalFactor = conversionFactor;

		const conversion: UnitConversion = {
			ingredientId,
			inputUnit: finalInputUnit,
			outputUnit: finalOutputUnit,
			conversionFactor: finalFactor
		};

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
	<p class="description">
		{m.addUnitConversionQuestion({
			smaller: unitLabels[smallerUnit] || smallerUnit,
			larger: unitLabels[largerUnit] || largerUnit,
			ingredient: ingredientName
		})}
	</p>
	<div class="input-group">
		<TextInput
			bind:value={conversionFactor}
			min={0.0001}
			step={0.0001}
			label={m.conversionFactorLabel()}
			size="medium"
			autofocus={true}
			onkeydown={handleKeydown}
			{error}
		/>
		<p class="hint">
			{m.conversionFactorHint({
				larger: unitLabels[largerUnit] || largerUnit,
				factor: conversionFactor,
				smaller: unitLabels[smallerUnit] || smallerUnit
			})}
		</p>
	</div>
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

	.description {
		margin: 0;
		color: var(--secondary-foreground);
		line-height: 1.5;
	}

	.description strong {
		color: var(--foreground);
		font-weight: 600;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
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

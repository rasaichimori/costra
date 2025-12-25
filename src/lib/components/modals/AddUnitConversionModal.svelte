<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import { isSmallerUnit } from '$lib/utils/unit';

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

	// If outputUnit is smaller, we need to invert the factor for display
	// (because we're asking "how many smaller in one larger")
	const needsInvertedFactor = $derived(outputIsSmaller === true);

	let conversionFactor = $state<number>(1);
	let error = $state<string>('');

	const handleSave = () => {
		if (conversionFactor <= 0) {
			error = 'Conversion factor must be greater than 0';
			return;
		}
		if (!isFinite(conversionFactor)) {
			error = 'Conversion factor must be a valid number';
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
	<h3>Add Unit Conversion</h3>
	<p class="description">
		How many <strong>{unitLabels[smallerUnit] || smallerUnit}</strong> is in one{' '}
		<strong>{unitLabels[largerUnit] || largerUnit}</strong> for <strong>{ingredientName}</strong>?
	</p>
	<div class="input-group">
		<TextInput
			bind:value={conversionFactor}
			min={0.0001}
			step={0.0001}
			label="Conversion Factor"
			size="medium"
			autofocus={true}
			onkeydown={handleKeydown}
			{error}
		/>
		<p class="hint">
			1 {unitLabels[largerUnit] || largerUnit} = {conversionFactor}{' '}
			{unitLabels[smallerUnit] || smallerUnit}
		</p>
	</div>
	<div class="actions">
		<ModernButton variant="secondary" onclick={() => onclose?.()}>Cancel</ModernButton>
		<ModernButton variant="primary" onclick={handleSave}>Save</ModernButton>
	</div>
</div>

<style>
	.conversion-modal {
		width: 400px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		color: var(--text-primary);
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		padding: 24px;
	}

	.conversion-modal h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.description {
		margin: 0;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.description strong {
		color: var(--text-primary);
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
		color: var(--text-secondary);
		font-style: italic;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}
</style>

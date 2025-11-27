<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';

	interface Props {
		ingredientId: string;
		ingredientName: string;
		missingConversions: {
			inputUnit: string;
			outputUnit: string;
		}[];
		unitLabels: Record<string, string>;
		onSave: (conversions: UnitConversion[]) => void;
		onclose?: () => void;
	}

	let { ingredientId, ingredientName, missingConversions, unitLabels, onSave, onclose }: Props =
		$props();

	// Initialize conversion factors for each missing conversion
	let conversionFactors = $state<number[]>(missingConversions.map(() => 1));
	let errors = $state<string[]>(missingConversions.map(() => ''));

	const validateAll = (): boolean => {
		let isValid = true;
		const newErrors = conversionFactors.map((factor, index) => {
			if (factor <= 0) {
				isValid = false;
				return 'Must be greater than 0';
			}
			if (!isFinite(factor)) {
				isValid = false;
				return 'Must be a valid number';
			}
			return '';
		});
		errors = newErrors;
		return isValid;
	};

	const handleSave = () => {
		if (!validateAll()) {
			return;
		}

		const conversions: UnitConversion[] = missingConversions.map((missing, index) => ({
			ingredientId,
			inputUnit: missing.inputUnit,
			outputUnit: missing.outputUnit,
			conversionFactor: conversionFactors[index]
		}));

		onSave(conversions);
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSave();
		} else if (e.key === 'Escape') {
			onclose?.();
		}
	};

	const getUnitLabel = (unitId: string): string => {
		return unitLabels[unitId] || unitId;
	};
</script>

<div class="conversion-modal" onkeydown={handleKeydown}>
	<h3>Add Unit Conversions</h3>
	<p class="description">
		The following conversions are needed for <strong>{ingredientName}</strong> to use the new unit:
	</p>

	<div class="conversions-list">
		{#each missingConversions as missing, index}
			<div class="conversion-row">
				<p class="conversion-question">
					How many <strong>{getUnitLabel(missing.inputUnit)}</strong> equals 1
					<strong>{getUnitLabel(missing.outputUnit)}</strong>?
				</p>
				<div class="input-row">
					<TextInput
						bind:value={conversionFactors[index]}
						min={0.0001}
						step={0.0001}
						size="small"
						variant="inline"
						autofocus={index === 0}
						error={errors[index]}
					/>
					<span class="hint">
						{getUnitLabel(missing.inputUnit)} × {conversionFactors[index]} = {getUnitLabel(
							missing.outputUnit
						)}
					</span>
				</div>
			</div>
		{/each}
	</div>

	<div class="actions">
		<ModernButton variant="secondary" onclick={() => onclose?.()}>Cancel</ModernButton>
		<ModernButton variant="primary" onclick={handleSave}>Save All</ModernButton>
	</div>
</div>

<style>
	.conversion-modal {
		width: 450px;
		max-height: 80vh;
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

	.conversions-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-height: 400px;
		overflow-y: auto;
	}

	.conversion-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		background: var(--bg-tertiary);
		border-radius: 6px;
		border: 1px solid var(--border-primary);
	}

	.conversion-question {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.conversion-question strong {
		color: var(--text-primary);
		font-weight: 600;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.hint {
		font-size: 0.8rem;
		color: var(--text-secondary);
		font-style: italic;
		white-space: nowrap;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}
</style>

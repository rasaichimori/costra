<script lang="ts">
	import type { UnitConversion } from '$lib/data/schema';
	import ConversionRow from './ConversionRow.svelte';

	let {
		ingredientId,
		ingredientName,
		color,
		conversions,
		customUnitLabels,
		getInputAmount,
		onInputAmountChange,
		onOutputAmountChange,
		onInputUnitChange,
		onOutputUnitChange,
		onDelete
	}: {
		ingredientId: string;
		ingredientName: string;
		color: string;
		conversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		getInputAmount: (index: number) => number;
		onInputAmountChange: (index: number, amount: number) => void;
		onOutputAmountChange: (index: number, amount: number) => void;
		onInputUnitChange: (index: number, unit: string) => void;
		onOutputUnitChange: (index: number, unit: string) => void;
		onDelete: (index: number) => void;
	} = $props();
</script>

<div class="ingredient-group">
	<div class="ingredient-header">
		<span class="color-dot" style="background-color: {color}"></span>
		<span class="ingredient-name">{ingredientName}</span>
		<span class="conversion-count">{conversions.length}</span>
	</div>
	<div class="conversions-list">
		{#each conversions as conversion, index}
			<ConversionRow
				{conversion}
				{ingredientName}
				inputAmount={getInputAmount(index)}
				{customUnitLabels}
				onInputAmountChange={(amount) => onInputAmountChange(index, amount)}
				onOutputAmountChange={(amount) => onOutputAmountChange(index, amount)}
				onInputUnitChange={(unit) => onInputUnitChange(index, unit)}
				onOutputUnitChange={(unit) => onOutputUnitChange(index, unit)}
				onDelete={() => onDelete(index)}
			/>
		{/each}
	</div>
</div>

<style>
	.ingredient-group {
		background: var(--bg-tertiary);
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		overflow: hidden;
	}

	.ingredient-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-secondary);
	}

	.color-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.ingredient-name {
		flex: 1;
		font-weight: 500;
		color: var(--text-primary);
		font-size: 14px;
	}

	.conversion-count {
		background: var(--accent-primary);
		color: white;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.conversions-list {
		display: flex;
		flex-direction: column;
	}
</style>


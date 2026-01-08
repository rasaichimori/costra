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
		background: var(--muted);
		border-radius: 8px;
		border: 1px solid var(--border);
		overflow: hidden;
	}

	.ingredient-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		background: var(--card);
		border-bottom: 1px solid var(--border);
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
		color: var(--foreground);
		font-size: 14px;
	}

	.conversion-count {
		background: var(--active);
		color: var(--secondary-foreground);
		font-size: 10px;
		font-weight: 500;
		padding: 2px 6px;
		border-radius: 8px;
		min-width: 16px;
		text-align: center;
	}

	.conversions-list {
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 768px) {
		.ingredient-header {
			padding: 10px 12px;
			gap: 8px;
		}

		.color-dot {
			width: 10px;
			height: 10px;
		}

		.ingredient-name {
			font-size: 13px;
		}
	}

	@media (max-width: 480px) {
		.ingredient-group {
			border-radius: 6px;
		}

		.ingredient-header {
			padding: 8px 10px;
		}

		.ingredient-name {
			font-size: 12px;
		}

		.conversion-count {
			font-size: 9px;
			padding: 1px 5px;
		}
	}
</style>

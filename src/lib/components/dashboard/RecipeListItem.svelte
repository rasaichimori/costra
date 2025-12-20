<script lang="ts">
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';

	interface Props {
		label: string;
		selected?: boolean;
		cost?: number;
		unit?: string;
		onclick?: () => void;
	}

	let { label, selected = false, cost, unit, onclick }: Props = $props();
	const currencyContext = getCurrencyContext();
</script>

<button class="recipe-list-item {selected ? 'selected' : ''}" {onclick}>
	<span class="label">{label}</span>
	{#if cost !== undefined}
		<span class="cost">{currencyContext.currency}{cost.toFixed(0)}</span>
	{/if}
	{#if unit !== undefined}
		{' / '}
		<span class="unit">{unit}</span>
	{/if}
</button>

<style>
	.recipe-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.6rem 0.9rem;
		font-size: 0.85rem;
		background: transparent;
		color: var(--text-primary);
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.recipe-list-item:hover {
		background: var(--bg-hover);
	}

	.recipe-list-item.selected {
		background: var(--bg-active);
		border-color: var(--border-secondary);
		color: var(--text-primary);
	}

	.label {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
	}

	.cost {
		font-weight: 600;
		margin-left: 0.5rem;
	}
</style>

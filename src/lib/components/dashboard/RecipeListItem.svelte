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
		color: var(--secondary-foreground);
		border: 1px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.recipe-list-item:hover {
		background: var(--hover);
		color: var(--foreground);
	}

	.recipe-list-item.selected {
		background: var(--card);
		border-color: var(--primary);
		color: var(--foreground);
		box-shadow: var(--shadow-light);
	}

	.recipe-list-item.selected::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 60%;
		background: var(--primary);
		border-radius: 0 2px 2px 0;
	}

	.label {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		font-weight: 450;
		letter-spacing: -0.01em;
	}

	.cost {
		font-weight: 600;
		margin-left: 0.5rem;
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 900px) {
		.recipe-list-item {
			width: auto;
			flex-shrink: 0;
		}
	}

	@media (max-width: 480px) {
		.recipe-list-item {
			padding: 0.5rem 0.75rem;
			font-size: 0.8rem;
		}

		.cost {
			margin-left: 0.4rem;
		}
	}
</style>

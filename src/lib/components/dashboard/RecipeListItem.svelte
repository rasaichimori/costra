<script lang="ts">
	interface Props {
		label: string;
		selected?: boolean;
		cost?: number;
		onclick?: () => void;
	}

	let { label, selected = false, cost, onclick }: Props = $props();
</script>

<button class="recipe-list-item {selected ? 'selected' : ''}" {onclick}>
	<span class="label">{label}</span>
	{#if cost !== undefined}
		<span class="cost">¥{cost.toFixed(0)}</span>
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

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
		color: #333333;
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.recipe-list-item:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.recipe-list-item.selected {
		background: rgba(0, 0, 0, 0.1);
		border-color: rgba(0, 0, 0, 0.2);
		color: #000000;
	}

	.label {
		flex: 1;
		text-align: left;
	}

	.cost {
		font-weight: 600;
		margin-left: 0.5rem;
	}
</style>

<script lang="ts">
	interface Props {
		label?: string;
		onclick?: () => void;
	}

	let { label = '＋ Add Recipe', onclick }: Props = $props();
</script>

<button class="add-recipe-btn" {onclick}>
	{label}
</button>

<style>
	.add-recipe-btn {
		display: block;
		width: 100%;
		padding: 0.6rem 0.9rem;
		font-size: 0.85rem;
		background: rgba(0, 0, 0, 0.05);
		border: 1px dashed rgba(0, 0, 0, 0.3);
		border-radius: 6px;
		color: #333333;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.25s ease;
	}

	.add-recipe-btn:hover {
		background: rgba(0, 0, 0, 0.08);
	}
</style>

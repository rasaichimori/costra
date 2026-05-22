<script lang="ts">
	interface Props {
		onclick?: () => void;
		children?: import('svelte').Snippet;
	}

	let { onclick, children }: Props = $props();
</script>

<button class="sidebar-add-btn" {onclick}>
	{@render children?.()}
</button>

<style>
	.sidebar-add-btn {
		display: block;
		width: 100%;
		padding: 0.6rem 0.9rem;
		font-size: 0.85rem;
		background: var(--secondary, #f5f5f5);
		border: 1px solid transparent;
		border-radius: 8px;
		color: var(--secondary-foreground, #333);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		letter-spacing: -0.01em;
	}

	.sidebar-add-btn:hover {
		background: var(--hover, #eee);
		border-color: var(--border, #ddd);
		color: var(--foreground, #000);
	}

	@media (max-width: 900px) {
		.sidebar-add-btn {
			width: auto;
			flex-shrink: 0;
		}
	}

	@media (max-width: 480px) {
		.sidebar-add-btn {
			padding: 0.5rem 0.75rem;
			font-size: 0.8rem;
		}
	}
</style>

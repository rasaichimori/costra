<script lang="ts">
	interface Props {
		message: string;
		duration?: number;
	}

	let { message, duration = 2000 }: Props = $props();

	let visible = $state(true);

	setTimeout(() => (visible = false), duration);
</script>

{#if visible}
	<div class="toast">{message}</div>
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border-primary);
		padding: 8px 16px;
		border-radius: 6px;
		box-shadow: 0 2px 6px var(--shadow-medium);
		z-index: 9999;
		animation: fade 0.3s ease;
	}

	@keyframes fade {
		from {
			opacity: 0;
			transform: translate(-50%, 10px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
</style>

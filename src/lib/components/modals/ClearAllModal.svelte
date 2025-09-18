<script lang="ts">
	import ModernButton from '../common/ModernButton.svelte';

	let { onConfirm = () => {}, onclose = () => {} } = $props();

	const handleConfirm = () => {
		onConfirm();
		onclose(true);
	};
</script>

<div class="clear-all-modal">
	<h3>Clear All Data</h3>
	<p>This will permanently delete all ingredients and recipes. This action cannot be undone.</p>
	<p class="warning">Are you sure you want to proceed?</p>

	<div class="actions">
		<ModernButton variant="danger" onclick={handleConfirm}>Clear All</ModernButton>
		<ModernButton variant="secondary" onclick={() => onclose(false)}>Cancel</ModernButton>
	</div>
</div>

<style>
	.clear-all-modal {
		background: rgba(255, 255, 255, 0.9);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		gap: 16px;
		width: 400px;
		display: flex;
		flex-direction: column;
	}

	h3 {
		margin: 0;
		color: black;
		font-weight: 500;
	}

	p {
		margin: 0;
		color: black;
		line-height: 1.4;
	}

	.warning {
		font-weight: 500;
		color: #d32f2f;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}
</style>

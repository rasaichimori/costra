<script lang="ts">
	let {
		isOpen = false,
		onClose
	}: {
		isOpen: boolean;
		onClose: () => void;
	} = $props();

	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onClose();
		}
	};
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div class="modal-content">
			<button class="close-button" onclick={onClose}>
				<i class="fa-solid fa-times"></i>
			</button>
			<slot />
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		min-width: 400px;
		max-width: 500px;
		max-height: 80vh;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(0, 0, 0, 0.1);
		animation: modalSlideIn 0.2s ease-out;
		position: relative;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.close-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		cursor: pointer;
		color: rgba(0, 0, 0, 0.6);
		font-size: 1rem;
		padding: 4px;
		border-radius: 4px;
		transition: all 0.2s ease;
		z-index: 1;
	}

	.close-button:hover {
		background: rgba(0, 0, 0, 0.1);
		color: rgba(0, 0, 0, 0.8);
	}

	@media (max-width: 480px) {
		.modal-content {
			min-width: 90vw;
			margin: 1rem;
		}
	}
</style>
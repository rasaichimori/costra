<script lang="ts">
	import Modal from './Modal.svelte';
	import ModernButton from './ModernButton.svelte';

	let {
		isOpen = false,
		title = 'Confirm Action',
		component = null,
		props = {},
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		onConfirm,
		onCancel,
		variant = 'danger'
	}: {
		isOpen: boolean;
		title?: string;
		component?: any;
		props?: any;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel: () => void;
		variant?: 'danger' | 'primary' | 'secondary';
	} = $props();
</script>

<Modal {isOpen} onClose={onCancel}>
	<div class="modal-header">
		<h3>{title}</h3>
	</div>
	<div class="modal-body">
		{#if component}
			{@const Component = component}
			<Component {...props} />
		{/if}
	</div>
	<div class="modal-footer">
		<ModernButton variant="secondary" onclick={onCancel}>
			{cancelText}
		</ModernButton>
		<ModernButton {variant} onclick={onConfirm}>
			{confirmText}
		</ModernButton>
	</div>
</Modal>

<style>
	.modal-header {
		padding: 1.5rem 1.5rem 0;
	}

	.modal-header h3 {
		margin: 0;
		color: #333333;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.modal-body {
		padding: 1.5rem;
		color: #333333;
		line-height: 1.5;
	}

	.modal-body :global(ul) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.modal-body :global(li) {
		margin: 0.5rem 0;
	}

	.modal-body :global(strong) {
		color: #222;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 0 1.5rem 1.5rem;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		margin-top: 1rem;
		padding-top: 1rem;
	}

	@media (max-width: 480px) {
		.modal-footer {
			flex-direction: column-reverse;
		}

		.modal-footer :global(button) {
			width: 100%;
		}
	}
</style>
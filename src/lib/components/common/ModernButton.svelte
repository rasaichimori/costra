<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'icon' | 'danger';
		size?: 'small' | 'medium' | 'large';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		ariaLabel?: string;
		title?: string;
		style?: string;
		children?: any;
	}

	let {
		variant = 'primary',
		size = 'medium',
		disabled = false,
		type = 'button',
		onclick,
		ariaLabel,
		title,
		style,
		children
	}: Props = $props();
</script>

<button
	class="btn btn-{variant} btn-{size}"
	{type}
	{disabled}
	{onclick}
	aria-label={ariaLabel}
	{title}
	{style}
>
	{@render children?.()}
</button>

<style>
	.btn {
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-family: inherit;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		text-transform: none;
		line-height: 1;
		letter-spacing: -0.01em;
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none !important;
	}

	/* Variants */
	.btn-primary {
		background: var(--foreground);
		border: 1px solid var(--foreground);
		color: var(--background);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--secondary-foreground);
		border-color: var(--secondary-foreground);
		transform: translateY(-1px);
		box-shadow: var(--shadow-medium);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(0);
	}

	.btn-secondary {
		background: var(--muted);
		border: 1px solid var(--border);
		color: var(--foreground);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--secondary);
		border-color: var(--border);
		transform: translateY(-1px);
		box-shadow: var(--shadow-light);
	}

	.btn-secondary:active:not(:disabled) {
		transform: translateY(0);
	}

	.btn-icon {
		background: var(--muted);
		border: 1px solid transparent;
		color: var(--secondary-foreground);
		min-width: 24px;
		height: 24px;
		padding: 4px 6px;
		border-radius: 6px;
	}

	.btn-icon:hover:not(:disabled) {
		background: var(--secondary);
		border-color: var(--border);
		color: var(--foreground);
	}

	.btn-icon:active:not(:disabled) {
		background: var(--active);
	}

	/* Delete/trash icon buttons - more subtle */
	.btn-icon:has(.fa-trash) {
		background: transparent;
		border-color: transparent;
		color: var(--muted-foreground);
	}

	.btn-icon:has(.fa-trash):hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.1);
		border-color: transparent;
		color: var(--destructive);
	}

	.btn-danger {
		background: var(--destructive);
		border: 1px solid transparent;
		color: var(--destructive-foreground);
	}

	.btn-danger:hover:not(:disabled) {
		background: var(--destructive);
		opacity: 0.9;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
		transform: translateY(-1px);
	}

	.btn-danger:active:not(:disabled) {
		transform: translateY(0);
	}

	/* Sizes */
	.btn-small {
		padding: 6px 10px;
		font-size: 0.75rem;
	}

	.btn-medium {
		padding: 8px 16px;
		font-size: 0.875rem;
	}

	.btn-large {
		padding: 12px 24px;
		font-size: 1rem;
	}

	/* Icon size adjustments */
	.btn-icon.btn-small {
		min-width: 24px;
		height: 24px;
		padding: 4px;
		font-size: 0.75rem;
	}

	.btn-icon.btn-medium {
		min-width: 28px;
		height: 28px;
		padding: 6px;
		font-size: 0.8rem;
	}

	.btn-icon.btn-large {
		min-width: 36px;
		height: 36px;
		padding: 8px;
		font-size: 0.9rem;
	}
</style>

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
		border-radius: 6px;
		cursor: pointer;
		font-family: inherit;
		font-weight: 400;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
		text-transform: none;
		line-height: 1;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
	}

	/* Variants */
	.btn-primary {
		background: var(--bg-active);
		border: 1px solid var(--border-tertiary);
		color: var(--text-primary);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--bg-hover);
		border-color: var(--border-dashed);
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-tertiary);
		color: var(--text-primary);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--bg-quaternary);
		border-color: var(--border-dashed);
		transform: translateY(-1px);
	}

	.btn-icon {
		background: var(--bg-hover);
		border: 1px solid var(--border-secondary);
		color: var(--text-secondary);
		min-width: 24px;
		height: 24px;
		padding: 4px 6px;
	}

	.btn-icon:hover:not(:disabled) {
		background: var(--bg-active);
		border-color: var(--border-tertiary);
		color: var(--text-primary);
		transform: scale(1.05);
	}

	.btn-danger {
		background: var(--danger-bg);
		border: 1px solid var(--danger-bg);
		color: var(--text-on-dark);
	}

	.btn-danger:hover:not(:disabled) {
		background: var(--danger-bg-hover);
		border-color: var(--danger-bg-hover);
		transform: scale(1.05);
	}

	/* Sizes */
	.btn-small {
		padding: 4px 8px;
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
		min-width: 20px;
		height: 20px;
		padding: 2px 4px;
		font-size: 0.7rem;
	}

	.btn-icon.btn-medium {
		min-width: 24px;
		height: 24px;
		padding: 4px 6px;
		font-size: 0.75rem;
	}

	.btn-icon.btn-large {
		min-width: 32px;
		height: 32px;
		padding: 6px 8px;
		font-size: 0.875rem;
	}
</style>

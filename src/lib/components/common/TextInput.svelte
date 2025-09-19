<script lang="ts" generics="T extends string | number">
	interface Props<T> {
		value?: T;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		min?: number;
		max?: number;
		step?: number;
		size?: 'small' | 'medium' | 'large';
		variant?: 'default' | 'inline';
		label?: string;
		error?: string;
		required?: boolean;
		ariaLabel?: string;
		spinner?: boolean;
		onchange?: (value: T) => void;
		oninput?: (value: T) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
	}

	let {
		value = $bindable(),
		placeholder,
		disabled = false,
		readonly = false,
		min,
		max,
		step,
		size = 'medium',
		variant = 'default',
		label,
		error,
		required = false,
		ariaLabel,
		spinner = false,
		onchange,
		oninput,
		onkeydown,
		onfocus,
		onblur
	}: Props<T> = $props();

	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const newValue = typeof value === 'number' ? parseFloat(target.value) || 0 : target.value;
		value = newValue as T;
		oninput?.(newValue as T);
	};

	const handleChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const newValue = typeof value === 'number' ? parseFloat(target.value) || 0 : target.value;
		onchange?.(newValue as T);
	};
</script>

<div class="input-container input-{variant} input-{size}">
	{#if label}
		<label class="input-label" for={ariaLabel}>
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}

	<input
		class="input"
		class:error={!!error}
		class:no-spinner={!spinner}
		type={typeof value === 'number' ? 'number' : 'text'}
		{value}
		{placeholder}
		{disabled}
		{readonly}
		{min}
		{max}
		{step}
		{required}
		aria-label={ariaLabel || label}
		oninput={handleInput}
		onchange={handleChange}
		{onkeydown}
		{onfocus}
		{onblur}
	/>

	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.input-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
	}

	.input-inline {
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	.input-inline .input-label {
		margin: 0;
		white-space: nowrap;
	}

	.input-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.required {
		color: var(--danger);
		margin-left: 2px;
	}

	.input {
		border: 1px solid var(--border-secondary);
		border-radius: 4px;
		font-family: inherit;
		font-weight: 400;
		background: var(--bg-secondary);
		color: var(--text-primary);
		transition: all 0.2s ease;
		outline: none;
		width: 100%;
	}

	.input:focus {
		border-color: var(--border-primary);
		background: var(--bg-primary);
		box-shadow: var(--shadow-light);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--bg-tertiary);
	}

	.input:readonly {
		background: var(--bg-tertiary);
		cursor: default;
	}

	.input.error {
		border-color: var(--danger);
		background: var(--danger-bg-light);
	}

	.input.error:focus {
		border-color: var(--danger);
		box-shadow: var(--danger-shadow);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--danger);
		margin-top: 2px;
	}

	/* Sizes */
	.input-small .input {
		padding: 4px 8px;
		font-size: 0.75rem;
	}

	.input-medium .input {
		padding: 8px 12px;
		font-size: 0.875rem;
	}

	.input-large .input {
		padding: 12px 16px;
		font-size: 1rem;
	}

	/* Hide native number input spinners when spinner prop is false */
	.input.no-spinner::-webkit-outer-spin-button,
	.input.no-spinner::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.input.no-spinner[type='number'] {
		-moz-appearance: textfield;
	}
</style>

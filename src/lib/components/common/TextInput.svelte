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
		color: #333333;
		margin-bottom: 2px;
	}

	.required {
		color: #ef4444;
		margin-left: 2px;
	}

	.input {
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		font-family: inherit;
		font-weight: 400;
		background: rgba(255, 255, 255, 0.9);
		color: #333333;
		transition: all 0.2s ease;
		outline: none;
		width: 100%;
	}

	.input:focus {
		border-color: rgba(0, 0, 0, 0.4);
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: rgba(0, 0, 0, 0.02);
	}

	.input:readonly {
		background: rgba(0, 0, 0, 0.02);
		cursor: default;
	}

	.input.error {
		border-color: #ef4444;
		background: rgba(255, 0, 0, 0.02);
	}

	.input.error:focus {
		border-color: #ef4444;
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		font-size: 0.75rem;
		color: #ef4444;
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

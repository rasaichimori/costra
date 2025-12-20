<script lang="ts" generics="T extends string | number">
	import { onMount } from 'svelte';
	import { parseFraction } from '$lib/utils/math';
	import { clamp } from '$lib/utils/math';
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
		autofocus?: boolean;
		clearable?: boolean;
		style?: string;
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
		autofocus = false,
		clearable = false,
		style,
		onchange,
		oninput,
		onkeydown,
		onfocus,
		onblur
	}: Props<T> = $props();

	let inputRef: HTMLInputElement;
	let displayValue = $state<string>('');

	const isNumeric = $derived(typeof value === 'number');
	const hasText = $derived(
		(typeof value === 'string' && (value as string).length > 0) ||
			(isNumeric && displayValue.length > 0)
	);

	const isIncompleteDecimal = (inputStr: string): boolean => {
		const trimmed = inputStr.trim();
		// Check if it ends with a decimal point (e.g., "0.", "123.")
		return trimmed.endsWith('.') && /^-?\d+\.$/.test(trimmed);
	};

	const clearValue = () => {
		if (typeof value === 'string') {
			value = '' as T;
			// notify handlers
			oninput?.('' as T);
			onchange?.('' as T);
			inputRef?.focus();
		} else if (isNumeric) {
			displayValue = '';
			value = 0 as T;
			oninput?.(0 as T);
			onchange?.(0 as T);
			inputRef?.focus();
		}
	};

	onMount(() => {
		if (autofocus && inputRef) {
			inputRef.focus();
		}
		// Initialize displayValue from value prop
		if (isNumeric) {
			displayValue = (value as number).toString();
		}
	});

	const parseAndValidate = (inputStr: string): number => {
		const parsed = parseFraction(inputStr);
		let validated = parsed;
		if (min !== undefined) {
			validated = Math.max(validated, min);
		}
		if (max !== undefined) {
			validated = Math.min(validated, max);
		}
		return validated;
	};

	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (isNumeric) {
			// For numeric inputs, keep the raw string for display
			displayValue = target.value;
			// If it's an incomplete decimal (ends with "."), don't parse yet
			if (isIncompleteDecimal(target.value)) {
				// Keep the previous numeric value, just update display
				oninput?.(value as T);
			} else {
				// Parse and update the numeric value
				const parsed = parseAndValidate(target.value);
				value = parsed as T;
				oninput?.(parsed as T);
			}
		} else {
			value = target.value as T;
			oninput?.(target.value as T);
		}
	};

	const handleChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (isNumeric) {
			// Parse, validate, and update both display and value
			const parsed = parseAndValidate(target.value);
			displayValue = parsed.toString();
			value = parsed as T;
			onchange?.(parsed as T);
		} else {
			value = target.value as T;
			onchange?.(target.value as T);
		}
	};

	const handleBlur = (e: FocusEvent) => {
		if (isNumeric) {
			// On blur, ensure display value matches the parsed numeric value
			const parsed = parseAndValidate(displayValue);
			displayValue = parsed.toString();
			value = parsed as T;
		}
		onblur?.(e);
	};

	const inputValue = $derived(isNumeric ? displayValue : (value as string));
</script>

<div class="input-container input-{variant} input-{size}" {style}>
	{#if label}
		<label class="input-label" for={ariaLabel}>
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}

	<input
		bind:this={inputRef}
		class="input"
		class:error={!!error}
		class:no-spinner={!spinner}
		type="text"
		value={inputValue}
		{placeholder}
		{disabled}
		{readonly}
		{required}
		aria-label={ariaLabel || label}
		oninput={handleInput}
		onchange={handleChange}
		onblur={handleBlur}
		{onkeydown}
		{onfocus}
	/>

	{#if clearable && hasText}
		<button type="button" class="clear-btn" onclick={clearValue} aria-label="Clear">×</button>
	{/if}

	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.input-container {
		position: relative;
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

	.clear-btn {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		padding: 0;
	}

	.clear-btn:hover {
		color: var(--text-primary);
	}
</style>

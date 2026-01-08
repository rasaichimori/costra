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
		icon?: string;
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
		icon,
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

	// Sync displayValue with value prop changes (important for undo/redo)
	$effect(() => {
		if (isNumeric && typeof value === 'number') {
			// Only update if the input is not focused (user is not actively typing)
			// and the displayValue doesn't match the current value
			const isFocused = inputRef === document.activeElement;
			const expectedDisplay = value.toString();
			const currentDisplayMatches =
				displayValue === expectedDisplay || isIncompleteDecimal(displayValue);

			if (!isFocused && !currentDisplayMatches) {
				displayValue = expectedDisplay;
			}
		}
	});

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

	<div class="input-wrapper" class:has-icon={!!icon}>
		{#if icon}
			<i class="{icon} input-icon"></i>
		{/if}
		<input
			bind:this={inputRef}
			class="input"
			class:error={!!error}
			class:no-spinner={!spinner}
			class:has-icon={!!icon}
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
	</div>

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
		color: var(--foreground);
	}

	.required {
		color: var(--destructive);
		margin-left: 2px;
	}

	.input-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 12px;
		color: var(--secondary-foreground);
		font-size: 14px;
		pointer-events: none;
	}

	.input-wrapper.has-icon .input {
		padding-left: 36px;
	}

	.input {
		border: 1px solid var(--border);
		border-radius: 8px;
		font-family: inherit;
		font-weight: 400;
		background: var(--card);
		color: var(--foreground);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
		width: 100%;
	}

	.input:focus {
		border-color: var(--ring);
		background: var(--card);
		box-shadow: 0 0 0 3px var(--accent);
	}

	.input:hover:not(:focus):not(:disabled) {
		border-color: var(--border);
	}

	.input:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		background: var(--secondary);
	}

	.input:readonly {
		background: var(--muted);
		cursor: default;
	}

	.input.error {
		border-color: var(--destructive);
		background: rgba(239, 68, 68, 0.05);
	}

	.input.error:focus {
		border-color: var(--destructive);
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--destructive);
		margin-top: 2px;
	}

	/* Sizes */
	.input-small .input {
		padding: 4px 8px;
		font-size: 0.75rem;
	}

	.input-small .input-wrapper.has-icon .input {
		padding-left: 28px;
	}

	.input-small .input-icon {
		left: 8px;
		font-size: 12px;
	}

	.input-medium .input {
		padding: 8px 12px;
		font-size: 0.875rem;
	}

	.input-medium .input-wrapper.has-icon .input {
		padding-left: 36px;
	}

	.input-large .input {
		padding: 12px 16px;
		font-size: 1rem;
	}

	.input-large .input-wrapper.has-icon .input {
		padding-left: 44px;
	}

	.input-large .input-icon {
		left: 16px;
		font-size: 16px;
	}

	.clear-btn {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: var(--hover);
		border: none;
		color: var(--muted-foreground);
		cursor: pointer;
		font-size: 12px;
		line-height: 1;
		padding: 2px 6px;
		border-radius: 4px;
		transition: all 0.15s ease;
	}

	.clear-btn:hover {
		color: var(--foreground);
		background: var(--active);
	}
</style>

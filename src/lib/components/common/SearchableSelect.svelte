<script lang="ts">
	interface Props {
		value?: string;
		options: string[];
		placeholder?: string;
		size?: 'small' | 'medium' | 'large';
		disabled?: boolean;
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(),
		options = [],
		placeholder = 'Select or type...',
		size = 'medium',
		disabled = false,
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let searchTerm = $state('');
	let inputRef: HTMLInputElement;

	// Filter options based on search term
	const filteredOptions = $derived(
		searchTerm
			? options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
			: options
	);

	const selectOption = (option: string) => {
		value = option;
		searchTerm = '';
		isOpen = false;
		onchange?.(option);
	};

	const handleInputFocus = () => {
		isOpen = true;
		searchTerm = value || '';
	};

	// Show placeholder only when there's no value and not focused
	const showPlaceholder = $derived(!value && !isOpen);

	const handleInputBlur = (e: FocusEvent) => {
		// Don't close if clicking on an option
		const relatedTarget = e.relatedTarget as HTMLElement;
		if (relatedTarget?.closest('.dropdown-options')) {
			return;
		}

		setTimeout(() => {
			isOpen = false;
			searchTerm = '';
		}, 150);
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			isOpen = false;
			searchTerm = '';
			inputRef?.blur();
		}
	};
</script>

<div class="searchable-select searchable-select-{size}">
	<input
		bind:this={inputRef}
		bind:value={searchTerm}
		class="select-input"
		placeholder={showPlaceholder ? placeholder : ''}
		{disabled}
		onfocus={handleInputFocus}
		onblur={handleInputBlur}
		onkeydown={handleKeydown}
	/>

	{#if !isOpen && value && !searchTerm}
		<div class="selected-value">{value}</div>
	{/if}

	<div class="dropdown-icon">
		<i class="fa-solid fa-chevron-down" class:rotated={isOpen}></i>
	</div>

	{#if isOpen}
		<div class="dropdown-options">
			{#if !options.includes(searchTerm)}
				<button
					class="option add-new-option"
					onclick={() => selectOption(searchTerm)}
					tabindex="-1"
				>
					<i class="fa-solid fa-plus"></i>
					"{searchTerm}"
				</button>
			{/if}

			{#each filteredOptions as option}
				<button class="option" onclick={() => selectOption(option)} tabindex="-1">
					{option}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.searchable-select {
		position: relative;
		width: 100%;
	}

	.select-input {
		width: 100%;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.9);
		color: #333333;
		font-family: inherit;
		font-weight: 400;
		outline: none;
		transition: all 0.2s ease;
		padding-right: 30px;
	}

	.select-input:focus {
		border-color: rgba(0, 0, 0, 0.4);
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
	}

	.select-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: rgba(0, 0, 0, 0.02);
	}

	.selected-value {
		position: absolute;
		left: 0;
		top: 0;
		right: 30px;
		bottom: 0;
		display: flex;
		align-items: center;
		pointer-events: none;
		color: #333333;
		font-weight: 400;
	}

	.dropdown-icon {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		color: #666666;
		pointer-events: none;
		font-size: 0.75rem;
		transition: transform 0.2s ease;
	}

	.dropdown-icon.rotated {
		transform: translateY(-50%) rotate(180deg);
	}

	.dropdown-options {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		border-top: none;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		max-height: 200px;
		overflow-y: auto;
		z-index: 1000;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.option {
		width: 100%;
		padding: 8px 12px;
		border: none;
		background: transparent;
		color: #333333;
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		transition: background-color 0.2s ease;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.option:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.add-new-option {
		background: rgba(0, 0, 0, 0.02);
		font-weight: 500;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.add-new-option:hover {
		background: rgba(0, 0, 0, 0.08);
	}

	.add-new-option i {
		font-size: 0.75rem;
		color: #666666;
	}

	.no-options {
		padding: 8px 12px;
		color: #666666;
		font-style: italic;
		text-align: center;
	}

	/* Sizes */
	.searchable-select-small .select-input,
	.searchable-select-small .selected-value {
		padding: 4px 8px;
		font-size: 0.75rem;
	}

	.searchable-select-medium .select-input,
	.searchable-select-medium .selected-value {
		padding: 8px 12px;
		font-size: 0.875rem;
	}

	.searchable-select-large .select-input,
	.searchable-select-large .selected-value {
		padding: 12px 16px;
		font-size: 1rem;
	}
</style>

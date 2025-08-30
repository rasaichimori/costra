<script lang="ts">
	import TextInput from './TextInput.svelte';
	import { onMount } from 'svelte';

	interface Props {
		value?: string;
		options: string[];
		placeholder?: string;
		size?: 'small' | 'medium' | 'large';
		disabled?: boolean;
		searchable?: boolean;
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(),
		options = [],
		placeholder = 'Select or type...',
		size = 'medium',
		disabled = false,
		searchable = true,
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let searchTerm = $state(searchable ? (value ?? '') : '');
	let containerElement: HTMLElement;
	let dropdownRect = $state<DOMRect | null>(null);

	// Filter options based on search term
	const filteredOptions = $derived(
		searchTerm !== ''
			? options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
			: options
	);

	const selectOption = (option: string) => {
		value = option;
		if (searchable) {
			searchTerm = value;
		}
		isOpen = false;
		onchange?.(option);
	};

	const updateDropdownPosition = () => {
		if (!containerElement) return;
		dropdownRect = containerElement.getBoundingClientRect();
	};

	const onfocus = () => {
		isOpen = true;
		if (searchable) {
			searchTerm = value || '';
		}
		updateDropdownPosition();
	};

	const onblur = (e: FocusEvent) => {
		// Don't close if clicking on an option
		const relatedTarget = e.relatedTarget as HTMLElement;
		if (relatedTarget?.closest('.dropdown-options')) {
			return;
		}

		isOpen = false;
		if (searchable && searchTerm !== '') {
			value = searchTerm;
		} else {
			searchTerm = value ?? '';
		}
	};

	const onkeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			isOpen = false;
			searchTerm = value ?? '';
		}
		if (e.key === 'Enter') {
			isOpen = false;
			selectOption(searchTerm);
		}
	};

	onMount(() => {
		const handleReposition = () => {
			if (isOpen) {
				updateDropdownPosition();
			}
		};

		window.addEventListener('scroll', handleReposition, true);
		window.addEventListener('resize', handleReposition);

		return () => {
			window.removeEventListener('scroll', handleReposition, true);
			window.removeEventListener('resize', handleReposition);
		};
	});
</script>

<div class="searchable-select searchable-select-{size}" bind:this={containerElement}>
	<div class="input-wrapper">
		{#if searchable}
			<TextInput
				bind:value={searchTerm}
				{size}
				variant="inline"
				placeholder={!searchTerm && !isOpen ? placeholder : ''}
				{disabled}
				{onfocus}
				{onblur}
				{onkeydown}
			/>
		{:else}
			<button onclick={() => (isOpen = true)} {onblur}>{value}</button>
		{/if}
	</div>
</div>

{#if isOpen && dropdownRect}
	<div
		class="dropdown-options"
		style:top="{dropdownRect.bottom}px"
		style:left="{dropdownRect.left}px"
		style:width="{dropdownRect.width}px"
	>
		{#if !options.includes(searchTerm) && searchTerm !== ''}
			<button class="option add-new-option" onclick={() => selectOption(searchTerm)} tabindex="-1">
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

<style>
	.searchable-select {
		position: relative;
		width: 100%;
	}

	.input-wrapper {
		position: relative;
		width: 100%;

		button {
			width: 100%;
			height: 25px;
			border: 1px solid rgba(0, 0, 0, 0.2);
			border-radius: 4px;
			font-family: inherit;
			font-weight: 400;
			background: rgba(255, 255, 255, 0.9);
			color: #333333;
			transition: all 0.2s ease;
			outline: none;
		}
	}

	.input-wrapper :global(.text-input) {
		padding-right: 30px;
	}

	.selected-value {
		position: absolute;
		left: 8px;
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
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		border-top: none;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		max-height: 200px;
		overflow-y: auto;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		pointer-events: auto;
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
</style>

<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import TextInput from './TextInput.svelte';
	import { onMount } from 'svelte';
	import Dropdown from './Dropdown.svelte';

	const { openOverlay, closeOverlay, updateOverlay } = getOverlayContext();

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

	let searchTerm = $state(searchable ? (value ?? '') : '');
	let containerElement: HTMLElement;
	let dropdownRect = $state<DOMRect | undefined>(undefined);
	let dropdownId = $state<string | undefined>(undefined);

	const selectOption = (option: string) => {
		value = option;
		if (searchable) {
			searchTerm = value;
		}
		closeDropdown();
		onchange?.(option);
	};

	const updateDropdownPosition = () => {
		if (!containerElement) return;
		dropdownRect = containerElement.getBoundingClientRect();
		// If overlay open, push new rect so it follows scroll/resize
		if (dropdownId) {
			updateOverlay(dropdownId, {}, { position: dropdownRect });
		}
	};

	const onfocus = () => {
		openDropdown();
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

		closeDropdown();
		if (searchable && searchTerm !== '') {
			value = searchTerm;
		} else {
			searchTerm = value ?? '';
		}
	};

	const onkeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeDropdown();
			searchTerm = value ?? '';
		}
		if (e.key === 'Enter') {
			closeDropdown();
			selectOption(searchTerm);
		}
	};

	const openDropdown = () =>
		(dropdownId = openOverlay(
			Dropdown,
			{
				options,
				searchTerm,
				selectOption
			},
			{ position: dropdownRect, clearBackground: true }
		));

	const updateDropdown = () => {
		console.log(dropdownRect);
		if (!dropdownId) return;
		updateOverlay(dropdownId, { options, searchTerm }, { position: dropdownRect });
	};

	const closeDropdown = () => {
		if (dropdownId) {
			closeOverlay(dropdownId);
			dropdownId = undefined;
		}
	};

	onMount(() => {
		const handleReposition = updateDropdownPosition;

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
				placeholder={!searchTerm && !dropdownId ? placeholder : ''}
				{disabled}
				{onfocus}
				{onblur}
				{onkeydown}
				oninput={updateDropdown}
			/>
		{:else}
			<button onclick={openDropdown} {onblur}>{value}</button>
		{/if}
	</div>
</div>

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
</style>

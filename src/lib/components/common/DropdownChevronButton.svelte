<script lang="ts" generics="T">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount } from 'svelte';
	import Dropdown from './Dropdown.svelte';
	import ModernButton from './ModernButton.svelte';

	const { openOverlay, closeOverlay, updateOverlay } = getOverlayContext();

	interface Props<T> {
		value?: T;
		options: { label: string; value: T }[];
		size?: 'small' | 'medium' | 'large';
		disabled?: boolean;
		searchable?: boolean;
		onchange?: (value: T) => void;
	}

	let {
		value = $bindable(),
		options = [],
		searchable = true,
		onchange,
		size = 'medium',
		disabled = false
	}: Props<T> = $props();

	const selectedOption = $derived(options.find((o) => o.value === value));

	let searchTerm = $state(searchable && value !== undefined ? (selectedOption?.label ?? '') : '');
	let containerElement: HTMLElement;
	let dropdownId = $state<string | undefined>(undefined);

	const selectOption = (option: { label: string; value: T }) => {
		if (!options.find((o) => o.value === option.value)) {
			options = [...options, option];
		}

		value = option.value;
		if (searchable) {
			searchTerm = option.label;
		}
		closeDropdown();
		onchange?.(option.value);
	};

	const openDropdown = () => {
		dropdownId = openOverlay(
			Dropdown,
			{
				options,
				selectOption
			},
			{ transparentBackground: true }
		);
		updateDropdown();
	};

	const updateDropdown = () => {
		if (!dropdownId) return;
		updateOverlay(
			dropdownId,
			{ options, selectOption },
			{ position: containerElement.getBoundingClientRect() }
		);
	};

	const closeDropdown = () => {
		if (dropdownId) {
			closeOverlay(dropdownId);
			dropdownId = undefined;
		}
	};

	onMount(() => {
		window.addEventListener('scroll', updateDropdown, true);
		window.addEventListener('resize', updateDropdown);

		return () => {
			window.removeEventListener('scroll', updateDropdown, true);
			window.removeEventListener('resize', updateDropdown);
		};
	});
</script>

<div class="dropdown-chevron-button" bind:this={containerElement}>
	<ModernButton
		variant="icon"
		{size}
		{disabled}
		ariaLabel="toggle dropdown"
		title="Toggle options"
		onclick={() => openDropdown()}
	>
		<i class="fa-solid fa-chevron-down"></i>
	</ModernButton>
</div>

<style>
	.dropdown-chevron-button {
		display: inline-flex;
		align-items: center;
		width: 100px;
	}
</style>

<script lang="ts">
	import { massUnits, volumeUnits } from '$lib/utils/unit';

	type Option = { label: string; value: string };
	type OptionList = { title: string; options: Option[] };
	interface Props {
		options: Option[];
		// The label acts as the search term. If value is not provided, the new option will not be added to the dropdown.
		newOption?: Option;
		selectOption: (option: Option) => void;
	}

	let { options, newOption, selectOption }: Props = $props();

	const allOptions = $derived<OptionList[]>([
		{ title: 'Custom', options: options },
		{ title: 'Volume', options: volumeUnits.map((unit) => ({ label: unit, value: unit })) },
		{ title: 'Mass', options: massUnits.map((unit) => ({ label: unit, value: unit })) }
	]);

	// Filter options based on search term
	const filteredLists = $derived(
		allOptions
			.map((list) => {
				list.options.filter((option) =>
					option.label.toLowerCase().includes(newOption?.label?.toLowerCase() ?? '')
				);
			})
			.filter((list) => list.options.length > 0)
	);
</script>

<div class="dropdown-options">
	{#if newOption && newOption.value !== undefined && !options.some((option) => option.label === newOption.label) && newOption.label !== ''}
		<button class="option add-new-option" onclick={() => selectOption(newOption)} tabindex="-1">
			<i class="fa-solid fa-plus"></i>
			"{newOption.label}"
		</button>
	{/if}

	{#each filteredLists as list}
		<div class="li-title">{list.title}</div>
		{#each list.options as option}
			<button class="option" onclick={() => selectOption(option)} tabindex="-1">
				{option.label}
			</button>
		{/each}
	{/each}
</div>

<style>
	.dropdown-options {
		position: absolute;
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: 4px;
		border-top: none;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		max-height: 200px;
		overflow-y: auto;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 6px var(--shadow-medium);
		pointer-events: auto;
		width: 100%;
		min-width: 0;
	}

	.option {
		width: 100%;
		padding: 8px 12px;
		border: none;
		background: transparent;
		color: var(--text-primary);
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		transition: background-color 0.2s ease;
		display: flex;
		align-items: center;
		gap: 6px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.option:hover {
		background: var(--bg-hover);
	}

	.add-new-option {
		background: var(--bg-tertiary);
		font-weight: 500;
		border-bottom: 1px solid var(--border-primary);
	}

	.add-new-option:hover {
		background: var(--bg-active);
	}
</style>

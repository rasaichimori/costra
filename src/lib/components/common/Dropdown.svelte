<script lang="ts" generics="T">
	type Option<T> = { label: string; value: T };
	interface Props<T> {
		options: Option<T>[];
		// The label acts as the search term. If value is not provided, the new option will not be added to the dropdown.
		newOption?: Option<T>;
		selectOption: (option: Option<T>) => void;
	}

	let { options, newOption, selectOption }: Props<T> = $props();

	// Filter options based on search term
	const filteredOptions = $derived(
		newOption?.label
			? options.filter((option) =>
					option.label.toLowerCase().includes(newOption.label.toLowerCase())
				)
			: options
	);
	$inspect(options, filteredOptions);
</script>

<div class="dropdown-options">
	{#if newOption && newOption.value !== undefined && !options.some((option) => option.label === newOption.label) && newOption.label !== ''}
		<button
			class="option add-new-option"
			onclick={() => selectOption(newOption as Option<T>)}
			tabindex="-1"
		>
			<i class="fa-solid fa-plus"></i>
			"{newOption.label}"
		</button>
	{/if}

	{#each filteredOptions as option}
		<button class="option" onclick={() => selectOption(option)} tabindex="-1">
			{option.label}
		</button>
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

<script lang="ts">
	interface Props {
		options: string[];
		searchTerm: string;
		selectOption: (option: string) => void;
	}

	let { options, searchTerm, selectOption }: Props = $props();

	// Filter options based on search term
	const filteredOptions = $derived(
		searchTerm !== ''
			? options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()))
			: options
	);
</script>

<div class="dropdown-options">
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

<style>
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

	.no-options {
		padding: 8px 12px;
		color: #666666;
		font-style: italic;
		text-align: center;
	}
</style>

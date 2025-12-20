<script lang="ts">
	import type { UnitOption, UnitOptionGroup } from '$lib/utils/unit';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';

	interface Props {
		unitGroups: UnitOptionGroup[];
		// The label acts as the search term. If value is not provided, the new option will not be added to the dropdown.
		selectedUnitId: string;
		selectUnit: (option: UnitOption) => void;
		addNewUnit: (option: UnitOption) => void;
	}

	let { unitGroups, selectedUnitId, selectUnit, addNewUnit }: Props = $props();

	let searchTerm = $state('');
	// allow multiple category filters
	let selectedFilters: string[] = $state([]);

	const filteredGroups = $derived(
		unitGroups
			.map((group) => {
				return {
					label: group.label,
					options: group.options.filter((unitOption) => {
						const matchesSearch = unitOption.label.toLowerCase().includes(searchTerm.toLowerCase());
						unitOption.label;
						let matchesFilter = false;
						if (selectedFilters.length === 0) {
							matchesFilter = true;
						} else {
							matchesFilter = selectedFilters.includes(group.label);
						}
						return matchesSearch && matchesFilter;
					})
				};
			})
			.filter((group) => group.options.length > 0)
	);
</script>

<div class="unit-popup">
	<!-- Filter Pills Section -->
	<div class="filter-pills">
		{#each ['Volume', 'Mass', 'Custom'] as category}
			<ModernButton
				variant={selectedFilters.includes(category) ? 'primary' : 'secondary'}
				size="small"
				onclick={() => {
					if (selectedFilters.includes(category)) {
						selectedFilters = selectedFilters.filter((c) => c !== category);
					} else {
						selectedFilters = [...selectedFilters, category];
					}
				}}
			>
				{category}
			</ModernButton>
		{/each}
		{#if selectedFilters.length > 0}
			<ModernButton variant="danger" size="small" onclick={() => (selectedFilters = [])}
				>Clear</ModernButton
			>
		{/if}
	</div>
	<div class="search-container">
		<TextInput
			bind:value={searchTerm}
			size={'small'}
			variant="inline"
			placeholder={!searchTerm ? 'Search unit...' : ''}
			autofocus={true}
			clearable={true}
			icon="fa-solid fa-magnifying-glass"
		/>
	</div>
	{#if searchTerm !== '' && !unitGroups
			.flatMap((group) => group.options)
			.some((option) => option.label.toLowerCase() === searchTerm.toLowerCase())}
		<button
			class="option add-new-option"
			onclick={() => {
				const newId = searchTerm;
				// const newId = crypto.randomUUID();
				const newOption: UnitOption = { id: newId, label: searchTerm };
				addNewUnit(newOption);
				selectUnit(newOption);
			}}
			tabindex="-1"
		>
			<i class="fa-solid fa-plus"></i>
			"{searchTerm}"
		</button>
	{/if}
	<div class="unit-groups">
		{#each filteredGroups as group}
			<div class="group-header">{group.label}</div>
			<div class="unit-options">
				{#each group.options as option}
					<button class="option" onclick={() => selectUnit(option)} tabindex="-1">
						{option.label}
						{selectedUnitId === option.id ? '✓' : ''}
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.unit-popup {
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: 10px;
		box-shadow: 0 6px 18px var(--shadow-heavy);
		width: 232px;
		color: var(--text-primary);
	}

	.filter-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 0 16px;
		padding-top: 16px;
	}

	.search-container {
		padding: 0 16px;
	}

	.unit-groups {
		display: flex;
		flex-direction: column;
		max-height: 240px;
		overflow-y: auto;
		position: relative;

		.group-header {
			position: sticky;
			top: 0;
			font-size: 9px;
			text-transform: uppercase;
			font-weight: 700;
			padding: 4px 16px;
			color: var(--text-secondary);
			background: var(--bg-secondary);
			z-index: 1;
		}
	}

	.unit-options {
		display: flex;
		flex-direction: column;
		padding-bottom: 24px;
	}

	.option {
		width: 100%;
		padding: 4px 16px;
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

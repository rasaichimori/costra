<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount } from 'svelte';
	import UnitSelectPopup from './UnitSelectPopup.svelte';
	import {
		massUnitLabels,
		massUnits,
		volumeUnitLabels,
		volumeUnits,
		type UnitOption,
		type UnitOptionGroup
	} from '$lib/utils/unit';

	interface Props {
		customUnitOptions: UnitOption[];
		selectedUnitId: string;
		selectUnit: (option: UnitOption) => void;
		addNewUnit: (option: UnitOption) => void;
	}

	let { customUnitOptions, selectedUnitId, selectUnit, addNewUnit }: Props = $props();
	const { openOverlay, updateOverlay, closeOverlay } = getOverlayContext();

	let unitBtnElement: HTMLButtonElement | undefined;
	let unitPopupId = $state<string | undefined>(undefined);

	const volumeOptions = $derived(
		volumeUnits.map((unit) => ({ label: volumeUnitLabels[unit], id: unit }))
	);
	const massOptions = $derived(
		massUnits.map((unit) => ({ label: massUnitLabels[unit], id: unit }))
	);

	const allUnitGroups = $derived<UnitOptionGroup[]>([
		{ label: 'Volume', options: volumeOptions },
		{ label: 'Mass', options: massOptions },
		{ label: 'Custom', options: customUnitOptions }
	]);

	const selectAndClose = (unitOption: UnitOption) => {
		selectUnit(unitOption);
		closeOverlay(unitPopupId);
	};

	const openUnitPopup = (btn: HTMLButtonElement) => {
		unitBtnElement = btn;
		unitPopupId = openOverlay(
			UnitSelectPopup,
			{
				unitGroups: allUnitGroups,
				selectedUnitId,
				addNewUnit,
				selectUnit: selectAndClose
			},
			{ transparentBackground: true, position: unitBtnElement.getBoundingClientRect() }
		);
		updateUnitPopup();
	};

	const updateUnitPopup = () => {
		if (!unitPopupId || !unitBtnElement) return;
		updateOverlay(
			unitPopupId,
			{
				allUnitOptions: allUnitGroups,
				selectedUnitId,
				addNewUnit,
				selectUnit: selectAndClose
			},
			{ position: unitBtnElement.getBoundingClientRect() }
		);
	};

	onMount(() => {
		window.addEventListener('scroll', updateUnitPopup, true);
		window.addEventListener('resize', updateUnitPopup);
		return () => {
			window.removeEventListener('scroll', updateUnitPopup, true);
			window.removeEventListener('resize', updateUnitPopup);
		};
	});

	const selectedUnit = $derived(
		allUnitGroups.flatMap((group) => group.options).find((option) => option.id === selectedUnitId)
	);
</script>

<button onclick={(e) => openUnitPopup(e.currentTarget as HTMLButtonElement)}>
	{selectedUnit?.label}</button
>

<style>
	button {
		width: 100%;
		height: 25px;
		border: 1px solid var(--border-tertiary);
		border-radius: 4px;
		font-family: inherit;
		font-weight: 400;
		background: var(--bg-secondary);
		color: var(--text-primary);
		transition: all 0.2s ease;
		outline: none;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>

<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount } from 'svelte';
	import UnitSelectPopup from './UnitSelectPopup.svelte';
	import {
		hasConversion,
		massUnitLabels,
		massUnits,
		volumeUnitLabels,
		volumeUnits,
		type UnitOption,
		type UnitOptionGroup
	} from '$lib/utils/unit';
	import ModernButton from '../common/ModernButton.svelte';
	import type { IngredientDoc, UnitConversion } from '$lib/data/schema';
	import { buildUnitLabels } from '$lib/utils/unitSelectUtils';
	import AddUnitConversionModal from '../modals/AddUnitConversionModal.svelte';

	interface Props {
		customUnitLabels: Record<string, string>;
		unitConversions: UnitConversion[];
		selectedUnitId: string;
		ingredientDoc: IngredientDoc;
		selectUnit: (unitId: string) => void;
	}

	let {
		customUnitLabels = $bindable(),
		unitConversions = $bindable(),
		selectedUnitId,
		ingredientDoc,
		selectUnit
	}: Props = $props();
	const { openOverlay, updateOverlay, closeOverlay } = getOverlayContext();

	let containerElement: HTMLElement;

	let unitBtnElement: HTMLButtonElement | undefined;
	let unitPopupId = $state<string | undefined>(undefined);

	const volumeOptions = $derived(
		volumeUnits.map((unit) => ({ label: volumeUnitLabels[unit], id: unit }))
	);
	const massOptions = $derived(
		massUnits.map((unit) => ({ label: massUnitLabels[unit], id: unit }))
	);
	const customUnitOptions = $derived(
		Object.entries(customUnitLabels).map(([id, label]) => ({ label, id }))
	);

	const allUnitGroups = $derived<UnitOptionGroup[]>([
		{ label: 'Volume', options: volumeOptions },
		{ label: 'Mass', options: massOptions },
		{ label: 'Custom', options: customUnitOptions }
	]);
	const unitLabels = $derived(buildUnitLabels(customUnitLabels));

	const handleViewedUnitSelection = (unitOption: UnitOption) => {
		const newUnitId = unitOption.id;
		const targetUnitId = ingredientDoc.product.unit;
		const ingredientId = ingredientDoc.id;

		// Check if conversion is needed
		if (
			newUnitId !== targetUnitId &&
			!hasConversion(newUnitId, targetUnitId, ingredientId, unitConversions)
		) {
			// Open conversion modal
			const conversionModalId = openOverlay(AddUnitConversionModal, {
				ingredientId,
				ingredientName: ingredientDoc.name,
				inputUnit: newUnitId,
				outputUnit: targetUnitId,
				unitLabels,
				onSave: (conversion: UnitConversion) => {
					unitConversions = [...unitConversions, conversion];
					selectUnit(newUnitId);
					closeOverlay(conversionModalId);
					closeOverlay(unitPopupId);
				},
				onclose: () => {
					closeOverlay(conversionModalId);
				}
			});
		} else {
			// No conversion needed, update immediately and close popup
			selectUnit(newUnitId);
			if (unitPopupId) {
				closeOverlay(unitPopupId);
			}
		}
	};

	const addNewUnit = (unitOption: UnitOption) => {
		customUnitLabels[unitOption.id] = unitOption.label;
	};

	const openUnitPopup = (btn: HTMLButtonElement) => {
		unitBtnElement = btn;
		unitPopupId = openOverlay(
			UnitSelectPopup,
			{
				unitGroups: allUnitGroups,
				selectedUnitId,
				addNewUnit,
				selectUnit: handleViewedUnitSelection
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
				selectUnit: handleViewedUnitSelection
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
</script>

<div class="dropdown-chevron-button" bind:this={containerElement}>
	<ModernButton
		variant="icon"
		size="small"
		ariaLabel="toggle dropdown"
		title="Toggle options"
		onclick={(e) => openUnitPopup(e.currentTarget as HTMLButtonElement)}
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

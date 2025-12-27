<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount } from 'svelte';
	import UnitSelectPopup from './UnitSelectPopup.svelte';
	import { hasConversion, type UnitOption, type Portion } from '$lib/utils/unit';
	import type { IngredientDoc, UnitConversion } from '$lib/data/schema';
	import AddUnitConversionModal from '../modals/AddUnitConversionModal.svelte';
	import { buildUnitGroups, buildUnitLabels } from '$lib/utils/unitSelectUtils';

	interface Props {
		recipePortion: Portion;
		ingredientDoc: IngredientDoc;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		updateRecipePortionUnit: (unitId: string) => void;
	}

	let {
		recipePortion,
		ingredientDoc,
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		updateRecipePortionUnit
	}: Props = $props();

	const { openOverlay, updateOverlay, closeOverlay } = getOverlayContext();

	let unitBtnElement: HTMLButtonElement | undefined;
	let unitPopupId = $state<string | undefined>(undefined);

	const unitLabels = $derived(buildUnitLabels(customUnitLabels));
	const allUnitGroups = $derived(buildUnitGroups(customUnitLabels));

	const addNewUnit = (unitOption: UnitOption) => {
		customUnitLabels[unitOption.id] = unitOption.label;
	};

	const handleUnitSelection = (unitOption: UnitOption) => {
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
					updateRecipePortionUnit(newUnitId);
					closeOverlay(conversionModalId);
					closeOverlay(unitPopupId);
				},
				onclose: () => {
					closeOverlay(conversionModalId);
				}
			});
		} else {
			// No conversion needed, update immediately and close popup
			updateRecipePortionUnit(newUnitId);
			if (unitPopupId) {
				closeOverlay(unitPopupId);
			}
		}
	};

	const openUnitPopup = (btn: HTMLButtonElement) => {
		unitBtnElement = btn;
		unitPopupId = openOverlay(
			UnitSelectPopup,
			{
				unitGroups: allUnitGroups,
				selectedUnitId: recipePortion.unit,
				addNewUnit,
				selectUnit: handleUnitSelection
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
				unitGroups: allUnitGroups,
				selectedUnitId: recipePortion.unit,
				addNewUnit,
				selectUnit: handleUnitSelection
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

<button onclick={(e) => openUnitPopup(e.currentTarget as HTMLButtonElement)}>
	{unitLabels[recipePortion.unit] || recipePortion.unit}</button
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

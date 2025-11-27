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
		type UnitOptionGroup,
		type Portion
	} from '$lib/utils/unit';
	import type { IngredientDoc, UnitConversion } from '$lib/data/schema';
	import AddUnitConversionModal from '../modals/AddUnitConversionModal.svelte';

	interface Props {
		recipePortion: Portion;
		ingredientDoc: IngredientDoc;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
	}

	let {
		recipePortion = $bindable(),
		ingredientDoc = $bindable(),
		unitConversions = $bindable(),
		customUnitLabels = $bindable()
	}: Props = $props();

	const { openOverlay, updateOverlay, closeOverlay } = getOverlayContext();

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

	// Build unitLabels from customUnitOptions + standard labels
	const unitLabels = $derived<Record<string, string>>({
		...volumeUnitLabels,
		...massUnitLabels,
		...customUnitOptions.reduce(
			(acc, opt) => {
				acc[opt.id] = opt.label;
				return acc;
			},
			{} as Record<string, string>
		)
	});

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
					recipePortion.unitId = newUnitId;
					closeOverlay(conversionModalId);
				},
				onclose: () => {
					closeOverlay(conversionModalId);
				}
			});
		} else {
			// No conversion needed, update immediately and close popup
			recipePortion.unitId = newUnitId;
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
				selectedUnitId: recipePortion.unitId,
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
				allUnitOptions: allUnitGroups,
				selectedUnitId: recipePortion.unitId,
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
	{unitLabels[recipePortion.unitId]}</button
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

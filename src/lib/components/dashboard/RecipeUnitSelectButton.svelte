<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount } from 'svelte';
	import UnitSelectPopup from './UnitSelectPopup.svelte';
	import { hasConversion, type UnitOption, type Portion } from '$lib/utils/unit';
	import type { IngredientDoc, UnitConversion } from '$lib/data/schema';
	import AddUnitConversionModal from '../modals/AddUnitConversionModal.svelte';
	import { buildUnitGroups, buildUnitLabels } from '$lib/utils/unitSelectUtils';
	import { isFirstIngredientUnitPick } from '$lib/utils/ingredientUtils';

	interface Props {
		recipePortion: Portion;
		ingredientDoc: IngredientDoc;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		/** Allow changing recipe/product units away from the auto placeholder without a conversion. */
		allowFirstUnitPick?: boolean;
		updateRecipePortionUnit: (unitId: string) => void;
	}

	let {
		recipePortion,
		ingredientDoc,
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		allowFirstUnitPick = false,
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

	const applyUnitSelection = (newUnitId: string) => {
		updateRecipePortionUnit(newUnitId);
		if (unitPopupId) {
			closeOverlay(unitPopupId);
		}
	};

	const handleUnitSelection = (unitOption: UnitOption) => {
		const newUnitId = unitOption.id;
		const targetUnitId = ingredientDoc.product.unit as string;
		const ingredientId = ingredientDoc.id;

		if (
			isFirstIngredientUnitPick({
				allowFirstUnitPick,
				productUnit: targetUnitId,
				portionUnit: recipePortion.unit
			})
		) {
			ingredientDoc.product.unit = newUnitId;
			applyUnitSelection(newUnitId);
			return;
		}

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
					applyUnitSelection(newUnitId);
					closeOverlay(conversionModalId);
				},
				onclose: () => {
					closeOverlay(conversionModalId);
				}
			});
		} else {
			applyUnitSelection(newUnitId);
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
		border: 1px solid var(--border);
		border-radius: 4px;
		font-family: inherit;
		font-weight: 400;
		background: var(--card);
		color: var(--foreground);
		transition: all 0.2s ease;
		outline: none;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>

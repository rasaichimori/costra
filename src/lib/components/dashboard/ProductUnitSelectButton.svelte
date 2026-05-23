<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount } from 'svelte';
	import UnitSelectPopup from './UnitSelectPopup.svelte';
	import type { UnitOption } from '$lib/utils/unit';
	import type { IngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';
	import {
		buildUnitGroups,
		buildUnitLabels,
		findMissingConversions,
		getPortionUnitsForIngredient
	} from '$lib/utils/unitSelectUtils';
	import { isIngredientUsedWithCommittedUnits, isUnsetUnit } from '$lib/utils/ingredientUtils';
	import AddBatchUnitConversionModal from '$lib/components/modals/AddBatchUnitConversionModal.svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		ingredientDoc: IngredientDoc;
		recipes: Record<string, RecipeDoc>;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		onUnitChange?: (newUnit: string) => void;
	}

	let {
		ingredientDoc = $bindable(),
		recipes,
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		onUnitChange
	}: Props = $props();

	const { openOverlay, updateOverlay, closeOverlay } = getOverlayContext();

	let unitBtnElement: HTMLButtonElement | undefined;
	let unitPopupId = $state<string | undefined>(undefined);

	const unitLabels = $derived(buildUnitLabels(customUnitLabels, m.unitUnsetLabel()));
	const allUnitGroups = $derived(buildUnitGroups(customUnitLabels));
	const productUnit = $derived(ingredientDoc.product.unit as string);

	const applyUnitChange = (newUnitId: string) => {
		ingredientDoc.product.unit = newUnitId;
		onUnitChange?.(newUnitId);
		if (unitPopupId) {
			closeOverlay(unitPopupId);
		}
	};

	const handleUnitSelection = (unitOption: UnitOption) => {
		const newUnitId = unitOption.id;
		const ingredientId = ingredientDoc.id;
		const oldUnitId = productUnit;

		if (newUnitId === oldUnitId) {
			if (unitPopupId) {
				closeOverlay(unitPopupId);
			}
			return;
		}

		if (isUnsetUnit(oldUnitId)) {
			applyUnitChange(newUnitId);
			return;
		}

		if (!isIngredientUsedWithCommittedUnits(ingredientId, recipes)) {
			applyUnitChange(newUnitId);
			return;
		}

		const portionUnits = getPortionUnitsForIngredient(ingredientId, recipes).filter(
			(unit) => !isUnsetUnit(unit)
		);
		const allPortionUnits = [...portionUnits];
		if (!allPortionUnits.includes(oldUnitId)) {
			allPortionUnits.push(oldUnitId);
		}

		const missingConversions = findMissingConversions(
			allPortionUnits,
			newUnitId,
			ingredientId,
			unitConversions
		);

		if (missingConversions.length > 0) {
			const conversionModalId = openOverlay(AddBatchUnitConversionModal, {
				ingredientId,
				ingredientName: ingredientDoc.name,
				missingConversions,
				unitLabels,
				recipes,
				onSave: (conversions: UnitConversion[]) => {
					unitConversions = [...unitConversions, ...conversions];
					applyUnitChange(newUnitId);
					closeOverlay(conversionModalId);
				},
				onclose: () => {
					closeOverlay(conversionModalId);
				}
			});
		} else {
			applyUnitChange(newUnitId);
		}
	};

	const openUnitPopup = (btn: HTMLButtonElement) => {
		unitBtnElement = btn;
		unitPopupId = openOverlay(
			UnitSelectPopup,
			{
				unitGroups: allUnitGroups,
				selectedUnitId: productUnit,
				addNewUnit: (unitOption: UnitOption) => {
					customUnitLabels[unitOption.id] = unitOption.label;
				},
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
				selectedUnitId: productUnit,
				addNewUnit: (unitOption: UnitOption) => {
					customUnitLabels[unitOption.id] = unitOption.label;
				},
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

<button
	class:unset-unit={isUnsetUnit(productUnit)}
	onclick={(e) => openUnitPopup(e.currentTarget as HTMLButtonElement)}
>
	{unitLabels[productUnit] || productUnit}
</button>

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

	button.unset-unit {
		color: var(--secondary-foreground);
		font-style: italic;
	}
</style>

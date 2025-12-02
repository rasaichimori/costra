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
	import AddBatchUnitConversionModal from '$lib/components/modals/AddBatchUnitConversionModal.svelte';

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

	const unitLabels = $derived(buildUnitLabels(customUnitLabels));
	const allUnitGroups = $derived(buildUnitGroups(customUnitLabels));

	const addNewUnit = (unitOption: UnitOption) => {
		customUnitLabels[unitOption.id] = unitOption.label;
	};

	const handleUnitSelection = (unitOption: UnitOption) => {
		const newUnitId = unitOption.id;
		const ingredientId = ingredientDoc.id;
		const oldUnitId = ingredientDoc.product.unit as string;

		// Get all portion units used for this ingredient across recipes
		const portionUnits = getPortionUnitsForIngredient(ingredientId, recipes);

		// Always include the old product unit in the check, as it might be used as a portion unit
		// in compounds or other recipes, and we need conversions from old unit to new unit
		const allPortionUnits = [...portionUnits];
		if (oldUnitId !== newUnitId && !allPortionUnits.includes(oldUnitId)) {
			allPortionUnits.push(oldUnitId);
		}

		// Find missing conversions from portion units to the new product unit
		const missingConversions = findMissingConversions(
			allPortionUnits,
			newUnitId,
			ingredientId,
			unitConversions
		);

		if (missingConversions.length > 0) {
			// Open batch conversion modal
			const conversionModalId = openOverlay(AddBatchUnitConversionModal, {
				ingredientId,
				ingredientName: ingredientDoc.name,
				missingConversions,
				unitLabels,
				recipes,
				onSave: (conversions: UnitConversion[]) => {
					unitConversions = [...unitConversions, ...conversions];
					ingredientDoc.product.unit = newUnitId;
					onUnitChange?.(newUnitId);
					closeOverlay(conversionModalId);
					if (unitPopupId) {
						closeOverlay(unitPopupId);
					}
				},
				onclose: () => {
					closeOverlay(conversionModalId);
				}
			});
		} else {
			// No conversion needed, update immediately
			ingredientDoc.product.unit = newUnitId;
			onUnitChange?.(newUnitId);
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
				selectedUnitId: ingredientDoc.product.unit as string,
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
				selectedUnitId: ingredientDoc.product.unit as string,
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
	{unitLabels[ingredientDoc.product.unit as string] || ingredientDoc.product.unit}
</button>

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

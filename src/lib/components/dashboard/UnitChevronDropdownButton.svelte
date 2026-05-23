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
	import type { IngredientDoc, RecipeLikeDoc, UnitConversion } from '$lib/data/schema';
	import { buildUnitLabels } from '$lib/utils/unitSelectUtils';
	import {
		isInitialUnitSelection,
		isIngredientUsedWithCommittedUnits
	} from '$lib/utils/ingredientUtils';
	import AddUnitConversionModal from '../modals/AddUnitConversionModal.svelte';

	interface Props {
		customUnitLabels: Record<string, string>;
		unitConversions: UnitConversion[];
		selectedUnitId: string;
		ingredientDoc: IngredientDoc;
		allRecipes: Record<string, RecipeLikeDoc>;
		unsetLabel: string;
		selectUnit: (unitId: string) => void;
	}

	let {
		customUnitLabels = $bindable(),
		unitConversions = $bindable(),
		selectedUnitId,
		ingredientDoc,
		allRecipes,
		unsetLabel,
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
	const unitLabels = $derived(buildUnitLabels(customUnitLabels, unsetLabel));

	const applyViewedUnit = (newUnitId: string) => {
		selectUnit(newUnitId);
		if (unitPopupId) {
			closeOverlay(unitPopupId);
		}
	};

	const handleViewedUnitSelection = (unitOption: UnitOption) => {
		const newUnitId = unitOption.id;
		const targetUnitId = ingredientDoc.product.unit as string;
		const ingredientId = ingredientDoc.id;

		if (isInitialUnitSelection({ productUnit: targetUnitId, portionUnit: selectedUnitId })) {
			applyViewedUnit(newUnitId);
			return;
		}

		if (
			newUnitId === targetUnitId ||
			hasConversion(newUnitId, targetUnitId, ingredientId, unitConversions)
		) {
			applyViewedUnit(newUnitId);
			return;
		}

		if (!isIngredientUsedWithCommittedUnits(ingredientId, allRecipes)) {
			applyViewedUnit(newUnitId);
			return;
		}

		const conversionModalId = openOverlay(AddUnitConversionModal, {
			ingredientId,
			ingredientName: ingredientDoc.name,
			inputUnit: newUnitId,
			outputUnit: targetUnitId,
			unitLabels,
			onSave: (conversion: UnitConversion) => {
				unitConversions = [...unitConversions, conversion];
				applyViewedUnit(newUnitId);
				closeOverlay(conversionModalId);
			},
			onclose: () => {
				closeOverlay(conversionModalId);
			}
		});
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

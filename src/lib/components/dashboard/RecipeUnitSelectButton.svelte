<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount } from 'svelte';
	import UnitSelectPopup from './UnitSelectPopup.svelte';
	import { hasConversion, type UnitOption, type Portion } from '$lib/utils/unit';
	import type { IngredientDoc, RecipeDoc, UnitConversion } from '$lib/data/schema';
	import AddUnitConversionModal from '../modals/AddUnitConversionModal.svelte';
	import { buildUnitGroups, buildUnitLabels } from '$lib/utils/unitSelectUtils';
	import {
		isInitialUnitSelection,
		isUnsetUnit,
		shouldPromptForUnitConversion
	} from '$lib/utils/ingredientUtils';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		recipePortion: Portion;
		ingredientDoc: IngredientDoc;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		/** When set, product-unit changes skip conversion prompts unless used elsewhere. */
		allRecipes?: Record<string, RecipeDoc>;
		promptOnlyWhenUsed?: boolean;
		updateRecipePortionUnit: (unitId: string) => void;
	}

	let {
		recipePortion,
		ingredientDoc,
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		allRecipes,
		promptOnlyWhenUsed = false,
		updateRecipePortionUnit
	}: Props = $props();

	const { openOverlay, updateOverlay, closeOverlay } = getOverlayContext();

	let unitBtnElement: HTMLButtonElement | undefined;
	let unitPopupId = $state<string | undefined>(undefined);

	const unitLabels = $derived(buildUnitLabels(customUnitLabels, m.unitUnsetLabel()));
	const allUnitGroups = $derived(buildUnitGroups(customUnitLabels));
	const portionUnit = $derived(recipePortion.unit as string);

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

		if (isInitialUnitSelection({ productUnit: targetUnitId, portionUnit })) {
			ingredientDoc.product.unit = newUnitId;
			applyUnitSelection(newUnitId);
			return;
		}

		if (
			newUnitId === targetUnitId ||
			hasConversion(newUnitId, targetUnitId, ingredientId, unitConversions)
		) {
			applyUnitSelection(newUnitId);
			return;
		}

		const needsPrompt =
			!promptOnlyWhenUsed ||
			!allRecipes ||
			shouldPromptForUnitConversion({
				oldUnit: targetUnitId,
				newUnit: newUnitId,
				ingredientId,
				recipes: allRecipes
			});

		if (!needsPrompt) {
			if (promptOnlyWhenUsed) {
				ingredientDoc.product.unit = newUnitId;
			}
			applyUnitSelection(newUnitId);
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
				applyUnitSelection(newUnitId);
				closeOverlay(conversionModalId);
			},
			onclose: () => {
				closeOverlay(conversionModalId);
			}
		});
	};

	const openUnitPopup = (btn: HTMLButtonElement) => {
		unitBtnElement = btn;
		unitPopupId = openOverlay(
			UnitSelectPopup,
			{
				unitGroups: allUnitGroups,
				selectedUnitId: portionUnit,
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
				selectedUnitId: portionUnit,
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
	class:unset-unit={isUnsetUnit(portionUnit)}
	onclick={(e) => openUnitPopup(e.currentTarget as HTMLButtonElement)}
>
	{unitLabels[portionUnit] || portionUnit}
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

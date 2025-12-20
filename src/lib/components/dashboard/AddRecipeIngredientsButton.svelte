<script lang="ts">
	import { getOverlayContext } from '$lib/contexts/overlay.svelte';
	import { onMount, tick } from 'svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import AddRecipeIngredientsPopup from './AddRecipeIngredientsPopup.svelte';
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';

	interface Props {
		availableIngredients: IngredientDoc[];
		availableCompounds?: CompoundIngredientDoc[];
		recipe: RecipeDoc;
		costs?: Record<string, IngredientDoc>;
		recipes?: Record<string, RecipeDoc>;
		unitConversions?: UnitConversion[];
		customUnitLabels?: Record<string, string>;
	}

	let {
		availableIngredients,
		availableCompounds,
		recipe,
		costs,
		recipes = {},
		unitConversions = [],
		customUnitLabels = {}
	}: Props = $props();
	const { openOverlay, updateOverlay } = getOverlayContext();

	let addBtnElement: HTMLButtonElement | undefined;
	let addPopupId = $state<string | undefined>(undefined);

	const openAddPopup = (btn: HTMLButtonElement) => {
		addBtnElement = btn;
		addPopupId = openOverlay(
			AddRecipeIngredientsPopup,
			{
				availableIngredients,
				availableCompounds,
				recipe,
				costs,
				recipes,
				unitConversions,
				customUnitLabels,
				onAddIngredient: async () => {
					await tick();
					updateAddPopup();
				}
			},
			{ transparentBackground: true, position: addBtnElement.getBoundingClientRect() }
		);
		updateAddPopup();
	};

	const updateAddPopup = () => {
		if (!addPopupId || !addBtnElement) return;
		updateOverlay(
			addPopupId,
			{
				availableIngredients,
				availableCompounds,
				recipe,
				costs,
				recipes,
				unitConversions,
				customUnitLabels
			},
			{ position: addBtnElement.getBoundingClientRect() }
		);
	};

	onMount(() => {
		window.addEventListener('scroll', updateAddPopup, true);
		window.addEventListener('resize', updateAddPopup);
		return () => {
			window.removeEventListener('scroll', updateAddPopup, true);
			window.removeEventListener('resize', updateAddPopup);
		};
	});
</script>

<ModernButton
	onclick={(e) => openAddPopup(e.currentTarget as HTMLButtonElement)}
	style="width: fit-content;"
>
	<i class="fa-solid fa-plus"></i>
	Add Ingredients
</ModernButton>

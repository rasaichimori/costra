<script lang="ts">
	import { onMount } from 'svelte';
	import { setCurrencyContext } from '$lib/contexts/currency.svelte';
	import { createOverlayContext, overlays } from '$lib/contexts/overlay.svelte';
	import OverlayHost from '$lib/overlay/OverlayHost.svelte';
	import type { IngredientDoc } from '$lib/data/schema';
	import CreateIngredientPopup from './CreateIngredientPopup.svelte';

	setCurrencyContext();
	const { openOverlay } = createOverlayContext();

	const costs: Record<string, IngredientDoc> = {
		flour: {
			id: 'flour',
			name: 'Flour',
			category: 'Dry',
			product: { cost: 1, amount: 1, unit: 'g' },
			color: '#ffffff'
		},
		milk: {
			id: 'milk',
			name: 'Milk',
			category: 'Dairy',
			product: { cost: 1, amount: 1, unit: 'ml' },
			color: '#ffffff'
		}
	};

	onMount(() => {
		openOverlay(
			CreateIngredientPopup,
			{
				costs,
				recipes: {},
				unitConversions: [],
				customUnitLabels: {}
			},
			{ transparentBackground: true }
		);
	});
</script>

{#each overlays as entry (entry.id)}
	<OverlayHost {entry} />
{/each}

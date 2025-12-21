<script lang="ts">
	import ConversionsSection from '$lib/components/dashboard/ConversionsSection.svelte';
	import { getDataContext } from '$lib/contexts/data.svelte';

	const data = getDataContext();
</script>

<ConversionsSection
	costs={data.costs}
	compoundIngredients={data.compoundIngredients}
	bind:unitConversions={data.unitConversions}
	customUnitLabels={data.customUnitLabels}
/>


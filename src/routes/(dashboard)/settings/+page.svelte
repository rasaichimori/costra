<script lang="ts">
	import SettingsSection from '$lib/components/dashboard/SettingsSection.svelte';
	import { getDataContext } from '$lib/contexts/data.svelte';

	const data = getDataContext();
</script>

<SettingsSection
	bind:costs={data.costs}
	bind:recipes={data.recipes}
	bind:compoundIngredients={data.compoundIngredients}
	bind:unitConversions={data.unitConversions}
	bind:customUnitLabels={data.customUnitLabels}
/>


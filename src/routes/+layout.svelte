<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import OverlayProvider from '$lib/overlay/OverlayProvider.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<OverlayProvider>
	{@render children?.()}
</OverlayProvider>

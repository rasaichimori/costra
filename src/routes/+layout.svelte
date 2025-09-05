<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import OverlayProvider from '$lib/overlay/OverlayProvider.svelte';
	import Sidebar from '$lib/components/common/Sidebar.svelte';
	import { page } from '$app/state';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<OverlayProvider>
	{@render children?.()}
	<!-- {#if page.url.pathname !== '/'}
		<div class="layout-with-sidebar">
			<Sidebar />
			<main class="content">{@render children?.()}</main>
		</div>
	{:else}
		{@render children?.()}
	{/if} -->
</OverlayProvider>

<style>
	.layout-with-sidebar {
		display: flex;
		min-height: 100vh;
	}
	.content {
		flex: 1;
	}
</style>

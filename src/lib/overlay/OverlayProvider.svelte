<script lang="ts">
	import { createOverlayContext, overlays } from '../contexts/overlay.svelte';
	import OverlayHost from './OverlayHost.svelte';

	import type { Snippet } from 'svelte';

	// accept children from props in runes style
	let { children }: { children?: Snippet } = $props();

	// instantiate API and provide it
	createOverlayContext();

	$inspect(overlays);
</script>

{@render children?.()}

{#each overlays as entry, i (entry.id)}
	<OverlayHost {entry} />
{/each}

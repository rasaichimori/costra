<script lang="ts">
	import {
		getOverlayContext,
		type OverlayComponent,
		type OverlayEntry
	} from '../contexts/overlay.svelte';

	let { entry }: { entry: OverlayEntry<any, any> } = $props();

	const Comp = $derived(entry?.component as OverlayComponent<any, any>);

	const { closeOverlay } = getOverlayContext();

	const handleBackdropClick = (e: MouseEvent) => {
		e.stopPropagation();
		closeOverlay(entry.id);
	};

	$inspect(entry.options?.position);
</script>

<div
	class="overlay-backdrop"
	onpointerdown={handleBackdropClick}
	style="background: {entry.options?.clearBackground ? 'transparent' : 'rgba(0, 0, 0, 0.5)'}"
>
	<div
		class="overlay-content"
		onpointerdown={(e) => e.stopPropagation()}
		style:position={entry.options?.position !== undefined ? 'absolute' : 'relative'}
		style:top="{entry.options?.position?.bottom}px"
		style:left="{entry.options?.position?.left}px"
		style:width="{entry.options?.position?.width}px"
	>
		<Comp {...entry.props} />
	</div>
</div>

<style>
	.overlay-backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.overlay-content {
		width: fit-content;
		height: fit-content;
	}
</style>

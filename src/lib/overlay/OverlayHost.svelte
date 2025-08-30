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
</script>

<div class="overlay-backdrop" onpointerdown={handleBackdropClick}>
	<div class="overlay-content" onpointerdown={(e) => e.stopPropagation()}>
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
		background: rgba(0, 0, 0, 0.5);
	}
</style>

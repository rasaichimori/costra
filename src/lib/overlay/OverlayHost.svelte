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

	// Calculate smart positioning to keep dropdown within viewport
	const getSmartPosition = (position: DOMRect) => {
		const viewportHeight = window.innerHeight;
		const viewportWidth = window.innerWidth;
		const dropdownMaxHeight = 200; // Match max-height from Dropdown.svelte
		const dropdownWidth = position.width;

		let top = position.bottom;
		let left = position.left;

		// Check if dropdown would go below viewport
		if (position.bottom + dropdownMaxHeight > viewportHeight) {
			// Position above the input instead
			top = position.top - dropdownMaxHeight;

			// If still not enough space above, adjust to fit within viewport
			if (top < 0) {
				top = Math.max(10, viewportHeight - dropdownMaxHeight - 10);
			}
		}

		// Check if dropdown would go beyond right edge of viewport
		if (position.left + dropdownWidth > viewportWidth) {
			left = viewportWidth - dropdownWidth - 10;
		}

		// Check if dropdown would go beyond left edge of viewport
		if (left < 0) {
			left = 10;
		}

		return { top, left };
	};

	const smartPosition = $derived(() => {
		if (!entry.options?.position) return {};
		const { top, left } = getSmartPosition(entry.options.position);
		return { top: `${top}px`, left: `${left}px` };
	});
</script>

<div
	class="overlay-backdrop"
	onpointerdown={handleBackdropClick}
	style="background: {entry.options?.transparentBackground ? 'transparent' : 'var(--overlay)'}"
>
	<div
		class="overlay-content"
		onpointerdown={(e) => e.stopPropagation()}
		style:position={entry.options?.position !== undefined ? 'absolute' : 'relative'}
		style:top={smartPosition().top || `${entry.options?.position?.bottom}px`}
		style:left={smartPosition().left || `${entry.options?.position?.left}px`}
		style:width="{entry.options?.position?.width}px"
	>
		{#if Comp}
			<Comp {...entry.props} />
		{/if}
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

<script lang="ts">
	import { startDrag } from '$lib/utils/dragControls';
	import CheckIcon from '$lib/components/common/icons/CheckIcon.svelte';
	import XIcon from '$lib/components/common/icons/XIcon.svelte';

	interface Props {
		isHovered?: boolean;
	}

	let { isHovered = false }: Props = $props();

	let targetMargin = $state(30);
	let trackElement: HTMLDivElement | null = $state(null);
	let isDragging = $state(false);

	let products = $state([
		{ id: 'croissant', name: 'Croissant', margin: 35, color: '#10b981' },
		{ id: 'baguette', name: 'Baguette', margin: 22, color: '#f59e0b' },
		{ id: 'danish', name: 'Danish', margin: 41, color: '#3b82f6' }
	]);

	const getMarginStatus = (margin: number) => {
		if (margin >= targetMargin) return 'above';
		return 'on-target';
	};

	const handleMarkerDrag = (e: MouseEvent) => {
		if (!trackElement) return;

		isDragging = true;

		const updatePosition = (moveEvent: MouseEvent) => {
			if (!trackElement) return;
			const rect = trackElement.getBoundingClientRect();
			const x = moveEvent.clientX - rect.left;
			const percentage = Math.round(Math.max(5, Math.min(50, (x / rect.width) * 50)));
			targetMargin = percentage;
		};

		startDrag(e, updatePosition, () => {
			isDragging = false;
		});
	};
</script>

<div class="demo-container" class:is-hovered={isHovered || isDragging}>
	<div class="target-indicator">
		<span class="target-label">Target: {targetMargin}%</span>
		<div class="target-line-marker"></div>
	</div>
	<div class="products-list">
		{#each products as product, index (product.id)}
			{@const isFirst = index === 0}
			<div class="product-row">
				<span class="product-name">{product.name}</span>
				<div class="bar-container">
					{#if isFirst}
						<div class="bar-track" bind:this={trackElement}>
							<div
								class="bar-fill {getMarginStatus(product.margin)}"
								style="width: {Math.min(product.margin, 50) * 2}%; background: {product.color}"
							></div>
							<div class="target-line" style="left: {targetMargin * 2}%">
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="drag-handle" class:dragging={isDragging} onmousedown={handleMarkerDrag}>
									<svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
										<path d="M5 6L0 0h10L5 6z" />
									</svg>
								</div>
							</div>
						</div>
					{:else}
						<div class="bar-track">
							<div
								class="bar-fill {getMarginStatus(product.margin)}"
								style="width: {Math.min(product.margin, 50) * 2}%; background: {product.color}"
							></div>
							<div class="target-line" style="left: {targetMargin * 2}%"></div>
						</div>
					{/if}
					<span class="margin-value" class:on-target={product.margin < targetMargin}>
						{product.margin}%
					</span>
				</div>
				<span class="status-icon">
					{#if product.margin < targetMargin}
						<CheckIcon />
					{:else}
						<XIcon />
					{/if}
				</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.demo-container {
		background: var(--background);
		padding: 10px;
		border-radius: 8px;
	}

	.target-indicator {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 10px;
		padding-bottom: 8px;
		border-bottom: 1px dashed var(--border);
	}

	.target-label {
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		width: 70px;
	}

	.target-line-marker {
		flex: 1;
		height: 1px;
		background: repeating-linear-gradient(
			90deg,
			var(--primary),
			var(--primary) 4px,
			transparent 4px,
			transparent 8px
		);
	}

	.products-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		transform-style: preserve-3d;
	}

	.product-row {
		display: flex;
		align-items: center;
		gap: 8px;
		transform-style: preserve-3d;
	}

	.product-name {
		font-size: 0.7rem;
		font-weight: 500;
		color: var(--foreground);
		width: 60px;
		flex-shrink: 0;
	}

	.bar-container {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		transform-style: preserve-3d;
	}

	.bar-track {
		flex: 1;
		height: 8px;
		background: var(--muted);
		border-radius: 4px;
		position: relative;
		transform-style: preserve-3d;
	}

	.bar-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bar-fill.on-target {
		opacity: 1;
	}
	.bar-fill.above {
		opacity: 0.6;
	}

	.target-line {
		position: absolute;
		top: -2px;
		bottom: -2px;
		width: 2px;
		background: var(--primary);
		border-radius: 1px;
		box-shadow: 0 0 4px var(--primary);
		transition: left 0.1s ease-out;
		transform-style: preserve-3d;
	}

	.drag-handle {
		position: absolute;
		top: -20px;
		left: 50%;
		transform: translateX(-50%) translateZ(50px) scale(0.5);
		width: 24px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: ew-resize;
		color: var(--primary);
		background: var(--card);
		border: 1px solid var(--primary);
		border-radius: 4px;
		filter: drop-shadow(0 0 6px var(--primary));
		opacity: 0;
		pointer-events: none;
		transition:
			transform 0.2s ease,
			filter 0.2s ease,
			opacity 0.2s ease;
	}

	.demo-container.is-hovered .drag-handle {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(-50%) translateZ(50px) scale(1);
	}

	.demo-container.is-hovered .drag-handle:hover {
		transform: translateX(-50%) translateZ(50px) scale(1.15);
		filter: drop-shadow(0 0 10px var(--primary));
	}

	.drag-handle.dragging {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(-50%) translateZ(50px) scale(1.2);
		filter: drop-shadow(0 0 12px var(--primary));
	}

	.margin-value {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
		min-width: 32px;
		text-align: right;
	}

	.margin-value.on-target {
		color: var(--primary);
	}

	.status-icon {
		width: 14px;
		height: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-icon :global(svg) {
		color: var(--muted-foreground);
	}

	.product-row:has(.margin-value.on-target) .status-icon :global(svg) {
		color: var(--primary);
	}
</style>

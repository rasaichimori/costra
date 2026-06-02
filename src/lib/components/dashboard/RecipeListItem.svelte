<script lang="ts">
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';
	import type { DragPosition } from '$lib/utils/dragControls';

	interface Props {
		label: string;
		selected?: boolean;
		cost?: number;
		unit?: string;
		reorderable?: boolean;
		isDragging?: boolean;
		isPlaceholder?: boolean;
		dragPosition?: DragPosition | null;
		dragHeight?: number;
		element?: HTMLElement | undefined;
		onpointerdown?: (e: PointerEvent) => void;
	}

	let {
		label,
		selected = false,
		cost,
		unit,
		reorderable = false,
		isDragging = false,
		isPlaceholder = false,
		dragPosition = null,
		dragHeight,
		element = $bindable(),
		onpointerdown
	}: Props = $props();

	const currencyContext = getCurrencyContext();

	const dragStyle = $derived(
		isDragging && dragPosition
			? `left: ${dragPosition.left}px; top: ${dragPosition.top}px; width: ${dragPosition.width}px;`
			: undefined
	);
</script>

{#if isPlaceholder}
	<div
		class="recipe-list-item-placeholder"
		style:height={dragHeight ? `${dragHeight}px` : undefined}
		aria-hidden="true"
	></div>
{:else}
	<button
		bind:this={element}
		class="recipe-list-item {selected ? 'selected' : ''}"
		class:dragging={isDragging}
		class:reorderable
		style={dragStyle}
		{onpointerdown}
	>
		<span class="label">{label}</span>
		{#if cost !== undefined}
			<span class="cost">{currencyContext.currency}{cost.toFixed(0)}</span>
		{/if}
		{#if unit !== undefined}
			<span class="unit-separator"> / </span>
			<span class="unit">{unit}</span>
		{/if}
	</button>
{/if}

<style>
	.recipe-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.6rem 0.9rem;
		font-size: 0.85rem;
		background: transparent;
		color: var(--secondary-foreground);
		border: 1px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition:
			background 0.2s cubic-bezier(0.4, 0, 0.2, 1),
			color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
			border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.recipe-list-item:hover {
		background: var(--hover);
		color: var(--foreground);
	}

	.recipe-list-item.selected {
		background: var(--card);
		border-color: var(--primary);
		color: var(--foreground);
		box-shadow: var(--shadow-light);
	}

	.recipe-list-item.selected::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 60%;
		background: var(--primary);
		border-radius: 0 2px 2px 0;
	}

	.recipe-list-item.reorderable {
		touch-action: none;
	}

	.recipe-list-item.dragging {
		position: fixed;
		z-index: 100;
		pointer-events: none;
		transition: none;
		cursor: grabbing;
	}

	.recipe-list-item-placeholder {
		width: 100%;
		flex-shrink: 0;
	}

	.label {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		font-weight: 450;
		letter-spacing: -0.01em;
	}

	.cost {
		font-weight: 600;
		margin-left: 0.5rem;
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 900px) {
		.recipe-list-item {
			width: auto;
			flex-shrink: 0;
		}

		.recipe-list-item-placeholder {
			width: auto;
		}
	}

	@media (max-width: 480px) {
		.recipe-list-item {
			padding: 0.5rem 0.75rem;
			font-size: 0.8rem;
		}

		.cost {
			margin-left: 0.4rem;
		}
	}
</style>

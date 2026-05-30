<script lang="ts">
	import type { RecipeDoc } from '$lib/data/schema';
	import EditableTextField from '../common/EditableTextField.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import {
		createRecipeSize,
		getActiveSize,
		getNextRecipeSizeNumber,
		reorderRecipeSizes
	} from '$lib/utils/recipeUtils';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		recipe: RecipeDoc;
		editingSizeId?: string;
		sizeCosts: Record<string, number>;
		onActiveSizeChange?: () => void;
	}

	let {
		recipe = $bindable(),
		editingSizeId = $bindable<string | undefined>(),
		sizeCosts,
		onActiveSizeChange
	}: Props = $props();

	const currencyContext = getCurrencyContext();

	const DRAG_THRESHOLD_PX = 5;

	const activeSize = $derived(getActiveSize(recipe));
	const hasMultipleSizes = $derived(recipe.sizes.length > 1);

	let isEditingActiveSize = $state(false);
	let draggingSizeId = $state<string | null>(null);
	let dragPosition = $state<{ left: number; top: number; width: number } | null>(null);
	let dragDimensions = $state<{ width: number; height: number } | null>(null);
	const sizeTabEls: Record<string, HTMLElement> = $state({});
	const placeholderEls: Record<string, HTMLElement> = $state({});

	const getSizeIndex = (sizeId: string) => recipe.sizes.findIndex((size) => size.id === sizeId);

	const swapSizes = (from: number, to: number) => {
		recipe.sizes = reorderRecipeSizes(recipe.sizes, from, to);
	};

	const getDropIndexFromX = (clientX: number, draggedId: string | null) => {
		for (let i = 0; i < recipe.sizes.length; i++) {
			const size = recipe.sizes[i];
			const el =
				size.id === draggedId
					? (placeholderEls[size.id] ?? sizeTabEls[size.id])
					: sizeTabEls[size.id];
			if (!el) continue;

			const rect = el.getBoundingClientRect();
			if (clientX < rect.left + rect.width / 2) {
				return i;
			}
		}

		return Math.max(recipe.sizes.length - 1, 0);
	};

	const clearDragState = () => {
		draggingSizeId = null;
		dragPosition = null;
		dragDimensions = null;
	};

	const isInteractiveDragTarget = (target: EventTarget | null) => {
		if (!(target instanceof Element)) return true;
		return !!target.closest('button, input, textarea, select, a, [contenteditable="true"]');
	};

	const disableTextSelection = () => {
		document.body.style.userSelect = 'none';
		document.body.style.webkitUserSelect = 'none';
	};

	const restoreTextSelection = () => {
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = '';
		window.getSelection()?.removeAllRanges();
	};

	const handleTabPointerDown = (e: PointerEvent, sizeId: string) => {
		if (!hasMultipleSizes || isInteractiveDragTarget(e.target)) return;

		if (sizeId !== activeSize.id) {
			selectSize(sizeId);
		}

		e.preventDefault();
		disableTextSelection();

		const startX = e.clientX;
		const startY = e.clientY;
		let isDragging = false;
		let fromIdx = getSizeIndex(sizeId);
		let grabOffsetX = 0;
		let dragTop = 0;

		const onMove = (moveEvent: PointerEvent) => {
			if (!isDragging) {
				const dx = moveEvent.clientX - startX;
				const dy = moveEvent.clientY - startY;
				if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

				const tabEl = sizeTabEls[sizeId];
				if (!tabEl) return;

				const rect = tabEl.getBoundingClientRect();
				grabOffsetX = moveEvent.clientX - rect.left;
				dragTop = rect.top;

				isDragging = true;
				draggingSizeId = sizeId;
				dragDimensions = { width: rect.width, height: rect.height };
				window.getSelection()?.removeAllRanges();
			}

			moveEvent.preventDefault();
			dragPosition = {
				left: moveEvent.clientX - grabOffsetX,
				top: dragTop,
				width: dragDimensions?.width ?? 0
			};

			const toIdx = getDropIndexFromX(moveEvent.clientX, sizeId);
			if (toIdx !== fromIdx) {
				swapSizes(fromIdx, toIdx);
				fromIdx = toIdx;
			}
		};

		const onUp = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			restoreTextSelection();

			if (isDragging) {
				clearDragState();
			}
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	};

	const selectSize = (sizeId: string) => {
		if (sizeId === recipe.activeSizeId) return;

		onActiveSizeChange?.();
		recipe.activeSizeId = sizeId;
		editingSizeId = undefined;
		isEditingActiveSize = false;
	};

	const addSize = () => {
		const nextNumber = getNextRecipeSizeNumber(recipe);
		const newSize = createRecipeSize(
			m.defaultRecipeSizeName({ number: nextNumber }),
			activeSize.ingredients
		);
		onActiveSizeChange?.();
		recipe.sizes = [...recipe.sizes, newSize];
		recipe.activeSizeId = newSize.id;
		editingSizeId = newSize.id;
		isEditingActiveSize = true;
	};

	const deleteSize = (sizeId: string) => {
		if (!hasMultipleSizes) return;

		const remainingSizes = recipe.sizes.filter((size) => size.id !== sizeId);
		recipe.sizes = remainingSizes;

		if (recipe.activeSizeId === sizeId) {
			onActiveSizeChange?.();
			recipe.activeSizeId = remainingSizes[0].id;
		}

		if (editingSizeId === sizeId) {
			editingSizeId = undefined;
			isEditingActiveSize = false;
		}
	};

	const finishEditingSizeName = () => {
		editingSizeId = undefined;
		isEditingActiveSize = false;
	};
</script>

<div class="size-tabs-bar" class:is-dragging={draggingSizeId !== null}>
	<div class="size-tabs" role="tablist" aria-label={m.recipeSizeTabsAriaLabel()}>
		{#each recipe.sizes as size (size.id)}
			{#if size.id === draggingSizeId && dragDimensions}
				<div
					bind:this={placeholderEls[size.id]}
					class="size-tab-placeholder"
					style:width="{dragDimensions.width}px"
					style:height="{dragDimensions.height}px"
					aria-hidden="true"
				></div>
			{/if}
			<div
				bind:this={sizeTabEls[size.id]}
				class="size-tab"
				class:active={size.id === activeSize.id}
				class:dragging={size.id === draggingSizeId}
				class:reorderable={hasMultipleSizes}
				role="tab"
				aria-selected={size.id === activeSize.id}
				style={size.id === draggingSizeId && dragPosition
					? `left: ${dragPosition.left}px; top: ${dragPosition.top}px; width: ${dragPosition.width}px;`
					: undefined}
				onpointerdown={(e) => handleTabPointerDown(e, size.id)}
			>
				{#if size.id === activeSize.id}
					<div class="active-tab-content">
						<EditableTextField
							bind:value={size.name}
							bind:isEditing={isEditingActiveSize}
							placeholder={m.recipeSizeNamePlaceholder()}
							editAriaLabel={m.editRecipeSizeNameAriaLabel()}
							editTitle={m.editRecipeSizeNameAriaLabel()}
							onSave={finishEditingSizeName}
							onCancel={finishEditingSizeName}
						/>
						<span class="tab-cost">
							{currencyContext.currency}{(sizeCosts[size.id] ?? 0).toFixed(0)}
						</span>
					</div>
					{#if hasMultipleSizes}
						<ModernButton
							variant="icon"
							size="small"
							ariaLabel={m.deleteRecipeSizeAriaLabel({ name: size.name })}
							title={m.deleteRecipeSizeTitle()}
							onclick={() => deleteSize(size.id)}
						>
							<i class="fa-solid fa-trash"></i>
						</ModernButton>
					{/if}
				{:else}
					<div class="tab-content">
						<span class="tab-label">{size.name}</span>
						<span class="tab-cost">
							{currencyContext.currency}{(sizeCosts[size.id] ?? 0).toFixed(0)}
						</span>
					</div>
				{/if}
			</div>
		{/each}
		<div class="add-size-btn">
			<ModernButton
				variant="icon"
				size="small"
				ariaLabel={m.addRecipeSizeAriaLabel()}
				title={m.addRecipeSizeTitle()}
				onclick={addSize}
			>
				<i class="fa-solid fa-plus"></i>
			</ModernButton>
		</div>
	</div>
</div>

<style>
	.size-tabs-bar {
		isolation: isolate;
		width: 0px;
		min-width: 100%;
		max-width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
		background: var(--muted, #f5f5f5);
		border-radius: 8px 8px 0 0;
		padding: 4px 8px 0;
	}

	.size-tabs-bar::-webkit-scrollbar {
		display: none;
	}

	.size-tabs {
		display: flex;
		align-items: flex-end;
		gap: 0;
		width: max-content;
		min-width: min-content;
	}

	.add-size-btn {
		flex-shrink: 0;
		align-self: center;
		padding: 0 4px 6px;
	}

	.size-tab {
		display: flex;
		align-items: flex-start;
		gap: 2px;
		flex-shrink: 0;
		padding: 6px 12px 7px;
		background: transparent;
		border: none;
		color: var(--secondary-foreground, #666);
		font-size: 12px;
		font-weight: 500;
		max-width: 220px;
		position: relative;
		transition: color 0.15s ease;
	}

	.size-tab:not(.active) + .size-tab:not(.active)::before {
		content: '';
		position: absolute;
		left: 0;
		top: 22%;
		bottom: 22%;
		width: 1px;
		background: var(--border, #e5e5e5);
	}

	.size-tab:not(.active):hover {
		color: var(--foreground, #111);
	}

	.size-tab.active {
		--tab-curve: 8px;
		background: var(--card, #fff);
		color: var(--foreground, #111);
		border: 1px solid var(--border, #e5e5e5);
		border-bottom: none;
		border-radius: var(--tab-curve) var(--tab-curve) 0 0;
		z-index: 1;
		padding-bottom: 8px;
		margin-bottom: -1px;
	}

	.size-tab.active::before,
	.size-tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		width: var(--tab-curve);
		height: var(--tab-curve);
		pointer-events: none;
	}

	.size-tab.active::before {
		left: calc(-1 * var(--tab-curve));
		background: radial-gradient(
			circle at 0 0,
			transparent calc(var(--tab-curve) - 1px),
			var(--border, #e5e5e5) calc(var(--tab-curve) - 1px),
			var(--border, #e5e5e5) var(--tab-curve),
			var(--card, #fff) var(--tab-curve)
		);
	}

	.size-tab.active::after {
		right: calc(-1 * var(--tab-curve));
		background: radial-gradient(
			circle at 100% 0,
			transparent calc(var(--tab-curve) - 1px),
			var(--border, #e5e5e5) calc(var(--tab-curve) - 1px),
			var(--border, #e5e5e5) var(--tab-curve),
			var(--card, #fff) var(--tab-curve)
		);
	}

	.active-tab-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.tab-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		min-width: 0;
	}

	.tab-cost {
		font-size: 10px;
		font-weight: 400;
		line-height: 1;
		color: var(--secondary-foreground, #888);
		padding: 0 4px;
	}

	.active-tab-content :global(.editable-text-field) {
		gap: 4px;
	}

	.active-tab-content :global(.ingredient-name) {
		font-size: 12px;
		text-transform: none;
		max-width: 100px;
	}

	.size-tab.reorderable {
		touch-action: none;
	}

	.size-tabs-bar.is-dragging {
		user-select: none;
		-webkit-user-select: none;
	}

	.size-tab-placeholder {
		flex-shrink: 0;
		align-self: flex-end;
	}

	.size-tab.dragging {
		position: fixed;
		z-index: 100;
		pointer-events: none;
		transition: none;
	}

	.tab-label {
		padding: 2px 4px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 140px;
	}

	@media (max-width: 480px) {
		.size-tab {
			padding: 5px 8px 6px;
			font-size: 11px;
			max-width: 160px;
		}

		.size-tab.active {
			padding-bottom: 7px;
		}

		.tab-label {
			max-width: 100px;
		}
	}
</style>

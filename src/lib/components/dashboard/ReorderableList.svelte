<script lang="ts" generics="T">
	import { handleVerticalListPointerDown, type DragPosition } from '$lib/utils/dragControls';
	import { reorderRecord } from '$lib/utils/recipeUtils';
	import RecipeListItem from './RecipeListItem.svelte';
	import SidebarAddButton from './SidebarAddButton.svelte';

	interface Props {
		items: Record<string, T>;
		selectedId?: string;
		getLabel: (item: T) => string;
		getCost?: (item: T) => number | undefined;
		getUnit?: (item: T) => string | undefined;
		onSelect?: (id: string) => void;
		onAdd: () => void;
		addLabel: string;
	}

	let {
		items = $bindable(),
		selectedId = $bindable(),
		getLabel,
		getCost,
		getUnit,
		onSelect,
		onAdd,
		addLabel
	}: Props = $props();

	const entries = $derived(Object.entries(items) as [string, T][]);
	const ids = $derived(entries.map(([id]) => id));
	const reorderable = $derived(ids.length > 1);

	let draggingId = $state<string | null>(null);
	let dragHoverIndex = $state<number | null>(null);
	let dragPosition = $state<DragPosition | null>(null);
	let dragDimensions = $state<{ width: number; height: number } | null>(null);
	const itemEls: Record<string, HTMLElement> = $state({});
	const placeholderEls: Record<string, HTMLElement> = $state({});
	let trailingPlaceholderEl = $state<HTMLElement | undefined>();

	const getElement = (id: string, isDragged: boolean) => {
		if (isDragged && dragHoverIndex !== null) {
			if (dragHoverIndex >= ids.length) {
				return trailingPlaceholderEl;
			}
			const hoverId = ids[dragHoverIndex];
			if (hoverId && placeholderEls[hoverId]) {
				return placeholderEls[hoverId];
			}
		}
		return itemEls[id];
	};

	const select = (id: string) => {
		selectedId = id;
		onSelect?.(id);
	};

	const handleItemPointerDown = (e: PointerEvent, id: string) => {
		handleVerticalListPointerDown({
			e,
			itemId: id,
			itemIds: ids,
			getElement,
			onSelect: () => select(id),
			onReorder: (fromIndex, toIndex) => {
				items = reorderRecord(items, fromIndex, toIndex);
			},
			setDraggingId: (id) => (draggingId = id),
			setDragPosition: (position) => (dragPosition = position),
			setDragDimensions: (dimensions) => (dragDimensions = dimensions),
			setHoverIndex: (index) => (dragHoverIndex = index),
			reorderable
		});
	};
</script>

<div class="recipes-list" class:is-dragging={draggingId !== null}>
	{#each entries as [id, item], idx (id)}
		{#if draggingId && dragHoverIndex === idx && dragHoverIndex < ids.length && dragDimensions}
			<div bind:this={placeholderEls[id]}>
				<RecipeListItem isPlaceholder={true} label="" dragHeight={dragDimensions.height} />
			</div>
		{/if}
		<RecipeListItem
			bind:element={itemEls[id]}
			label={getLabel(item)}
			selected={id === selectedId}
			cost={getCost?.(item)}
			unit={getUnit?.(item)}
			{reorderable}
			isDragging={id === draggingId}
			{dragPosition}
			onpointerdown={(e) => handleItemPointerDown(e, id)}
		/>
	{/each}
	{#if draggingId && dragHoverIndex === ids.length && dragDimensions}
		<div bind:this={trailingPlaceholderEl}>
			<RecipeListItem isPlaceholder={true} label="" dragHeight={dragDimensions.height} />
		</div>
	{/if}
	<SidebarAddButton onclick={onAdd}>{addLabel}</SidebarAddButton>
</div>

<style>
	.recipes-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--muted);
		border: 1px solid var(--border);
		padding: 1rem;
		border-radius: 12px;
		max-height: 80vh;
		overflow-y: auto;
		width: 220px;
		min-width: 180px;
		box-shadow: var(--shadow-light);
		flex-shrink: 0;
	}

	.recipes-list.is-dragging {
		user-select: none;
		-webkit-user-select: none;
	}

	@media (max-width: 900px) {
		.recipes-list {
			width: 100%;
			max-height: none;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
		}
	}

	@media (max-width: 480px) {
		.recipes-list {
			padding: 0.75rem;
			gap: 0.4rem;
		}
	}
</style>

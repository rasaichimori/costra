export const DRAG_THRESHOLD_PX = 5;

export type DragPosition = { left: number; top: number; width: number };

export const startDrag = (
	e: MouseEvent,
	onMove: (e: MouseEvent) => void,
	onUp: (e: MouseEvent) => void
) => {
	e.preventDefault();

	const onPointerUp = (e: MouseEvent) => {
		window.removeEventListener('pointermove', onMove);
		onUp(e);
		window.removeEventListener('pointerup', onPointerUp);
	};

	window.addEventListener('pointermove', onMove);
	window.addEventListener('pointerup', onPointerUp);
};

export const disableTextSelection = () => {
	document.body.style.userSelect = 'none';
	document.body.style.webkitUserSelect = 'none';
};

export const restoreTextSelection = () => {
	document.body.style.userSelect = '';
	document.body.style.webkitUserSelect = '';
	window.getSelection()?.removeAllRanges();
};

export const clampDragTop = (top: number, minTop: number, maxTop: number): number =>
	Math.min(Math.max(top, minTop), maxTop);

export const getVerticalDragBounds = (
	firstTop: number,
	lastBottom: number,
	draggedHeight: number
): { minTop: number; maxTop: number } => {
	const minTop = firstTop;
	const maxTop = Math.max(minTop, lastBottom - draggedHeight);
	return { minTop, maxTop };
};

export const getDropIndexFromY = (
	clientY: number,
	itemIds: string[],
	draggedId: string | null,
	getElement: (id: string, isDragged: boolean) => HTMLElement | undefined
): number => {
	for (let i = 0; i < itemIds.length; i++) {
		const id = itemIds[i];
		const el = getElement(id, id === draggedId);
		if (!el) continue;

		const rect = el.getBoundingClientRect();
		if (clientY < rect.top + rect.height / 2) {
			return i;
		}
	}

	return itemIds.length;
};

export const handleVerticalListPointerDown = (options: {
	e: PointerEvent;
	itemId: string;
	itemIds: string[];
	getElement: (id: string, isDragged: boolean) => HTMLElement | undefined;
	onSelect: () => void;
	onReorder: (fromIndex: number, toIndex: number) => void;
	setDraggingId: (id: string | null) => void;
	setDragPosition: (position: DragPosition | null) => void;
	setDragDimensions: (dimensions: { width: number; height: number } | null) => void;
	setHoverIndex: (index: number | null) => void;
	reorderable?: boolean;
}) => {
	const {
		e,
		itemId,
		itemIds,
		getElement,
		onSelect,
		onReorder,
		setDraggingId,
		setDragPosition,
		setDragDimensions,
		setHoverIndex,
		reorderable = true
	} = options;

	if (!reorderable || itemIds.length < 2) {
		onSelect();
		return;
	}

	onSelect();
	e.preventDefault();
	disableTextSelection();

	const startX = e.clientX;
	const startY = e.clientY;
	const fromIdx = itemIds.indexOf(itemId);
	let isDragging = false;
	let hoverIdx = fromIdx;
	let grabOffsetY = 0;
	let fixedLeft = 0;
	let dragWidth = 0;
	let minTop = 0;
	let maxTop = Infinity;

	const clearDragState = () => {
		setDraggingId(null);
		setDragPosition(null);
		setDragDimensions(null);
		setHoverIndex(null);
	};

	const onMove = (moveEvent: PointerEvent) => {
		if (!isDragging) {
			const dx = moveEvent.clientX - startX;
			const dy = moveEvent.clientY - startY;
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

			const itemEl = getElement(itemId, false);
			if (!itemEl) return;

			const rect = itemEl.getBoundingClientRect();
			grabOffsetY = moveEvent.clientY - rect.top;
			fixedLeft = rect.left;
			dragWidth = rect.width;

			const firstEl = getElement(itemIds[0], false);
			const lastEl = getElement(itemIds[itemIds.length - 1], false);
			const firstTop = firstEl ? firstEl.getBoundingClientRect().top : rect.top;
			const lastBottom = lastEl ? lastEl.getBoundingClientRect().bottom : rect.bottom;
			({ minTop, maxTop } = getVerticalDragBounds(firstTop, lastBottom, rect.height));

			isDragging = true;
			setDraggingId(itemId);
			setDragDimensions({ width: rect.width, height: rect.height });
			setHoverIndex(fromIdx);
			window.getSelection()?.removeAllRanges();
		}

		moveEvent.preventDefault();
		setDragPosition({
			left: fixedLeft,
			top: clampDragTop(moveEvent.clientY - grabOffsetY, minTop, maxTop),
			width: dragWidth
		});

		const nextHoverIdx = getDropIndexFromY(moveEvent.clientY, itemIds, itemId, getElement);
		if (nextHoverIdx !== hoverIdx) {
			hoverIdx = nextHoverIdx;
			setHoverIndex(hoverIdx);
		}
	};

	const onUp = () => {
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', onUp);
		restoreTextSelection();

		if (isDragging) {
			if (hoverIdx !== fromIdx) {
				onReorder(fromIdx, hoverIdx);
			}
			clearDragState();
		}
	};

	window.addEventListener('pointermove', onMove);
	window.addEventListener('pointerup', onUp);
};

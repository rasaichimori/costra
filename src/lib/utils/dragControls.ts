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

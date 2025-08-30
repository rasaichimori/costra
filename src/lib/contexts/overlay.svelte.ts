import { getContext, setContext, type Component } from 'svelte';

/** A unique key used with Svelte's setContext/getContext for overlay handling. */
export const OVERLAY_KEY = Symbol('overlay');

export type OverlayComponent<P, R> = Component<P & { onclose?: (value?: R) => void }>;

/** Internal representation of a single overlay in the stack. */
export interface OverlayEntry<P, R> {
	/** The unique identifier for the overlay. */
	id: string;
	/** The component to render. */
	component: OverlayComponent<P, R>;
	/** The props to pass to the component. */
	props: P;
}

/** An Array that contains all the open overlays */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const overlays = $state<OverlayEntry<any, any>[]>([]);

/**
 * Creates the overlay API (openOverlay, closeOverlay, overlays) and registers
 * it on the current component's context. Call this once in an
 * OverlayProvider-style component.
 */
export const createOverlayContext = () => {
	// Open a new overlay by supplying the component constructor and its props.
	const openOverlay = <P, R>(component: OverlayComponent<P, R>, props: P): void => {
		overlays.push({
			id: crypto.randomUUID(),
			component,
			props
		});
	};

	// Close the topmost overlay (default) or a specific overlay by id. All
	// overlays above the target index will be closed as well (cascade).
	const closeOverlay = (id?: string): void => {
		if (!overlays.length) return;
		const idx = id ? overlays.findIndex((e) => e.id === id) : overlays.length - 1;
		if (idx === -1) return;
		// Remove the target overlay and everything above it (cascade close)
		overlays.splice(idx);
	};

	const api = { openOverlay, closeOverlay, overlays } as const;
	setContext(OVERLAY_KEY, api);
	return api;
};

/**
 * Retrieve the overlay API from context. Useful inside consumer components.
 * Throws if used outside of a provider.
 */
export const getOverlayContext = () =>
	getContext<ReturnType<typeof createOverlayContext>>(OVERLAY_KEY);

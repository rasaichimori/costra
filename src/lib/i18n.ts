import { localizeHref } from '$lib/paraglide/runtime';

/** Localize an internal app path for the current locale. */
export const localPath = (path: string) => localizeHref(path);

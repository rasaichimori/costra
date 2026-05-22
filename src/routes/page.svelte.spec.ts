import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestProviders from './TestProviders.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(TestProviders);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});

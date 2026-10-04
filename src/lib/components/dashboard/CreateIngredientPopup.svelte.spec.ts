import { page } from '@vitest/browser/context';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { overlays } from '$lib/contexts/overlay.svelte';
import CreateIngredientCategoryHarness from './CreateIngredientCategoryHarness.svelte';

describe('create ingredient category dropdown', () => {
	afterEach(() => {
		overlays.splice(0);
	});

	it('selects a category when an option in the dropdown is clicked', async () => {
		render(CreateIngredientCategoryHarness);

		const dialog = page.getByRole('heading', { name: 'Create Ingredient' });
		await expect.element(dialog).toBeInTheDocument();

		const categoryInput = page.getByRole('textbox').nth(1);
		await categoryInput.click();
		await page.getByRole('button', { name: 'Dry', exact: true }).click();

		await expect.element(categoryInput).toHaveValue('Dry');
		await expect.element(dialog).toBeInTheDocument();
	});
});

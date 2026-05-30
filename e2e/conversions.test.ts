import { expect, test } from '@playwright/test';
import { setupDashboardWithExampleData } from './helpers';

test.describe('conversions tab', () => {
	test('saves edited conversion factor to localStorage', async ({ page }) => {
		await setupDashboardWithExampleData(page);
		await page.goto('/conversions', { waitUntil: 'networkidle' });
		await expect(page.getByText('Unit Conversions')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('.ingredient-group')).toHaveCount(4, { timeout: 15000 });

		const butterGroup = page
			.locator('.ingredient-group')
			.filter({ has: page.locator('.ingredient-name', { hasText: 'Butter' }) });
		const factorInput = butterGroup.locator('.conversion-part').first().getByRole('textbox');
		await factorInput.fill('28');
		await factorInput.blur();

		const saveButton = page.getByRole('button', { name: 'Save unit conversions' });
		await expect(saveButton).toBeEnabled();
		await saveButton.click();
		await expect(page.getByText('Unsaved changes')).not.toBeVisible();

		await page.reload();

		const stored = await page.evaluate(() => localStorage.getItem('costra_app_data'));
		expect(stored).toBeTruthy();
		const parsed = JSON.parse(stored!) as {
			unitConversions: { ingredientId: string; conversionFactor: number }[];
		};
		const butterConversion = parsed.unitConversions.find((c) => c.ingredientId === 'butter');
		expect(butterConversion?.conversionFactor).toBe(28);

		const reloadedInput = page
			.locator('.ingredient-group')
			.filter({ has: page.locator('.ingredient-name', { hasText: 'Butter' }) })
			.locator('.conversion-part')
			.first()
			.getByRole('textbox');
		await expect(reloadedInput).toHaveValue('28');
	});
});

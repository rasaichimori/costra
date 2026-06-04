import { expect, test } from '@playwright/test';
import { gotoDashboard } from './helpers';

test.describe('dashboard workflows', () => {
	test('loads example data and shows recipe costs', async ({ page }) => {
		await gotoDashboard(page);

		await expect(page.getByRole('button', { name: 'Vanilla Cake' })).toBeVisible();
		await page.getByRole('button', { name: 'Vanilla Cake' }).click();

		const costAmount = page.locator('.cost-amount');
		await expect(costAmount).toBeVisible();
		await expect(costAmount).not.toHaveText(/¥0$/);
	});

	test('updates recipe cost when an ingredient price changes', async ({ page }) => {
		await gotoDashboard(page);
		await page.getByRole('button', { name: 'Vanilla Cake' }).click();

		const costAmount = page.locator('.cost-amount');
		const initialCost = await costAmount.textContent();

		const flourRow = page.locator('tr.cost-row').filter({ hasText: 'Flour' });
		const flourCostInput = flourRow.locator('.cost-cell input');
		await flourCostInput.fill('4000');
		await flourCostInput.blur();
		await page.waitForTimeout(400);

		await expect(costAmount).not.toHaveText(initialCost ?? '');
	});

	test('imports data from settings', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('costra_welcome_choice', 'blank');
			localStorage.removeItem('costra_app_data');
		});
		await page.goto('/settings');

		const importPayload = {
			costs: {
				flour: {
					id: 'flour',
					name: 'Flour',
					category: 'dry',
					color: '#ffffff',
					product: { cost: 100, amount: 1000, unit: 'g' }
				}
			},
			recipes: {
				cake: {
					id: 'cake',
					name: 'Imported Cake',
					ingredients: [{ id: 'flour', portion: { amount: 100, unit: 'g' }, hidden: false }]
				}
			}
		};

		await page.getByRole('button', { name: 'Import Data' }).click();
		await page.locator('.import-modal textarea').fill(JSON.stringify(importPayload));
		await page.locator('.import-modal').getByRole('button', { name: 'Load' }).click();
		await expect(page.locator('.import-modal')).toHaveCount(0);

		await page.getByRole('button', { name: 'Dashboard' }).click();
		await expect(page.getByRole('button', { name: 'Imported Cake' })).toBeVisible();
	});

	test('duplicates a recipe below the original', async ({ page }) => {
		await gotoDashboard(page);
		await page.getByRole('button', { name: 'Vanilla Cake' }).click();

		await page.getByRole('button', { name: 'Duplicate recipe' }).click();

		await expect(page.getByRole('button', { name: 'Vanilla Cake - copy' })).toBeVisible();
		const header = page.locator('.recipe-cost-calculator .header');
		await expect(header.getByRole('textbox', { name: 'Edit ingredient name' })).toBeVisible();
		await expect(header.getByRole('button', { name: 'Save name' })).toBeVisible();

		const recipeButtons = page.locator('.recipes-list').first().getByRole('button');
		const labels = await recipeButtons.allTextContents();
		const vanillaIndex = labels.findIndex(
			(label) => label.includes('Vanilla Cake') && !label.includes('copy')
		);
		const copyIndex = labels.findIndex((label) => label.includes('Vanilla Cake - copy'));
		expect(copyIndex).toBe(vanillaIndex + 1);
	});

	test('duplicates a compound ingredient below the original', async ({ page }) => {
		await gotoDashboard(page);
		await page.getByRole('button', { name: 'Cake Mix' }).click();

		await page.getByRole('button', { name: 'Duplicate ingredient' }).click();

		await expect(page.getByRole('button', { name: 'Cake Mix - copy' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Edit ingredient name' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Save name' })).toBeVisible();

		const compoundButtons = page.locator('.recipes-list').nth(1).getByRole('button');
		const labels = await compoundButtons.allTextContents();
		const mixIndex = labels.findIndex(
			(label) => label.includes('Cake Mix') && !label.includes('copy')
		);
		const copyIndex = labels.findIndex((label) => label.includes('Cake Mix - copy'));
		expect(copyIndex).toBe(mixIndex + 1);
	});

	test('shows correct portion amount when switching recipes that share an ingredient', async ({
		page
	}) => {
		await gotoDashboard(page);
		const recipePanel = page.locator('.recipes').first();

		await recipePanel.getByRole('button', { name: 'Vanilla Cake' }).click();
		const flourAmount = recipePanel
			.locator('.ingredient-cost-item')
			.filter({ hasText: /Flour/i })
			.locator('.amount-input-group input');
		await expect(flourAmount).toHaveValue('250');

		await recipePanel.getByRole('button', { name: 'Duplicate recipe' }).click();
		await flourAmount.fill('999');
		await flourAmount.blur();

		await recipePanel.getByRole('button', { name: 'Vanilla Cake', exact: true }).click();
		await expect(flourAmount).toHaveValue('250');
	});

	test('undoes an ingredient price change', async ({ page }) => {
		await gotoDashboard(page);
		await page.getByRole('button', { name: 'Vanilla Cake' }).click();

		const flourRow = page.locator('tr.cost-row').filter({ hasText: 'Flour' });
		const flourCostInput = flourRow.locator('.cost-cell input');
		const originalCost = await flourCostInput.inputValue();

		await flourCostInput.fill('9999');
		await flourCostInput.blur();
		await page.waitForTimeout(500);

		await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();
		await page.getByRole('button', { name: 'Undo' }).click();
		await expect(flourCostInput).toHaveValue(originalCost);
	});
});

test.describe('settings workflows', () => {
	test('loads example data from settings', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('costra_welcome_choice', 'blank');
			localStorage.removeItem('costra_app_data');
		});
		await page.goto('/settings');

		await page.getByRole('button', { name: 'Load Example Data' }).click();
		await page.getByRole('button', { name: 'Dashboard' }).click();

		await expect(page.getByRole('button', { name: 'Chocolate Cake' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Vanilla Cake' })).toBeVisible();
	});
});

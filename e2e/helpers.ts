import type { Page } from '@playwright/test';
import { mockData } from '../src/lib/data/mockData';

export const setupDashboardWithExampleData = async (page: Page) => {
	const appData = {
		costs: mockData.costs,
		recipes: mockData.recipes,
		compoundIngredients: mockData.compoundIngredients,
		unitConversions: mockData.unitConversions,
		customUnitLabels: mockData.unitLabels
	};

	await page.addInitScript((data) => {
		localStorage.setItem('costra_welcome_choice', 'prefilled');
		localStorage.setItem('costra_app_data', JSON.stringify(data));
	}, appData);
};

export const gotoDashboard = async (page: Page) => {
	await setupDashboardWithExampleData(page);
	await page.goto('/dashboard');
};

export const gotoSettings = async (page: Page) => {
	await setupDashboardWithExampleData(page);
	await page.goto('/settings');
};

export const gotoConversions = async (page: Page) => {
	await setupDashboardWithExampleData(page);
	await page.goto('/conversions');
};

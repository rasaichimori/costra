import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	clearAppData,
	hasSavedData,
	loadAppData,
	saveAppData,
	type AppData
} from '$lib/utils/localStorage';

vi.mock('$app/environment', () => ({
	browser: true
}));

const createStorage = () => {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		}
	};
};

const sampleData: AppData = {
	costs: {
		flour: {
			id: 'flour',
			name: 'Flour',
			category: 'dry',
			product: { cost: 100, amount: 1000, unit: 'g' },
			color: '#ffffff'
		}
	},
	compoundIngredients: {},
	recipes: {
		cake: {
			id: 'cake',
			name: 'Cake',
			ingredients: [{ id: 'flour', portion: { amount: 100, unit: 'g' }, hidden: false }]
		}
	},
	customUnitLabels: {},
	unitConversions: []
};

describe('localStorage app data', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', createStorage());
	});

	it('returns false when no data is saved', () => {
		expect(hasSavedData()).toBe(false);
		expect(loadAppData()).toBeNull();
	});

	it('saves and loads app data', () => {
		saveAppData(sampleData);
		expect(hasSavedData()).toBe(true);
		expect(loadAppData()).toEqual(sampleData);
	});

	it('clears saved app data', () => {
		saveAppData(sampleData);
		clearAppData();
		expect(hasSavedData()).toBe(false);
		expect(loadAppData()).toBeNull();
	});

	it('returns null for corrupt JSON', () => {
		localStorage.setItem('costra_app_data', '{not-json');
		expect(loadAppData()).toBeNull();
	});
});

describe('localStorage when browser is false', () => {
	it('no-ops save, load, clear, and hasSavedData', async () => {
		vi.resetModules();
		vi.doMock('$app/environment', () => ({ browser: false }));

		const { saveAppData, loadAppData, clearAppData, hasSavedData } = await import(
			'$lib/utils/localStorage'
		);

		saveAppData(sampleData);
		expect(loadAppData()).toBeNull();
		expect(hasSavedData()).toBe(false);
		clearAppData();
	});
});

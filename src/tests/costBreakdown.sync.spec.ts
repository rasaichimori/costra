/* eslint-disable @typescript-eslint/no-explicit-any */
import CostBreakdown from '$lib/components/dashboard/CostBreakdown.svelte';
import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
import { mount } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

// Mock Chart.js with controllable visibility state
const instances: MockChart[] = [];
class MockChart {
	public data: any;
	public options: any;
	private visibility: boolean[];
	constructor(_ctx: HTMLCanvasElement, cfg: any) {
		this.data = cfg.data;
		this.options = cfg.options;
		// assume first dataset length
		const len = (cfg.data.datasets[0].data as any[]).length;
		this.visibility = new Array(len).fill(true);
		instances.push(this);
	}
	isDatasetVisible(idx: number) {
		return this.visibility[idx];
	}
	toggleDataVisibility(idx: number) {
		this.visibility[idx] = !this.visibility[idx];
	}
	setDatasetVisibility(idx: number, val: boolean) {
		this.visibility[idx] = val;
	}
	update() {}
	resize() {}
	destroy() {}
}

vi.mock('chart.js/auto', () => ({
	Chart: MockChart,
	default: MockChart
}));

function sampleData() {
	const costs: Record<string, IngredientDoc> = {
		flour: {
			id: 'flour',
			name: 'Flour',
			category: '',
			product: { cost: 100, amount: 1000, unit: 'g' }
		},
		sugar: {
			id: 'sugar',
			name: 'Sugar',
			category: '',
			product: { cost: 80, amount: 1000, unit: 'g' }
		}
	} as any;
	const recipe: RecipeDoc = {
		id: 'r1',
		name: 'Cake',
		ingredients: [
			{ id: 'flour', portion: { amount: 100, unitId: 'g' }, hidden: false },
			{ id: 'sugar', portion: { amount: 50, unitId: 'g' }, hidden: false }
		]
	};
	return { recipe, costs };
}

describe('CostBreakdown visibility sync', () => {
	it('updates chart visibility when ingredient.hidden changes', async () => {
		const { recipe, costs } = sampleData();
		mount(CostBreakdown, { target: document.body, props: { recipe, costs } });

		// hide first ingredient via model
		recipe.ingredients[0].hidden = true;
		recipe.ingredients = [...recipe.ingredients];
		await Promise.resolve();

		const chart = instances[0];
		expect(chart.isDatasetVisible(0)).toBe(false);
	});
});

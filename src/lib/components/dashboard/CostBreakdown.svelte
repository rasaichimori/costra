<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import type { Chart, ChartData, ChartOptions } from 'chart.js';
	import { calculateRecipeCosts } from '$lib/utils/costCalculatorUtils';

	function indexToHexColour(idx: number, total: number): string {
		const hue = (idx * 360) / total;
		const s = 0.7;
		const l = 0.6;
		const a = s * Math.min(l, 1 - l);
		const f = (n: number) => {
			const k = (n + hue / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0');
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	}

	import { Chart as ChartJS } from 'chart.js/auto';

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
	}

	let { recipe, costs }: Props = $props();

	// Derived recipeCosts and colors
	const recipeCosts = $derived(calculateRecipeCosts(recipe, costs));

	const colors = $derived(
		recipe.ingredients.map(
			(ing, idx) => ing.color ?? indexToHexColour(idx, recipe.ingredients.length)
		)
	);

	let canvas: HTMLCanvasElement;
	let chart = $state<Chart<'doughnut'> | undefined>(undefined);

	async function createChart() {
		const labels = Object.keys(recipeCosts).map((id) => costs[id]?.name ?? id);
		const data = Object.keys(recipeCosts).map((id) => recipeCosts[id]);

		const chartData: ChartData<'doughnut'> = {
			labels,
			datasets: [
				{
					data,
					backgroundColor: colors
				}
			]
		};

		const options: ChartOptions<'doughnut'> = {
			responsive: true,
			plugins: {
				legend: { position: 'bottom' }
			},
			maintainAspectRatio: false
		};

		chart = new ChartJS(canvas, { type: 'doughnut', data: chartData, options });

		const resize = () => chart?.resize();
		window.addEventListener('resize', resize);
		onDestroy(() => {
			window.removeEventListener('resize', resize);
			chart?.destroy();
		});
	}

	$effect(() => {
		if (!chart) return;
		const labels = Object.keys(recipeCosts).map((id) => costs[id]?.name ?? id);
		chart.data.labels = labels;
		chart.data.datasets[0].data = Object.keys(recipeCosts).map((id) => recipeCosts[id]);
		chart.data.datasets[0].backgroundColor = colors;
		chart.update();
	});

	onMount(createChart);
</script>

<div class="chart-wrapper">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-wrapper {
		width: 100%;
		max-width: 400px;
		margin: auto;
		position: relative;
		/* set height to keep ratio when maintainAspectRatio is false */
		aspect-ratio: 1 / 1;
	}

	canvas {
		width: 100% !important;
		height: 100% !important;
	}
</style>

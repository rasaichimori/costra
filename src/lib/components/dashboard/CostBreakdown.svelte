<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import type { Chart, ChartData, ChartOptions, Plugin } from 'chart.js';
	import { calculateRecipeCosts } from '$lib/utils/costCalculatorUtils';

	import { Chart as ChartJS } from 'chart.js/auto';

	// Custom plugin to render labels (ingredient name inside segment and percentage outside)
	const labelPlugin: Plugin<'doughnut'> = {
		id: 'labels',
		afterDatasetsDraw(chart) {
			const meta = chart.getDatasetMeta(0);
			if (!meta || !meta.data) return;
			const total = (chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
			const ctx = chart.ctx;
			const minPercentForName = 5; // below this only show %
			ctx.save();
			(meta.data as any[]).forEach((arc, idx) => {
				const ing = recipe.ingredients[idx];
				if (!ing || ing.hidden) return; // skip hidden
				const value = chart.data.datasets[0].data[idx] as number;
				const percent = (value / total) * 100;
				const center = arc.getCenterPoint();
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = '#ffffff';
				ctx.font = '12px sans-serif';
				if (percent >= minPercentForName) {
					const labelsArr = (chart.data.labels ?? []) as unknown as string[];
					ctx.fillText(labelsArr[idx] ?? '', center.x, center.y - 6);
				}
				// Always show percentage below (smaller font)
				ctx.font = '10px sans-serif';
				ctx.fillStyle = '#dddddd';
				ctx.fillText(`${Math.round(percent)}%`, center.x, center.y + 8);
			});
			ctx.restore();
		}
	};

	// Register plugin once (Chart.js ignores duplicates)
	ChartJS.register(labelPlugin);

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
	}

	let { recipe = $bindable(), costs }: Props = $props();

	// Derived recipeCosts and colors
	const recipeCosts = $derived(calculateRecipeCosts(recipe, costs));

	// Helper to access all ingredient names in recipe order
	const labelsAll = $derived(recipe.ingredients.map((ing) => costs[ing.id].name));

	// Data array reflecting hidden visibility (0 when hidden)
	const chartDataValues = $derived(
		recipe.ingredients.map((ing) => (ing.hidden ? 0 : (recipeCosts[ing.id] ?? 0)))
	);

	const colors = $derived(recipe.ingredients.map((ing) => costs[ing.id].color));

	let canvas: HTMLCanvasElement;
	let chart = $state<Chart<'doughnut'> | undefined>(undefined);

	// Unified visibility sync helper
	const syncVisibility = (idx: number, hidden: boolean) => {
		if (!chart) return;
		const meta = chart.getDatasetMeta(0);
		const element = meta.data[idx];
		if (element && element.options) {
			element.options.hidden = hidden;
			console.log(element.options.hidden);
			chart.update();
		}
		if (recipe.ingredients[idx]) {
			// avoid triggering needless updates if already same
			if (recipe.ingredients[idx].hidden !== hidden) {
				recipe.ingredients[idx].hidden = hidden;
			}
		}
	};

	async function createChart() {
		const labels = labelsAll;
		const data = chartDataValues;

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
				legend: {
					position: 'bottom',
					onClick: (_e, legendItem, legend) => {
						const index = legendItem.index;
						if (index === undefined) return;
						const meta = legend.chart.getDatasetMeta(0);
						const element = meta.data[index];
						const newHidden = !(element.options?.hidden ?? false);
						syncVisibility(index, newHidden);
					},

					labels: {
						generateLabels: function (chart) {
							const data = chart.data;
							if (data.labels && data.labels.length && data.datasets.length) {
								return data.labels.map((label, i) => {
									const meta = chart.getDatasetMeta(0);
									const style = meta.controller.getStyle(i, false);
									const isHidden = meta.data[i].options?.hidden;

									return {
										text: String(label), // Ensure string type
										fillStyle: style.backgroundColor,
										strokeStyle: style.borderColor,
										lineWidth: style.borderWidth,
										hidden: isHidden,
										index: i,
										fontStyle: isHidden ? 'italic' : 'normal',
										fontColor: isHidden ? '#999999' : '#666666' // Use specific color strings
									};
								});
							}
							return [];
						}
					}
				},
				tooltip: {
					displayColors: false,
					callbacks: {
						title: () => [],
						label: (context) => {
							const dataset = context.dataset.data as number[];
							const total = dataset.reduce((a, b) => (a as number) + (b as number), 0 as number);
							const percent = ((context.parsed as number) / total) * 100;
							const showName = percent < 5; // name only if slice too small to display
							const yen = `¥${(context.parsed as number).toFixed(0)}`;
							return showName ? `${context.label}: ${yen}` : yen;
						}
					}
				}
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
		const labels = labelsAll;
		chart.data.labels = labels;
		chart.data.datasets[0].data = chartDataValues;
		chart.data.datasets[0].backgroundColor = colors;
		chart.update();
	});

	// Watch for ingredient.hidden changes coming from UI (eye button)
	$effect(() => {
		if (!chart) return;
		recipe.ingredients.forEach((ing, idx) => {
			syncVisibility(idx, ing.hidden);
		});
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

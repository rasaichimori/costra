<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeIngredientEntry,
		UnitConversion
	} from '$lib/data/schema';
	import type { ArcElement, Chart, ChartData, ChartOptions, Plugin } from 'chart.js';
	import { calculateRecipeCosts, getAllCosts } from '$lib/utils/costCalculatorUtils';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';

	import { Chart as ChartJS } from 'chart.js/auto';

	const createLabelPlugin = (
		getIngredientList: () => RecipeIngredientEntry[]
	): Plugin<'doughnut'> => ({
		id: 'labels',
		afterDatasetsDraw(chart) {
			const meta = chart.getDatasetMeta(0);
			if (!meta || !meta.data) return;
			const total = (chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
			const ctx = chart.ctx;
			const minPercentForName = 5;
			const ingredientList = getIngredientList();

			const getContrast = (hex: string) => {
				if (!hex) return '#000000';
				const normalized = hex.replace('#', '');
				const bigint = parseInt(normalized, 16);
				const r = (bigint >> 16) & 255;
				const g = (bigint >> 8) & 255;
				const b = bigint & 255;
				const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
				return luminance > 0.6 ? '#000000' : '#ffffff';
			};

			ctx.save();
			(meta.data as ArcElement[]).forEach((arc, idx) => {
				const ing = ingredientList[idx];
				if (!ing || ing.hidden) return;
				const value = chart.data.datasets[0].data[idx] as number;
				const percent = (value / total) * 100;
				const center = arc.getCenterPoint(true);
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				const bgColor = (chart.data.datasets[0].backgroundColor as string[])[idx];
				const textColor = getContrast(bgColor);
				ctx.fillStyle = textColor;
				ctx.font = '12px sans-serif';
				if (percent >= minPercentForName) {
					const labelsArr = (chart.data.labels ?? []) as unknown as string[];
					ctx.fillText(labelsArr[idx] ?? '', center.x, center.y - 6);
				}
				ctx.font = '10px sans-serif';
				ctx.fillStyle = textColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
				ctx.fillText(`${Math.round(percent)}%`, center.x, center.y + 8);
			});
			ctx.restore();
		}
	});

	interface Props {
		ingredients: RecipeIngredientEntry[];
		chartId: string;
		costs: Record<string, IngredientDoc>;
		compounds?: Record<string, CompoundIngredientDoc>;
		unitConversions: UnitConversion[];
	}

	let { ingredients = $bindable(), chartId, costs, compounds, unitConversions }: Props = $props();
	const currencyContext = getCurrencyContext();

	const allCosts = $derived(getAllCosts(costs, compounds ?? {}, unitConversions));

	const recipeCosts = $derived(
		calculateRecipeCosts({ id: chartId, ingredients }, allCosts, unitConversions)
	);

	const labelsAll = $derived(ingredients.map((ing) => allCosts[ing.id]?.name ?? ''));

	const chartDataValues = $derived(
		ingredients.map((ing) => (ing.hidden ? 0 : (recipeCosts[ing.id] ?? 0)))
	);

	const colors = $derived(ingredients.map((ing) => allCosts[ing.id]?.color ?? '#000000'));

	type DoughnutChart = Chart<'doughnut'> & { __chartId?: string };

	let canvas: HTMLCanvasElement;
	let chart = $state<DoughnutChart | undefined>(undefined);
	let resizeHandler: (() => void) | null = null;

	const syncVisibility = (idx: number, hidden: boolean) => {
		if (!chart) return;
		const meta = chart.getDatasetMeta(0);
		const element = meta.data[idx];
		if (element && element.options) {
			element.options.hidden = hidden;
			chart.update();
		}
		if (ingredients[idx]) {
			if (ingredients[idx].hidden !== hidden) {
				ingredients[idx].hidden = hidden;
			}
		}
	};

	const createChart = () => {
		if (chart) {
			if (resizeHandler) {
				window.removeEventListener('resize', resizeHandler);
			}
			chart.destroy();
		}

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

		const labelPlugin = createLabelPlugin(() => ingredients);

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
										text: String(label),
										fillStyle: style.backgroundColor,
										strokeStyle: style.borderColor,
										lineWidth: style.borderWidth,
										hidden: isHidden,
										index: i,
										fontStyle: isHidden ? 'italic' : 'normal',
										fontColor: isHidden ? '#999999' : '#666666'
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
							const showName = percent < 5;
							const currency = `${currencyContext.currency}${(context.parsed as number).toFixed(0)}`;
							return showName ? `${context.label}: ${currency}` : currency;
						}
					}
				}
			},
			maintainAspectRatio: false
		};

		chart = new ChartJS(canvas, {
			type: 'doughnut',
			data: chartData,
			options,
			plugins: [labelPlugin]
		});

		chart.__chartId = chartId;

		resizeHandler = () => chart?.resize();
		window.addEventListener('resize', resizeHandler);
	};

	$effect(() => {
		if (!chart) return;
		const labels = labelsAll;
		const data = chartDataValues;
		const bgColors = colors;

		const currentChartId = chartId;
		const storedChartId = chart.__chartId;

		if (storedChartId !== currentChartId) {
			createChart();
			return;
		}

		chart.data.labels = labels;
		chart.data.datasets[0].data = data;
		chart.data.datasets[0].backgroundColor = bgColors;
		chart.update('active');
	});

	$effect(() => {
		if (!chart) return;
		ingredients.forEach((ing, idx) => {
			syncVisibility(idx, ing.hidden);
		});
	});

	onMount(() => {
		createChart();
		return () => {
			if (resizeHandler) {
				window.removeEventListener('resize', resizeHandler);
			}
			chart?.destroy();
		};
	});
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
		aspect-ratio: 1 / 1;
	}

	canvas {
		width: 100% !important;
		height: 100% !important;
	}

	@media (max-width: 768px) {
		.chart-wrapper {
			max-width: 300px;
		}
	}

	@media (max-width: 480px) {
		.chart-wrapper {
			max-width: 250px;
		}
	}
</style>

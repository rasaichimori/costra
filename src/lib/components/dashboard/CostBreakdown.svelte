<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import type { Chart, ChartData, ChartOptions, Plugin } from 'chart.js';
	import {
		calculateRecipeCosts,
		compoundsToIngredients,
		getAllCosts
	} from '$lib/utils/costCalculatorUtils';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';

	import { Chart as ChartJS } from 'chart.js/auto';

	// Helper function to create label plugin with current recipe reference
	const createLabelPlugin = (currentRecipe: RecipeDoc): Plugin<'doughnut'> => ({
		id: 'labels',
		afterDatasetsDraw(chart) {
			const meta = chart.getDatasetMeta(0);
			if (!meta || !meta.data) return;
			const total = (chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
			const ctx = chart.ctx;
			const minPercentForName = 5; // below this only show %

			// util to pick black/white based on bg
			const getContrast = (hex: string) => {
				if (!hex) return '#000000';
				const normalized = hex.replace('#', '');
				const bigint = parseInt(normalized, 16);
				const r = (bigint >> 16) & 255;
				const g = (bigint >> 8) & 255;
				const b = bigint & 255;
				// relative luminance
				const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
				return luminance > 0.6 ? '#000000' : '#ffffff';
			};

			ctx.save();
			(meta.data as any[]).forEach((arc, idx) => {
				const ing = currentRecipe.ingredients[idx];
				if (!ing || ing.hidden) return; // skip hidden
				const value = chart.data.datasets[0].data[idx] as number;
				const percent = (value / total) * 100;
				const center = arc.getCenterPoint();
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
				// Always show percentage below (smaller font)
				ctx.font = '10px sans-serif';
				ctx.fillStyle = textColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
				ctx.fillText(`${Math.round(percent)}%`, center.x, center.y + 8);
			});
			ctx.restore();
		}
	});

	interface Props {
		recipe: RecipeDoc;
		costs: Record<string, IngredientDoc>;
		compounds?: Record<string, CompoundIngredientDoc>;
		unitConversions: UnitConversion[];
	}

	let { recipe = $bindable(), costs, compounds, unitConversions }: Props = $props();
	const currencyContext = getCurrencyContext();

	// Merge costs and compounds into a single record
	const allCosts = $derived(getAllCosts(costs, compounds ?? {}, unitConversions));

	// Derived recipeCosts using merged costs (includes compounds)
	const recipeCosts = $derived(calculateRecipeCosts(recipe, allCosts, unitConversions));

	// Helper to access all ingredient names in recipe order
	const labelsAll = $derived(recipe.ingredients.map((ing) => allCosts[ing.id]?.name ?? ''));

	// Data array reflecting hidden visibility (0 when hidden)
	const chartDataValues = $derived(
		recipe.ingredients.map((ing) => (ing.hidden ? 0 : (recipeCosts[ing.id] ?? 0)))
	);

	const colors = $derived(recipe.ingredients.map((ing) => allCosts[ing.id]?.color ?? '#000000'));

	let canvas: HTMLCanvasElement;
	let chart = $state<Chart<'doughnut'> | undefined>(undefined);
	let resizeHandler: (() => void) | null = null;

	// Unified visibility sync helper
	const syncVisibility = (idx: number, hidden: boolean) => {
		if (!chart) return;
		const meta = chart.getDatasetMeta(0);
		const element = meta.data[idx];
		if (element && element.options) {
			element.options.hidden = hidden;
			chart.update();
		}
		if (recipe.ingredients[idx]) {
			// avoid triggering needless updates if already same
			if (recipe.ingredients[idx].hidden !== hidden) {
				recipe.ingredients[idx].hidden = hidden;
			}
		}
	};

	const createChart = () => {
		// Destroy existing chart if it exists
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

		// Create plugin with current recipe reference
		const labelPlugin = createLabelPlugin(recipe);

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
							const currency = `${currencyContext.currency}${(context.parsed as number).toFixed(0)}`;
							return showName ? `${context.label}: ${currency}` : currency;
						}
					}
				}
			},
			maintainAspectRatio: false
		};

		chart = new ChartJS(canvas, { type: 'doughnut', data: chartData, options, plugins: [labelPlugin] });
		
		// Store recipe ID on chart instance to detect recipe changes
		(chart as any).__recipeId = recipe.id;

		resizeHandler = () => chart?.resize();
		window.addEventListener('resize', resizeHandler);
	}

	$effect(() => {
		if (!chart) return;
		const labels = labelsAll;
		const data = chartDataValues;
		const bgColors = colors;
		
		// Check if recipe reference changed - if so, recreate chart with new plugin
		const currentRecipeId = recipe.id;
		const chartRecipeId = (chart as any).__recipeId;
		
		if (chartRecipeId !== currentRecipeId) {
			// Recipe changed, recreate chart with new plugin
			createChart();
			return;
		}
		
		chart.data.labels = labels;
		chart.data.datasets[0].data = data;
		chart.data.datasets[0].backgroundColor = bgColors;
		chart.update();
	});

	// Watch for ingredient.hidden changes coming from UI (eye button)
	$effect(() => {
		if (!chart) return;
		recipe.ingredients.forEach((ing, idx) => {
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
		/* set height to keep ratio when maintainAspectRatio is false */
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

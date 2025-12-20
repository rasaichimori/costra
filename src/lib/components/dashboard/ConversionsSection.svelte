<script lang="ts">
	import type { CompoundIngredientDoc, IngredientDoc, UnitConversion } from '$lib/data/schema';
	import ConversionIngredientGroup from './ConversionIngredientGroup.svelte';
	import ConversionsEmptyState from './ConversionsEmptyState.svelte';

	let {
		costs,
		compoundIngredients,
		unitConversions = $bindable([]),
		customUnitLabels
	}: {
		costs: Record<string, IngredientDoc>;
		compoundIngredients: Record<string, CompoundIngredientDoc>;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
	} = $props();

	// Track input amounts for each conversion (for display purposes)
	// Key format: "ingredientId-localIndex"
	let inputAmounts = $state<Record<string, number>>({});

	// Get input amount for a conversion (defaults to 1)
	const getInputAmount = (ingredientId: string, localIndex: number): number => {
		const key = `${ingredientId}-${localIndex}`;
		return inputAmounts[key] ?? 1;
	};

	// Get ingredient/compound name by ID
	const getIngredientName = (id: string): string => {
		if (costs[id]) return costs[id].name;
		if (compoundIngredients[id]) return compoundIngredients[id].name;
		return id;
	};

	// Get ingredient/compound color by ID
	const getIngredientColor = (id: string): string => {
		if (costs[id]) return costs[id].color;
		if (compoundIngredients[id]) return compoundIngredients[id].color;
		return '#888888';
	};

	// Group conversions by ingredient
	const groupedConversions = $derived.by(() => {
		const groups = new Map<string, UnitConversion[]>();

		for (const conversion of unitConversions) {
			const existing = groups.get(conversion.ingredientId);
			if (existing) {
				existing.push(conversion);
			} else {
				groups.set(conversion.ingredientId, [conversion]);
			}
		}

		// Convert to array and sort by ingredient name
		return Array.from(groups.entries())
			.map(([ingredientId, conversions]) => ({
				ingredientId,
				ingredientName: getIngredientName(ingredientId),
				color: getIngredientColor(ingredientId),
				conversions
			}))
			.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
	});

	// Find the global index of a conversion
	const findGlobalIndex = (ingredientId: string, localIndex: number): number => {
		let count = 0;
		for (let i = 0; i < unitConversions.length; i++) {
			if (unitConversions[i].ingredientId === ingredientId) {
				if (count === localIndex) return i;
				count++;
			}
		}
		return -1;
	};

	// Update conversion input unit
	const updateInputUnit = (ingredientId: string, localIndex: number, newUnit: string) => {
		const globalIndex = findGlobalIndex(ingredientId, localIndex);
		if (globalIndex !== -1) {
			unitConversions[globalIndex] = {
				...unitConversions[globalIndex],
				inputUnit: newUnit
			};
			unitConversions = unitConversions;
		}
	};

	// Update conversion output unit
	const updateOutputUnit = (ingredientId: string, localIndex: number, newUnit: string) => {
		const globalIndex = findGlobalIndex(ingredientId, localIndex);
		if (globalIndex !== -1) {
			unitConversions[globalIndex] = {
				...unitConversions[globalIndex],
				outputUnit: newUnit
			};
			unitConversions = unitConversions;
		}
	};

	// Update the input amount (display only)
	const updateInputAmount = (ingredientId: string, localIndex: number, newInputAmount: number) => {
		if (newInputAmount > 0) {
			const key = `${ingredientId}-${localIndex}`;
			inputAmounts[key] = newInputAmount;
			inputAmounts = inputAmounts;
		}
	};

	// Update output amount - recalculates conversion factor based on current input amount
	const updateOutputAmount = (
		ingredientId: string,
		localIndex: number,
		newOutputAmount: number
	) => {
		const globalIndex = findGlobalIndex(ingredientId, localIndex);
		if (globalIndex !== -1 && newOutputAmount > 0) {
			const inputAmount = getInputAmount(ingredientId, localIndex);
			const newFactor = newOutputAmount / inputAmount;
			unitConversions[globalIndex] = {
				...unitConversions[globalIndex],
				conversionFactor: newFactor
			};
			unitConversions = unitConversions;
		}
	};

	const deleteConversion = (ingredientId: string, localIndex: number) => {
		const globalIndex = findGlobalIndex(ingredientId, localIndex);
		if (globalIndex !== -1) {
			unitConversions = unitConversions.filter((_, i) => i !== globalIndex);
			const key = `${ingredientId}-${localIndex}`;
			delete inputAmounts[key];
			inputAmounts = inputAmounts;
		}
	};

	// Stats
	const totalConversions = $derived(unitConversions.length);
	const totalIngredients = $derived(groupedConversions.length);
</script>

<div class="conversions-section">
	<div class="section-header">
		<div class="header-info">
			<h3>Unit Conversions</h3>
			<span class="stats">
				{totalConversions} conversion{totalConversions !== 1 ? 's' : ''} across {totalIngredients} ingredient{totalIngredients !==
				1
					? 's'
					: ''}
			</span>
		</div>
	</div>

	{#if groupedConversions.length === 0}
		<ConversionsEmptyState />
	{:else}
		<div class="conversions-grid">
			{#each groupedConversions as group}
				<ConversionIngredientGroup
					ingredientId={group.ingredientId}
					ingredientName={group.ingredientName}
					color={group.color}
					conversions={group.conversions}
					{customUnitLabels}
					getInputAmount={(index) => getInputAmount(group.ingredientId, index)}
					onInputAmountChange={(index, amount) =>
						updateInputAmount(group.ingredientId, index, amount)}
					onOutputAmountChange={(index, amount) =>
						updateOutputAmount(group.ingredientId, index, amount)}
					onInputUnitChange={(index, unit) => updateInputUnit(group.ingredientId, index, unit)}
					onOutputUnitChange={(index, unit) => updateOutputUnit(group.ingredientId, index, unit)}
					onDelete={(index) => deleteConversion(group.ingredientId, index)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.conversions-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid var(--border-primary);
		backdrop-filter: blur(10px);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.header-info h3 {
		margin: 0;
		color: var(--text-primary);
		font-size: 18px;
		font-weight: 600;
	}

	.stats {
		color: var(--text-secondary);
		font-size: 13px;
	}

	.conversions-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>

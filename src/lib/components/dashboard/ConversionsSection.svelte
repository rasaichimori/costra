<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import type { CompoundIngredientDoc, IngredientDoc, UnitConversion } from '$lib/data/schema';
	import ConversionIngredientGroup from './ConversionIngredientGroup.svelte';
	import ConversionsEmptyState from './ConversionsEmptyState.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import { getDataContext } from '$lib/contexts/data.svelte';
	import {
		cloneUnitConversions,
		deleteConversionAt,
		findConversionGlobalIndex,
		getOutputAmount,
		unitConversionsEqual,
		updateConversionAt,
		updateConversionFactorFromDisplayAmounts
	} from '$lib/utils/conversionEditUtils';
	import { m } from '$lib/paraglide/messages.js';

	let {
		costs,
		compoundIngredients,
		customUnitLabels
	}: {
		costs: Record<string, IngredientDoc>;
		compoundIngredients: Record<string, CompoundIngredientDoc>;
		customUnitLabels: Record<string, string>;
	} = $props();

	const data = getDataContext();

	let draftUnitConversions = $state<UnitConversion[]>(cloneUnitConversions(data.unitConversions));
	let hasUnsavedChanges = $state(false);
	let lastSyncedHistoryVersion = $state(data.historyVersion);

	// Resync draft after undo/redo or other persisted changes when the user has no local edits
	$effect(() => {
		const version = data.historyVersion;
		if (version !== lastSyncedHistoryVersion && !hasUnsavedChanges) {
			draftUnitConversions = cloneUnitConversions(data.unitConversions);
			lastSyncedHistoryVersion = version;
		}
	});

	const markDirty = (nextDraft: UnitConversion[]) => {
		draftUnitConversions = nextDraft;
		hasUnsavedChanges = !unitConversionsEqual(nextDraft, data.unitConversions);
	};

	const handleSave = () => {
		data.unitConversions = cloneUnitConversions(draftUnitConversions);
		hasUnsavedChanges = false;
		data.saveStateNow();
		lastSyncedHistoryVersion = data.historyVersion;
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
		const groups = new SvelteMap<string, UnitConversion[]>();

		for (const conversion of draftUnitConversions) {
			const existing = groups.get(conversion.ingredientId);
			if (existing) {
				existing.push(conversion);
			} else {
				groups.set(conversion.ingredientId, [conversion]);
			}
		}

		return Array.from(groups.entries())
			.map(([ingredientId, conversions]) => ({
				ingredientId,
				ingredientName: getIngredientName(ingredientId),
				color: getIngredientColor(ingredientId),
				conversions
			}))
			.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
	});

	const updateInputUnit = (ingredientId: string, localIndex: number, newUnit: string) => {
		const globalIndex = findConversionGlobalIndex(draftUnitConversions, ingredientId, localIndex);
		markDirty(updateConversionAt(draftUnitConversions, globalIndex, { inputUnit: newUnit }));
	};

	const updateOutputUnit = (ingredientId: string, localIndex: number, newUnit: string) => {
		const globalIndex = findConversionGlobalIndex(draftUnitConversions, ingredientId, localIndex);
		markDirty(updateConversionAt(draftUnitConversions, globalIndex, { outputUnit: newUnit }));
	};

	const updateLeftAmount = (ingredientId: string, localIndex: number, newLeft: number) => {
		const globalIndex = findConversionGlobalIndex(draftUnitConversions, ingredientId, localIndex);
		if (globalIndex === -1) return;
		const outputAmount = getOutputAmount(draftUnitConversions[globalIndex]);
		markDirty(
			updateConversionFactorFromDisplayAmounts(
				draftUnitConversions,
				globalIndex,
				newLeft,
				outputAmount
			)
		);
	};

	const updateRightAmount = (ingredientId: string, localIndex: number, newRight: number) => {
		const globalIndex = findConversionGlobalIndex(draftUnitConversions, ingredientId, localIndex);
		if (globalIndex === -1 || newRight <= 0) return;
		const conversion = draftUnitConversions[globalIndex];
		const outputAmount = getOutputAmount(conversion);
		const leftAmount = conversion.conversionFactor * outputAmount;
		markDirty(
			updateConversionFactorFromDisplayAmounts(
				draftUnitConversions,
				globalIndex,
				leftAmount,
				newRight
			)
		);
	};

	const deleteConversion = (ingredientId: string, localIndex: number) => {
		const globalIndex = findConversionGlobalIndex(draftUnitConversions, ingredientId, localIndex);
		if (globalIndex !== -1) {
			markDirty(deleteConversionAt(draftUnitConversions, globalIndex));
		}
	};

	const totalConversions = $derived(draftUnitConversions.length);
	const totalIngredients = $derived(groupedConversions.length);
</script>

<div class="conversions-section">
	<div class="section-header">
		<div class="header-info">
			<h3>{m.unitConversionsTitle()}</h3>
			<span class="stats">
				{m.conversionsStats({ count: totalConversions, ingredientCount: totalIngredients })}
			</span>
			{#if hasUnsavedChanges}
				<span class="unsaved-hint">{m.conversionsUnsavedChanges()}</span>
			{/if}
		</div>
		<ModernButton
			variant="primary"
			size="small"
			disabled={!hasUnsavedChanges}
			onclick={handleSave}
			ariaLabel={m.conversionsSaveAriaLabel()}
			title={m.conversionsSaveTitle()}
		>
			{m.save()}
		</ModernButton>
	</div>

	{#if groupedConversions.length === 0}
		<ConversionsEmptyState />
	{:else}
		<div class="conversions-grid">
			{#each groupedConversions as group (group.ingredientId)}
				<ConversionIngredientGroup
					ingredientName={group.ingredientName}
					color={group.color}
					conversions={group.conversions}
					{customUnitLabels}
					onLeftAmountChange={(index, amount) =>
						updateLeftAmount(group.ingredientId, index, amount)}
					onRightAmountChange={(index, amount) =>
						updateRightAmount(group.ingredientId, index, amount)}
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
		background: var(--card);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		backdrop-filter: blur(10px);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.header-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.header-info h3 {
		margin: 0;
		color: var(--foreground);
		font-size: 18px;
		font-weight: 600;
	}

	.stats {
		color: var(--secondary-foreground);
		font-size: 13px;
	}

	.unsaved-hint {
		color: var(--primary);
		font-size: 12px;
		font-weight: 500;
	}

	.conversions-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	@media (max-width: 768px) {
		.conversions-section {
			padding: 1rem;
			gap: 16px;
		}

		.header-info h3 {
			font-size: 16px;
		}

		.stats {
			font-size: 12px;
		}

		.conversions-grid {
			gap: 12px;
		}
	}

	@media (max-width: 480px) {
		.conversions-section {
			padding: 0.75rem;
			border-radius: 6px;
		}

		.header-info h3 {
			font-size: 14px;
		}

		.stats {
			font-size: 11px;
		}
	}
</style>

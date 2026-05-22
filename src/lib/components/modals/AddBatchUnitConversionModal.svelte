<script lang="ts">
	import type { RecipeDoc, UnitConversion } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import TextInput from '../common/TextInput.svelte';
	import { getRecipesUsingIngredientWithUnit } from '$lib/utils/unitSelectUtils';
	import { isSmallerUnit } from '$lib/utils/unit';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		ingredientId: string;
		ingredientName: string;
		missingConversions: {
			inputUnit: string;
			outputUnit: string;
		}[];
		unitLabels: Record<string, string>;
		recipes: Record<string, RecipeDoc>;
		onSave: (conversions: UnitConversion[]) => void;
		onclose?: () => void;
	}

	let {
		ingredientId,
		ingredientName,
		missingConversions,
		unitLabels,
		recipes,
		onSave,
		onclose
	}: Props = $props();

	// Initialize conversion factors for each missing conversion
	let conversionFactors = $state<number[]>(missingConversions.map(() => 1));
	let errors = $state<string[]>(missingConversions.map(() => ''));

	const validateAll = (): boolean => {
		let isValid = true;
		const newErrors = conversionFactors.map((factor, index) => {
			if (factor <= 0) {
				isValid = false;
				return m.conversionFactorMustBePositive();
			}
			if (!isFinite(factor)) {
				isValid = false;
				return m.conversionFactorMustBeValidNumber();
			}
			return '';
		});
		errors = newErrors;
		return isValid;
	};

	const handleSave = () => {
		if (!validateAll()) {
			return;
		}

		const conversions: UnitConversion[] = missingConversions.map((missing, index) => {
			// Determine display order: smaller unit first
			const outputIsSmaller = isSmallerUnit(missing.outputUnit, missing.inputUnit);
			const smallerUnit = outputIsSmaller === true ? missing.outputUnit : missing.inputUnit;
			const largerUnit = outputIsSmaller === true ? missing.inputUnit : missing.outputUnit;

			// Store normalized: smaller unit first
			// The factor represents: 1 largerUnit = factor smallerUnit
			return {
				ingredientId,
				inputUnit: smallerUnit,
				outputUnit: largerUnit,
				conversionFactor: conversionFactors[index]
			};
		});

		onSave(conversions);
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSave();
		} else if (e.key === 'Escape') {
			onclose?.();
		}
	};

	const getUnitLabel = (unitId: string): string => {
		return unitLabels[unitId] || unitId;
	};

	const getRecipesForUnit = (unitId: string): RecipeDoc[] => {
		return getRecipesUsingIngredientWithUnit(ingredientId, unitId, recipes);
	};

	const isCompoundIngredient = (recipe: RecipeDoc): boolean => {
		return 'category' in recipe && 'yield' in recipe;
	};
</script>

<div
	class="conversion-modal"
	onkeydown={handleKeydown}
	role="dialog"
	aria-labelledby="conversion-modal-title"
	tabindex="-1"
>
	<h3 id="conversion-modal-title">{m.addUnitConversionsTitle()}</h3>
	<p class="description">
		{m.addUnitConversionsDescription({ name: ingredientName })}
	</p>

	<div class="conversions-list">
		{#each missingConversions as missing, index}
			{@const recipesUsingUnit = getRecipesForUnit(missing.inputUnit)}
			{@const outputIsSmaller = isSmallerUnit(missing.outputUnit, missing.inputUnit)}
			{@const smallerUnit = outputIsSmaller === true ? missing.outputUnit : missing.inputUnit}
			{@const largerUnit = outputIsSmaller === true ? missing.inputUnit : missing.outputUnit}
			<div class="conversion-row">
				<p class="conversion-question">
					{m.addUnitConversionQuestionShort({
						smaller: getUnitLabel(smallerUnit),
						larger: getUnitLabel(largerUnit)
					})}
				</p>
				{#if recipesUsingUnit.length > 0}
					<div class="recipes-list">
						<span class="recipes-label">{m.usedInRecipesLabel()}</span>
						<div class="recipe-names">
							{#each recipesUsingUnit as recipe}
								<span class="recipe-name" class:compound={isCompoundIngredient(recipe)}>
									{recipe.name}
									{#if isCompoundIngredient(recipe)}
										<span class="compound-badge">{m.compoundBadge()}</span>
									{/if}
								</span>
							{/each}
						</div>
					</div>
				{/if}
				<div class="input-row">
					<TextInput
						bind:value={conversionFactors[index]}
						min={0.0001}
						step={0.0001}
						size="small"
						variant="inline"
						autofocus={index === 0}
						error={errors[index]}
					/>
					<span class="hint">
						{m.conversionFactorHint({
							larger: getUnitLabel(largerUnit),
							factor: conversionFactors[index],
							smaller: getUnitLabel(smallerUnit)
						})}
					</span>
				</div>
			</div>
		{/each}
	</div>

	<div class="actions">
		<ModernButton variant="secondary" onclick={() => onclose?.()}>{m.cancel()}</ModernButton>
		<ModernButton variant="primary" onclick={handleSave}>{m.saveAll()}</ModernButton>
	</div>
</div>

<style>
	.conversion-modal {
		width: 450px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		gap: 16px;
		color: var(--foreground);
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 24px;
	}

	.conversion-modal h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.description {
		margin: 0;
		color: var(--secondary-foreground);
		line-height: 1.5;
	}

	.description strong {
		color: var(--foreground);
		font-weight: 600;
	}

	.conversions-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-height: 400px;
		overflow-y: auto;
	}

	.conversion-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		background: var(--muted);
		border-radius: 6px;
		border: 1px solid var(--border);
	}

	.conversion-question {
		margin: 0;
		font-size: 0.9rem;
		color: var(--secondary-foreground);
	}

	.conversion-question strong {
		color: var(--foreground);
		font-weight: 600;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.hint {
		font-size: 0.8rem;
		color: var(--secondary-foreground);
		font-style: italic;
		white-space: nowrap;
	}

	.recipes-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 4px;
	}

	.recipes-label {
		font-size: 0.75rem;
		color: var(--secondary-foreground);
		font-weight: 500;
	}

	.recipe-names {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.recipe-name {
		font-size: 0.8rem;
		color: var(--foreground);
		background: var(--background);
		padding: 2px 8px;
		border-radius: 4px;
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.recipe-name.compound {
		border-color: var(--border);
	}

	.compound-badge {
		font-size: 0.7rem;
		color: var(--secondary-foreground);
		font-style: italic;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}
</style>

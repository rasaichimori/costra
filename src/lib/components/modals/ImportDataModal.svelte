<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import Toast from '../common/Toast.svelte';
	import { normalizeUnitConversion } from '$lib/utils/unit';
	import { m } from '$lib/paraglide/messages.js';
	import { SvelteSet } from 'svelte/reactivity';

	// Props expected: onLoad callback to pass parsed data back, onclose to inform parent
	let { onLoad, onclose } = $props();

	let jsonText = $state<string>('');
	let error = $state<string>('');
	let showToast = $state(false);

	const placeholder = m.importDataPlaceholder();

	const validateData = (data: unknown): string | null => {
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			return m.importValidationDataMustBeObject();
		}

		const record = data as Record<string, unknown>;

		if (!record.costs || !record.recipes) {
			return m.importValidationMissingCostsRecipes();
		}

		if (typeof record.costs !== 'object' || Array.isArray(record.costs)) {
			return m.importValidationCostsMustBeObject();
		}

		for (const [key, ingredient] of Object.entries(record.costs)) {
			if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
				return m.importValidationIngredientInCostsMustBeObject({ key });
			}

			const ing = ingredient as IngredientDoc;
			if (typeof ing.id !== 'string') {
				return m.importValidationIngredientMustHaveId({ key });
			}
			if (typeof ing.name !== 'string') {
				return m.importValidationIngredientMustHaveName({ key });
			}
			if (typeof ing.category !== 'string') {
				return m.importValidationIngredientMustHaveCategory({ key });
			}
			if (typeof ing.color !== 'string') {
				return m.importValidationIngredientMustHaveColor({ key });
			}
			if (!ing.product || typeof ing.product !== 'object' || Array.isArray(ing.product)) {
				return m.importValidationIngredientMustHaveProduct({ key });
			}
			if (typeof ing.product.cost !== 'number' || !isFinite(ing.product.cost)) {
				return m.importValidationIngredientProductMustHaveCost({ key });
			}
			if (typeof ing.product.amount !== 'number' || !isFinite(ing.product.amount)) {
				return m.importValidationIngredientProductMustHaveAmount({ key });
			}
			if (typeof ing.product.unit !== 'string') {
				return m.importValidationIngredientProductMustHaveUnit({ key });
			}
		}

		if (typeof record.recipes !== 'object' || Array.isArray(record.recipes)) {
			return m.importValidationRecipesMustBeObject();
		}

		for (const [key, recipe] of Object.entries(record.recipes)) {
			if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
				return m.importValidationRecipeMustBeObject({ key });
			}

			const rec = recipe as RecipeDoc;
			if (typeof rec.id !== 'string') {
				return m.importValidationRecipeMustHaveId({ key });
			}
			if (typeof rec.name !== 'string') {
				return m.importValidationRecipeMustHaveName({ key });
			}
			if (!Array.isArray(rec.ingredients)) {
				return m.importValidationRecipeMustHaveIngredientsArray({ key });
			}

			for (const ingredient of rec.ingredients) {
				if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
					return m.importValidationRecipeHasInvalidIngredient({ key });
				}
				if (typeof ingredient.id !== 'string') {
					return m.importValidationRecipeIngredientMustHaveId({ key });
				}
				if (typeof ingredient.hidden !== 'boolean') {
					return m.importValidationRecipeIngredientMustHaveHidden({ key });
				}
				if (
					!ingredient.portion ||
					typeof ingredient.portion !== 'object' ||
					Array.isArray(ingredient.portion)
				) {
					return m.importValidationRecipeIngredientMustHavePortion({ key });
				}
				if (typeof ingredient.portion.amount !== 'number' || !isFinite(ingredient.portion.amount)) {
					return m.importValidationRecipeIngredientPortionMustHaveAmount({ key });
				}
				if (typeof ingredient.portion.unit !== 'string') {
					return m.importValidationRecipeIngredientPortionMustHaveUnit({ key });
				}
			}
		}

		if (record.compoundIngredients !== undefined) {
			if (
				typeof record.compoundIngredients !== 'object' ||
				Array.isArray(record.compoundIngredients)
			) {
				return m.importValidationCompoundIngredientsMustBeObject();
			}

			for (const [key, compound] of Object.entries(
				record.compoundIngredients as Record<string, unknown>
			)) {
				if (!compound || typeof compound !== 'object' || Array.isArray(compound)) {
					return m.importValidationCompoundMustBeObject({ key });
				}

				const comp = compound as CompoundIngredientDoc;
				if (typeof comp.id !== 'string') {
					return m.importValidationCompoundMustHaveId({ key });
				}
				if (typeof comp.name !== 'string') {
					return m.importValidationCompoundMustHaveName({ key });
				}
				if (!Array.isArray(comp.ingredients)) {
					return m.importValidationCompoundMustHaveIngredientsArray({ key });
				}
				if (typeof comp.category !== 'string') {
					return m.importValidationCompoundMustHaveCategory({ key });
				}
				if (typeof comp.color !== 'string') {
					return m.importValidationCompoundMustHaveColor({ key });
				}
				if (!comp.yield || typeof comp.yield !== 'object' || Array.isArray(comp.yield)) {
					return m.importValidationCompoundMustHaveYield({ key });
				}
				if (typeof comp.yield.amount !== 'number' || !isFinite(comp.yield.amount)) {
					return m.importValidationCompoundYieldMustHaveAmount({ key });
				}
				if (typeof comp.yield.unit !== 'string') {
					return m.importValidationCompoundYieldMustHaveUnit({ key });
				}
				if (typeof comp.viewedUnit !== 'string') {
					return m.importValidationCompoundMustHaveViewedUnit({ key });
				}
			}
		}

		if (record.unitConversions !== undefined) {
			if (!Array.isArray(record.unitConversions)) {
				return m.importValidationUnitConversionsMustBeArray();
			}

			for (let i = 0; i < record.unitConversions.length; i++) {
				const conv = record.unitConversions[i];
				if (!conv || typeof conv !== 'object' || Array.isArray(conv)) {
					return m.importValidationUnitConversionMustBeObject({ index: i });
				}
				if (typeof conv.ingredientId !== 'string') {
					return m.importValidationUnitConversionMustHaveIngredientId({ index: i });
				}
				if (typeof conv.inputUnit !== 'string') {
					return m.importValidationUnitConversionMustHaveInputUnit({ index: i });
				}
				if (typeof conv.outputUnit !== 'string') {
					return m.importValidationUnitConversionMustHaveOutputUnit({ index: i });
				}
				if (typeof conv.conversionFactor !== 'number' || !isFinite(conv.conversionFactor)) {
					return m.importValidationUnitConversionMustHaveConversionFactor({ index: i });
				}
			}
		}

		if (record.customUnitLabels !== undefined) {
			if (typeof record.customUnitLabels !== 'object' || Array.isArray(record.customUnitLabels)) {
				return m.importValidationCustomUnitLabelsMustBeObject();
			}

			for (const [key, value] of Object.entries(
				record.customUnitLabels as Record<string, unknown>
			)) {
				if (typeof value !== 'string') {
					return m.importValidationCustomUnitLabelMustBeString({ key });
				}
			}
		}

		const costs = record.costs as Record<string, IngredientDoc>;
		const recipes = record.recipes as Record<string, RecipeDoc>;
		const compoundIngredients = (record.compoundIngredients || {}) as Record<
			string,
			CompoundIngredientDoc
		>;

		const availableIngredientIds = new SvelteSet<string>();
		for (const ingredientId of Object.keys(costs)) {
			availableIngredientIds.add(ingredientId);
		}
		for (const compoundId of Object.keys(compoundIngredients)) {
			availableIngredientIds.add(compoundId);
		}

		for (const [recipeKey, recipe] of Object.entries(recipes)) {
			for (const ingredient of recipe.ingredients) {
				if (!availableIngredientIds.has(ingredient.id)) {
					return m.importValidationRecipeReferencesMissingIngredient({
						recipeName: recipe.name,
						recipeKey,
						ingredientId: ingredient.id
					});
				}
			}
		}

		for (const [compoundKey, compound] of Object.entries(compoundIngredients)) {
			for (const ingredient of compound.ingredients) {
				if (!availableIngredientIds.has(ingredient.id)) {
					return m.importValidationCompoundReferencesMissingIngredient({
						compoundName: compound.name,
						compoundKey,
						ingredientId: ingredient.id
					});
				}
			}
		}

		return null;
	};

	const handleLoad = () => {
		error = '';
		try {
			const data = JSON.parse(jsonText);
			const validationError = validateData(data);
			if (validationError) {
				error = validationError;
				showToast = true;
				setTimeout(() => (showToast = false), 3000);
				return;
			}

			// Normalize unit conversions to have smaller unit first
			if (data.unitConversions && Array.isArray(data.unitConversions)) {
				data.unitConversions = data.unitConversions.map((conv: UnitConversion) =>
					normalizeUnitConversion(conv)
				);
			}

			onLoad(data);
		} catch (e) {
			error =
				e instanceof Error
					? m.importInvalidJsonWithMessage({ message: e.message })
					: m.importInvalidJson();
			showToast = true;
			setTimeout(() => (showToast = false), 3000);
		}
	};
</script>

<div class="import-modal">
	<h3>{m.importDataTitle()}</h3>
	<p>{m.importDataDescription()}</p>
	<textarea bind:value={jsonText} {placeholder}></textarea>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<div class="actions">
		<ModernButton variant="primary" onclick={handleLoad}>{m.load()}</ModernButton>
		<ModernButton variant="secondary" onclick={() => onclose(false)}>{m.cancel()}</ModernButton>
	</div>

	{#if showToast}
		<Toast message={error} duration={3000} />
	{/if}
</div>

<style>
	.import-modal {
		width: 400px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		color: var(--foreground);
	}

	textarea {
		width: 100%;
		height: 200px;
		resize: vertical;
		padding: 8px;
		font-family: monospace;
		background: var(--card);
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: 4px;
	}

	.error {
		color: var(--destructive);
		font-size: 12px;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
</style>

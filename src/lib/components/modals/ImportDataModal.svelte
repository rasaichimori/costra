<script lang="ts">
	import type { CompoundIngredientDoc, IngredientDoc, RecipeDoc } from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import Toast from '../common/Toast.svelte';

	// Props expected: onLoad callback to pass parsed data back, onclose to inform parent
	let { onLoad, onclose } = $props();

	let jsonText = $state<string>('');
	let error = $state<string>('');
	let showToast = $state(false);

	const placeholder =
		'{"costs": { ... }, "recipes": { ... }, "compoundIngredients": { ... }, "unitConversions": [ ... ], "customUnitLabels": { ... }}';

	const validateData = (data: any): string | null => {
		// Check top-level structure
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			return 'Data must be an object.';
		}

		// Check required keys
		if (!data.costs || !data.recipes) {
			return 'JSON must contain "costs" and "recipes" keys.';
		}

		// Validate costs structure
		if (typeof data.costs !== 'object' || Array.isArray(data.costs)) {
			return '"costs" must be an object.';
		}

		for (const [key, ingredient] of Object.entries(data.costs)) {
			if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
				return `Ingredient "${key}" in costs must be an object.`;
			}

			const ing = ingredient as IngredientDoc;
			if (typeof ing.id !== 'string') {
				return `Ingredient "${key}" must have a string "id" field.`;
			}
			if (typeof ing.name !== 'string') {
				return `Ingredient "${key}" must have a string "name" field.`;
			}
			if (typeof ing.category !== 'string') {
				return `Ingredient "${key}" must have a string "category" field.`;
			}
			if (typeof ing.color !== 'string') {
				return `Ingredient "${key}" must have a string "color" field.`;
			}
			if (!ing.product || typeof ing.product !== 'object' || Array.isArray(ing.product)) {
				return `Ingredient "${key}" must have a "product" object.`;
			}
			if (typeof ing.product.cost !== 'number' || !isFinite(ing.product.cost)) {
				return `Ingredient "${key}" product must have a valid number "cost" field.`;
			}
			if (typeof ing.product.amount !== 'number' || !isFinite(ing.product.amount)) {
				return `Ingredient "${key}" product must have a valid number "amount" field.`;
			}
			if (typeof ing.product.unit !== 'string') {
				return `Ingredient "${key}" product must have a string "unit" field.`;
			}
		}

		// Validate recipes structure
		if (typeof data.recipes !== 'object' || Array.isArray(data.recipes)) {
			return '"recipes" must be an object.';
		}

		for (const [key, recipe] of Object.entries(data.recipes)) {
			if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
				return `Recipe "${key}" must be an object.`;
			}

			const rec = recipe as RecipeDoc;
			if (typeof rec.id !== 'string') {
				return `Recipe "${key}" must have a string "id" field.`;
			}
			if (typeof rec.name !== 'string') {
				return `Recipe "${key}" must have a string "name" field.`;
			}
			if (!Array.isArray(rec.ingredients)) {
				return `Recipe "${key}" must have an array "ingredients" field.`;
			}

			for (const ingredient of rec.ingredients) {
				if (!ingredient || typeof ingredient !== 'object' || Array.isArray(ingredient)) {
					return `Recipe "${key}" has an invalid ingredient.`;
				}
				if (typeof ingredient.id !== 'string') {
					return `Recipe "${key}" ingredient must have a string "id" field.`;
				}
				if (typeof ingredient.hidden !== 'boolean') {
					return `Recipe "${key}" ingredient must have a boolean "hidden" field.`;
				}
				if (
					!ingredient.portion ||
					typeof ingredient.portion !== 'object' ||
					Array.isArray(ingredient.portion)
				) {
					return `Recipe "${key}" ingredient must have a "portion" object.`;
				}
				if (typeof ingredient.portion.amount !== 'number' || !isFinite(ingredient.portion.amount)) {
					return `Recipe "${key}" ingredient portion must have a valid number "amount" field.`;
				}
				if (typeof ingredient.portion.unit !== 'string') {
					return `Recipe "${key}" ingredient portion must have a string "unit" field.`;
				}
			}
		}

		// Validate compoundIngredients if present
		if (data.compoundIngredients !== undefined) {
			if (typeof data.compoundIngredients !== 'object' || Array.isArray(data.compoundIngredients)) {
				return '"compoundIngredients" must be an object.';
			}

			for (const [key, compound] of Object.entries(data.compoundIngredients)) {
				if (!compound || typeof compound !== 'object' || Array.isArray(compound)) {
					return `Compound ingredient "${key}" must be an object.`;
				}

				const comp = compound as CompoundIngredientDoc;
				// Validate all RecipeDoc fields first
				if (typeof comp.id !== 'string') {
					return `Compound ingredient "${key}" must have a string "id" field.`;
				}
				if (typeof comp.name !== 'string') {
					return `Compound ingredient "${key}" must have a string "name" field.`;
				}
				if (!Array.isArray(comp.ingredients)) {
					return `Compound ingredient "${key}" must have an array "ingredients" field.`;
				}

				// Validate compound-specific fields
				if (typeof comp.category !== 'string') {
					return `Compound ingredient "${key}" must have a string "category" field.`;
				}
				if (typeof comp.color !== 'string') {
					return `Compound ingredient "${key}" must have a string "color" field.`;
				}
				if (!comp.yield || typeof comp.yield !== 'object' || Array.isArray(comp.yield)) {
					return `Compound ingredient "${key}" must have a "yield" object.`;
				}
				if (typeof comp.yield.amount !== 'number' || !isFinite(comp.yield.amount)) {
					return `Compound ingredient "${key}" yield must have a valid number "amount" field.`;
				}
				if (typeof comp.yield.unit !== 'string') {
					return `Compound ingredient "${key}" yield must have a string "unit" field.`;
				}
				if (typeof comp.viewedUnit !== 'string') {
					return `Compound ingredient "${key}" must have a string "viewedUnit" field.`;
				}
			}
		}

		// Validate unitConversions if present
		if (data.unitConversions !== undefined) {
			if (!Array.isArray(data.unitConversions)) {
				return '"unitConversions" must be an array.';
			}

			for (let i = 0; i < data.unitConversions.length; i++) {
				const conv = data.unitConversions[i];
				if (!conv || typeof conv !== 'object' || Array.isArray(conv)) {
					return `Unit conversion at index ${i} must be an object.`;
				}
				if (typeof conv.ingredientId !== 'string') {
					return `Unit conversion at index ${i} must have a string "ingredientId" field.`;
				}
				if (typeof conv.inputUnit !== 'string') {
					return `Unit conversion at index ${i} must have a string "inputUnit" field.`;
				}
				if (typeof conv.outputUnit !== 'string') {
					return `Unit conversion at index ${i} must have a string "outputUnit" field.`;
				}
				if (typeof conv.conversionFactor !== 'number' || !isFinite(conv.conversionFactor)) {
					return `Unit conversion at index ${i} must have a valid number "conversionFactor" field.`;
				}
			}
		}

		// Validate customUnitLabels if present
		if (data.customUnitLabels !== undefined) {
			if (typeof data.customUnitLabels !== 'object' || Array.isArray(data.customUnitLabels)) {
				return '"customUnitLabels" must be an object.';
			}

			for (const [key, value] of Object.entries(data.customUnitLabels)) {
				if (typeof value !== 'string') {
					return `Custom unit label "${key}" must have a string value.`;
				}
			}
		}

		// Validate that all recipe ingredients exist in costs or compoundIngredients
		const costs = data.costs as Record<string, IngredientDoc>;
		const recipes = data.recipes as Record<string, RecipeDoc>;
		const compoundIngredients = (data.compoundIngredients || {}) as Record<
			string,
			CompoundIngredientDoc
		>;

		// Build a set of all available ingredient IDs (from costs and compoundIngredients)
		const availableIngredientIds = new Set<string>();
		for (const ingredientId of Object.keys(costs)) {
			availableIngredientIds.add(ingredientId);
		}
		for (const compoundId of Object.keys(compoundIngredients)) {
			availableIngredientIds.add(compoundId);
		}

		// Validate recipe ingredients
		for (const [recipeKey, recipe] of Object.entries(recipes)) {
			for (const ingredient of recipe.ingredients) {
				if (!availableIngredientIds.has(ingredient.id)) {
					return `Recipe "${recipe.name}" (${recipeKey}) references ingredient "${ingredient.id}" which does not exist in costs or compoundIngredients.`;
				}
			}
		}

		// Validate compound ingredient components
		for (const [compoundKey, compound] of Object.entries(compoundIngredients)) {
			for (const ingredient of compound.ingredients) {
				if (!availableIngredientIds.has(ingredient.id)) {
					return `Compound ingredient "${compound.name}" (${compoundKey}) references ingredient "${ingredient.id}" which does not exist in costs or compoundIngredients.`;
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
			onLoad(data);
		} catch (e) {
			error = e instanceof Error ? `Invalid JSON format: ${e.message}` : 'Invalid JSON format.';
			showToast = true;
			setTimeout(() => (showToast = false), 3000);
		}
	};
</script>

<div class="import-modal">
	<h3>Import Data</h3>
	<p>Paste the JSON export here to restore your data.</p>
	<textarea bind:value={jsonText} {placeholder}></textarea>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<div class="actions">
		<ModernButton variant="primary" onclick={handleLoad}>Load</ModernButton>
		<ModernButton variant="secondary" onclick={() => onclose(false)}>Cancel</ModernButton>
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
		color: var(--text-primary);
	}

	textarea {
		width: 100%;
		height: 200px;
		resize: vertical;
		padding: 8px;
		font-family: monospace;
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-secondary);
		border-radius: 4px;
	}

	.error {
		color: var(--danger);
		font-size: 12px;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
</style>

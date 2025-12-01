<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import Toast from '../common/Toast.svelte';
	let {
		data = {} as {
			costs: Record<string, IngredientDoc>;
			recipes: Record<string, RecipeDoc>;
			compoundIngredients?: Record<string, CompoundIngredientDoc>;
			unitConversions?: UnitConversion[];
			customUnitLabels?: Record<string, string>;
		},
		onclose = () => {}
	} = $props();
	const jsonString = JSON.stringify(data, null, 2);

	let showToast = $state(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(jsonString);
			showToast = true;
			setTimeout(() => (showToast = false), 2000);
		} catch (e) {
			console.error('Failed to copy', e);
		}
	};
</script>

<div class="export-modal">
	<h3>Export Data</h3>
	<p>Copy the JSON below to save your data.</p>
	<textarea readonly value={jsonString} onfocus={(e) => e.currentTarget.select()}></textarea>
	<div class="actions">
		<ModernButton variant="secondary" onclick={copyToClipboard}>Copy</ModernButton>
		<ModernButton variant="primary" onclick={() => onclose()}>Close</ModernButton>
	</div>

	{#if showToast}
		<Toast message="Copied!" />
	{/if}
</div>

<style>
	.export-modal {
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
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
</style>

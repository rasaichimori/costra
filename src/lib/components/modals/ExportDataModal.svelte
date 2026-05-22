<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeDoc,
		UnitConversion
	} from '$lib/data/schema';
	import ModernButton from '../common/ModernButton.svelte';
	import Toast from '../common/Toast.svelte';
	import { m } from '$lib/paraglide/messages.js';
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
	<h3>{m.exportDataTitle()}</h3>
	<p>{m.exportDataDescription()}</p>
	<textarea readonly value={jsonString} onfocus={(e) => e.currentTarget.select()}></textarea>
	<div class="actions">
		<ModernButton variant="secondary" onclick={copyToClipboard}>{m.copy()}</ModernButton>
		<ModernButton variant="primary" onclick={() => onclose()}>{m.close()}</ModernButton>
	</div>

	{#if showToast}
		<Toast message={m.copiedToast()} />
	{/if}
</div>

<style>
	.export-modal {
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
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
</style>

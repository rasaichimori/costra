<script lang="ts">
	import ModernButton from '../common/ModernButton.svelte';

	// Props expected: onLoad callback to pass parsed data back, onclose to inform parent
	let { onLoad = () => {}, onclose = () => {} } = $props();

	let jsonText = $state<string>('');
	let error = $state<string>('');

	const placeholder = '{"costs": { ... }, "recipes": { ... }, "compoundIngredients": { ... }, "unitConversions": [ ... ], "customUnitLabels": { ... }}';

	const handleLoad = () => {
		error = '';
		try {
			const data = JSON.parse(jsonText);
			if (!data || typeof data !== 'object' || !data.costs || !data.recipes) {
				error = 'JSON must contain "costs" and "recipes" keys.';
				return;
			}
			onLoad(data);
			onclose(true);
		} catch (e) {
			error = 'Invalid JSON format.';
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

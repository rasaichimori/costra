<script lang="ts">
	import ModernButton from '../common/ModernButton.svelte';
	let { data = {}, onclose = () => {} } = $props();
	const jsonString = JSON.stringify(data, null, 2);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(jsonString);
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

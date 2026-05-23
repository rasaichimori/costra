<script lang="ts">
	import ModernButton from '../common/ModernButton.svelte';
	import Toast from '../common/Toast.svelte';
	import { ImportValidationError, parseAndPrepareImportData } from '$lib/utils/importUtils';
	import { m } from '$lib/paraglide/messages.js';

	// Props expected: onLoad callback to pass parsed data back, onclose to inform parent
	let { onLoad, onclose } = $props();

	let jsonText = $state<string>('');
	let error = $state<string>('');
	let showToast = $state(false);

	const placeholder = m.importDataPlaceholder();

	const handleLoad = () => {
		error = '';
		try {
			const data = parseAndPrepareImportData(jsonText);
			onLoad(data);
		} catch (e) {
			error =
				e instanceof ImportValidationError
					? e.message
					: e instanceof SyntaxError
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

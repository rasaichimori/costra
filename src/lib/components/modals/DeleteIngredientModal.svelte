<script lang="ts">
	import type { RecipeDoc } from '$lib/data/schema';
	import ModernButton from '$lib/components/common/ModernButton.svelte';

	let {
		ingredientName,
		recipesUsing,
		onclose
	}: {
		ingredientName: string;
		recipesUsing: RecipeDoc[];
		onclose?: (confirm: boolean) => void;
	} = $props();

	/**
	 * Invoke both the optional external `onclose` handler (provided in the props
	 * when `openOverlay` was called) **and** the mandatory `close` function that
	 * OverlayHost injects so the overlay actually disappears.
	 */
	const handleClose = (confirmed: boolean) => {
		onclose?.(confirmed);
	};
</script>

<div class="modal">
	<p>
		Are you sure you want to delete <strong>{ingredientName}</strong>?
	</p>
	{#if recipesUsing.length > 0}
		<p>This ingredient is currently used in the following recipes:</p>
		<ul>
			{#each recipesUsing as recipe}
				<li><strong>{recipe.name}</strong></li>
			{/each}
		</ul>
	{/if}

	<div class="actions">
		<ModernButton variant="danger" size="small" onclick={() => handleClose(true)}>
			<i class="fa-solid fa-trash"></i>
			Remove and Delete
		</ModernButton>

		<ModernButton variant="secondary" size="small" onclick={() => handleClose(false)}>
			Cancel
		</ModernButton>
	</div>

	<!-- Close (X) button in the top-right corner -->
	<ModernButton
		variant="icon"
		size="small"
		ariaLabel="Close modal"
		title="Close"
		style="position:absolute; top:8px; right:8px;"
		onclick={() => handleClose(false)}
	>
		<i class="fa-solid fa-times"></i>
	</ModernButton>
</div>

<style>
	.modal {
		background: var(--secondary);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid var(--border);
		backdrop-filter: blur(10px);
		gap: 16px;
		color: var(--foreground);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 1rem;
	}
</style>

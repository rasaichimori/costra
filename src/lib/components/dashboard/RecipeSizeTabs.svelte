<script lang="ts">
	import type { RecipeDoc } from '$lib/data/schema';
	import EditableTextField from '../common/EditableTextField.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import { createRecipeSize, getActiveSize, getNextRecipeSizeNumber } from '$lib/utils/recipeUtils';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		recipe: RecipeDoc;
		editingSizeId?: string;
	}

	let { recipe = $bindable(), editingSizeId = $bindable<string | undefined>() }: Props = $props();

	const activeSize = $derived(getActiveSize(recipe));
	const canDeleteSize = $derived(recipe.sizes.length > 1);

	let isEditingActiveSize = $state(false);

	const selectSize = (sizeId: string) => {
		recipe.activeSizeId = sizeId;
		editingSizeId = undefined;
		isEditingActiveSize = false;
	};

	const addSize = () => {
		const nextNumber = getNextRecipeSizeNumber(recipe);
		const newSize = createRecipeSize(
			m.defaultRecipeSizeName({ number: nextNumber }),
			activeSize.ingredients
		);
		recipe.sizes = [...recipe.sizes, newSize];
		recipe.activeSizeId = newSize.id;
		editingSizeId = newSize.id;
		isEditingActiveSize = true;
	};

	const deleteSize = (sizeId: string) => {
		if (!canDeleteSize) return;

		const remainingSizes = recipe.sizes.filter((size) => size.id !== sizeId);
		recipe.sizes = remainingSizes;

		if (recipe.activeSizeId === sizeId) {
			recipe.activeSizeId = remainingSizes[0].id;
		}

		if (editingSizeId === sizeId) {
			editingSizeId = undefined;
			isEditingActiveSize = false;
		}
	};

	const finishEditingSizeName = () => {
		editingSizeId = undefined;
		isEditingActiveSize = false;
	};
</script>

<div class="size-tabs-bar">
	<div class="size-tabs" role="tablist" aria-label={m.recipeSizeTabsAriaLabel()}>
		{#each recipe.sizes as size (size.id)}
			<div
				class="size-tab"
				class:active={size.id === activeSize.id}
				role="tab"
				aria-selected={size.id === activeSize.id}
			>
				{#if size.id === activeSize.id}
					<div class="active-tab-content">
						<EditableTextField
							bind:value={size.name}
							bind:isEditing={isEditingActiveSize}
							placeholder={m.recipeSizeNamePlaceholder()}
							editAriaLabel={m.editRecipeSizeNameAriaLabel()}
							editTitle={m.editRecipeSizeNameAriaLabel()}
							onSave={finishEditingSizeName}
							onCancel={finishEditingSizeName}
						/>
					</div>
					{#if canDeleteSize}
						<ModernButton
							variant="icon"
							size="small"
							ariaLabel={m.deleteRecipeSizeAriaLabel({ name: size.name })}
							title={m.deleteRecipeSizeTitle()}
							onclick={() => deleteSize(size.id)}
						>
							<i class="fa-solid fa-trash"></i>
						</ModernButton>
					{/if}
				{:else}
					<button type="button" class="tab-label" onclick={() => selectSize(size.id)}>
						{size.name}
					</button>
				{/if}
			</div>
		{/each}
		<div class="add-size-btn">
			<ModernButton
				variant="icon"
				size="small"
				ariaLabel={m.addRecipeSizeAriaLabel()}
				title={m.addRecipeSizeTitle()}
				onclick={addSize}
			>
				<i class="fa-solid fa-plus"></i>
			</ModernButton>
		</div>
	</div>
</div>

<style>
	.size-tabs-bar {
		width: 0px;
		overflow: hidden;
		min-width: 100%;
		max-width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.size-tabs-bar::-webkit-scrollbar {
		display: none;
	}

	.size-tabs {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		width: max-content;
		min-width: min-content;
	}

	.add-size-btn {
		flex-shrink: 0;
		align-self: center;
		margin-bottom: 4px;
	}

	.size-tab {
		display: flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
		padding: 4px 8px 4px 10px;
		background: var(--muted, #f5f5f5);
		border: 1px solid var(--border, #e5e5e5);
		border-bottom: none;
		border-radius: 8px 8px 0 0;
		color: var(--secondary-foreground, #666);
		font-size: 12px;
		font-weight: 500;
		max-width: 220px;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	.size-tab.active {
		background: var(--card, #fff);
		color: var(--foreground, #111);
		border-color: var(--border, #e5e5e5);
		position: relative;
		z-index: 1;
		padding-bottom: 5px;
		margin-bottom: -1px;
	}

	.active-tab-content {
		min-width: 0;
		flex: 1;
	}

	.active-tab-content :global(.editable-text-field) {
		gap: 4px;
	}

	.active-tab-content :global(.ingredient-name) {
		font-size: 12px;
		text-transform: none;
		max-width: 100px;
	}

	.tab-label {
		background: none;
		border: none;
		padding: 2px 4px;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 140px;
	}

	@media (max-width: 480px) {
		.size-tab {
			padding: 3px 6px 3px 8px;
			font-size: 11px;
			max-width: 160px;
		}

		.tab-label {
			max-width: 100px;
		}
	}
</style>

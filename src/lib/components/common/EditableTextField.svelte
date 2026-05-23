<script lang="ts">
	import TextInput from './TextInput.svelte';
	import ModernButton from './ModernButton.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let {
		value = $bindable(),
		isEditing = $bindable(),
		onSave,
		onCancel,
		placeholder = m.ingredientNamePlaceholder(),
		editAriaLabel = m.editIngredientNameAriaLabel(),
		editTitle = m.editIngredientNameTitle()
	}: {
		value: string;
		isEditing?: boolean;
		onSave?: (newValue: string) => void;
		onCancel?: (oldValue: string) => void;
		placeholder?: string;
		editAriaLabel?: string;
		editTitle?: string;
	} = $props();

	let editingValue = $derived(value);

	const startEditing = () => {
		isEditing = true;
		editingValue = value;
	};

	const cancelEditing = () => {
		isEditing = false;
		editingValue = value;
		onCancel?.(value);
	};

	const saveChanges = () => {
		if (editingValue.trim()) {
			value = editingValue.trim();
			onSave?.(value);
		}
		isEditing = false;
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			saveChanges();
		} else if (event.key === 'Escape') {
			cancelEditing();
		}
	};
</script>

<div class="editable-text-field">
	{#if isEditing}
		<TextInput
			bind:value={editingValue}
			size="small"
			variant="inline"
			{placeholder}
			ariaLabel={editAriaLabel}
			onkeydown={handleKeydown}
		/>
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel={m.saveNameAriaLabel()}
			title={m.saveChangesTitle()}
			onclick={saveChanges}
		>
			<i class="fa-solid fa-check"></i>
		</ModernButton>
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel={m.cancelEditingAriaLabel()}
			title={m.cancelEditingTitle()}
			onclick={cancelEditing}
		>
			<i class="fa-solid fa-times"></i>
		</ModernButton>
	{:else}
		<span class="ingredient-name">{value}</span>
		<ModernButton
			variant="icon"
			size="small"
			ariaLabel={editAriaLabel}
			title={editTitle}
			onclick={startEditing}
		>
			<i class="fa-solid fa-pencil"></i>
		</ModernButton>
	{/if}
</div>

<style>
	.editable-text-field {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.ingredient-name {
		font-weight: 500;
		color: var(--foreground);
		text-transform: capitalize;
		flex: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>

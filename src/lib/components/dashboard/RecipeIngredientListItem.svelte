<script lang="ts">
	import type {
		CompoundIngredientDoc,
		IngredientDoc,
		RecipeIngredientEntry,
		UnitConversion
	} from '$lib/data/schema';
	import TextInput from '../common/TextInput.svelte';
	import ModernButton from '../common/ModernButton.svelte';
	import RecipeUnitSelectButton from './RecipeUnitSelectButton.svelte';
	import { getCurrencyContext } from '$lib/contexts/currency.svelte';
	import DragHandle from '../common/icons/DragHandle.svelte';
	import { startDrag } from '$lib/utils/dragControls';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		ingredient: RecipeIngredientEntry;
		ingredientDoc?: IngredientDoc;
		lineCost?: number;
		isCompound?: boolean;
		costs: Record<string, IngredientDoc>;
		compounds?: Record<string, CompoundIngredientDoc>;
		missingIngredientMessage?: (id: string) => string;
		unitConversions: UnitConversion[];
		customUnitLabels: Record<string, string>;
		draggingId: string | null;
		onDraggingChange: (id: string | null) => void;
		onSwapWith: (targetIngredientId: string) => void;
		onDelete: () => void;
	}

	let {
		ingredient = $bindable(),
		ingredientDoc,
		lineCost,
		isCompound = false,
		costs,
		compounds = {},
		missingIngredientMessage = (id) => m.missingIngredientError({ id }),
		unitConversions = $bindable(),
		customUnitLabels = $bindable(),
		draggingId,
		onDraggingChange,
		onSwapWith,
		onDelete
	}: Props = $props();

	const currencyContext = getCurrencyContext();
	const isDragging = $derived(ingredient.id === draggingId);
</script>

<div
	class="ingredient-cost-item"
	role="listitem"
	data-id={ingredient.id}
	class:compound={isCompound}
	class:hidden={ingredient.hidden}
	class:dragging={isDragging}
>
	<span
		class="drag-handle"
		role="button"
		tabindex="-1"
		aria-label={m.dragToReorderAriaLabel()}
		data-tooltip={m.dragToReorderTitle()}
		onpointerdown={(e) => {
			onDraggingChange(ingredient.id);
			startDrag(
				e,
				(moveEvent) => {
					moveEvent.preventDefault();
					const targetEl = document.elementFromPoint(
						moveEvent.clientX,
						moveEvent.clientY
					) as HTMLElement;
					const targetId = targetEl.dataset.id;
					if (targetId && targetId !== ingredient.id) {
						onSwapWith(targetId);
					}
				},
				() => onDraggingChange(null)
			);
		}}
	>
		<DragHandle />
	</span>
	<div class="ingredient-details">
		<span class="ingredient-name">{ingredientDoc?.name ?? ingredient.id}</span>
		<div class="amount-input-group">
			<TextInput
				value={ingredient.portion.amount}
				onchange={(value) => {
					ingredient.portion.amount = value;
				}}
				oninput={(value) => {
					ingredient.portion.amount = value;
				}}
				size="small"
				variant="inline"
				min={0}
				step={1}
				spinner={true}
			/>
		</div>
		<div class="unit-input-group">
			{#if ingredientDoc}
				<RecipeUnitSelectButton
					recipePortion={ingredient.portion}
					{ingredientDoc}
					bind:unitConversions
					bind:customUnitLabels
					updateRecipePortionUnit={(unitId: string) => {
						ingredient.portion.unit = unitId;
					}}
				/>
			{:else}
				<span class="error-text">{missingIngredientMessage(ingredient.id)}</span>
			{/if}
		</div>
	</div>
	<div class="ingredient-cost">
		{currencyContext.currency}{lineCost?.toFixed(0) || '0'}
	</div>
	<div class="color-input-group">
		{#if ingredientDoc}
			<input
				type="color"
				class="color-picker"
				value={ingredientDoc.color}
				oninput={(e) => {
					if (ingredient.id in compounds) {
						compounds[ingredient.id].color = e.currentTarget.value;
					} else if (ingredient.id in costs) {
						costs[ingredient.id].color = e.currentTarget.value;
					}
				}}
			/>
		{/if}
	</div>
	<ModernButton
		variant="icon"
		size="small"
		ariaLabel={ingredient.hidden ? m.showIngredient() : m.hideIngredient()}
		title={ingredient.hidden ? m.showIngredient() : m.hideIngredient()}
		onclick={() => {
			ingredient.hidden = !ingredient.hidden;
		}}
	>
		<i class={`fa-solid ${ingredient.hidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
	</ModernButton>
	<ModernButton
		variant="icon"
		size="small"
		ariaLabel={m.deleteIngredientAriaLabel()}
		title={m.deleteIngredientTitle()}
		onclick={onDelete}
	>
		<i class="fa-solid fa-trash"></i>
	</ModernButton>
</div>

<style>
	.ingredient-cost-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 12px;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 10px;
		font-size: 12px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.ingredient-cost-item:hover {
		background: var(--secondary);
		border-color: var(--border);
	}

	.drag-handle {
		cursor: grab;
		margin-right: 8px;
		color: var(--muted-foreground);
		display: flex;
		align-items: center;
		transition: color 0.15s ease;
	}

	.drag-handle:hover {
		color: var(--secondary-foreground);
	}

	.drag-handle:active {
		cursor: grabbing;
		color: var(--primary);
	}

	.ingredient-details {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.ingredient-name {
		font-weight: 500;
		color: var(--foreground);
		text-transform: capitalize;
		min-width: 80px;
		width: 120px;
		font-size: 12px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		letter-spacing: -0.01em;
	}

	.ingredient-cost {
		font-weight: 600;
		color: var(--foreground);
		min-width: 40px;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}

	.amount-input-group,
	.unit-input-group {
		display: flex;
		align-items: center;
		gap: 4px;
		width: 80px;
	}

	.color-input-group {
		display: flex;
		align-items: center;
	}

	.color-picker {
		border: 2px solid var(--border);
		background: transparent;
		width: 22px;
		height: 22px;
		padding: 0;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.color-picker:hover {
		border-color: var(--border);
		transform: scale(1.1);
	}

	.color-picker::-webkit-color-swatch-wrapper {
		padding: 2px;
	}

	.color-picker::-webkit-color-swatch {
		border: none;
		border-radius: 3px;
	}

	.color-picker::-moz-color-swatch {
		border: none;
		border-radius: 3px;
	}

	.ingredient-cost-item.hidden {
		opacity: 0.35;
		filter: grayscale(0.3);
	}

	.ingredient-cost-item.compound {
		border-color: var(--primary);
		background: linear-gradient(135deg, var(--muted) 0%, var(--accent) 100%);
	}

	.ingredient-cost-item.dragging {
		opacity: 0.6;
		transform: scale(0.98);
		box-shadow: var(--shadow-medium);
	}

	@media (max-width: 768px) {
		.ingredient-cost-item {
			min-width: max-content;
			gap: 6px;
			padding: 6px 10px;
		}

		.ingredient-details {
			gap: 6px;
		}

		.ingredient-name {
			min-width: 60px;
			width: 80px;
			font-size: 11px;
		}

		.amount-input-group {
			width: 50px;
		}

		.unit-input-group {
			width: auto;
		}

		.ingredient-cost {
			min-width: 35px;
			font-size: 11px;
		}

		.color-picker {
			width: 18px;
			height: 18px;
		}
	}

	@media (max-width: 480px) {
		.ingredient-cost-item {
			padding: 5px 8px;
			font-size: 10px;
			border-radius: 6px;
		}

		.drag-handle {
			margin-right: 4px;
		}

		.ingredient-name {
			min-width: 50px;
			width: 70px;
			font-size: 10px;
		}

		.amount-input-group {
			width: 45px;
		}

		.ingredient-cost {
			font-size: 10px;
			min-width: 30px;
		}

		.color-picker {
			width: 16px;
			height: 16px;
		}
	}
</style>

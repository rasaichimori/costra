<script lang="ts">
	import DragHandle from '../common/DragHandle.svelte';

	let ingredients = $state([
		{ id: 'flour', name: 'Flour', cost: 12, color: '#f59e0b' },
		{ id: 'butter', name: 'Butter', cost: 28, color: '#3b82f6' },
		{ id: 'sugar', name: 'Sugar', cost: 8, color: '#10b981' }
	]);

	let draggingIdx = $state<number | null>(null);

	const swap = (from: number, to: number) => {
		const moved = ingredients.splice(from, 1)[0];
		ingredients.splice(to, 0, moved);
	};

	const handlePointerDown = (e: PointerEvent, idx: number) => {
		e.preventDefault();
		draggingIdx = idx;

		const onMove = (moveEvent: PointerEvent) => {
			moveEvent.preventDefault();
			const targetEl = document.elementFromPoint(
				moveEvent.clientX,
				moveEvent.clientY
			) as HTMLElement;
			const targetIdx = targetEl?.closest('[data-idx]')?.getAttribute('data-idx');
			if (targetIdx !== null && targetIdx !== undefined && +targetIdx !== idx) {
				swap(idx, +targetIdx);
				idx = +targetIdx;
			}
		};

		const onUp = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			draggingIdx = null;
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	};

	const total = $derived(ingredients.reduce((sum, i) => sum + i.cost, 0));
</script>

<div class="demo-container">
	<div class="mini-ingredient-list">
		{#each ingredients as ing, idx (ing.id)}
			<div
				class="mini-row"
				role="button"
				class:dragging={draggingIdx === idx}
				data-idx={idx}
				onpointerdown={(e) => handlePointerDown(e, idx)}
				tabindex="-1"
			>
				<span class="grip">
					<DragHandle />
				</span>
				<span class="color-dot" style="background: {ing.color}"></span>
				<span class="name">{ing.name}</span>
				<span class="cost">${ing.cost}</span>
			</div>
		{/each}
	</div>
	<div class="total-row">
		<span>Total</span>
		<span class="total-cost">${total}</span>
	</div>
</div>

<style>
	.demo-container {
		background: var(--background);
		padding: 10px;
		margin-top: 1rem;
		border-radius: 8px;
		transform-style: preserve-3d;
	}

	.mini-ingredient-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mini-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 0.75rem;
		transition: all 0.15s ease;
		user-select: none;
		cursor: grab;
	}

	.mini-row:hover {
		background: var(--secondary);
	}

	.mini-row.dragging {
		opacity: 0.7;
		transform: scale(0.98);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.grip {
		color: var(--muted-foreground);
		display: flex;
		align-items: center;
		transition: color 0.15s ease;
		padding: 2px;
	}

	.grip:hover {
		color: var(--foreground);
	}

	.grip:active {
		cursor: grabbing;
		color: var(--primary);
	}

	.color-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.name {
		flex: 1;
		font-weight: 500;
		color: var(--foreground);
		letter-spacing: -0.01em;
	}

	.cost {
		font-weight: 600;
		color: var(--foreground);
		font-variant-numeric: tabular-nums;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		padding: 8px 10px;
		margin-top: 6px;
		border-top: 1px dashed var(--border);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.total-cost {
		color: var(--foreground);
		font-variant-numeric: tabular-nums;
	}
</style>

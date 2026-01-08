<script lang="ts">
	interface InputBox {
		id: string;
		label: string;
		value: number;
		multiplier: number;
	}

	let boxes = $state<InputBox[]>([
		{ id: 'a', label: 'Flour', value: 100, multiplier: 1 },
		{ id: 'b', label: 'Croissant', value: 250, multiplier: 2.5 },
		{ id: 'c', label: 'Danish', value: 175, multiplier: 1.75 }
	]);

	let flashing = $state<Record<string, boolean>>({});

	const flashBox = (id: string) => {
		flashing[id] = true;
		setTimeout(() => {
			flashing[id] = false;
		}, 500);
	};

	const updateFromBox = (sourceId: string, newVal: number) => {
		const sourceBox = boxes.find((b) => b.id === sourceId);
		if (!sourceBox) return;

		const baseValue = newVal / sourceBox.multiplier;
		sourceBox.value = newVal;

		boxes.forEach((box) => {
			if (box.id !== sourceId) {
				const targetValue = Math.round(baseValue * box.multiplier * 10) / 10;
				flashBox(box.id);
				box.value = targetValue;
			}
		});
	};
</script>

<div class="demo-container">
	<div class="inputs-list">
		{#each boxes as box (box.id)}
			<div class="input-row" class:flash={flashing[box.id]}>
				<span class="input-label">{box.label}</span>
				<div class="input-wrapper">
					<span class="currency">$</span>
					<input
						type="number"
						bind:value={box.value}
						oninput={(e) => updateFromBox(box.id, +e.currentTarget.value)}
						step="10"
					/>
				</div>
				<span class="multiplier">×{box.multiplier}</span>
			</div>
		{/each}
	</div>
	<p class="hint">Change any value to see others update</p>
</div>

<style>
	.demo-container {
		background: var(--background);
		padding: 10px;
		border-radius: 8px;
		transform-style: preserve-3d;
	}

	.inputs-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 6px;
		transition: all 0.2s ease;
		width: fit-content;
	}

	.input-row:nth-child(1) {
		margin-left: 5%;
	}

	.input-row:nth-child(2) {
		margin-left: 45%;
	}

	.input-row:nth-child(3) {
		margin-left: 15%;
	}

	.input-row.flash {
		animation: pulse 0.4s ease;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent);
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	.input-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--foreground);
		min-width: 60px;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 4px 8px;
	}
	.currency {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
		margin-right: 2px;
	}

	input {
		width: 50px;
		border: none;
		background: transparent;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--foreground);
		font-variant-numeric: tabular-nums;
		outline: none;
		cursor: pointer;
	}

	.input-wrapper:has(input:hover) {
		background: var(--secondary);
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}

	.multiplier {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--muted-foreground);
		margin-left: auto;
		font-variant-numeric: tabular-nums;
	}

	.hint {
		font-size: 0.625rem;
		color: var(--muted-foreground);
		text-align: center;
		margin: 8px 0 0;
		font-style: italic;
	}

	@media (max-width: 480px) {
		.input-row {
			width: 100%;
		}

		.input-row:nth-child(1),
		.input-row:nth-child(2),
		.input-row:nth-child(3) {
			margin-left: 0;
		}
	}
</style>

<script lang="ts">
	interface InputBox {
		id: string;
		label: string;
		value: number;
		multiplier: number;
		x: number;
		y: number;
	}

	let boxes = $state<InputBox[]>([
		{ id: 'a', label: 'Flour', value: 100, multiplier: 1, x: 10, y: 5 },
		{ id: 'b', label: 'Croissant', value: 250, multiplier: 2.5, x: 55, y: 35 },
		{ id: 'c', label: 'Danish', value: 175, multiplier: 1.75, x: 20, y: 65 }
	]);

	let flashing = $state<Record<string, boolean>>({});
	let animatingValues = $state<Record<string, number>>({});

	const animateValue = (id: string, from: number, to: number) => {
		flashing[id] = true;
		animatingValues[id] = from;

		const duration = 400;
		const startTime = performance.now();
		const diff = to - from;

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			// Easing function for smooth animation
			const eased = 1 - Math.pow(1 - progress, 3);
			animatingValues[id] = from + diff * eased;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				animatingValues[id] = to;
				setTimeout(() => {
					flashing[id] = false;
				}, 100);
			}
		};

		requestAnimationFrame(animate);
	};

	const updateFromBox = (sourceId: string, newVal: number) => {
		const sourceBox = boxes.find((b) => b.id === sourceId);
		if (!sourceBox) return;

		const baseValue = newVal / sourceBox.multiplier;
		sourceBox.value = newVal;

		boxes.forEach((box) => {
			if (box.id !== sourceId) {
				const targetValue = Math.round(baseValue * box.multiplier * 10) / 10;
				animateValue(box.id, box.value, targetValue);
				box.value = targetValue;
			}
		});
	};

	const getDisplayValue = (box: InputBox) => {
		if (flashing[box.id] && animatingValues[box.id] !== undefined) {
			return Math.round(animatingValues[box.id] * 10) / 10;
		}
		return box.value;
	};
</script>

<div class="demo-container">
	<div class="inputs-area">
		{#each boxes as box (box.id)}
			<div
				class="input-box"
				class:flash={flashing[box.id]}
				style="left: {box.x}%; top: {box.y}%"
			>
				<span class="input-label">{box.label}</span>
				<div class="input-wrapper">
					<span class="currency">$</span>
					<input
						type="number"
						value={getDisplayValue(box)}
						oninput={(e) => updateFromBox(box.id, +e.currentTarget.value)}
						step="10"
					/>
				</div>
			</div>
		{/each}
		<!-- Connection lines SVG -->
		<svg class="connections" viewBox="0 0 100 100" preserveAspectRatio="none">
			<path
				d="M 25 15 Q 50 25, 70 45"
				stroke="var(--border)"
				stroke-width="0.5"
				fill="none"
				stroke-dasharray="2,2"
			/>
			<path
				d="M 70 45 Q 45 55, 35 75"
				stroke="var(--border)"
				stroke-width="0.5"
				fill="none"
				stroke-dasharray="2,2"
			/>
			<path
				d="M 25 15 Q 25 45, 35 75"
				stroke="var(--border)"
				stroke-width="0.5"
				fill="none"
				stroke-dasharray="2,2"
			/>
		</svg>
	</div>
	<p class="hint">Change any value to see others update</p>
</div>

<style>
	.demo-container {
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 10px;
		margin-top: 1rem;
	}

	.inputs-area {
		position: relative;
		height: 120px;
		overflow: hidden;
	}

	.connections {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: 0.6;
	}

	.input-box {
		position: absolute;
		display: flex;
		flex-direction: column;
		gap: 3px;
		transition: transform 0.15s ease;
	}

	.input-box.flash {
		animation: pulse 0.4s ease;
	}

	.input-box.flash input {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent);
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	.input-label {
		font-size: 0.625rem;
		font-weight: 500;
		color: var(--muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 4px 8px;
		transition: all 0.2s ease;
	}

	.input-box.flash .input-wrapper {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent);
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
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}

	.hint {
		font-size: 0.625rem;
		color: var(--muted-foreground);
		text-align: center;
		margin: 8px 0 0;
		font-style: italic;
	}
</style>


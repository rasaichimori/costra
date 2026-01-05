<script lang="ts">
	const targetMargin = 30;

	let products = $state([
		{ id: 'croissant', name: 'Croissant', margin: 35, color: '#10b981' },
		{ id: 'baguette', name: 'Baguette', margin: 22, color: '#f59e0b' },
		{ id: 'danish', name: 'Danish', margin: 41, color: '#3b82f6' }
	]);

	const getMarginStatus = (margin: number) => {
		if (margin >= targetMargin) return 'on-target';
		if (margin >= targetMargin - 10) return 'close';
		return 'below';
	};
</script>

<div class="demo-container">
	<div class="target-indicator">
		<span class="target-label">Target: {targetMargin}%</span>
		<div class="target-line-marker"></div>
	</div>
	<div class="products-list">
		{#each products as product (product.id)}
			<div class="product-row">
				<span class="product-name">{product.name}</span>
				<div class="bar-container">
					<div class="bar-track">
						<div
							class="bar-fill {getMarginStatus(product.margin)}"
							style="width: {Math.min(product.margin, 50) * 2}%; background: {product.color}"
						></div>
						<div class="target-line" style="left: {targetMargin * 2}%"></div>
					</div>
					<span class="margin-value" class:on-target={product.margin >= targetMargin}>
						{product.margin}%
					</span>
				</div>
				<span class="status-icon">
					{#if product.margin >= targetMargin}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					{:else}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					{/if}
				</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.demo-container {
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 10px;
		margin-top: 1rem;
	}

	.target-indicator {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 10px;
		padding-bottom: 8px;
		border-bottom: 1px dashed var(--border);
	}

	.target-label {
		font-size: 0.625rem;
		font-weight: 600;
		color: var(--muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.target-line-marker {
		flex: 1;
		height: 1px;
		background: repeating-linear-gradient(
			90deg,
			var(--primary),
			var(--primary) 4px,
			transparent 4px,
			transparent 8px
		);
	}

	.products-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.product-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.product-name {
		font-size: 0.7rem;
		font-weight: 500;
		color: var(--foreground);
		width: 60px;
		flex-shrink: 0;
	}

	.bar-container {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.bar-track {
		flex: 1;
		height: 8px;
		background: var(--muted);
		border-radius: 4px;
		position: relative;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bar-fill.on-target {
		opacity: 1;
	}

	.bar-fill.close {
		opacity: 0.8;
	}

	.bar-fill.below {
		opacity: 0.6;
	}

	.target-line {
		position: absolute;
		top: -2px;
		bottom: -2px;
		width: 2px;
		background: var(--primary);
		border-radius: 1px;
		box-shadow: 0 0 4px var(--primary);
	}

	.margin-value {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
		min-width: 32px;
		text-align: right;
	}

	.margin-value.on-target {
		color: var(--primary);
	}

	.status-icon {
		width: 14px;
		height: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-icon svg {
		color: var(--muted-foreground);
	}

	.product-row:has(.margin-value.on-target) .status-icon svg {
		color: var(--primary);
	}
</style>


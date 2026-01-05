<script lang="ts">
	let expanded = $state(true);

	const recipe = {
		name: 'Croissant',
		cost: 48,
		ingredients: [
			{
				type: 'compound',
				name: 'Laminated Dough',
				cost: 32,
				children: [
					{ name: 'Flour', cost: 12 },
					{ name: 'Butter', cost: 18 },
					{ name: 'Yeast', cost: 2 }
				]
			},
			{ type: 'simple', name: 'Egg Wash', cost: 4 },
			{ type: 'simple', name: 'Almond Fill', cost: 12 }
		]
	};
</script>

<div class="demo-container">
	<div class="recipe-card">
		<div class="recipe-header">
			<span class="recipe-icon">🥐</span>
			<span class="recipe-name">{recipe.name}</span>
			<span class="recipe-cost">${recipe.cost}</span>
		</div>
		<div class="ingredients-tree">
			{#each recipe.ingredients as ing}
				{#if ing.type === 'compound'}
					<div class="compound-item">
						<button
							class="compound-header"
							onclick={() => (expanded = !expanded)}
						>
							<span class="expand-icon" class:expanded>
								<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="9 18 15 12 9 6"></polyline>
								</svg>
							</span>
							<span class="compound-badge">Recipe</span>
							<span class="ing-name">{ing.name}</span>
							<span class="ing-cost">${ing.cost}</span>
						</button>
						{#if expanded && ing.children}
							<div class="nested-items">
								{#each ing.children as child}
									<div class="nested-item">
										<span class="tree-line"></span>
										<span class="ing-name">{child.name}</span>
										<span class="ing-cost">${child.cost}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<div class="simple-item">
						<span class="simple-dot"></span>
						<span class="ing-name">{ing.name}</span>
						<span class="ing-cost">${ing.cost}</span>
					</div>
				{/if}
			{/each}
		</div>
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

	.recipe-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.recipe-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: var(--muted);
		border-radius: 6px;
	}

	.recipe-icon {
		font-size: 1rem;
	}

	.recipe-name {
		flex: 1;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.recipe-cost {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--foreground);
		font-variant-numeric: tabular-nums;
	}

	.ingredients-tree {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-left: 8px;
	}

	.compound-item {
		display: flex;
		flex-direction: column;
	}

	.compound-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 8px;
		background: linear-gradient(135deg, var(--muted) 0%, color-mix(in srgb, var(--primary) 8%, var(--muted)) 100%);
		border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border));
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.15s ease;
		width: 100%;
		text-align: left;
	}

	.compound-header:hover {
		border-color: var(--primary);
	}

	.expand-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		transition: transform 0.2s ease;
	}

	.expand-icon.expanded {
		transform: rotate(90deg);
	}

	.compound-badge {
		font-size: 0.5rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--primary);
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		padding: 2px 5px;
		border-radius: 3px;
	}

	.nested-items {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-left: 16px;
		margin-top: 4px;
		padding-left: 8px;
		border-left: 1px dashed var(--border);
	}

	.nested-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 3px 6px;
		font-size: 0.65rem;
	}

	.tree-line {
		width: 8px;
		height: 1px;
		background: var(--border);
	}

	.simple-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 8px;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 5px;
	}

	.simple-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--muted-foreground);
	}

	.ing-name {
		flex: 1;
		font-size: 0.7rem;
		font-weight: 500;
		color: var(--foreground);
	}

	.ing-cost {
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}

	.nested-item .ing-name {
		color: var(--muted-foreground);
	}

	.nested-item .ing-cost {
		color: var(--muted-foreground);
		opacity: 0.8;
	}
</style>


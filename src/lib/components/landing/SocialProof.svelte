<script lang="ts">
	const stats = [
		{ number: '10K+', label: 'Recipes calculated' },
		{ number: '$2.4M', label: 'Margins optimized' },
		{ number: '99.9%', label: 'Accuracy' }
	];
</script>

<section class="social-proof">
	<div class="proof-content">
		{#each stats as stat, i}
			<div class="proof-stat">
				<span class="proof-number">{stat.number}</span>
				<span class="proof-label">{stat.label}</span>
			</div>
			{#if i < stats.length - 1}
				<div class="proof-divider"></div>
			{/if}
		{/each}
	</div>
</section>

<style>
	.social-proof {
		position: relative;
		z-index: 10;
		padding: 3rem 4rem;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		background: var(--muted);
	}

	.proof-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.proof-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.proof-number {
		font-family: 'Instrument Serif', serif;
		font-size: 2.5rem;
		font-weight: 400;
		color: var(--foreground);
	}

	.proof-label {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
	}

	.proof-divider {
		width: 1px;
		height: 50px;
		background: var(--border);
	}

	@media (max-width: 768px) {
		.proof-content {
			flex-direction: column;
			gap: 1.5rem;
		}

		.proof-divider {
			width: 50px;
			height: 1px;
		}
	}
</style>


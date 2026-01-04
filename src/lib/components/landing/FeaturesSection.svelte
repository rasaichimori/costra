<script lang="ts">
	const features = [
		{
			number: '01',
			title: 'Layer by Layer',
			description:
				'Break down complex recipes into individual components. See exactly where your money goes.',
			icon: 'layers'
		},
		{
			number: '02',
			title: 'Instant Updates',
			description:
				'Change an ingredient price and watch it ripple through every recipe automatically.',
			icon: 'clock'
		},
		{
			number: '03',
			title: 'Margin Clarity',
			description: 'Set your target margins and instantly see which products are hitting the mark.',
			icon: 'chart'
		},
		{
			number: '04',
			title: 'Compound Recipes',
			description:
				'Build recipes from other recipes. Perfect for bakeries, restaurants, and manufacturers.',
			icon: 'grid'
		}
	];
</script>

<section class="features">
	<div class="features-header">
		<span class="section-number">01</span>
		<h2 class="section-title">Why Costra?</h2>
		<p class="section-description">
			Everything you need to understand and optimize your product costs.
		</p>
	</div>

	<div class="features-grid">
		{#each features as feature}
			<div class="feature-card">
				<div class="feature-number">{feature.number}</div>
				<div class="feature-icon">
					{#if feature.icon === 'layers'}
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path d="M12 2L2 7L12 12L22 7L12 2Z" />
							<path d="M2 17L12 22L22 17" />
							<path d="M2 12L12 17L22 12" />
						</svg>
					{:else if feature.icon === 'clock'}
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M12 6V12L16 14" />
						</svg>
					{:else if feature.icon === 'chart'}
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path d="M21 21H3V3" />
							<path d="M21 9L15 15L10 10L3 17" />
						</svg>
					{:else if feature.icon === 'grid'}
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<rect x="3" y="3" width="7" height="9" />
							<rect x="14" y="3" width="7" height="5" />
							<rect x="14" y="12" width="7" height="9" />
							<rect x="3" y="16" width="7" height="5" />
						</svg>
					{/if}
				</div>
				<h3 class="feature-title">{feature.title}</h3>
				<p class="feature-description">{feature.description}</p>
			</div>
		{/each}
	</div>
</section>

<style>
	.features {
		position: relative;
		z-index: 10;
		padding: 6rem 4rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.features-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 3rem;
	}

	.section-number {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--primary);
		letter-spacing: 0.1em;
	}

	.section-title {
		font-family: 'Instrument Serif', serif;
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 400;
		margin: 0;
		letter-spacing: -0.02em;
		color: var(--foreground);
	}

	.section-description {
		font-size: 1rem;
		color: var(--muted-foreground);
		margin: 0;
		max-width: 450px;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.25rem;
	}

	.feature-card {
		padding: 2rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.feature-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--primary), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.feature-card:hover {
		border-color: var(--primary);
		transform: translateY(-4px);
		box-shadow: 0 8px 30px color-mix(in srgb, var(--primary) 15%, transparent);
	}

	.feature-card:hover::before {
		opacity: 1;
	}

	.feature-number {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--muted-foreground);
		letter-spacing: 0.1em;
		margin-bottom: 1.25rem;
	}

	.feature-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--primary) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
		border-radius: 10px;
		color: var(--primary);
		margin-bottom: 1.25rem;
		transition: all 0.3s ease;
	}

	.feature-card:hover .feature-icon {
		background: color-mix(in srgb, var(--primary) 18%, transparent);
		transform: scale(1.05);
	}

	.feature-title {
		font-family: 'Instrument Serif', serif;
		font-size: 1.375rem;
		font-weight: 400;
		margin: 0 0 0.5rem;
		color: var(--foreground);
	}

	.feature-description {
		font-size: 0.9375rem;
		color: var(--muted-foreground);
		line-height: 1.6;
		margin: 0;
	}

	@media (max-width: 1024px) {
		.features-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.features {
			padding: 4rem 1.5rem;
		}
	}
</style>


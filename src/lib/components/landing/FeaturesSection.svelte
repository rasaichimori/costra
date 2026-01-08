<script lang="ts">
	import FeatureDemoLayers from './FeatureDemoLayers.svelte';
	import FeatureDemoUpdates from './FeatureDemoUpdates.svelte';
	import FeatureDemoMargin from './FeatureDemoMargin.svelte';
	import FeatureDemoCompound from './FeatureDemoCompound.svelte';

	const features = [
		{
			number: '01',
			title: 'Layer by Layer',
			description:
				'Break down complex recipes into individual components. See exactly where your money goes.',
			icon: 'layers',
			demo: 'layers'
		},
		{
			number: '02',
			title: 'Instant Updates',
			description:
				'Change an ingredient price and watch it ripple through every recipe automatically.',
			icon: 'clock',
			demo: 'updates'
		},
		{
			number: '03',
			title: 'Margin Clarity',
			description: 'Set your target margins and instantly see which products are hitting the mark.',
			icon: 'chart',
			demo: 'margin'
		},
		{
			number: '04',
			title: 'Compound Recipes',
			description:
				'Build recipes from other recipes. Perfect for bakeries, restaurants, and manufacturers.',
			icon: 'grid',
			demo: 'compound'
		}
	];

	// Track tilt state for each card
	let cardTilts = $state<Record<string, { tiltX: number; tiltY: number }>>({});

	const handleMouseMove = (e: MouseEvent, featureId: string) => {
		const card = e.currentTarget as HTMLElement;
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		// Calculate tilt (max 8 degrees)
		const tiltX = ((y - centerY) / centerY) * -8;
		const tiltY = ((x - centerX) / centerX) * 8;

		cardTilts[featureId] = { tiltX, tiltY };
	};

	const handleMouseLeave = (featureId: string) => {
		cardTilts[featureId] = { tiltX: 0, tiltY: 0 };
	};

	const getTilt = (featureId: string) => {
		return cardTilts[featureId] ?? { tiltX: 0, tiltY: 0 };
	};
</script>

<section class="features">
	<div class="features-header">
		<span class="section-number">01</span>
		<h2 class="section-title">Um, so why Costra?</h2>
		<p class="section-description">
			Everything you need to understand and optimize your product costs.
		</p>
	</div>

	<div class="features-grid">
		{#each features as feature}
			{@const tilt = getTilt(feature.demo)}
			<div
				class="feature-card"
				role="group"
				onmousemove={(e) => handleMouseMove(e, feature.demo)}
				onmouseleave={() => handleMouseLeave(feature.demo)}
			>
				<div class="feature-meta">
					<div class="feature-number">Interactive {feature.number}</div>
				</div>
				<div class="feature-demo">
					<div
						class="demo-3d-wrapper"
						style="transform: perspective(800px) rotateX({tilt.tiltX}deg) rotateY({tilt.tiltY}deg) translateZ({Math.abs(
							tilt.tiltX
						) +
							Math.abs(tilt.tiltY) >
						0
							? 20
							: 0}px)"
					>
						{#if feature.demo === 'layers'}
							<FeatureDemoLayers />
						{:else if feature.demo === 'updates'}
							<FeatureDemoUpdates />
						{:else if feature.demo === 'margin'}
							<FeatureDemoMargin isHovered={Math.abs(tilt.tiltX) + Math.abs(tilt.tiltY) > 0} />
						{:else if feature.demo === 'compound'}
							<FeatureDemoCompound />
						{/if}
					</div>
				</div>
				<div class="feature-header">
					<div class="feature-text">
						<h3 class="feature-title">{feature.title}</h3>
						<p class="feature-description">{feature.description}</p>
					</div>
				</div>
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
		font-family: 'Outfit', sans-serif;
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.03em;
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
		padding: 1.5rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 36px;
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

	.feature-header {
		display: flex;
		gap: 1rem;
	}

	.feature-meta {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.feature-number {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--muted-foreground);
		letter-spacing: 0.1em;
	}
	.feature-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.feature-title {
		font-family: 'Outfit', sans-serif;
		font-size: 1.375rem;
		font-weight: 600;
		margin: 0;
		color: var(--foreground);
	}

	.feature-description {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		line-height: 1.6;
		margin: 0;
	}

	.feature-demo {
		width: 80%;
		margin: auto;
		perspective: 800px;
	}

	.demo-3d-wrapper {
		transform-style: preserve-3d;
		transition:
			transform 0.15s ease-out,
			box-shadow 0.15s ease-out;
		border-radius: 8px;
	}

	.feature-card:hover .demo-3d-wrapper {
		border: 1px solid var(--border);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(255, 255, 255, 0.05);
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

		.feature-header {
			flex-direction: column;
			gap: 0.75rem;
		}

		.feature-meta {
			flex-direction: row;
			align-items: center;
		}

		.feature-demo {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		.features {
			padding: 3rem 1rem;
		}

		.features-header {
			margin-bottom: 2rem;
		}

		.feature-card {
			padding: 1.25rem;
			gap: 24px;
		}

		.feature-title {
			font-size: 1.25rem;
		}

		.feature-description {
			font-size: 0.8125rem;
		}
	}
</style>

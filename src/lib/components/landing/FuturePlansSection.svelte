<script lang="ts">
</script>

<section class="future-plans" id="future-plans">
	<div class="content-wrapper">
		<div class="section-header">
			<span class="section-number">03</span>
			<h2 class="section-title">What's Next?</h2>
		</div>

		<div class="plans-card">
			<p class="intro-text">
				Costra will always have a <strong>free core</strong>. But if enough people want features
				that require ongoing costs, I'd consider an optional paid tier on top.
			</p>

			<div class="features-section">
				<span class="features-label">Possible features</span>
				<ul class="features-list">
					<li class="feature-item">
						<span class="item-dot"></span>
						<span class="item-text"
							>AI auto-fill — Let AI fill in the ingredients or recipes as you are typing</span
						>
					</li>
					<li class="feature-item">
						<span class="item-dot"></span>
						<span class="item-text"
							>Price tracking — Track prices from vendors and get notified when ingredient costs
							change</span
						>
					</li>
					<li class="feature-item">
						<span class="item-dot"></span>
						<span class="item-text"
							>Cloud accounts — access your data from anywhere, on any device</span
						>
					</li>
				</ul>
			</div>

			<p class="cta-text">
				Want any of these? <a href="https://www.instagram.com/lanibowls/" target="_blank"
					>Let me know</a
				> — if there's enough interest, I'll make it happen.
			</p>
		</div>
	</div>
</section>

<style>
	.future-plans {
		position: relative;
		z-index: 10;
		padding: 6rem 4rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.content-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
	}

	.section-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.75rem;
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

	.plans-card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		transition: all 0.3s ease;
		max-width: 640px;
	}

	.plans-card:hover {
		border-color: var(--primary);
		transform: translateY(-2px);
	}

	.intro-text {
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--foreground);
		margin: 0;
	}

	.intro-text strong {
		color: var(--primary);
		font-weight: 600;
	}

	.features-section {
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.features-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--primary);
	}

	.features-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.feature-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		position: relative;
		padding-bottom: 1rem;
	}

	.feature-item:last-child {
		padding-bottom: 0;
	}

	.feature-item::before {
		content: '';
		position: absolute;
		left: 5px;
		top: 14px;
		width: 2px;
		height: calc(100% - 2px);
		background: linear-gradient(
			to bottom,
			var(--primary),
			color-mix(in srgb, var(--primary) 30%, transparent)
		);
	}

	.feature-item:last-child::before {
		display: none;
	}

	.item-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--primary);
		flex-shrink: 0;
		margin-top: 4px;
		position: relative;
		z-index: 1;
		box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent);
	}

	.item-text {
		font-size: 0.9375rem;
		color: var(--muted-foreground);
		line-height: 1.5;
	}

	.cta-text {
		font-size: 0.9375rem;
		color: var(--muted-foreground);
		margin: 0;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.cta-text a {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 2px;
		font-weight: 500;
		transition: opacity 0.2s ease;
	}

	.cta-text a:hover {
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.future-plans {
			padding: 4rem 1.5rem;
		}

		.plans-card {
			padding: 1.5rem;
		}

		.intro-text {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.future-plans {
			padding: 3rem 1rem;
		}

		.content-wrapper {
			gap: 2rem;
		}

		.plans-card {
			padding: 1.25rem;
			gap: 1.25rem;
		}

		.intro-text {
			font-size: 0.9375rem;
			line-height: 1.6;
		}

		.features-section {
			padding-top: 1.25rem;
			gap: 0.875rem;
		}

		.item-text {
			font-size: 0.875rem;
		}

		.feature-item {
			padding-bottom: 0.875rem;
		}

		.cta-text {
			font-size: 0.875rem;
			padding-top: 1.25rem;
		}
	}
</style>

<script lang="ts">
	// No props needed - this is static content
</script>

<div class="hero-content">
	<h1 class="headline">
		<span class="headline-row">
			<span class="headline-word" style="animation-delay: 0.1s">For</span>
			<span class="headline-word" style="animation-delay: 0.15s">people</span>
			<span class="headline-word" style="animation-delay: 0.2s">who</span>
		</span>
		<span class="headline-row">
			<span class="headline-word headline-italic" style="animation-delay: 0.25s">care</span>
			<span class="headline-word" style="animation-delay: 0.3s">about</span>
		</span>
		<span class="headline-row">
			<span class="headline-word headline-accent" style="animation-delay: 0.35s">margins</span>
		</span>
	</h1>

	<p class="tagline">A simple tool to understand your costs.</p>

	<p class="value-prop-text">
		Your profit is leaking. <span class="text-highlight">Protect your margins</span> before they disappear.
	</p>

	<div class="cta-group">
		<a href="/dashboard" class="btn-primary">
			<span class="btn-bg"></span>
			<span class="btn-content">
				Get Started Free
				<svg
					class="btn-arrow"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M5 12H19M19 12L12 5M19 12L12 19" />
				</svg>
			</span>
		</a>
	</div>
</div>

<style>
	.hero-content {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.headline {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(2.75rem, 5vw, 4.5rem);
		font-weight: 700;
		line-height: 1.1;
		margin: 0;
		letter-spacing: -0.03em;
		color: var(--foreground);
	}

	.headline-row {
		display: block;
		overflow: hidden;
	}

	.headline-word {
		display: inline-block;
		animation: wordReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.headline-italic {
		font-weight: 300;
		color: var(--muted-foreground);
	}

	.headline-accent {
		color: black;
		position: relative;
	}

	.headline-accent::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--primary);
		height: 85%;
		transform: rotate(-2deg) translateY(10px) scaleY(0.9);
		z-index: -1;
		border-radius: 2px;
	}

	@keyframes wordReveal {
		from {
			opacity: 0;
			transform: translateY(100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tagline {
		font-size: 1.125rem;
		color: var(--muted-foreground);
		margin: 0;
		animation: fadeInUp 0.8s ease-out 0.5s both;
	}

	.text-highlight {
		color: var(--foreground);
		font-weight: 500;
	}

	.cta-group {
		display: flex;
		gap: 1rem;
		animation: fadeInUp 0.8s ease-out 0.7s both;
	}

	.btn-primary {
		position: relative;
		padding: 0.875rem 1.75rem;
		font-size: 0.9375rem;
		font-weight: 500;
		font-family: inherit;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		overflow: hidden;
		text-decoration: none;
		display: inline-flex;
	}

	.btn-primary {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.btn-primary .btn-bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, var(--primary) 0%, var(--chart-2) 100%);
		transition: all 0.3s ease;
	}

	.btn-primary:hover .btn-bg {
		transform: scale(1.02);
	}

	.btn-content {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-arrow {
		transition: transform 0.3s ease;
	}

	.btn-primary:hover .btn-arrow {
		transform: translateX(4px);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1024px) {
		.hero-content {
			align-items: center;
		}
	}

	@media (max-width: 768px) {
		.headline {
			font-size: clamp(2.25rem, 9vw, 3rem);
		}

		.cta-group {
			flex-direction: column;
			width: 100%;
		}

		.btn-primary,
		.btn-secondary {
			width: 100%;
			justify-content: center;
		}
	}
</style>

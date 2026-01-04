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

	<div class="value-prop">
		<div class="value-prop-icon">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
			</svg>
		</div>
		<p class="value-prop-text">
			Your profit is leaking. <span class="text-highlight">Protect your margins</span> before they
			disappear.
		</p>
	</div>

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
		<button class="btn-secondary">
			<span class="btn-content">See How It Works</span>
		</button>
	</div>
</div>

<style>
	.hero-content {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.headline {
		font-family: 'Instrument Serif', serif;
		font-size: clamp(2.75rem, 5vw, 4.5rem);
		font-weight: 400;
		line-height: 1.1;
		margin: 0;
		letter-spacing: -0.02em;
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
		font-style: italic;
		color: var(--muted-foreground);
	}

	.headline-accent {
		color: var(--primary);
		position: relative;
	}

	.headline-accent::after {
		content: '';
		position: absolute;
		bottom: 0.05em;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--primary);
		transform: scaleX(0);
		transform-origin: left;
		animation: underlineReveal 0.6s ease-out 0.8s forwards;
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

	@keyframes underlineReveal {
		to {
			transform: scaleX(1);
		}
	}

	.tagline {
		font-size: 1.125rem;
		color: var(--muted-foreground);
		margin: 0;
		animation: fadeInUp 0.8s ease-out 0.5s both;
	}

	.value-prop {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.25rem;
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 12px;
		animation: fadeInUp 0.8s ease-out 0.6s both;
	}

	.value-prop-icon {
		color: var(--primary);
		flex-shrink: 0;
	}

	.value-prop-text {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--muted-foreground);
		margin: 0;
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

	.btn-primary,
	.btn-secondary {
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

	.btn-secondary {
		background: transparent;
		color: var(--foreground);
		border: 1px solid var(--border);
		transition: all 0.3s ease;
	}

	.btn-secondary:hover {
		background: var(--muted);
		border-color: var(--muted-foreground);
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


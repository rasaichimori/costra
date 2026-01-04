<script lang="ts">
	// No props needed
</script>

<section class="final-cta">
	<div class="cta-content">
		<h2 class="cta-headline">Ready to protect your margins?</h2>
		<p class="cta-subtext">Start calculating your true costs today. No credit card required.</p>
		<a href="/dashboard" class="btn-primary btn-large">
			<span class="btn-bg"></span>
			<span class="btn-content">
				Start Free
				<svg
					class="btn-arrow"
					width="20"
					height="20"
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
</section>

<style>
	.final-cta {
		position: relative;
		z-index: 10;
		padding: 6rem 4rem;
		text-align: center;
	}

	.cta-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}

	.cta-headline {
		font-family: 'Instrument Serif', serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 400;
		margin: 0;
		letter-spacing: -0.02em;
		color: var(--foreground);
	}

	.cta-subtext {
		font-size: 1rem;
		color: var(--muted-foreground);
		margin: 0;
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

	.btn-large {
		padding: 1.125rem 2.25rem;
		font-size: 1rem;
	}

	@media (max-width: 768px) {
		.final-cta {
			padding: 4rem 1.5rem;
		}
	}
</style>


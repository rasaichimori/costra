<script lang="ts">
	// No props needed
</script>

<footer class="footer">
	<div class="footer-content">
		<div class="footer-brand">
			<span class="logo-mark">◈</span>
			<span class="logo-text">Costra</span>
		</div>
		<p class="footer-tagline">Built for people who care about margins.</p>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 10;
		padding: 2.5rem 4rem;
		border-top: 1px solid var(--border);
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.footer-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo-mark {
		font-size: 1.5rem;
		color: var(--primary);
	}

	.logo-text {
		font-family: 'Outfit', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--foreground);
	}

	.footer-tagline {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		margin: 0;
	}

	@media (max-width: 768px) {
		.footer {
			padding: 2rem 1.5rem;
		}
	}
</style>

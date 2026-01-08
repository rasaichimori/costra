<script lang="ts">
	import restaurantImage from '$lib/assets/images/20251009170620.jpg';
</script>

<section class="why-free" id="why-free">
	<div class="content-wrapper">
		<div class="section-header">
			<span class="section-number">02</span>
			<h2 class="section-title">Why is it Free?</h2>
		</div>

		<div class="reasons-grid">
			<div class="image-card">
				<img src={restaurantImage} alt="Lani Bowls restaurant" class="restaurant-image" />
			</div>
			<div class="reason-card main-reason">
				<p class="reason-text">
					I built Costra because I needed it myself. I started a <a
						href="https://www.instagram.com/lanibowls/"
						target="_blank">little restaurant</a
					> back in April 2025 and I've needed a quick way to find the cost of new recipes.
				</p>
				<p class="reason-text">
					Charging for it felt wrong. The people who need this most are often the ones who can least
					afford another subscription.
				</p>

				<div class="how-free">
					<span class="how-free-label">How I keep it free</span>
					<ul class="connected-list">
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">No backend — your data is stored locally in your browser</span
							>
						</li>
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">No servers to maintain means no costs to pass on</span>
						</li>
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">I don't even have a domain name for it</span>
						</li>
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">Built as a passion project, not a business</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.why-free {
		position: relative;
		z-index: 10;
		padding: 6rem 4rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.content-wrapper {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.section-header {
		display: flex;
		flex-direction: column;
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

	.reasons-grid {
		display: grid;
		grid-template-columns: 1fr 1.2fr;
		gap: 1.5rem;
		align-items: stretch;
	}

	.image-card {
		border-radius: 12px;
		overflow: hidden;
		position: relative;
	}

	.restaurant-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 12px;
		transition: transform 0.4s ease;
	}

	.image-card:hover .restaurant-image {
		transform: scale(1.02);
	}

	.reason-card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2rem;
		transition: all 0.3s ease;
	}

	.reason-card:hover {
		border-color: var(--primary);
		transform: translateY(-2px);
	}

	.main-reason {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.reason-text {
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--foreground);
		margin: 0;
		position: relative;
		z-index: 1;
	}

	.reason-text a {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: opacity 0.2s ease;
	}

	.reason-text a:hover {
		opacity: 0.8;
	}

	.how-free {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.how-free-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--primary);
		display: block;
		margin-bottom: 1rem;
	}

	.connected-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.connected-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		position: relative;
		padding-bottom: 1.25rem;
	}

	.connected-item:last-child {
		padding-bottom: 0;
	}

	/* Connecting line */
	.connected-item::before {
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

	.connected-item:last-child::before {
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

	@media (max-width: 1024px) {
		.reasons-grid {
			grid-template-columns: 1fr;
		}

		.image-card {
			max-height: 400px;
		}
	}

	@media (max-width: 768px) {
		.why-free {
			padding: 4rem 1.5rem;
		}

		.image-card {
			max-height: 300px;
		}
	}
</style>

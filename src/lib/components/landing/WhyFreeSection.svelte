<script lang="ts">
	import restaurantImage from '$lib/assets/images/20251009170620.jpg';
	import { m } from '$lib/paraglide/messages.js';
</script>

<section class="why-free" id="why-free">
	<div class="content-wrapper">
		<div class="section-header">
			<span class="section-number">02</span>
			<h2 class="section-title">{m.whyFreeSectionTitle()}</h2>
		</div>

		<div class="reasons-grid">
			<div class="image-card">
				<img src={restaurantImage} alt={m.restaurantImageAlt()} class="restaurant-image" />
			</div>
			<div class="reason-card main-reason">
				<p class="reason-text">
					{m.whyFreeReason1Before()}<a
						href="https://www.instagram.com/lanibowls/"
						target="_blank">{m.whyFreeRestaurantLink()}</a
					>{m.whyFreeReason1After()}
				</p>
				<p class="reason-text">
					{m.whyFreeReason2()}
				</p>

				<div class="how-free">
					<span class="how-free-label">{m.howFreeLabel()}</span>
					<ul class="connected-list">
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">{m.howFreeItem1()}</span>
						</li>
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">{m.howFreeItem2()}</span>
						</li>
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">{m.howFreeItem3()}</span>
						</li>
						<li class="connected-item">
							<span class="item-dot"></span>
							<span class="item-text">{m.howFreeItem4()}</span>
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

	.reasons-grid {
		display: grid;
		grid-template-columns: 1fr 1.2fr;
		gap: 2rem;
		width: 100%;
		max-width: 1000px;
	}

	.image-card {
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid var(--border);
		aspect-ratio: 4/5;
	}

	.restaurant-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.reason-card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		transition: all 0.3s ease;
	}

	.reason-card:hover {
		border-color: var(--primary);
		transform: translateY(-2px);
	}

	.reason-text {
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--foreground);
		margin: 0;
	}

	.reason-text a {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 2px;
		font-weight: 500;
	}

	.how-free {
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.how-free-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--primary);
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
		padding-bottom: 1rem;
	}

	.connected-item:last-child {
		padding-bottom: 0;
	}

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

	@media (max-width: 768px) {
		.why-free {
			padding: 4rem 1.5rem;
		}

		.reasons-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.image-card {
			aspect-ratio: 16/10;
			max-height: 280px;
		}

		.reason-card {
			padding: 1.5rem;
		}

		.reason-text {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.why-free {
			padding: 3rem 1rem;
		}

		.content-wrapper {
			gap: 2rem;
		}

		.reason-card {
			padding: 1.25rem;
			gap: 1rem;
		}

		.reason-text {
			font-size: 0.9375rem;
			line-height: 1.6;
		}

		.how-free {
			padding-top: 1.25rem;
			gap: 0.875rem;
		}

		.item-text {
			font-size: 0.875rem;
		}

		.connected-item {
			padding-bottom: 0.875rem;
		}
	}
</style>

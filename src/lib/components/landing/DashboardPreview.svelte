<script lang="ts">
	interface Props {
		tiltX?: number;
		tiltY?: number;
	}

	let { tiltX = 0, tiltY = 0 }: Props = $props();
</script>

<div class="hero-visual-wrapper">
	<div
		class="hero-visual"
		style="transform: perspective(1000px) rotateX({tiltX}deg) rotateY({tiltY}deg)"
	>
		<div class="dashboard-preview">
			<div class="preview-header">
				<div class="preview-dots">
					<span class="dot red"></span>
					<span class="dot yellow"></span>
					<span class="dot green"></span>
				</div>
				<span class="preview-title">Recipe Cost Calculator</span>
			</div>
			<div class="preview-content">
				<!-- Recipe name -->
				<div class="preview-recipe-header">
					<span class="recipe-name">Chocolate Cake</span>
					<span class="recipe-badge">Recipe</span>
				</div>

				<!-- Ingredients list -->
				<div class="preview-ingredients">
					<div class="ingredient-row header">
						<span class="ing-name">Ingredient</span>
						<span class="ing-qty">Qty</span>
						<span class="ing-unit">Unit</span>
						<span class="ing-cost">Cost</span>
					</div>
					<div class="ingredient-row">
						<span class="ing-name">All-Purpose Flour</span>
						<span class="ing-qty">250</span>
						<span class="ing-unit">g</span>
						<span class="ing-cost">$0.42</span>
					</div>
					<div class="ingredient-row">
						<span class="ing-name">Cocoa Powder</span>
						<span class="ing-qty">75</span>
						<span class="ing-unit">g</span>
						<span class="ing-cost">$1.85</span>
					</div>
					<div class="ingredient-row">
						<span class="ing-name">Butter</span>
						<span class="ing-qty">200</span>
						<span class="ing-unit">g</span>
						<span class="ing-cost">$2.40</span>
					</div>
					<div class="ingredient-row">
						<span class="ing-name">Sugar</span>
						<span class="ing-qty">300</span>
						<span class="ing-unit">g</span>
						<span class="ing-cost">$0.36</span>
					</div>
					<div class="ingredient-row">
						<span class="ing-name">Eggs</span>
						<span class="ing-qty">4</span>
						<span class="ing-unit">pcs</span>
						<span class="ing-cost">$1.20</span>
					</div>
				</div>

				<!-- Cost summary -->
				<div class="preview-summary">
					<div class="summary-row">
						<span class="summary-label">Total Cost</span>
						<span class="summary-value">$6.23</span>
					</div>
					<div class="summary-row highlight">
						<span class="summary-label">Sell Price</span>
						<span class="summary-value">$18.00</span>
					</div>
					<div class="summary-row margin">
						<span class="summary-label">Margin</span>
						<span class="summary-value positive">65.4%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Floating cards -->
		<div class="floating-card card-1">
			<span class="card-icon">✓</span>
			<span class="card-text">Cost updated</span>
		</div>
		<div class="floating-card card-2">
			<span class="card-value">+12%</span>
			<span class="card-text">Margin improved</span>
		</div>
	</div>
	<!-- Shadow/reflection -->
	<div
		class="preview-shadow"
		style="transform: perspective(1000px) rotateX(80deg) rotateY({tiltY * 0.5}deg) translateZ(-50px)"
	></div>
</div>

<style>
	.hero-visual-wrapper {
		position: relative;
		animation: fadeInUp 1s ease-out 0.4s both;
		perspective: 1000px;
	}

	.hero-visual {
		position: relative;
		transition: transform 0.15s ease-out;
		transform-style: preserve-3d;
	}

	.dashboard-preview {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 20px 40px -10px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--muted);
		border-bottom: 1px solid var(--border);
	}

	.preview-dots {
		display: flex;
		gap: 6px;
	}

	.preview-dots .dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.dot.red {
		background: #ff5f57;
	}
	.dot.yellow {
		background: #febc2e;
	}
	.dot.green {
		background: #28c840;
	}

	.preview-title {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--muted-foreground);
	}

	.preview-content {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preview-recipe-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.recipe-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.recipe-badge {
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.5rem;
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		color: var(--primary);
		border-radius: 4px;
	}

	.preview-ingredients {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.ingredient-row {
		display: grid;
		grid-template-columns: 1fr 50px 40px 60px;
		gap: 0.5rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.8125rem;
		color: var(--foreground);
	}

	.ingredient-row.header {
		font-weight: 500;
		color: var(--muted-foreground);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
	}

	.ingredient-row:last-child {
		border-bottom: none;
	}

	.ing-qty,
	.ing-unit,
	.ing-cost {
		text-align: right;
	}

	.ing-cost {
		font-weight: 500;
		color: var(--primary);
	}

	.preview-summary {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 0.75rem;
		border-top: 2px solid var(--border);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
	}

	.summary-row.highlight {
		background: var(--muted);
	}

	.summary-row.margin {
		background: color-mix(in srgb, var(--primary) 12%, transparent);
	}

	.summary-label {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
	}

	.summary-value {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.summary-value.positive {
		color: #22c55e;
	}

	.preview-shadow {
		position: absolute;
		bottom: -30px;
		left: 10%;
		right: 10%;
		height: 40px;
		background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.2) 0%, transparent 70%);
		filter: blur(10px);
		transition: transform 0.15s ease-out;
	}

	.floating-card {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		font-size: 0.8125rem;
		animation: floatCard 3s ease-in-out infinite;
		z-index: 10;
	}

	.card-1 {
		top: 10px;
		right: -20px;
		animation-delay: 0s;
	}

	.card-2 {
		bottom: 60px;
		left: -30px;
		animation-delay: 1.5s;
	}

	.card-icon {
		color: #22c55e;
		font-weight: 600;
	}

	.card-value {
		color: #22c55e;
		font-weight: 600;
	}

	.card-text {
		color: var(--muted-foreground);
	}

	@keyframes floatCard {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
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
		.hero-visual-wrapper {
			max-width: 480px;
			margin: 0 auto;
		}

		.floating-card {
			display: none;
		}
	}
</style>


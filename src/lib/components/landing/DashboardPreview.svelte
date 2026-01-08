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

				<!-- Ingredients list with donut chart -->
				<div class="ingredients-section">
					<div class="preview-ingredients">
						<div class="ingredient-row header">
							<span class="ing-name">Ingredient</span>
							<span class="ing-qty">Qty</span>
							<span class="ing-unit">Unit</span>
							<span class="ing-cost">Cost</span>
						</div>
						<div class="ingredient-row">
							<span class="ing-name"
								><span class="ing-dot" style="background: #f97316;"></span>All-Purpose Flour</span
							>
							<span class="ing-qty">250</span>
							<span class="ing-unit">g</span>
							<span class="ing-cost">$0.42</span>
						</div>
						<div class="ingredient-row">
							<span class="ing-name"
								><span class="ing-dot" style="background: #8b5cf6;"></span>Cocoa Powder</span
							>
							<span class="ing-qty">75</span>
							<span class="ing-unit">g</span>
							<span class="ing-cost">$1.85</span>
						</div>
						<div class="ingredient-row">
							<span class="ing-name"
								><span class="ing-dot" style="background: #eab308;"></span>Butter</span
							>
							<span class="ing-qty">200</span>
							<span class="ing-unit">g</span>
							<span class="ing-cost">$2.40</span>
						</div>
						<div class="ingredient-row">
							<span class="ing-name"
								><span class="ing-dot" style="background: #ec4899;"></span>Sugar</span
							>
							<span class="ing-qty">300</span>
							<span class="ing-unit">g</span>
							<span class="ing-cost">$0.36</span>
						</div>
						<div class="ingredient-row">
							<span class="ing-name"
								><span class="ing-dot" style="background: #22c55e;"></span>Eggs</span
							>
							<span class="ing-qty">4</span>
							<span class="ing-unit">pcs</span>
							<span class="ing-cost">$1.20</span>
						</div>
					</div>

					<!-- Floating Donut Chart -->
					<div class="donut-card">
						<div class="donut-chart-container">
							<svg class="donut-chart" viewBox="0 0 100 100">
								<circle
									cx="50"
									cy="50"
									r="35"
									fill="none"
									stroke="var(--border)"
									stroke-width="12"
								/>
								<circle
									cx="50"
									cy="50"
									r="35"
									fill="none"
									stroke="#f97316"
									stroke-width="12"
									stroke-dasharray="14.8 205.2"
									stroke-dashoffset="55"
									class="donut-segment"
									style="animation-delay: 0.1s"
								/>
								<circle
									cx="50"
									cy="50"
									r="35"
									fill="none"
									stroke="#8b5cf6"
									stroke-width="12"
									stroke-dasharray="65.3 154.7"
									stroke-dashoffset="40.2"
									class="donut-segment"
									style="animation-delay: 0.2s"
								/>
								<circle
									cx="50"
									cy="50"
									r="35"
									fill="none"
									stroke="#eab308"
									stroke-width="12"
									stroke-dasharray="84.7 135.3"
									stroke-dashoffset="-25.1"
									class="donut-segment"
									style="animation-delay: 0.3s"
								/>
								<circle
									cx="50"
									cy="50"
									r="35"
									fill="none"
									stroke="#ec4899"
									stroke-width="12"
									stroke-dasharray="12.7 207.3"
									stroke-dashoffset="-109.8"
									class="donut-segment"
									style="animation-delay: 0.4s"
								/>
								<circle
									cx="50"
									cy="50"
									r="35"
									fill="none"
									stroke="#22c55e"
									stroke-width="12"
									stroke-dasharray="42.5 177.5"
									stroke-dashoffset="-122.5"
									class="donut-segment"
									style="animation-delay: 0.5s"
								/>
							</svg>
							<div class="donut-center">
								<span class="donut-total">$6.23</span>
								<span class="donut-label">Total</span>
							</div>
						</div>
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
		style="transform: perspective(1000px) rotateX(80deg) rotateY({tiltY *
			0.5}deg) translateZ(-50px)"
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
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 20px 40px -10px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
		transform-style: preserve-3d;
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--muted);
		border-bottom: 1px solid var(--border);
		border-radius: 11px 11px 0 0;
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
		transform-style: preserve-3d;
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

	.ingredients-section {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		transform-style: preserve-3d;
	}

	.preview-ingredients {
		display: flex;
		flex-direction: column;
		gap: 0;
		flex: 1;
		min-width: 0;
	}

	.ing-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		margin-right: 6px;
	}

	.donut-card {
		padding: 0.5rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		animation: floatDonut 3s ease-in-out infinite;
		animation-delay: 0.75s;
		flex-shrink: 0;
		transform-style: preserve-3d;
	}

	.donut-chart-container {
		position: relative;
		width: 90px;
		height: 90px;
		transform-style: preserve-3d;
	}

	.donut-chart {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.donut-segment {
		opacity: 0;
		animation: donutReveal 0.5s ease-out forwards;
	}

	@keyframes donutReveal {
		from {
			opacity: 0;
			stroke-dasharray: 0 220;
		}
		to {
			opacity: 1;
		}
	}

	.donut-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	.donut-total {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--foreground);
		line-height: 1;
	}

	.donut-label {
		font-size: 0.5625rem;
		color: var(--muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
		transition: all 0.15s ease-out;
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
			transform: translateY(0) translateZ(10px);
		}
		50% {
			transform: translateY(-8px) translateZ(10px);
		}
	}

	@keyframes floatDonut {
		0%,
		100% {
			transform: translateY(0) translateZ(60px);
		}
		50% {
			transform: translateY(-8px) translateZ(60px);
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px) translateZ(60px);
		}
		to {
			opacity: 1;
			transform: translateY(0) translateZ(60px);
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

	@media (max-width: 768px) {
		.hero-visual-wrapper {
			max-width: 100%;
		}

		.preview-content {
			padding: 1rem;
		}

		.recipe-name {
			font-size: 1rem;
		}

		.donut-chart-container {
			width: 80px;
			height: 80px;
		}
	}

	@media (max-width: 480px) {
		.floating-card,
		.donut-card {
			display: none;
		}

		.ing-dot {
			display: none;
		}

		.preview-header {
			padding: 0.625rem 0.875rem;
		}

		.preview-content {
			padding: 0.875rem;
			gap: 0.75rem;
		}

		.recipe-name {
			font-size: 0.9375rem;
		}

		.recipe-badge {
			font-size: 0.625rem;
			padding: 0.1875rem 0.375rem;
		}

		.ingredient-row {
			grid-template-columns: 1fr 40px 35px 50px;
			gap: 0.375rem;
			padding: 0.375rem 0;
			font-size: 0.75rem;
		}

		.ingredient-row.header {
			font-size: 0.625rem;
		}

		.summary-row {
			padding: 0.375rem 0.625rem;
		}

		.summary-label {
			font-size: 0.75rem;
		}

		.summary-value {
			font-size: 0.875rem;
		}

		.preview-shadow {
			display: none;
		}
	}
</style>

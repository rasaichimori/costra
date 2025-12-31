<script>
	import { onMount } from 'svelte';
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';

	let mounted = false;
	let mouseX = 0;
	let mouseY = 0;

	onMount(() => {
		mounted = true;

		// Mouse tracking for interactive effects
		const handleMouseMove = (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		document.addEventListener('mousemove', handleMouseMove);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
		};
	});
</script>

<svelte:head>
	<title>Costra - Product Cost Calculator</title>
	<meta name="description" content="Modern cost calculation for your products" />
</svelte:head>

<main class="container">
	<div class="theme-toggle-container">
		<ThemeToggle />
	</div>
	<!-- Geometric background elements -->
	<div class="bg-geometry">
		<div
			class="geometry-circle"
			style="transform: translate({mouseX * 0.02}px, {mouseY * 0.02}px)"
		></div>
		<div
			class="geometry-square"
			style="transform: translate({mouseX * -0.01}px, {mouseY * -0.01}px) rotate({mouseX *
				0.01}deg)"
		></div>
		<div
			class="geometry-triangle"
			style="transform: translate({mouseX * 0.015}px, {mouseY * 0.015}px) rotate({mouseX *
				-0.005}deg)"
		></div>
	</div>

	<div class="hero" class:animate={mounted}>
		<!-- Floating glass elements -->
		<div
			class="glass-orb glass-orb-1"
			style="transform: translate({mouseX * 0.01}px, {mouseY * 0.01}px)"
		></div>
		<div
			class="glass-orb glass-orb-2"
			style="transform: translate({mouseX * -0.008}px, {mouseY * -0.008}px)"
		></div>
		<div
			class="glass-orb glass-orb-3"
			style="transform: translate({mouseX * 0.012}px, {mouseY * 0.012}px)"
		></div>

		<div class="hero-content">
			<div class="title-container">
				<div class="title-decoration"></div>
				<h1 class="title">
					<span class="title-main" data-text="COSTRA">COSTRA</span>
					<span class="title-sub">Product Cost Calculator</span>
				</h1>
			</div>

			<p class="description">
				<span class="description-highlight">Precision</span> cost analysis for the modern business.
				Calculate, optimize, and scale your product economics with
				<span class="description-highlight">intelligent insights</span>.
			</p>

			<div class="cta-section">
				<button class="cta-primary">
					<span class="cta-bg"></span>
					<span class="cta-text">
						Start Calculating
						<span class="arrow">→</span>
					</span>
				</button>
				<button class="cta-secondary">
					<span class="cta-border"></span>
					<span class="cta-text">View Demo</span>
				</button>
			</div>

			<div class="metrics-grid">
				<div class="metric-card">
					<div class="metric-value">99.9%</div>
					<div class="metric-label">Precision</div>
					<div class="metric-bar"><div class="metric-fill" style="width: 99.9%"></div></div>
				</div>
				<div class="metric-card">
					<div class="metric-value">&lt;0.5s</div>
					<div class="metric-label">Response</div>
					<div class="metric-bar"><div class="metric-fill" style="width: 95%"></div></div>
				</div>
				<div class="metric-card">
					<div class="metric-value">∞</div>
					<div class="metric-label">Scale</div>
					<div class="metric-bar"><div class="metric-fill" style="width: 100%"></div></div>
				</div>
			</div>
		</div>
	</div>

	<div class="features-section">
		<div class="section-header">
			<h2 class="section-title">Advanced Capabilities</h2>
			<div class="section-line"></div>
		</div>

		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-header">
					<div class="feature-icon-modern">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M13 3L4 14H11L10.5 21L19.5 10H13L13 3Z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<div class="feature-badge">Real-time</div>
				</div>
				<h3 class="feature-title">Lightning Calculation</h3>
				<p class="feature-description">
					Instant cost analysis powered by real-time market data and advanced algorithms
				</p>
				<div class="feature-footer">
					<span class="feature-link">Explore →</span>
				</div>
			</div>

			<div class="feature-card">
				<div class="feature-header">
					<div class="feature-icon-modern">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M3 3V21H21V3H3Z" stroke="currentColor" stroke-width="2" />
							<path d="M9 9L15 15" stroke="currentColor" stroke-width="2" />
							<path d="M15 9L9 15" stroke="currentColor" stroke-width="2" />
						</svg>
					</div>
					<div class="feature-badge">AI-Powered</div>
				</div>
				<h3 class="feature-title">Smart Analytics</h3>
				<p class="feature-description">
					Deep cost insights with predictive modeling and optimization recommendations
				</p>
				<div class="feature-footer">
					<span class="feature-link">Discover →</span>
				</div>
			</div>

			<div class="feature-card">
				<div class="feature-header">
					<div class="feature-icon-modern">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M12 2L2 7V17C2 17.5304 2.21071 18.0391 2.58579 18.4142C2.96086 18.7893 3.46957 19 4 19H20C20.5304 19 21.0391 18.7893 21.4142 18.4142C21.7893 18.0391 22 17.5304 22 17V7L12 2Z"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<div class="feature-badge">Flexible</div>
				</div>
				<h3 class="feature-title">Adaptive Framework</h3>
				<p class="feature-description">
					Customizable architecture that scales with your business complexity and requirements
				</p>
				<div class="feature-footer">
					<span class="feature-link">Configure →</span>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			'Outfit',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			system-ui,
			sans-serif;
		background: var(--background);
		color: var(--foreground);
		overflow-x: hidden;
		font-feature-settings:
			'ss02' on,
			'ss03' on;
		scroll-behavior: smooth;
	}

	.container {
		min-height: 100vh;
		background:
			radial-gradient(ellipse 80% 80% at 50% -20%, rgba(20, 20, 30, 0.8), transparent),
			radial-gradient(ellipse 80% 80% at 80% 80%, rgba(30, 20, 40, 0.4), transparent),
			linear-gradient(180deg, #000000 0%, #0a0a0f 50%, #000000 100%);
		position: relative;
		overflow: hidden;
	}

	.theme-toggle-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;
	}

	/* Geometric Background Elements */
	.bg-geometry {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}

	.geometry-circle {
		position: absolute;
		top: 20%;
		right: 15%;
		width: 300px;
		height: 300px;
		border: 1px solid rgba(255, 255, 255, 0.03);
		border-radius: 50%;
		backdrop-filter: blur(1px);
	}

	.geometry-square {
		position: absolute;
		bottom: 30%;
		left: 10%;
		width: 150px;
		height: 150px;
		border: 1px solid rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(1px);
	}

	.geometry-triangle {
		position: absolute;
		top: 60%;
		right: 30%;
		width: 0;
		height: 0;
		border-left: 75px solid transparent;
		border-right: 75px solid transparent;
		border-bottom: 130px solid rgba(255, 255, 255, 0.01);
	}

	/* Glass Orbs */
	.glass-orb {
		position: absolute;
		border-radius: 50%;
		background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		pointer-events: none;
		z-index: 2;
	}

	.glass-orb-1 {
		top: 15%;
		left: 20%;
		width: 120px;
		height: 120px;
	}

	.glass-orb-2 {
		bottom: 25%;
		right: 25%;
		width: 80px;
		height: 80px;
	}

	.glass-orb-3 {
		top: 70%;
		left: 15%;
		width: 60px;
		height: 60px;
	}

	/* Hero Section */
	.hero {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		position: relative;
		z-index: 10;
	}

	.hero-content {
		text-align: center;
		max-width: 900px;
		opacity: 0;
		transform: translateY(40px);
		transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hero.animate .hero-content {
		opacity: 1;
		transform: translateY(0);
	}

	/* Title Container */
	.title-container {
		position: relative;
	}

	.title-decoration {
		position: absolute;
		top: -20px;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 2px;
		background: linear-gradient(90deg, transparent, #ffffff, transparent);
		opacity: 0.6;
	}

	.title {
		margin: 0;
		line-height: 1;
		position: relative;
	}

	.title-main {
		display: block;
		font-size: clamp(4rem, 12vw, 8rem);
		font-weight: 100;
		letter-spacing: 0.2em;
		background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
		text-transform: uppercase;
	}

	.title-main::before {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		z-index: -1;
		transform: translate(2px, 2px);
	}

	.title-sub {
		display: block;
		font-size: clamp(0.9rem, 2.5vw, 1.2rem);
		font-weight: 300;
		color: rgba(255, 255, 255, 0.6);
		letter-spacing: 0.3em;
		text-transform: uppercase;
		margin-top: 1rem;
	}

	/* Description */
	.description {
		font-size: clamp(1.2rem, 2.8vw, 1.6rem);
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 4rem 0;
		font-weight: 300;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
	}

	.description-highlight {
		background: linear-gradient(135deg, #ffffff 0%, #d0d0d0 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-weight: 400;
	}

	/* CTA Section */
	.cta-section {
		display: flex;
		gap: 2rem;
		justify-content: center;
		margin: 0 0 5rem 0;
		flex-wrap: wrap;
	}

	.cta-primary,
	.cta-secondary {
		position: relative;
		padding: 1.2rem 2.5rem;
		border: none;
		border-radius: 0;
		font-size: 0.95rem;
		font-weight: 400;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		overflow: hidden;
		font-family: inherit;
	}

	.cta-primary {
		background: transparent;
		color: #000000;
	}

	.cta-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
		transition: all 0.4s ease;
		z-index: -1;
	}

	.cta-text {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	.cta-primary:hover .cta-bg {
		background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
		transform: translateY(-2px);
	}

	.cta-secondary {
		background: transparent;
		color: #ffffff;
		position: relative;
	}

	.cta-border {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.4s ease;
		z-index: -1;
	}

	.cta-secondary:hover .cta-border {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.05);
		transform: translateY(-2px);
	}

	.arrow {
		transition: transform 0.3s ease;
		font-size: 1.1em;
	}

	.cta-primary:hover .arrow {
		transform: translateX(6px);
	}

	/* Metrics Grid */
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 3rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.metric-card {
		text-align: center;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
	}

	.metric-card:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-3px);
	}

	.metric-value {
		font-size: 2.2rem;
		font-weight: 200;
		color: #ffffff;
		line-height: 1;
	}

	.metric-label {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.15em;
	}

	.metric-bar {
		width: 100%;
		height: 2px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}

	.metric-fill {
		height: 100%;
		background: linear-gradient(90deg, #ffffff 0%, #a0a0a0 100%);
		transition: width 1s ease-in-out 0.5s;
	}

	/* Features Section */
	.features-section {
		padding: 8rem 2rem;
		max-width: 1400px;
		margin: 0 auto;
		position: relative;
		z-index: 10;
	}

	.section-header {
		text-align: center;
	}

	.section-title {
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 100;
		color: #ffffff;
		margin: 0 0 2rem 0;
		letter-spacing: 0.05em;
	}

	.section-line {
		width: 100px;
		height: 1px;
		background: linear-gradient(90deg, transparent, #ffffff, transparent);
		margin: 0 auto;
		opacity: 0.4;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		padding: 3rem 2rem;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.03) 0%,
			rgba(255, 255, 255, 0.01) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		position: relative;
		overflow: hidden;
	}

	.feature-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.feature-card:hover {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-8px);
	}

	.feature-card:hover::before {
		opacity: 1;
	}

	.feature-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.feature-icon-modern {
		width: 48px;
		height: 48px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.02);
		color: rgba(255, 255, 255, 0.8);
		transition: all 0.3s ease;
	}

	.feature-card:hover .feature-icon-modern {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.feature-badge {
		font-size: 0.7rem;
		padding: 0.3rem 0.8rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 500;
	}

	.feature-title {
		font-size: 1.5rem;
		font-weight: 300;
		color: #ffffff;
		margin: 0 0 1rem 0;
		letter-spacing: 0.02em;
	}

	.feature-description {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
		margin: 0 0 2rem 0;
		font-weight: 300;
	}

	.feature-footer {
		margin-top: auto;
	}

	.feature-link {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 400;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.feature-card:hover .feature-link {
		color: #ffffff;
		transform: translateX(4px);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.cta-section {
			flex-direction: column;
			align-items: center;
		}

		.cta-primary,
		.cta-secondary {
			width: 100%;
			max-width: 320px;
		}

		.metrics-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.feature-card {
			padding: 2rem 1.5rem;
		}

		.geometry-circle {
			width: 200px;
			height: 200px;
		}

		.geometry-square {
			width: 100px;
			height: 100px;
		}

		.glass-orb-1 {
			width: 80px;
			height: 80px;
		}

		.glass-orb-2 {
			width: 60px;
			height: 60px;
		}

		.glass-orb-3 {
			width: 40px;
			height: 40px;
		}
	}

	@media (max-width: 480px) {
		.features-section {
			padding: 4rem 1rem;
		}

		.hero {
			padding: 1rem;
		}

		.metrics-grid {
			gap: 1rem;
		}

		.metric-card {
			padding: 1rem;
		}
	}

	/* Animation delays for staggered entrance */
	.hero.animate .title-container {
		animation: slideInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
	}

	.hero.animate .description {
		animation: slideInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both;
	}

	.hero.animate .cta-section {
		animation: slideInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both;
	}

	.hero.animate .metrics-grid {
		animation: slideInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s both;
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

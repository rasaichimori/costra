<script lang="ts">
	import { onMount } from 'svelte';
	import {
		LandingNav,
		LandingBackground,
		HeroContent,
		DashboardPreview,
		FeaturesSection,
		WhyFreeSection,
		FuturePlansSection,
		LandingFooter
	} from '$lib/components/landing';
	import { overlays } from '$lib/contexts/overlay.svelte';

	let mouseX = $state(0);
	let mouseY = $state(0);
	let scrollY = $state(0);

	// Close all modals when landing page mounts
	onMount(() => {
		overlays.splice(0);
	});

	const handleMouseMove = (e: MouseEvent) => {
		mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
		mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
	};

	const handleScroll = () => {
		scrollY = window.scrollY;
	};

	// Calculate 3D tilt for the preview window
	const tiltX = $derived(mouseY * -8);
	const tiltY = $derived(mouseX * 8);
</script>

<svelte:window onmousemove={handleMouseMove} onscroll={handleScroll} />

<svelte:head>
	<title>Costra - Protect Your Margins</title>
	<meta
		name="description"
		content="A simple tool to understand your costs and protect your margins"
	/>
</svelte:head>

<main class="landing" onmousemove={handleMouseMove}>
	<LandingBackground {mouseX} {mouseY} />
	<LandingNav scrolled={scrollY > 50} />

	<section class="hero">
		<HeroContent />
		<DashboardPreview {tiltX} {tiltY} />
	</section>

	<FeaturesSection />
	<WhyFreeSection />
	<FuturePlansSection />
	<LandingFooter />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}

	.landing {
		font-family:
			'Outfit',
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
		min-height: 100vh;
		position: relative;
		background: var(--background);
		color: var(--foreground);
	}

	.hero {
		position: relative;
		z-index: 10;
		min-height: 800px;
		display: grid;
		grid-template-columns: 1fr 1.1fr;
		align-items: center;
		gap: 4rem;
		padding: 8rem 4rem 4rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	@media (max-width: 1024px) {
		.hero {
			grid-template-columns: 1fr;
			padding: 7rem 2rem 4rem;
			text-align: center;
			min-height: auto;
			gap: 3rem;
		}
	}

	@media (max-width: 768px) {
		.hero {
			padding: 5.5rem 1.25rem 2.5rem;
			gap: 2.5rem;
		}
	}

	@media (max-width: 480px) {
		.hero {
			padding: 5rem 1rem 2rem;
			gap: 2rem;
		}
	}
</style>

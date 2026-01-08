<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		mouseX?: number;
		mouseY?: number;
	}

	let { mouseX = 0, mouseY = 0 }: Props = $props();

	let scrollY = $state(0);

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll(); // Initial value

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<!-- Animated gradient mesh background -->
<div class="gradient-mesh" style="transform: translate({mouseX * 20}px, {mouseY * 20}px)">
	<div class="mesh-blob mesh-1"></div>
	<div class="mesh-blob mesh-2"></div>
	<div class="mesh-blob mesh-3"></div>
</div>

<!-- Noise texture overlay -->
<div class="noise-overlay"></div>

<!-- Grid lines -->
<div class="grid-lines">
	{#each Array(12) as _, i}
		<div class="grid-line" style="left: {(i + 1) * (100 / 13)}%"></div>
	{/each}
</div>

<!-- Floating orbs -->
<div class="floating-elements">
	<div
		class="float-orb orb-1"
		style="transform: translate({mouseX * -30 + scrollY * 0.1}px, {mouseY * -30 +
			scrollY * 0.15}px)"
	></div>
	<div
		class="float-orb orb-2"
		style="transform: translate({mouseX * 40 + scrollY * -0.12}px, {mouseY * 25 + scrollY * 0.1}px)"
	></div>
	<div
		class="float-orb orb-3"
		style="transform: translate({mouseX * -20 + scrollY * 0.08}px, {mouseY * 35 +
			scrollY * -0.12}px)"
	></div>
	<div
		class="float-orb orb-4"
		style="transform: translate({mouseX * 35 + scrollY * -0.1}px, {mouseY * -25 +
			scrollY * 0.13}px)"
	></div>
	<div
		class="float-orb orb-5"
		style="transform: translate({mouseX * -35 + scrollY * 0.11}px, {mouseY * 20 +
			scrollY * -0.09}px)"
	></div>
	<div
		class="float-orb orb-6"
		style="transform: translate({mouseX * 25 + scrollY * -0.13}px, {mouseY * 30 +
			scrollY * 0.11}px)"
	></div>
	<div
		class="float-orb orb-7"
		style="transform: translate({mouseX * -25 + scrollY * 0.09}px, {mouseY * -35 +
			scrollY * -0.14}px)"
	></div>
	<div
		class="float-orb orb-8"
		style="transform: translate({mouseX * 30 + scrollY * -0.11}px, {mouseY * -20 +
			scrollY * 0.12}px)"
	></div>
</div>

<style>
	.gradient-mesh {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		transition: transform 0.3s ease-out;
	}

	.mesh-blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(120px);
		opacity: 0.4;
	}

	.mesh-1 {
		top: -20%;
		right: -10%;
		width: 60vw;
		height: 60vw;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--primary) 20%, transparent) 0%,
			transparent 70%
		);
		animation: float1 20s ease-in-out infinite;
	}

	.mesh-2 {
		bottom: -30%;
		left: -20%;
		width: 70vw;
		height: 70vw;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--chart-2) 15%, transparent) 0%,
			transparent 70%
		);
		animation: float2 25s ease-in-out infinite;
	}

	.mesh-3 {
		top: 40%;
		left: 30%;
		width: 40vw;
		height: 40vw;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--chart-3) 12%, transparent) 0%,
			transparent 70%
		);
		animation: float3 22s ease-in-out infinite;
	}

	@keyframes float1 {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(-50px, 30px) scale(1.1);
		}
	}

	@keyframes float2 {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(40px, -40px) scale(1.05);
		}
	}

	@keyframes float3 {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(-30px, 50px) scale(1.08);
		}
	}

	.noise-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
		opacity: 0.02;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
	}

	.grid-lines {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}

	.grid-line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: linear-gradient(
			180deg,
			transparent 0%,
			var(--border) 20%,
			var(--border) 80%,
			transparent 100%
		);
		opacity: 0.3;
	}

	.floating-elements {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 2;
	}

	.float-orb {
		position: absolute;
		border-radius: 50%;
		transition: transform 0.4s ease-out;
	}

	.orb-1 {
		top: 15%;
		left: 10%;
		width: 6px;
		height: 6px;
		background: var(--primary);
		box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 50%, transparent);
	}

	.orb-2 {
		top: 60%;
		right: 15%;
		width: 4px;
		height: 4px;
		background: var(--chart-2);
		box-shadow: 0 0 15px color-mix(in srgb, var(--chart-2) 50%, transparent);
	}

	.orb-3 {
		bottom: 30%;
		left: 20%;
		width: 5px;
		height: 5px;
		background: var(--chart-3);
		box-shadow: 0 0 18px color-mix(in srgb, var(--chart-3) 50%, transparent);
	}

	.orb-4 {
		top: 40%;
		right: 25%;
		width: 4px;
		height: 4px;
		background: var(--primary);
		box-shadow: 0 0 16px color-mix(in srgb, var(--primary) 50%, transparent);
	}

	.orb-5 {
		top: 25%;
		left: 50%;
		width: 6px;
		height: 6px;
		background: var(--chart-2);
		box-shadow: 0 0 22px color-mix(in srgb, var(--chart-2) 50%, transparent);
	}

	.orb-6 {
		bottom: 50%;
		right: 30%;
		width: 5px;
		height: 5px;
		background: var(--chart-3);
		box-shadow: 0 0 19px color-mix(in srgb, var(--chart-3) 50%, transparent);
	}

	.orb-7 {
		top: 70%;
		left: 35%;
		width: 4px;
		height: 4px;
		background: var(--primary);
		box-shadow: 0 0 17px color-mix(in srgb, var(--primary) 50%, transparent);
	}

	.orb-8 {
		bottom: 15%;
		right: 40%;
		width: 5px;
		height: 5px;
		background: var(--chart-2);
		box-shadow: 0 0 20px color-mix(in srgb, var(--chart-2) 50%, transparent);
	}

	/* Reduce visual complexity on mobile for better performance */
	@media (max-width: 768px) {
		.grid-lines {
			display: none;
		}

		.mesh-blob {
			filter: blur(100px);
			opacity: 0.3;
		}

		.floating-elements {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.mesh-blob {
			filter: blur(80px);
			opacity: 0.25;
		}

		.floating-elements {
			display: none;
		}
	}
</style>

<script lang="ts">
	import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';

	interface Props {
		scrolled?: boolean;
	}

	let { scrolled = false }: Props = $props();
</script>

<nav class="nav" class:scrolled>
	<div class="nav-logo">
		<span class="logo-mark">◈</span>
		<span class="logo-text">Costra</span>
	</div>
	<div class="nav-actions">
		<ThemeToggle />
		<a href="/dashboard" class="nav-cta">Open App</a>
	</div>
</nav>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 3rem;
		z-index: 100;
		max-width: 1400px;
		margin: 0 auto;
		transition: all 0.3s ease;
	}

	.nav.scrolled {
		background: color-mix(in srgb, var(--background) 90%, transparent);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--border);
	}

	.nav-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-mark {
		font-size: 1.5rem;
		color: var(--primary);
	}

	.logo-text {
		font-family: 'Instrument Serif', serif;
		font-size: 1.5rem;
		font-weight: 400;
		letter-spacing: -0.02em;
		color: var(--foreground);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.nav-cta {
		padding: 0.625rem 1.25rem;
		background: var(--primary);
		color: var(--primary-foreground);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.nav-cta:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent);
	}

	@media (max-width: 768px) {
		.nav {
			padding: 1rem 1.5rem;
		}

		.nav-cta {
			padding: 0.5rem 1rem;
			font-size: 0.8125rem;
		}
	}
</style>


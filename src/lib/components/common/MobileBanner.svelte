<script lang="ts">
	import { onMount } from 'svelte';

	let showBanner = $state(false);

	onMount(() => {
		const checkMobile = () => {
			// Check if screen width is mobile-sized
			const isMobile = window.innerWidth <= 768;
			showBanner = isMobile;
		};

		checkMobile();
		
		// Listen for resize events
		window.addEventListener('resize', checkMobile);
		
		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	const dismissBanner = () => {
		showBanner = false;
	};
</script>

{#if showBanner}
	<div class="mobile-banner">
		<div class="banner-content">
			<p>This app is not optimized for mobile yet. Please use a computer for the best experience.</p>
			<button class="dismiss-button" onclick={dismissBanner} aria-label="Dismiss banner">
				×
			</button>
		</div>
	</div>
{/if}

<style>
	.mobile-banner {
		position: fixed;
		bottom: 20px;
		left: 20px;
		right: 20px;
		background: rgba(30, 41, 59, 0.95);
		color: #f1f5f9;
		z-index: 9999;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(148, 163, 184, 0.2);
	}

	.banner-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		max-width: 400px;
		margin: 0 auto;
	}

	.banner-content p {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
		flex: 1;
		padding-right: 16px;
	}

	.dismiss-button {
		background: none;
		border: none;
		color: #cbd5e1;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.dismiss-button:hover {
		background-color: rgba(148, 163, 184, 0.2);
		color: #f1f5f9;
	}

	.dismiss-button:focus {
		outline: 2px solid #64748b;
		outline-offset: 2px;
	}
</style>
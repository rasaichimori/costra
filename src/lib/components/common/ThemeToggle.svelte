<script lang="ts">
	import { getThemeContext } from '$lib/contexts/theme.svelte';
	import ModernButton from './ModernButton.svelte';

	const themeContext = getThemeContext();
	const isDark = $derived(themeContext.theme === 'dark');
</script>

<ModernButton variant="secondary" onclick={() => themeContext.toggle()} ariaLabel="Toggle theme">
	{#if isDark}
		<i class="fas fa-sun"></i>
		Light
	{:else}
		<i class="fas fa-moon"></i>
		Dark
	{/if}
</ModernButton>
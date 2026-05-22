<script lang="ts">
	import { getThemeContext } from '$lib/contexts/theme.svelte';
	import ModernButton from './ModernButton.svelte';
	import { m } from '$lib/paraglide/messages.js';

	const themeContext = getThemeContext();
	const isDark = $derived(themeContext.theme === 'dark');
</script>

<ModernButton
	variant="secondary"
	onclick={() => themeContext.toggle()}
	ariaLabel={m.toggleThemeAriaLabel()}
>
	{#if isDark}
		<i class="fas fa-sun"></i>
		{m.themeLight()}
	{:else}
		<i class="fas fa-moon"></i>
		{m.themeDark()}
	{/if}
</ModernButton>

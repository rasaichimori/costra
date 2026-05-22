<script lang="ts">
	import { setCurrencyContext } from '$lib/contexts/currency.svelte';
	import { setThemeContext } from '$lib/contexts/theme.svelte';
	import Page from './+page.svelte';

	setThemeContext();
	setCurrencyContext();
</script>

<Page />

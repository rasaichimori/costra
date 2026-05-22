<script lang="ts">
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages.js';
	import ModernButton from './ModernButton.svelte';

	interface Props {
		variant?: 'button' | 'compact';
	}

	let { variant = 'button' }: Props = $props();

	const currentLocale = $derived(getLocale());

	const switchLanguage = (locale: 'en' | 'ja') => {
		if (locale !== getLocale()) {
			setLocale(locale);
		}
	};
</script>

{#if variant === 'compact'}
	<div class="language-switcher compact">
		<button
			class="lang-btn"
			class:active={currentLocale === 'en'}
			onclick={() => switchLanguage('en')}
		>
			EN
		</button>
		<button
			class="lang-btn"
			class:active={currentLocale === 'ja'}
			onclick={() => switchLanguage('ja')}
		>
			JA
		</button>
	</div>
{:else}
	<div class="language-switcher">
		<ModernButton
			variant={currentLocale === 'en' ? 'primary' : 'secondary'}
			size="small"
			onclick={() => switchLanguage('en')}
		>
			{m.languageEnglish()}
		</ModernButton>
		<ModernButton
			variant={currentLocale === 'ja' ? 'primary' : 'secondary'}
			size="small"
			onclick={() => switchLanguage('ja')}
		>
			{m.languageJapanese()}
		</ModernButton>
	</div>
{/if}

<style>
	.language-switcher {
		display: flex;
		gap: 8px;
	}

	.language-switcher.compact {
		gap: 4px;
		background: var(--muted, #f4f4f5);
		padding: 4px;
		border-radius: 8px;
		border: 1px solid var(--border, #e4e4e7);
	}

	.lang-btn {
		padding: 6px 10px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--muted-foreground, #71717a);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.lang-btn:hover {
		color: var(--foreground, #18181b);
	}

	.lang-btn.active {
		background: var(--card, #fff);
		color: var(--foreground, #18181b);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	}
</style>

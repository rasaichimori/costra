import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';

type Theme = 'light' | 'dark';

class ThemeState {
	theme = $state<Theme>('light');

	constructor() {
		if (browser) {
			// Check for saved theme preference or default to light
			const savedTheme = localStorage.getItem('theme') as Theme;
			const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			
			this.theme = savedTheme || systemPreference;
			this.updateDocumentTheme();

			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (!localStorage.getItem('theme')) {
					this.theme = e.matches ? 'dark' : 'light';
					this.updateDocumentTheme();
				}
			});
		}
	}

	toggle() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('theme', this.theme);
			this.updateDocumentTheme();
		}
	}

	setTheme(theme: Theme) {
		this.theme = theme;
		if (browser) {
			localStorage.setItem('theme', theme);
			this.updateDocumentTheme();
		}
	}

	private updateDocumentTheme() {
		if (browser) {
			document.documentElement.setAttribute('data-theme', this.theme);
		}
	}
}

const THEME_KEY = Symbol('theme');

export function setThemeContext() {
	const themeState = new ThemeState();
	setContext(THEME_KEY, themeState);
	return themeState;
}

export function getThemeContext(): ThemeState {
	return getContext(THEME_KEY);
}
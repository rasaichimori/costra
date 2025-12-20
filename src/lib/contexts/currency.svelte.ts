import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';

class CurrencyState {
	currency = $state<string>('¥');

	constructor() {
		if (browser) {
			// Check for saved currency preference or default to ¥
			const savedCurrency = localStorage.getItem('currency');
			this.currency = savedCurrency || '¥';
		}
	}

	setCurrency(currency: string) {
		this.currency = currency;
		if (browser) {
			localStorage.setItem('currency', currency);
		}
	}
}

const CURRENCY_KEY = Symbol('currency');

export function setCurrencyContext() {
	const currencyState = new CurrencyState();
	setContext(CURRENCY_KEY, currencyState);
	return currencyState;
}

export function getCurrencyContext(): CurrencyState {
	return getContext(CURRENCY_KEY);
}


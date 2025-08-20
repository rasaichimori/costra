<script lang="ts">
	import { slide } from 'svelte/transition';

	interface Props {
		text: string;
		link?: string;
		onclick?: () => void;
	}

	let { text, link, onclick }: Props = $props();
</script>

{#if link !== undefined}
	<a href={link} class="button" {onclick} transition:slide>
		<div class="label">
			{text}
		</div>
	</a>
{:else}
	<button class="button" {onclick} transition:slide>
		<div class="label">
			{text}
		</div>
	</button>
{/if}

<style>
	.button {
		display: flex;
		position: relative;
		width: fit-content;
		padding: var(--padding, 8px 16px);
		font-size: var(--font-size, 16px);
		font-family: Heiders;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		text-decoration: none;
		border: none;
		border-radius: var(--radius, 32px);
		transform: translate(0, 0);
		background-color: var(--background-color, var(--pink));
		transition: all 0.5s ease;
		cursor: pointer;

		.label {
			transition: transform 0.2s;
			color: var(--color, var(--brown));
		}
		&:hover {
			background-color: var(--hovered-background-color, var(--brown));

			.label {
				animation: bounce 0.5s;
				color: var(--hovered-color, white);
			}
		}
		&:active {
			background-color: var(--active-background-color, var(--dark-brown));

			.label {
				color: var(--active-color, white);
			}
		}
	}
</style>

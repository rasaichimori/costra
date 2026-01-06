<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 16 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
>
	<path d="M5 12H19M19 12L12 5M19 12L12 19" />
</svg>


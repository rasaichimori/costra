<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 14 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.5"
>
	<polyline points="20 6 9 17 4 12"></polyline>
</svg>


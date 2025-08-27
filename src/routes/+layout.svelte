<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { createModalContext } from '$lib/contexts/modal.svelte';
	import ConfirmationModal from '$lib/components/common/ConfirmationModal.svelte';
	import '../app.css';

	let { children } = $props();
	
	const modalContext = createModalContext();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<ConfirmationModal {...modalContext.modal} />

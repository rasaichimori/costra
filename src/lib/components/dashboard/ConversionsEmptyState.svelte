<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
</script>

<div class="empty-state">
	<div class="empty-icon">
		<i class="fa-solid fa-scale-balanced"></i>
	</div>
	<p>{m.conversionsEmptyTitle()}</p>
	<span class="hint">{m.conversionsEmptyHint()}</span>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
		color: var(--secondary-foreground);
	}

	.empty-icon {
		font-size: 48px;
		opacity: 0.3;
		margin-bottom: 16px;
	}

	.empty-state p {
		margin: 0;
		font-size: 16px;
		color: var(--foreground);
	}

	.empty-state .hint {
		margin-top: 8px;
		font-size: 13px;
		opacity: 0.7;
	}
</style>

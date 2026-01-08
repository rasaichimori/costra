<script lang="ts">
	import ModernButton from '../common/ModernButton.svelte';

	let { onChooseBlank, onChoosePrefilled, onclose } = $props();

	let selectedChoice = $state<'blank' | 'prefilled' | null>(null);

	const handleSelectBlank = () => {
		selectedChoice = 'blank';
		onChooseBlank();
	};

	const handleSelectPrefilled = () => {
		selectedChoice = 'prefilled';
		onChoosePrefilled();
	};
</script>

<div class="welcome-modal">
	<h3>Welcome to COSTRA!</h3>
	<p>Would you like to start with a blank slate or explore with a prefilled example?</p>

	<div class="options">
		<ModernButton
			variant={selectedChoice === 'blank' ? 'primary' : 'secondary'}
			onclick={handleSelectBlank}
		>
			Blank Slate
		</ModernButton>
		<ModernButton
			variant={selectedChoice === 'prefilled' ? 'primary' : 'secondary'}
			onclick={handleSelectPrefilled}
		>
			Prefilled Example
		</ModernButton>
	</div>

	<div class="confirm-section">
		<ModernButton
			variant="primary"
			onclick={() => onclose(true)}
			disabled={selectedChoice === null}
		>
			Confirm
		</ModernButton>
	</div>
</div>

<style>
	.welcome-modal {
		background: var(--secondary);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border);
		backdrop-filter: blur(10px);
		gap: 20px;
		width: 450px;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-light);
	}

	h3 {
		margin: 0;
		color: var(--foreground);
		font-weight: 600;
		font-size: 1.5rem;
	}

	p {
		margin: 0;
		color: var(--muted-foreground);
		line-height: 1.6;
		font-size: 1rem;
	}

	.options {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 8px;
	}

	.confirm-section {
		display: flex;
		justify-content: flex-end;
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}
</style>

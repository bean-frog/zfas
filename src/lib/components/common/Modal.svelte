<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let title = '';
	export let open = false;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div class="overlay" on:click={close} role="presentation">
		<div
			class="modal"
			on:click|stopPropagation
			on:keydown={(e) => e.key === "Escape" && close()}
			tabindex="-1"
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			<div class="modal-header">
				<span class="modal-title">{title}</span>
				<button class="close-btn" on:click={close} aria-label="Close">✕</button>
			</div>
			<div class="modal-body">
				<slot />
			</div>
			{#if $$slots.footer}
				<div class="modal-footer">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 16px;
	}

	.modal {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		width: 100%;
		max-width: 520px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.modal-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.close-btn {
		color: var(--text-secondary);
		font-size: 13px;
		padding: 2px 6px;
		border-radius: var(--radius);
		cursor: pointer;
		background: none;
		border: none;
	}

	.close-btn:hover {
		color: var(--text-primary);
		background: var(--elevated);
	}

	.modal-body {
		padding: 16px;
		overflow-y: auto;
		flex: 1;
	}

	.modal-footer {
		padding: 12px 16px;
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		flex-shrink: 0;
	}
</style>

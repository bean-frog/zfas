<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary';
	export let size: 'sm' | 'md' = 'md';
	export let disabled = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let fullWidth = false;
</script>

<button
	{type}
	{disabled}
	on:click
	class="btn btn--{variant} btn--{size}"
	class:btn--full={fullWidth}
>
	<slot />
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-family: var(--font);
		font-weight: 500;
		border-radius: var(--radius);
		cursor: pointer;
		border: 1px solid transparent;
		white-space: nowrap;
		letter-spacing: 0.3px;
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn--md {
		padding: 7px 14px;
		font-size: 13px;
	}

	.btn--sm {
		padding: 4px 10px;
		font-size: 12px;
	}

	.btn--full {
		width: 100%;
	}

	/* Primary */
	.btn--primary {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
	}
	.btn--primary:hover:not(:disabled) {
		background: var(--primary-hover);
		border-color: var(--primary-hover);
	}

	/* Secondary */
	.btn--secondary {
		background: var(--elevated);
		color: var(--text-primary);
		border-color: var(--border);
	}
	.btn--secondary:hover:not(:disabled) {
		border-color: var(--text-disabled);
	}

	/* Ghost */
	.btn--ghost {
		background: transparent;
		color: var(--text-secondary);
		border-color: transparent;
	}
	.btn--ghost:hover:not(:disabled) {
		background: var(--elevated);
		color: var(--text-primary);
	}

	/* Danger */
	.btn--danger {
		background: transparent;
		color: var(--error);
		border-color: var(--error);
	}
	.btn--danger:hover:not(:disabled) {
		background: var(--error);
		color: #fff;
	}
</style>

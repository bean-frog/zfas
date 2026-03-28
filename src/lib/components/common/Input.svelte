<script lang="ts">
	export let value = '';
	export let placeholder = '';
	export let type: 'text' | 'password' | 'number' | 'url' = 'text';
	export let label = '';
	export let error = '';
	export let fullWidth = true;
	export let disabled = false;
</script>

<div class="field" class:field--full={fullWidth}>
	{#if label}
		<label class="label" for="input-{label}">{label}</label>
	{/if}
	<input
		id="input-{label}"
		{type}
		{placeholder}
		{disabled}
		bind:value
		on:input
		on:change
		on:blur
		class:has-error={!!error}
	/>
	{#if error}
		<span class="error">{error}</span>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.field--full {
		width: 100%;
	}

	.label {
		font-size: 12px;
		color: var(--text-secondary);
		letter-spacing: 0.3px;
	}

	input {
		padding: 7px 10px;
		font-size: 13px;
		width: 100%;
	}

	input.has-error {
		border-color: var(--error);
	}

	.error {
		font-size: 11px;
		color: var(--error);
	}
</style>

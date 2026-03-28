<script lang="ts">
	export let value = '';
	export let placeholder = 'Search...';
</script>

<div class="search">
	<span class="icon">/</span>
	<input
		type="text"
		{placeholder}
		bind:value
		on:input
	/>
	{#if value}
		<button class="clear" on:click={() => (value = '')} aria-label="Clear search">✕</button>
	{/if}
</div>

<style>
	.search {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	.icon {
		position: absolute;
		left: 10px;
		color: var(--text-disabled);
		font-size: 12px;
		pointer-events: none;
		font-weight: 600;
	}

	input {
		width: 100%;
		padding: 7px 32px 7px 28px;
		font-size: 13px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text-primary);
	}

	input:focus {
		border-color: var(--primary);
		outline: none;
	}

	.clear {
		position: absolute;
		right: 8px;
		color: var(--text-disabled);
		font-size: 11px;
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 2px;
		background: none;
		border: none;
	}

	.clear:hover {
		color: var(--text-primary);
	}
</style>

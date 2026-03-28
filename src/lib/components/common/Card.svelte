<script lang="ts">
	export let padding: 'sm' | 'md' | 'lg' = 'md';
	export let elevated = false;
</script>

<div class="card card--pad-{padding}" class:card--elevated={elevated}>
	<slot />
</div>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.card--elevated {
		background: var(--elevated);
	}

	.card--pad-sm { padding: 10px; }
	.card--pad-md { padding: 16px; }
	.card--pad-lg { padding: 24px; }
</style>

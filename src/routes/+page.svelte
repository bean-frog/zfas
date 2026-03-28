<script lang="ts">
	import { onMount } from 'svelte';
	import GradesPanel from '$lib/components/dashboard/GradesPanel.svelte';
	import AssignmentList from '$lib/components/dashboard/AssignmentList.svelte';
	import { canvasStore } from '$lib/stores/canvasStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { flashcardStore } from '$lib/stores/flashcardStore';
	import { notesStore } from '$lib/stores/notesStore';

	$: loading = $canvasStore.loading;
	$: error = $canvasStore.error;
	$: hasCanvas = !!$settingsStore.canvasApiKey && !!$settingsStore.canvasBaseUrl;
	$: isConnected = $canvasStore.courses.length > 0;
	$: flashcardCount = $flashcardStore.length;
	$: noteCount = $notesStore.length;

	onMount(() => {
		if ($settingsStore.canvasApiKey && $settingsStore.canvasBaseUrl && $canvasStore.courses.length === 0) {
			canvasStore.fetch($settingsStore.canvasBaseUrl, $settingsStore.canvasApiKey);
		}
	});

	async function refresh() {
		await canvasStore.fetch($settingsStore.canvasBaseUrl, $settingsStore.canvasApiKey);
	}
</script>

<div class="page">
	<div class="page-header">
		<h1>Dashboard</h1>
		{#if hasCanvas}
			<button class="refresh-btn" on:click={refresh} disabled={loading}>
				{loading ? 'Loading...' : 'Refresh'}
			</button>
		{/if}
	</div>

	<div class="quick-stats">
		<a href="/flashcards" class="stat-card">
			<span class="stat-value">{flashcardCount}</span>
			<span class="stat-label">Flashcard Sets</span>
		</a>
		<a href="/notes" class="stat-card">
			<span class="stat-value">{noteCount}</span>
			<span class="stat-label">Notes</span>
		</a>
		<a href="/timer" class="stat-card">
			<span class="stat-value">Timer</span>
			<span class="stat-label">Study Timer</span>
		</a>
	</div>

	{#if !hasCanvas}
		<div class="canvas-prompt">
			<p>Connect your Canvas account to see grades and assignments.</p>
			<a href="/settings" class="settings-link">Go to Settings</a>
		</div>
	{:else}
		{#if error}
			<div class="error-banner">{error}</div>
		{/if}
		{#if loading && !isConnected}
			<p class="loading-text">Loading Canvas data...</p>
		{:else}
			<div class="canvas-grid">
				<section class="canvas-section"><GradesPanel /></section>
				<section class="canvas-section"><AssignmentList mode="upcoming" /></section>
				<section class="canvas-section"><AssignmentList mode="overdue" /></section>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 24px; max-width: 960px; }
	.page-header { display: flex; align-items: center; justify-content: space-between; }
	.refresh-btn {
		font-size: 12px; padding: 5px 12px; font-family: var(--font);
		background: var(--elevated); color: var(--text-secondary);
		border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer;
	}
	.refresh-btn:hover:not(:disabled) { color: var(--text-primary); }
	.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.quick-stats { display: flex; gap: 12px; flex-wrap: wrap; }
	.stat-card {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: var(--radius); padding: 14px 20px;
		display: flex; flex-direction: column; gap: 4px;
		text-decoration: none; min-width: 120px;
	}
	.stat-card:hover { border-color: var(--primary); }
	.stat-value { font-size: 22px; font-weight: 600; color: var(--text-primary); }
	.stat-label { font-size: 11px; color: var(--text-disabled); text-transform: uppercase; letter-spacing: 0.5px; }
	.canvas-prompt {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: var(--radius); padding: 20px;
		display: flex; align-items: center; justify-content: space-between; gap: 16px;
	}
	.canvas-prompt p { font-size: 13px; color: var(--text-secondary); }
	.settings-link { font-size: 13px; color: var(--primary); white-space: nowrap; }
	.error-banner {
		background: rgba(207, 102, 121, 0.1); border: 1px solid var(--error);
		border-radius: var(--radius); padding: 10px 14px; font-size: 13px; color: var(--error);
	}
	.loading-text { font-size: 13px; color: var(--text-disabled); }
	.canvas-grid { display: flex; flex-direction: column; gap: 24px; }
	.canvas-section {
		background: var(--surface); border: 1px solid var(--border);
		border-radius: var(--radius); padding: 16px;
	}
</style>

<script lang="ts">
	import SearchBar from '../common/SearchBar.svelte';
	import { goto } from '$app/navigation';
	import { flashcardStore } from '$lib/stores/flashcardStore';
	import { notesStore } from '$lib/stores/notesStore';
	import { timerStore } from '$lib/stores/timerStore';
	import { formatSeconds } from '$lib/utils/markdownParser';
	import { get } from 'svelte/store';

	$: timerRunning = $timerStore.running;
	$: timerPhase = $timerStore.phase;
	$: timerRemaining = $timerStore.remaining;

	let query = '';
	let results: Array<{ type: string; label: string; href: string }> = [];
	let showResults = false;

	function search(q: string) {
		if (!q.trim()) {
			results = [];
			showResults = false;
			return;
		}

		const lower = q.toLowerCase();
		const found: typeof results = [];

		const sets = get(flashcardStore);
		for (const set of sets) {
			if (set.name.toLowerCase().includes(lower)) {
				found.push({ type: 'Set', label: set.name, href: `/flashcards?set=${set.id}` });
			}
			for (const card of set.cards) {
				if (
					card.front.toLowerCase().includes(lower) ||
					card.back.toLowerCase().includes(lower)
				) {
					found.push({
						type: 'Card',
						label: `${set.name} — ${card.front.slice(0, 40)}`,
						href: `/flashcards?set=${set.id}`
					});
				}
			}
		}

		const notes = get(notesStore);
		for (const note of notes) {
			if (
				note.title.toLowerCase().includes(lower) ||
				note.content.toLowerCase().includes(lower)
			) {
				found.push({ type: 'Note', label: note.title, href: `/notes?id=${note.id}` });
			}
		}

		results = found.slice(0, 8);
		showResults = true;
	}

	function handleInput() {
		search(query);
	}

	function select(href: string) {
		query = '';
		results = [];
		showResults = false;
		goto(href);
	}

	function handleBlur() {
		setTimeout(() => {
			showResults = false;
		}, 150);
	}
</script>

<header class="header">
	<a href="/" class="brand">ZFAS <span class="commit">{__GIT_COMMIT__}</span></a>

	<div class="search-wrap" on:focusin={() => query && (showResults = true)} on:focusout={handleBlur}>
		<SearchBar bind:value={query} on:input={handleInput} placeholder="Search flashcards, notes..." />
		{#if showResults && results.length > 0}
			<div class="results">
				{#each results as r}
					<button class="result-item" on:click={() => select(r.href)}>
						<span class="result-type">{r.type}</span>
						<span class="result-label">{r.label}</span>
					</button>
				{/each}
			</div>
		{/if}
		{#if showResults && results.length === 0 && query}
			<div class="results">
				<div class="no-results">No results</div>
			</div>
		{/if}
	</div>

	{#if timerRunning}
		<a href="/timer" class="timer-pill">
			<span class="timer-phase">{timerPhase}</span>
			<span class="timer-remaining">{formatSeconds(timerRemaining)}</span>
		</a>
	{/if}
</header>

<style>
	.header {
		height: var(--header-height);
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 0 16px;
		position: sticky;
		top: 0;
		z-index: 50;
		flex-shrink: 0;
	}

	.brand {
		font-size: 13px;
		font-weight: 700;
		color: var(--primary);
		white-space: nowrap;
		letter-spacing: 1px;
		text-decoration: none;
	}

	.commit {
		font-size: 10px;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--text-disabled);
		font-family: monospace;
	}

	.search-wrap {
		flex: 1;
		max-width: 400px;
		position: relative;
	}

	.results {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		z-index: 200;
		overflow: hidden;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 12px;
		font-size: 12px;
		color: var(--text-primary);
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
	}

	.result-item:hover {
		background: var(--surface);
	}

	.result-type {
		color: var(--primary);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.5px;
		min-width: 34px;
	}

	.result-label {
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.no-results {
		padding: 10px 12px;
		font-size: 12px;
		color: var(--text-disabled);
	}

	.timer-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		background: var(--elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		text-decoration: none;
		flex-shrink: 0;
	}

	.timer-pill:hover {
		border-color: var(--primary);
	}

	.timer-phase {
		font-size: 10px;
		color: var(--primary);
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.timer-remaining {
		font-size: 12px;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}
</style>

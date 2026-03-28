<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FlashcardSet } from '$lib/stores/flashcardStore';
	import Flashcard from './Flashcard.svelte';

	export let set: FlashcardSet;

	const dispatch = createEventDispatcher();

	let index = 0;
	let flipped = false;
	let shuffled = [...set.cards];

	$: card = shuffled[index];
	$: total = shuffled.length;
	$: progress = total > 0 ? ((index + 1) / total) * 100 : 0;

	function next() {
		if (index < total - 1) {
			index++;
			flipped = false;
		}
	}

	function prev() {
		if (index > 0) {
			index--;
			flipped = false;
		}
	}

	function shuffle() {
		shuffled = [...set.cards].sort(() => Math.random() - 0.5);
		index = 0;
		flipped = false;
	}

	function restart() {
		shuffled = [...set.cards];
		index = 0;
		flipped = false;
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
		else if (e.key === ' ') { e.preventDefault(); flipped = !flipped; }
	}
</script>

<svelte:window on:keydown={handleKey} />

<div class="study-view">
	<div class="study-header">
		<button class="back-btn" on:click={() => dispatch('back')}>← Back</button>
		<div class="study-title">{set.name}</div>
		<div class="study-controls">
			<button class="ctrl-btn" on:click={shuffle}>Shuffle</button>
			<button class="ctrl-btn" on:click={restart}>Restart</button>
		</div>
	</div>

	<div class="progress-bar">
		<div class="progress-fill" style="width: {progress}%"></div>
	</div>

	<div class="counter">{index + 1} / {total}</div>

	{#if card}
		<div class="card-container">
			<Flashcard {card} bind:flipped />
		</div>

		<div class="nav-buttons">
			<button class="nav-btn" on:click={prev} disabled={index === 0}>← Prev</button>
			<button class="nav-btn" on:click={() => (flipped = !flipped)}>Flip</button>
			<button class="nav-btn" on:click={next} disabled={index === total - 1}>Next →</button>
		</div>

		<p class="keyboard-hint">Arrow keys to navigate · Space to flip</p>
	{/if}
</div>

<style>
	.study-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 640px;
	}

	.study-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.back-btn {
		font-size: 12px;
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 0;
		font-family: var(--font);
		white-space: nowrap;
	}

	.back-btn:hover { color: var(--text-primary); }

	.study-title {
		font-size: 14px;
		font-weight: 600;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.study-controls {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	.ctrl-btn {
		font-size: 12px;
		padding: 4px 10px;
		font-family: var(--font);
		background: var(--elevated);
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.ctrl-btn:hover { color: var(--text-primary); }

	.progress-bar {
		height: 2px;
		background: var(--border);
		border-radius: 1px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--primary);
	}

	.counter {
		font-size: 12px;
		color: var(--text-disabled);
		text-align: center;
	}

	.card-container {
		display: flex;
		justify-content: center;
	}

	.nav-buttons {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.nav-btn {
		font-size: 13px;
		padding: 7px 16px;
		font-family: var(--font);
		background: var(--elevated);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.nav-btn:hover:not(:disabled) { border-color: var(--primary); }
	.nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }

	.keyboard-hint {
		font-size: 11px;
		color: var(--text-disabled);
		text-align: center;
	}
</style>

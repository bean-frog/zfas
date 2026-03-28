<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FlashcardSet } from '$lib/stores/flashcardStore';

	export let set: FlashcardSet;

	const dispatch = createEventDispatcher();

	interface Tile {
		id: string;
		cardId: string;
		label: string;
		side: 'front' | 'back';
		matched: boolean;
		selected: boolean;
	}

	let tiles: Tile[] = [];
	let selected: Tile | null = null;
	let matchCount = 0;
	let attempts = 0;

	function init() {
		const cards = set.cards.slice(0, 8); // max 8 pairs
		const fronts: Tile[] = cards.map((c) => ({
			id: crypto.randomUUID(),
			cardId: c.id,
			label: c.front,
			side: 'front',
			matched: false,
			selected: false
		}));
		const backs: Tile[] = cards.map((c) => ({
			id: crypto.randomUUID(),
			cardId: c.id,
			label: c.back,
			side: 'back',
			matched: false,
			selected: false
		}));
		tiles = [...fronts, ...backs].sort(() => Math.random() - 0.5);
		selected = null;
		matchCount = 0;
		attempts = 0;
	}

	init();

	$: total = tiles.filter((t) => t.side === 'front').length;
	$: done = matchCount === total && total > 0;

	function select(tile: Tile) {
		if (tile.matched || tile.selected) return;

		if (!selected) {
			tile.selected = true;
			selected = tile;
			tiles = tiles;
			return;
		}

		if (selected.id === tile.id) return;

		attempts++;
		tile.selected = true;
		tiles = tiles;

		if (selected.cardId === tile.cardId && selected.side !== tile.side) {
			// Match
			setTimeout(() => {
				tiles = tiles.map((t) =>
					t.cardId === tile.cardId ? { ...t, matched: true, selected: false } : t
				);
				matchCount++;
				selected = null;
			}, 200);
		} else {
			// No match
			const prev = selected;
			setTimeout(() => {
				tiles = tiles.map((t) =>
					t.id === prev.id || t.id === tile.id ? { ...t, selected: false } : t
				);
				selected = null;
			}, 700);
		}
	}
</script>

<div class="game">
	<div class="game-header">
		<button class="back-btn" on:click={() => dispatch('back')}>← Back</button>
		<span class="game-title">Matching — {set.name}</span>
		<div class="game-stats">
			<span class="stat">{matchCount}/{total} matched</span>
			<span class="stat">{attempts} attempts</span>
		</div>
	</div>

	{#if done}
		<div class="done-banner">
			Done! {matchCount}/{total} matched in {attempts} attempts.
			<button class="replay-btn" on:click={init}>Play Again</button>
		</div>
	{/if}

	<div class="grid" style="grid-template-columns: repeat(4, 1fr)">
		{#each tiles as tile (tile.id)}
			<button
				class="tile"
				class:selected={tile.selected}
				class:matched={tile.matched}
				on:click={() => select(tile)}
				disabled={tile.matched}
			>
				{tile.label}
			</button>
		{/each}
	</div>
</div>

<style>
	.game { display: flex; flex-direction: column; gap: 16px; }

	.game-header {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.back-btn {
		font-size: 12px;
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font);
		white-space: nowrap;
	}

	.back-btn:hover { color: var(--text-primary); }

	.game-title {
		font-size: 14px;
		font-weight: 600;
		flex: 1;
	}

	.game-stats {
		display: flex;
		gap: 12px;
	}

	.stat {
		font-size: 12px;
		color: var(--text-disabled);
	}

	.done-banner {
		background: rgba(21, 95, 69, 0.15);
		border: 1px solid var(--primary);
		border-radius: var(--radius);
		padding: 10px 14px;
		font-size: 13px;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.replay-btn {
		font-size: 12px;
		font-family: var(--font);
		color: var(--primary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.grid {
		display: grid;
		gap: 8px;
	}

	.tile {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 12px 8px;
		font-family: var(--font);
		font-size: 12px;
		color: var(--text-primary);
		cursor: pointer;
		min-height: 70px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		line-height: 1.4;
		overflow: hidden;
	}

	.tile:hover:not(:disabled) {
		border-color: var(--text-disabled);
	}

	.tile.selected {
		border-color: var(--primary);
		background: rgba(21, 95, 69, 0.1);
	}

	.tile.matched {
		border-color: var(--primary);
		background: rgba(21, 95, 69, 0.2);
		color: var(--text-disabled);
		cursor: default;
		opacity: 0.6;
	}
</style>

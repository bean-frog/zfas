<script lang="ts">
	import katex from 'katex';
	import type { Flashcard } from '$lib/stores/flashcardStore';

	export let card: Flashcard;
	export let flipped = false;

	$: latexHtml = card.latex
		? katex.renderToString(card.latex, { displayMode: true, throwOnError: false })
		: '';

	function toggle() {
		flipped = !flipped;
	}
</script>

<button class="card-wrap" on:click={toggle} aria-label={flipped ? card.back : card.front}>
	<div class="card" class:flipped>
		<div class="card-face card-front">
			{#if card.image}
				<img src={card.image} alt="card visual" class="card-image" />
			{/if}
			<div class="card-text">{card.front}</div>
			<span class="hint">click to flip</span>
		</div>
		<div class="card-face card-back">
			<div class="card-text">{card.back}</div>
			{#if card.latex}
				<div class="card-latex">{@html latexHtml}</div>
			{/if}
			{#if card.image}
				<img src={card.image} alt="card visual" class="card-image" />
			{/if}
			<span class="hint">click to flip</span>
		</div>
	</div>
</button>

<style>
	.card-wrap {
		display: block;
		width: 100%;
		max-width: 560px;
		aspect-ratio: 16/9;
		perspective: 1000px;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
	}

	.card {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
	}

	.card-face {
		position: absolute;
		inset: 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 24px;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		overflow: hidden;
	}

	.card-front {
		background: var(--surface);
	}

	.card-back {
		background: var(--elevated);
		transform: rotateY(180deg);
	}

	/* flip — instant, no animation per spec */
	.card.flipped .card-front {
		transform: rotateY(180deg);
	}
	.card.flipped .card-back {
		transform: rotateY(0deg);
	}

	.card-image {
		max-width: 100%;
		max-height: 40%;
		object-fit: contain;
		border-radius: 2px;
	}

	.card-latex {
		max-width: 100%;
		overflow-x: auto;
		display: flex;
		justify-content: center;
	}

	.card-text {
		font-size: clamp(13px, 2.5vw, 20px);
		color: var(--text-primary);
		text-align: center;
		line-height: 1.4;
		overflow-y: auto;
		max-height: 100%;
		width: 100%;
	}

	.hint {
		position: absolute;
		bottom: 10px;
		right: 12px;
		font-size: 10px;
		color: var(--text-disabled);
		letter-spacing: 0.3px;
	}
</style>

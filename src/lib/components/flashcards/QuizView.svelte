<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FlashcardSet } from '$lib/stores/flashcardStore';
	import Flashcard from './Flashcard.svelte';

	export let set: FlashcardSet;

	const dispatch = createEventDispatcher();

	// Points awarded/deducted per confidence level
	const POINTS = { 1: 5, 2: 10, 3: 20 };
	const PENALTIES = { 1: 0, 2: 5, 3: 10 };

	let targetScore = 50;
	let started = false;
	let score = 0;
	let confidence = 2; // 1=low, 2=medium, 3=high
	let revealed = false;
	let flipped = false;
	let index = 0;
	let cards = [...set.cards].sort(() => Math.random() - 0.5);
	let done = false;
	let lastDelta = 0;
	let showDelta = false;
	let deltaPositive = true;
	let deltaTimer: ReturnType<typeof setTimeout> | null = null;

	$: card = cards[index];
	$: progress = Math.min((score / targetScore) * 100, 100);

	function start() {
		started = true;
	}

	function reveal() {
		revealed = true;
		flipped = true;
	}

	function grade(correct: boolean) {
		const delta = correct
			? POINTS[confidence as 1 | 2 | 3]
			: -PENALTIES[confidence as 1 | 2 | 3];

		score = Math.max(0, score + delta);
		lastDelta = delta;
		deltaPositive = delta >= 0;
		showDelta = true;

		if (deltaTimer) clearTimeout(deltaTimer);
		deltaTimer = setTimeout(() => (showDelta = false), 1000);

		if (score >= targetScore) {
			done = true;
			return;
		}

		// Advance to next card, looping if needed
		const next = index + 1;
		if (next >= cards.length) {
			// Reshuffle and loop
			cards = [...set.cards].sort(() => Math.random() - 0.5);
			index = 0;
		} else {
			index = next;
		}

		revealed = false;
		flipped = false;
		confidence = 2;
	}

	function restart() {
		score = 0;
		index = 0;
		cards = [...set.cards].sort(() => Math.random() - 0.5);
		revealed = false;
		flipped = false;
		confidence = 2;
		done = false;
	}

	const confidenceLabels = ['', 'Low', 'Medium', 'High'];
</script>

{#if !started}
	<div class="quiz-setup">
		<button class="back-btn" on:click={() => dispatch('back')}>← Back</button>
		<div class="setup-card">
			<div class="setup-title">Quiz — {set.name}</div>
			<div class="setup-body">
				<p class="setup-desc">
					Rate your confidence before revealing each answer. Higher confidence means more points for
					correct answers, but bigger penalties for wrong ones.
				</p>
				<div class="setup-field">
					<label class="setup-label" for="target-score">Target score</label>
					<input
						id="target-score"
						class="setup-input"
						type="number"
						min="10"
						max="999"
						bind:value={targetScore}
					/>
				</div>
				<div class="confidence-explainer">
					<div class="conf-row">
						<span class="conf-level low">Low</span>
						<span class="conf-pts">+{POINTS[1]} correct / no penalty</span>
					</div>
					<div class="conf-row">
						<span class="conf-level mid">Medium</span>
						<span class="conf-pts">+{POINTS[2]} correct / −{PENALTIES[2]} wrong</span>
					</div>
					<div class="conf-row">
						<span class="conf-level high">High</span>
						<span class="conf-pts">+{POINTS[3]} correct / −{PENALTIES[3]} wrong</span>
					</div>
				</div>
			</div>
			<button class="start-btn" on:click={start}>Start Quiz</button>
		</div>
	</div>
{:else if done}
	<div class="quiz-done">
		<button class="back-btn" on:click={() => dispatch('back')}>← Back</button>
		<div class="done-card">
			<div class="done-title">Target reached!</div>
			<div class="done-score">{score} pts</div>
			<button class="start-btn" on:click={restart}>Play Again</button>
		</div>
	</div>
{:else}
	<div class="quiz-view">
		<div class="quiz-header">
			<button class="back-btn" on:click={() => dispatch('back')}>← Back</button>
			<div class="quiz-title">{set.name}</div>
			<div class="score-wrap">
				{#if showDelta}
					<span class="delta" class:positive={deltaPositive} class:negative={!deltaPositive}>
						{deltaPositive ? '+' : ''}{lastDelta}
					</span>
				{/if}
				<span class="score">{score} / {targetScore}</span>
			</div>
		</div>

		<div class="progress-bar">
			<div class="progress-fill" style="width: {progress}%"></div>
		</div>

		{#if card}
			<div class="card-container">
				<Flashcard {card} bind:flipped />
			</div>

			{#if !revealed}
				<div class="confidence-section">
					<span class="conf-label">Confidence</span>
					<div class="conf-buttons">
						{#each [1, 2, 3] as level}
							<button
								class="conf-btn"
								class:active={confidence === level}
								on:click={() => (confidence = level)}
							>
								{confidenceLabels[level]}
							</button>
						{/each}
					</div>
					<button class="reveal-btn" on:click={reveal}>Reveal</button>
				</div>
			{:else}
				<div class="grade-section">
					<button class="grade-btn correct" on:click={() => grade(true)}>Got it</button>
					<button class="grade-btn wrong" on:click={() => grade(false)}>Missed it</button>
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.quiz-setup, .quiz-done {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 480px;
	}

	.setup-card, .done-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.setup-title, .done-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.done-score {
		font-size: 32px;
		font-weight: 700;
		color: var(--primary);
		text-align: center;
		padding: 8px 0;
	}

	.setup-body {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.setup-desc {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.setup-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.setup-label {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.setup-input {
		width: 120px;
		padding: 6px 10px;
		font-size: 13px;
		background: var(--elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text-primary);
		font-family: var(--font);
	}

	.setup-input:focus {
		border-color: var(--primary);
		outline: none;
	}

	.confidence-explainer {
		display: flex;
		flex-direction: column;
		gap: 6px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 10px 12px;
	}

	.conf-row {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 12px;
	}

	.conf-level {
		min-width: 56px;
		font-weight: 600;
		font-size: 11px;
	}

	.conf-level.low { color: var(--text-disabled); }
	.conf-level.mid { color: var(--text-secondary); }
	.conf-level.high { color: var(--primary); }

	.conf-pts {
		color: var(--text-secondary);
	}

	.start-btn {
		padding: 8px 20px;
		font-size: 13px;
		font-family: var(--font);
		font-weight: 600;
		background: var(--primary);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
		align-self: flex-start;
	}

	.start-btn:hover { background: var(--primary-hover); }

	/* Active quiz */
	.quiz-view {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 640px;
	}

	.quiz-header {
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

	.quiz-title {
		font-size: 14px;
		font-weight: 600;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.score-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.score {
		font-size: 13px;
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
	}

	.delta {
		font-size: 13px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		animation: fade-up 1s ease forwards;
	}

	.delta.positive { color: var(--primary); }
	.delta.negative { color: var(--error); }

	@keyframes fade-up {
		0% { opacity: 1; transform: translateY(0); }
		100% { opacity: 0; transform: translateY(-8px); }
	}

	.progress-bar {
		height: 2px;
		background: var(--border);
		border-radius: 1px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--primary);
		transition: width 0.3s ease;
	}

	.card-container {
		display: flex;
		justify-content: center;
	}

	.confidence-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.conf-label {
		font-size: 11px;
		color: var(--text-disabled);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.conf-buttons {
		display: flex;
		gap: 8px;
	}

	.conf-btn {
		padding: 6px 16px;
		font-size: 12px;
		font-family: var(--font);
		background: var(--elevated);
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.conf-btn:hover { color: var(--text-primary); }

	.conf-btn.active {
		border-color: var(--primary);
		color: var(--primary);
		background: rgba(21, 95, 69, 0.08);
	}

	.reveal-btn {
		padding: 8px 24px;
		font-size: 13px;
		font-family: var(--font);
		font-weight: 600;
		background: var(--primary);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
	}

	.reveal-btn:hover { background: var(--primary-hover); }

	.grade-section {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.grade-btn {
		padding: 8px 28px;
		font-size: 13px;
		font-family: var(--font);
		font-weight: 600;
		border: 1px solid transparent;
		border-radius: var(--radius);
		cursor: pointer;
	}

	.grade-btn.correct {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
	}

	.grade-btn.correct:hover { background: var(--primary-hover); }

	.grade-btn.wrong {
		background: transparent;
		color: var(--error);
		border-color: var(--error);
	}

	.grade-btn.wrong:hover {
		background: var(--error);
		color: #fff;
	}
</style>

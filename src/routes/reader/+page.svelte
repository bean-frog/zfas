<script lang="ts">
	import { onDestroy } from 'svelte';

	let inputText = '';
	let wpm = 300;
	let words: string[] = [];
	let index = 0;
	let running = false;
	let started = false;
	let intervalId: ReturnType<typeof setInterval> | null = null;

	$: currentWord = words[index] ?? '';
	$: anchorIndex = getAnchorIndex(currentWord);
	$: before = currentWord.slice(0, anchorIndex);
	$: anchor = currentWord[anchorIndex] ?? '';
	$: after = currentWord.slice(anchorIndex + 1);
	$: progress = words.length > 0 ? index / words.length : 0;

	function getAnchorIndex(word: string): number {
		const len = word.length;
		if (len <= 1) return 0;
		if (len <= 5) return 1;
		if (len <= 9) return 2;
		if (len <= 13) return 3;
		return 4;
	}

	function start() {
		words = inputText.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) return;
		index = 0;
		started = true;
		running = true;
		tick();
	}

	function tick() {
		if (intervalId) clearInterval(intervalId);
		intervalId = setInterval(() => {
			if (index < words.length - 1) {
				index++;
			} else {
				pause();
			}
		}, 60000 / wpm);
	}

	function pause() {
		running = false;
		if (intervalId) { clearInterval(intervalId); intervalId = null; }
	}

	function resume() {
		running = true;
		tick();
	}

	function stop() {
		pause();
		started = false;
		index = 0;
	}

	// Live-adjust speed — on:input on the slider calls this directly
	function adjustWpm() {
		if (running) tick();
	}

	onDestroy(() => { if (intervalId) clearInterval(intervalId); });
</script>

<div class="reader-page">
	<h1>Reader</h1>

	{#if !started}
		<div class="setup">
			<textarea
				bind:value={inputText}
				placeholder="Paste your text here..."
				rows="8"
			></textarea>

			<div class="controls-row">
				<div class="wpm-control">
					<label for="wpm-slider">
						<span class="wpm-val">{wpm}</span> WPM
					</label>
					<input
						id="wpm-slider"
						type="range"
						min="60"
						max="1000"
						step="10"
						bind:value={wpm}
					/>
				</div>
				<button class="start-btn" on:click={start} disabled={!inputText.trim()}>
					Start
				</button>
			</div>
		</div>
	{:else}
		<div class="display">
			<div class="word-stage">
				<div class="word-row">
					<span class="before">{before}</span>
					<span class="anchor">{anchor}</span>
					<span class="after">{after}</span>
				</div>
			</div>

			<div class="progress-bar">
				<div class="progress-fill" style="width: {progress * 100}%"></div>
			</div>

			<div class="playback-controls">
				<div class="wpm-control">
					<label for="wpm-slider-live">
						<span class="wpm-val">{wpm}</span> WPM
					</label>
					<input
						id="wpm-slider-live"
						type="range"
						min="60"
						max="1000"
						step="10"
						bind:value={wpm}
						on:input={adjustWpm}
					/>
				</div>
				<div class="btn-row">
					{#if running}
						<button class="ctrl-btn" on:click={pause}>Pause</button>
					{:else}
						<button class="ctrl-btn" on:click={resume}>Resume</button>
					{/if}
					<button class="ctrl-btn stop" on:click={stop}>Stop</button>
				</div>
			</div>

			<div class="word-count">{index + 1} / {words.length}</div>
		</div>
	{/if}

	<div class="explainer">
		<p>
			This is an RSVP (Rapid Serial Visual Presentation) speed reader. Words flash one at a time;
			the red letter marks the optimal recognition point your eye should rest on, letting your
			brain register the whole word at once.
		</p>
		<p>
			The biggest gains come from suppressing subvocalization — the inner voice that tries to
			pronounce each word as you read. Let that go. Trust your eyes to take in the word directly
			without sounding it out, and comprehension follows naturally at speeds that feel impossible
			when reading aloud internally.
		</p>
	</div>
</div>

<style>
	.reader-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 640px;
	}

	/* Setup */
	.setup { display: flex; flex-direction: column; gap: 16px; }

	textarea {
		width: 100%;
		resize: vertical;
		padding: 10px 12px;
		font-size: 13px;
		line-height: 1.6;
	}

	.controls-row {
		display: flex;
		align-items: center;
		gap: 20px;
		justify-content: space-between;
	}

	.wpm-control {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1;
	}

	label {
		font-size: 13px;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.wpm-val { color: var(--text-primary); font-weight: 600; }

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		background: var(--elevated);
		border: 1px solid var(--border);
		border-radius: 2px;
		height: 4px;
		flex: 1;
		min-width: 100px;
		padding: 0;
		cursor: pointer;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--primary);
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--primary);
		border: none;
		cursor: pointer;
	}

	.start-btn {
		padding: 8px 24px;
		background: var(--primary);
		color: #fff;
		font-family: var(--font);
		font-size: 13px;
		font-weight: 600;
		border-radius: var(--radius);
		cursor: pointer;
		white-space: nowrap;
	}

	.start-btn:hover:not(:disabled) { background: var(--primary-hover); }
	.start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

	/* Display */
	.display {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.word-stage {
		background: #000;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.word-row {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: baseline;
		width: 100%;
		font-size: 36px;
		font-family: var(--font);
		letter-spacing: 0.02em;
	}

	/* Grid keeps the anchor column centered; before/after fill left and right. */
	.before {
		text-align: right;
		color: #fff;
	}

	.anchor {
		text-align: center;
		color: #e53e3e;
	}

	.after {
		text-align: left;
		color: #fff;
	}

	.progress-bar {
		height: 2px;
		background: var(--elevated);
		border-radius: 1px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--primary);
		transition: width 0.1s linear;
	}

	.playback-controls {
		display: flex;
		align-items: center;
		gap: 20px;
		justify-content: space-between;
	}

	.btn-row {
		display: flex;
		gap: 8px;
	}

	.ctrl-btn {
		padding: 6px 18px;
		font-family: var(--font);
		font-size: 13px;
		background: var(--elevated);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.ctrl-btn:hover { border-color: var(--primary); }
	.ctrl-btn.stop:hover { border-color: var(--error); color: var(--error); }

	.word-count {
		font-size: 11px;
		color: var(--text-disabled);
		text-align: right;
	}

	.explainer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-top: 1px solid var(--border);
		padding-top: 20px;
	}

	.explainer p {
		font-size: 12px;
		color: var(--text-disabled);
		line-height: 1.7;
	}
</style>

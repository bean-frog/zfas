<script lang="ts">
	import { timerStore } from '$lib/stores/timerStore';
	import { formatSeconds } from '$lib/utils/markdownParser';

	$: state = $timerStore;
	$: preset = state.presets.find((p) => p.id === state.activePresetId);
	$: total = state.phase === 'break' ? (preset?.breakDuration ?? 300) : (preset?.workDuration ?? 1500);
	$: progress = total > 0 ? ((total - state.remaining) / total) * 100 : 0;

	// Circumference for SVG ring
	const RADIUS = 80;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
	$: dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
</script>

<div class="display">
	<div class="ring-container">
		<svg class="ring" viewBox="0 0 200 200" width="200" height="200">
			<circle
				cx="100" cy="100" r={RADIUS}
				fill="none"
				stroke="var(--border)"
				stroke-width="6"
			/>
			<circle
				cx="100" cy="100" r={RADIUS}
				fill="none"
				stroke={state.phase === 'break' ? '#4a9e7a' : 'var(--primary)'}
				stroke-width="6"
				stroke-linecap="butt"
				stroke-dasharray={CIRCUMFERENCE}
				stroke-dashoffset={dashOffset}
				transform="rotate(-90 100 100)"
			/>
		</svg>

		<div class="ring-content">
			<div class="time">{formatSeconds(state.remaining)}</div>
			<div class="phase-label">
				{#if state.phase === 'idle'}
					ready
				{:else if state.phase === 'work'}
					focus
				{:else}
					break
				{/if}
			</div>
		</div>
	</div>

	{#if state.cyclesCompleted > 0}
		<div class="cycles">
			{state.cyclesCompleted} cycle{state.cyclesCompleted !== 1 ? 's' : ''} completed
		</div>
	{/if}

	<div class="controls">
		{#if state.running}
			<button class="ctrl-btn" on:click={() => timerStore.pause()}>Pause</button>
		{:else}
			<button class="ctrl-btn primary" on:click={() => timerStore.start()}>
				{state.phase === 'idle' ? 'Start' : 'Resume'}
			</button>
		{/if}
		<button class="ctrl-btn" on:click={() => timerStore.reset()}>Reset</button>
	</div>
</div>

<style>
	.display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.ring-container {
		position: relative;
		width: 200px;
		height: 200px;
	}

	.ring {
		display: block;
	}

	.ring-content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}

	.time {
		font-size: 36px;
		font-weight: 600;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
		letter-spacing: 2px;
	}

	.phase-label {
		font-size: 11px;
		color: var(--text-disabled);
		text-transform: uppercase;
		letter-spacing: 1.5px;
	}

	.cycles {
		font-size: 12px;
		color: var(--text-disabled);
	}

	.controls {
		display: flex;
		gap: 10px;
	}

	.ctrl-btn {
		padding: 9px 24px;
		font-size: 13px;
		font-family: var(--font);
		font-weight: 500;
		background: var(--elevated);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
		letter-spacing: 0.3px;
	}

	.ctrl-btn:hover {
		border-color: var(--text-disabled);
	}

	.ctrl-btn.primary {
		background: var(--primary);
		border-color: var(--primary);
		color: #fff;
	}

	.ctrl-btn.primary:hover {
		background: var(--primary-hover);
		border-color: var(--primary-hover);
	}
</style>

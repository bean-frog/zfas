<script lang="ts">
	import TimerDisplay from '$lib/components/timer/TimerDisplay.svelte';
	import TimerSettings from '$lib/components/timer/TimerSettings.svelte';
</script>

<div class="timer-page">
	<h1>Timer</h1>

	<div class="timer-body">
		<TimerDisplay />
		<div class="divider"></div>
		<TimerSettings />
	</div>
</div>

<style>
	.timer-page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		max-width: 480px;
	}

	.timer-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
	}

	.divider {
		width: 100%;
		height: 1px;
		background: var(--border);
	}
</style>

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface TimerPreset {
	id: string;
	name: string;
	workDuration: number; // seconds
	breakDuration: number; // seconds
}

export type TimerPhase = 'work' | 'break' | 'idle';

export interface TimerState {
	presets: TimerPreset[];
	activePresetId: string | null;
	phase: TimerPhase;
	remaining: number; // seconds
	running: boolean;
	cyclesCompleted: number;
}

const defaultPresets: TimerPreset[] = [
	{ id: 'pomodoro', name: 'Pomodoro', workDuration: 25 * 60, breakDuration: 5 * 60 },
	{ id: 'longbreak', name: 'Long Session', workDuration: 50 * 60, breakDuration: 10 * 60 },
	{ id: 'short', name: 'Quick', workDuration: 15 * 60, breakDuration: 3 * 60 }
];

function loadPresets(): TimerPreset[] {
	if (!browser) return defaultPresets;
	try {
		const raw = localStorage.getItem('zfas_timer_presets');
		if (!raw) return defaultPresets;
		return JSON.parse(raw);
	} catch {
		return defaultPresets;
	}
}

function savePresets(presets: TimerPreset[]): void {
	if (browser) localStorage.setItem('zfas_timer_presets', JSON.stringify(presets));
}

function createTimerStore() {
	const presets = loadPresets();
	const initial: TimerState = {
		presets,
		activePresetId: presets[0]?.id ?? null,
		phase: 'idle',
		remaining: presets[0]?.workDuration ?? 25 * 60,
		running: false,
		cyclesCompleted: 0
	};

	const { subscribe, set, update } = writable<TimerState>(initial);

	let interval: ReturnType<typeof setInterval> | null = null;

	function clearTimer() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	return {
		subscribe,

		selectPreset: (id: string) => {
			update((s) => {
				const preset = s.presets.find((p) => p.id === id);
				if (!preset) return s;
				clearTimer();
				return {
					...s,
					activePresetId: id,
					phase: 'idle',
					remaining: preset.workDuration,
					running: false
				};
			});
		},

		start: () => {
			update((s) => {
				if (s.running) return s;
				const preset = s.presets.find((p) => p.id === s.activePresetId);
				if (!preset) return s;
				const phase: TimerPhase = s.phase === 'idle' ? 'work' : s.phase;
				const next = { ...s, running: true, phase };

				interval = setInterval(() => {
					update((st) => {
						if (!st.running) return st;
						if (st.remaining <= 1) {
							clearTimer();
							// switch phases
							const p = st.presets.find((x) => x.id === st.activePresetId)!;
							if (st.phase === 'work') {
								return {
									...st,
									phase: 'break',
									remaining: p.breakDuration,
									running: false,
									cyclesCompleted: st.cyclesCompleted + 1
								};
							} else {
								return { ...st, phase: 'work', remaining: p.workDuration, running: false };
							}
						}
						return { ...st, remaining: st.remaining - 1 };
					});
				}, 1000);

				return next;
			});
		},

		pause: () => {
			clearTimer();
			update((s) => ({ ...s, running: false }));
		},

		reset: () => {
			clearTimer();
			update((s) => {
				const preset = s.presets.find((p) => p.id === s.activePresetId);
				return {
					...s,
					phase: 'idle',
					remaining: preset?.workDuration ?? 25 * 60,
					running: false
				};
			});
		},

		addPreset: (preset: Omit<TimerPreset, 'id'>) => {
			update((s) => {
				const newPreset: TimerPreset = { ...preset, id: crypto.randomUUID() };
				const presets = [...s.presets, newPreset];
				savePresets(presets);
				return { ...s, presets };
			});
		},

		deletePreset: (id: string) => {
			update((s) => {
				// don't delete if it's the only one
				if (s.presets.length <= 1) return s;
				const presets = s.presets.filter((p) => p.id !== id);
				savePresets(presets);
				const activePresetId = s.activePresetId === id ? (presets[0]?.id ?? null) : s.activePresetId;
				clearTimer();
				const preset = presets.find((p) => p.id === activePresetId);
				return {
					...s,
					presets,
					activePresetId,
					phase: 'idle',
					remaining: preset?.workDuration ?? 25 * 60,
					running: false
				};
			});
		}
	};
}

export const timerStore = createTimerStore();

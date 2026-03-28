import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
	font: string;
	primaryColor: string;
	canvasApiKey: string;
	canvasBaseUrl: string;
}

const defaults: Settings = {
	font: 'JetBrains Mono',
	primaryColor: '#155f45',
	canvasApiKey: '',
	canvasBaseUrl: ''
};

function loadSettings(): Settings {
	if (!browser) return defaults;
	try {
		const raw = localStorage.getItem('zfas_settings');
		if (!raw) return defaults;
		return { ...defaults, ...JSON.parse(raw) };
	} catch {
		return defaults;
	}
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<Settings>(loadSettings());

	return {
		subscribe,
		set: (value: Settings) => {
			if (browser) localStorage.setItem('zfas_settings', JSON.stringify(value));
			set(value);
		},
		update: (fn: (s: Settings) => Settings) => {
			update((s) => {
				const next = fn(s);
				if (browser) localStorage.setItem('zfas_settings', JSON.stringify(next));
				return next;
			});
		}
	};
}

export const settingsStore = createSettingsStore();

export function hasVisited(): boolean {
	if (!browser) return true;
	return localStorage.getItem('zfas_visited') === 'true';
}

export function markVisited(): void {
	if (browser) localStorage.setItem('zfas_visited', 'true');
}

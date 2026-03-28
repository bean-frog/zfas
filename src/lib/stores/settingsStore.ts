import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Simple reversible obfuscation — not true security, just avoids plaintext in localStorage
function encode(s: string): string {
	if (!s) return s;
	return btoa(s);
}
function decode(s: string): string {
	if (!s) return s;
	try { return atob(s); } catch { return s; } // fallback for any legacy plaintext
}

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
		const parsed = JSON.parse(raw);
		if (parsed.canvasApiKey) parsed.canvasApiKey = decode(parsed.canvasApiKey);
		return { ...defaults, ...parsed };
	} catch {
		return defaults;
	}
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<Settings>(loadSettings());

	return {
		subscribe,
		set: (value: Settings) => {
			if (browser) {
				const toStore = { ...value, canvasApiKey: encode(value.canvasApiKey) };
				localStorage.setItem('zfas_settings', JSON.stringify(toStore));
			}
			set(value);
		},
		update: (fn: (s: Settings) => Settings) => {
			update((s) => {
				const next = fn(s);
				if (browser) {
					const toStore = { ...next, canvasApiKey: encode(next.canvasApiKey) };
					localStorage.setItem('zfas_settings', JSON.stringify(toStore));
				}
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

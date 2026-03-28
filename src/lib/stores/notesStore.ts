import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Note {
	id: string;
	title: string;
	content: string; // markdown
	createdAt: number;
	updatedAt: number;
}

export const NOTE_CHAR_LIMIT = 15000;

function loadNotes(): Note[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem('zfas_notes');
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

function saveNotes(notes: Note[]): void {
	if (browser) localStorage.setItem('zfas_notes', JSON.stringify(notes));
}

function createNotesStore() {
	const { subscribe, set, update } = writable<Note[]>(loadNotes());

	return {
		subscribe,

		createNote: (title: string = 'Untitled'): Note => {
			const note: Note = {
				id: crypto.randomUUID(),
				title,
				content: '',
				createdAt: Date.now(),
				updatedAt: Date.now()
			};
			update((notes) => {
				const next = [note, ...notes];
				saveNotes(next);
				return next;
			});
			return note;
		},

		updateNote: (id: string, changes: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
			update((notes) => {
				const next = notes.map((n) =>
					n.id === id ? { ...n, ...changes, updatedAt: Date.now() } : n
				);
				saveNotes(next);
				return next;
			});
		},

		deleteNote: (id: string) => {
			update((notes) => {
				const next = notes.filter((n) => n.id !== id);
				saveNotes(next);
				return next;
			});
		},

		importNotes: (incoming: Note[]) => {
			update((notes) => {
				const existingIds = new Set(notes.map((n) => n.id));
				const toAdd = incoming.filter((n) => !existingIds.has(n.id));
				const next = [...toAdd, ...notes];
				saveNotes(next);
				return next;
			});
		}
	};
}

export const notesStore = createNotesStore();

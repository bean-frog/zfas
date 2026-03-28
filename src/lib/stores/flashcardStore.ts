import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface Flashcard {
	id: string;
	front: string;
	back: string;
	image?: string; // base64
	latex?: string;
}

export interface FlashcardSet {
	id: string;
	name: string;
	createdAt: number;
	cards: Flashcard[];
}

function loadSets(): FlashcardSet[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem('zfas_flashcards');
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

function saveSets(sets: FlashcardSet[]): void {
	if (browser) localStorage.setItem('zfas_flashcards', JSON.stringify(sets));
}

function createFlashcardStore() {
	const { subscribe, set, update } = writable<FlashcardSet[]>(loadSets());

	return {
		subscribe,

		createSet: (name: string): FlashcardSet => {
			const newSet: FlashcardSet = {
				id: crypto.randomUUID(),
				name,
				createdAt: Date.now(),
				cards: []
			};
			update((sets) => {
				const next = [...sets, newSet];
				saveSets(next);
				return next;
			});
			return newSet;
		},

		updateSet: (id: string, changes: Partial<Omit<FlashcardSet, 'id'>>) => {
			update((sets) => {
				const next = sets.map((s) => (s.id === id ? { ...s, ...changes } : s));
				saveSets(next);
				return next;
			});
		},

		deleteSet: (id: string) => {
			update((sets) => {
				const next = sets.filter((s) => s.id !== id);
				saveSets(next);
				return next;
			});
		},

		addCard: (setId: string, card: Omit<Flashcard, 'id'>) => {
			const newCard: Flashcard = { ...card, id: crypto.randomUUID() };
			update((sets) => {
				const next = sets.map((s) =>
					s.id === setId ? { ...s, cards: [...s.cards, newCard] } : s
				);
				saveSets(next);
				return next;
			});
			return newCard;
		},

		updateCard: (setId: string, cardId: string, changes: Partial<Omit<Flashcard, 'id'>>) => {
			update((sets) => {
				const next = sets.map((s) =>
					s.id === setId
						? { ...s, cards: s.cards.map((c) => (c.id === cardId ? { ...c, ...changes } : c)) }
						: s
				);
				saveSets(next);
				return next;
			});
		},

		deleteCard: (setId: string, cardId: string) => {
			update((sets) => {
				const next = sets.map((s) =>
					s.id === setId ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) } : s
				);
				saveSets(next);
				return next;
			});
		},

		importSets: (incoming: FlashcardSet[]) => {
			update((sets) => {
				const existingIds = new Set(sets.map((s) => s.id));
				const toAdd = incoming.filter((s) => !existingIds.has(s.id));
				const next = [...sets, ...toAdd];
				saveSets(next);
				return next;
			});
		},

		getSet: (id: string): FlashcardSet | undefined => {
			let result: FlashcardSet | undefined;
			const unsub = subscribe((sets) => {
				result = sets.find((s) => s.id === id);
			});
			unsub();
			return result;
		}
	};
}

export const flashcardStore = createFlashcardStore();

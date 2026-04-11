import JSZip from 'jszip';
import { browser } from '$app/environment';
import type { FlashcardSet } from '$lib/stores/flashcardStore';
import type { Note } from '$lib/stores/notesStore';
import type { TimerPreset } from '$lib/stores/timerStore';

export interface BackupData {
	flashcards: FlashcardSet[];
	notes: Note[];
	timerPresets: TimerPreset[];
}

export async function exportBackupZip(data: BackupData): Promise<void> {
	const zip = new JSZip();
	zip.file('flashcards.json', JSON.stringify(data.flashcards, null, 2));
	zip.file('notes.json', JSON.stringify(data.notes, null, 2));
	zip.file('timer-presets.json', JSON.stringify(data.timerPresets, null, 2));

	const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `zfas-backup-${new Date().toISOString().slice(0, 10)}.zip`;
	a.click();
	URL.revokeObjectURL(url);
}

export async function importBackupZip(file: File): Promise<Partial<BackupData>> {
	const zip = await JSZip.loadAsync(file);
	const result: Partial<BackupData> = {};

	const flashcardsFile = zip.file('flashcards.json');
	if (flashcardsFile) {
		const raw = await flashcardsFile.async('string');
		result.flashcards = JSON.parse(raw);
	}

	const notesFile = zip.file('notes.json');
	if (notesFile) {
		const raw = await notesFile.async('string');
		result.notes = JSON.parse(raw);
	}

	const presetsFile = zip.file('timer-presets.json');
	if (presetsFile) {
		const raw = await presetsFile.async('string');
		result.timerPresets = JSON.parse(raw);
	}

	return result;
}

export function pickZipFile(): Promise<File> {
	return new Promise((resolve, reject) => {
		if (!browser) return reject(new Error('Not in browser'));
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.zip,application/zip';
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) reject(new Error('No file selected'));
			else resolve(file);
		};
		input.click();
	});
}

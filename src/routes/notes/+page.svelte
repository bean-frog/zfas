<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import NoteList from '$lib/components/notes/NoteList.svelte';
	import NoteEditor from '$lib/components/notes/NoteEditor.svelte';
	import { notesStore, type Note } from '$lib/stores/notesStore';
	import { importJSONFromFile, parseJSONString } from '$lib/utils/jsonImportExport';
	import Modal from '$lib/components/common/Modal.svelte';
	import Button from '$lib/components/common/Button.svelte';

	let activeNote: Note | null = null;
	let showImportModal = false;
	let pasteJson = '';
	let importError = '';

	// Deep-link support: ?id=noteId
	$: {
		const id = $page.url.searchParams.get('id');
		if (id && !activeNote) {
			const found = $notesStore.find((n) => n.id === id);
			if (found) activeNote = found;
		}
	}

	// Keep activeNote in sync with store
	$: if (activeNote) {
		const updated = $notesStore.find((n) => n.id === activeNote!.id);
		if (updated) activeNote = updated;
	}

	function handleSelect(e: CustomEvent<{ note: Note | null }>) {
		activeNote = e.detail.note;
		if (activeNote) {
			goto(`/notes?id=${activeNote.id}`, { replaceState: true });
		} else {
			goto('/notes', { replaceState: true });
		}
	}

	async function importFromFile() {
		try {
			const data = await importJSONFromFile();
			handleImport(data);
		} catch (e) {
			importError = e instanceof Error ? e.message : 'Import failed.';
		}
	}

	function importFromPaste() {
		try {
			const data = parseJSONString(pasteJson);
			handleImport(data);
		} catch {
			importError = 'Invalid JSON.';
		}
	}

	function handleImport(data: unknown) {
		const arr = Array.isArray(data) ? data : [data];
		const valid = arr.filter(
			(x) =>
				typeof x === 'object' &&
				x !== null &&
				'title' in x &&
				'content' in x
		) as Note[];
		if (valid.length === 0) {
			importError = 'No valid notes found in JSON.';
			return;
		}
		notesStore.importNotes(valid);
		showImportModal = false;
		pasteJson = '';
		importError = '';
	}
</script>

<div class="notes-page">
	<div class="notes-header">
		<h1>Notes</h1>
		<Button variant="ghost" size="sm" on:click={() => (showImportModal = true)}>Import</Button>
	</div>

	<div class="notes-body">
		<NoteList activeNoteId={activeNote?.id ?? null} on:select={handleSelect} />

		<div class="editor-area">
			{#if activeNote}
				<NoteEditor note={activeNote} />
			{:else}
				<div class="no-note">
					<p>Select a note or create a new one.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<Modal title="Import Notes" open={showImportModal} on:close={() => { showImportModal = false; importError = ''; }}>
	<div class="modal-form">
		<p class="help-text">Import notes from a JSON file or paste JSON directly.</p>
		<Button variant="secondary" on:click={importFromFile} fullWidth>Choose JSON File</Button>
		<div class="divider"><span>or paste JSON</span></div>
		<textarea
			class="paste-area"
			bind:value={pasteJson}
			placeholder="Paste notes JSON here..."
			rows="6"
		></textarea>
		{#if importError}
			<span class="import-error">{importError}</span>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={() => { showImportModal = false; importError = ''; }}>Cancel</Button>
		<Button variant="primary" on:click={importFromPaste} disabled={!pasteJson.trim()}>Import JSON</Button>
	</svelte:fragment>
</Modal>

<style>
	.notes-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
		height: 100%;
	}

	.notes-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
	}

	.notes-body {
		display: flex;
		gap: 20px;
		flex: 1;
		overflow: hidden;
		min-height: 0;
	}

	.editor-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-height: 0;
	}

	.no-note {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.no-note p {
		font-size: 13px;
		color: var(--text-disabled);
	}

	.modal-form { display: flex; flex-direction: column; gap: 12px; }
	.help-text { font-size: 12px; color: var(--text-secondary); }
	.divider { display: flex; align-items: center; gap: 10px; }
	.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
	.divider span { font-size: 11px; color: var(--text-disabled); }
	.paste-area { width: 100%; padding: 8px 10px; font-size: 12px; resize: vertical; font-family: var(--font); }
	.import-error { font-size: 12px; color: var(--error); }
</style>

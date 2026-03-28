<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { notesStore, type Note } from '$lib/stores/notesStore';
	import { exportJSON } from '$lib/utils/jsonImportExport';
	import { formatDate } from '$lib/utils/markdownParser';
	import SearchBar from '../common/SearchBar.svelte';
	import Button from '../common/Button.svelte';

	export let activeNoteId: string | null = null;

	const dispatch = createEventDispatcher();

	let query = '';

	$: notes = $notesStore;

	$: filtered = query.trim()
		? notes.filter(
				(n) =>
					n.title.toLowerCase().includes(query.toLowerCase()) ||
					n.content.toLowerCase().includes(query.toLowerCase())
		  )
		: notes;

	function createNote() {
		const note = notesStore.createNote('Untitled');
		dispatch('select', { note });
	}

	function deleteNote(note: Note, e: MouseEvent) {
		e.stopPropagation();
		if (confirm(`Delete "${note.title}"?`)) {
			notesStore.deleteNote(note.id);
			if (activeNoteId === note.id) dispatch('select', { note: null });
		}
	}

	function exportNotes() {
		exportJSON(notes, 'zfas-notes.json');
	}
</script>

<div class="note-list">
	<div class="list-header">
		<Button variant="primary" size="sm" on:click={createNote} fullWidth>+ New Note</Button>
		{#if notes.length > 0}
			<Button variant="ghost" size="sm" on:click={exportNotes}>Export</Button>
		{/if}
	</div>

	{#if notes.length > 2}
		<SearchBar bind:value={query} placeholder="Search notes..." />
	{/if}

	<div class="list">
		{#if filtered.length === 0}
			<p class="empty">
				{notes.length === 0 ? 'No notes yet.' : 'No results.'}
			</p>
		{:else}
			{#each filtered as note (note.id)}
				<div
					class="note-item"
					class:active={activeNoteId === note.id}
					on:click={() => dispatch('select', { note })}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && dispatch('select', { note })}
				>
					<div class="note-item-inner">
						<span class="note-title">{note.title || 'Untitled'}</span>
						<span class="note-date">{formatDate(note.updatedAt)}</span>
					</div>
					<button
						class="delete-btn"
						on:click|stopPropagation={(e) => deleteNote(note, e)}
						aria-label="Delete note"
					>✕</button>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.note-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 220px;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		padding-right: 16px;
		height: 100%;
		overflow-y: auto;
	}

	.list-header {
		display: flex;
		gap: 6px;
		align-items: center;
		flex-shrink: 0;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		overflow-y: auto;
	}

	.empty {
		font-size: 12px;
		color: var(--text-disabled);
		padding: 8px 0;
	}

	.note-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 8px 10px;
		background: none;
		border: 1px solid transparent;
		border-radius: var(--radius);
		text-align: left;
		cursor: pointer;
		gap: 6px;
	}

	.note-item:hover {
		background: var(--elevated);
	}

	.note-item.active {
		background: var(--elevated);
		border-color: var(--border);
	}

	.note-item-inner {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		overflow: hidden;
	}

	.note-title {
		font-size: 13px;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.note-date {
		font-size: 10px;
		color: var(--text-disabled);
	}

	.delete-btn {
		font-size: 10px;
		color: var(--text-disabled);
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 2px;
		flex-shrink: 0;
		opacity: 0;
		font-family: var(--font);
	}

	.note-item:hover .delete-btn,
	.note-item.active .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		color: var(--error);
	}
</style>

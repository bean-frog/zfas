<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { flashcardStore, type FlashcardSet } from '$lib/stores/flashcardStore';
	import { exportJSON, importJSONFromFile, parseJSONString } from '$lib/utils/jsonImportExport';
	import SearchBar from '../common/SearchBar.svelte';
	import Button from '../common/Button.svelte';
	import Modal from '../common/Modal.svelte';

	const dispatch = createEventDispatcher();

	let query = '';
	let showImportModal = false;
	let pasteJson = '';
	let importError = '';
	let newSetName = '';
	let showNewSetModal = false;

	$: sets = $flashcardStore;

	$: filtered = query.trim()
		? sets.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
		: sets;

	function createSet() {
		if (!newSetName.trim()) return;
		const s = flashcardStore.createSet(newSetName.trim());
		newSetName = '';
		showNewSetModal = false;
		dispatch('edit', { set: s });
	}

	function deleteSet(set: FlashcardSet) {
		if (confirm(`Delete "${set.name}" and all its cards?`)) {
			flashcardStore.deleteSet(set.id);
		}
	}

	function exportSet(set: FlashcardSet) {
		exportJSON([set], `zfas-${set.name.replace(/\s+/g, '-')}.json`);
	}

	function exportAll() {
		exportJSON(sets, 'zfas-all-flashcards.json');
	}

	async function importFromFile() {
		try {
			const data = await importJSONFromFile();
			handleImportData(data);
		} catch (e) {
			importError = e instanceof Error ? e.message : 'Import failed.';
		}
	}

	function importFromPaste() {
		try {
			const data = parseJSONString(pasteJson);
			handleImportData(data);
		} catch {
			importError = 'Invalid JSON.';
		}
	}

	function handleImportData(data: unknown) {
		const arr = Array.isArray(data) ? data : [data];
		// Basic validation
		const valid = arr.filter(
			(x) =>
				typeof x === 'object' &&
				x !== null &&
				'name' in x &&
				'cards' in x &&
				Array.isArray((x as FlashcardSet).cards)
		) as FlashcardSet[];

		if (valid.length === 0) {
			importError = 'No valid flashcard sets found in JSON.';
			return;
		}

		flashcardStore.importSets(valid);
		showImportModal = false;
		pasteJson = '';
		importError = '';
	}
</script>

<div class="set-list">
	<div class="list-header">
		<h1>Flashcards</h1>
		<div class="header-actions">
			<Button variant="ghost" size="sm" on:click={() => (showImportModal = true)}>Import</Button>
			{#if sets.length > 0}
				<Button variant="ghost" size="sm" on:click={exportAll}>Export All</Button>
			{/if}
			<Button variant="primary" size="sm" on:click={() => (showNewSetModal = true)}>+ New Set</Button>
		</div>
	</div>

	{#if sets.length > 1}
		<SearchBar bind:value={query} placeholder="Search sets..." />
	{/if}

	{#if filtered.length === 0}
		<div class="empty">
			{#if sets.length === 0}
				<p>No flashcard sets yet. Create one to get started.</p>
			{:else}
				<p>No sets match your search.</p>
			{/if}
		</div>
	{:else}
		<div class="sets">
			{#each filtered as set (set.id)}
				<div class="set-card">
					<div class="set-info">
						<span class="set-name">{set.name}</span>
						<span class="set-meta">{set.cards.length} card{set.cards.length !== 1 ? 's' : ''}</span>
					</div>
					<div class="set-actions">
						<Button variant="ghost" size="sm" on:click={() => dispatch('study', { set })}>Study</Button>
						<Button variant="ghost" size="sm" on:click={() => dispatch('match', { set })}>Match</Button>
						<Button variant="ghost" size="sm" on:click={() => dispatch('edit', { set })}>Edit</Button>
						<button class="icon-btn" on:click={() => exportSet(set)} title="Export">↓</button>
						<button class="icon-btn danger" on:click={() => deleteSet(set)} title="Delete">✕</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- New set modal -->
<Modal title="New Flashcard Set" open={showNewSetModal} on:close={() => (showNewSetModal = false)}>
	<div class="modal-form">
		<label class="form-label" for="new-set-name">Set Name</label>
		<input
			id="new-set-name"
			class="form-input"
			bind:value={newSetName}
			placeholder="e.g. Biology Chapter 3"
			on:keydown={(e) => e.key === 'Enter' && createSet()}
		/>
	</div>
	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={() => (showNewSetModal = false)}>Cancel</Button>
		<Button variant="primary" on:click={createSet} disabled={!newSetName.trim()}>Create</Button>
	</svelte:fragment>
</Modal>

<!-- Import modal -->
<Modal title="Import Flashcards" open={showImportModal} on:close={() => { showImportModal = false; importError = ''; }}>
	<div class="modal-form">
		<p class="import-help">Import from a JSON file or paste JSON directly.</p>
		<Button variant="secondary" on:click={importFromFile} fullWidth>Choose JSON File</Button>
		<div class="divider"><span>or paste JSON</span></div>
		<textarea
			class="paste-area"
			bind:value={pasteJson}
			placeholder="Paste flashcard set JSON here..."
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
	.set-list { display: flex; flex-direction: column; gap: 16px; }

	.list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.header-actions {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.empty { padding: 40px 0; }
	.empty p { font-size: 13px; color: var(--text-disabled); }

	.sets { display: flex; flex-direction: column; gap: 4px; }

	.set-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.set-info { display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
	.set-name { font-size: 14px; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.set-meta { font-size: 11px; color: var(--text-disabled); }

	.set-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.icon-btn {
		font-size: 11px;
		width: 26px;
		height: 26px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
		color: var(--text-secondary);
		font-family: var(--font);
	}

	.icon-btn:hover { color: var(--text-primary); }
	.icon-btn.danger:hover { color: var(--error); border-color: var(--error); }

	/* Modal form */
	.modal-form { display: flex; flex-direction: column; gap: 12px; }
	.form-label { font-size: 11px; color: var(--text-secondary); }
	.form-input { width: 100%; padding: 7px 10px; font-size: 13px; }
	.import-help { font-size: 12px; color: var(--text-secondary); }
	.divider { display: flex; align-items: center; gap: 10px; }
	.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
	.divider span { font-size: 11px; color: var(--text-disabled); }
	.paste-area { width: 100%; padding: 8px 10px; font-size: 12px; resize: vertical; }
	.import-error { font-size: 12px; color: var(--error); }
</style>

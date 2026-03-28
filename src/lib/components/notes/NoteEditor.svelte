<script lang="ts">
	import { notesStore, type Note, NOTE_CHAR_LIMIT } from '$lib/stores/notesStore';
	import { renderMarkdown } from '$lib/utils/markdownParser';

	export let note: Note;

	let mode: 'edit' | 'preview' = 'edit';
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	$: charCount = note.content.length;
	$: nearLimit = charCount > NOTE_CHAR_LIMIT * 0.9;
	$: atLimit = charCount >= NOTE_CHAR_LIMIT;
	$: rendered = mode === 'preview' ? renderMarkdown(note.content) : '';

	function handleContentInput(e: Event) {
		const content = (e.target as HTMLTextAreaElement).value;
		note = { ...note, content };
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => notesStore.updateNote(note.id, { content }), 500);
	}

	function handleTitleInput(e: Event) {
		const title = (e.target as HTMLInputElement).value;
		note = { ...note, title };
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => notesStore.updateNote(note.id, { title }), 500);
	}
</script>

<div class="editor">
	<div class="editor-toolbar">
		<input
			class="title-input"
			value={note.title}
			on:input={handleTitleInput}
			placeholder="Note title..."
		/>
		<span class="char-count" class:near-limit={nearLimit} class:at-limit={atLimit}>
			{charCount}/{NOTE_CHAR_LIMIT}
		</span>
		<button
			class="mode-btn"
			class:active={mode === 'preview'}
			on:click={() => (mode = mode === 'edit' ? 'preview' : 'edit')}
		>
			{mode === 'edit' ? 'Preview' : 'Edit'}
		</button>
	</div>

	{#if mode === 'edit'}
		<textarea
			class="edit-area"
			value={note.content}
			on:input={handleContentInput}
			placeholder="Write in Markdown... Use $latex$ for inline and $$latex$$ for block math."
			spellcheck="false"
		></textarea>
	{:else}
		<div class="preview-area">
			{#if note.content.trim()}
				{@html rendered}
			{:else}
				<span class="preview-empty">Nothing to preview.</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.editor-toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
		margin-bottom: 4px;
	}

	.title-input {
		flex: 1;
		font-size: 18px;
		font-weight: 600;
		background: transparent;
		border: none;
		color: var(--text-primary);
		padding: 0;
		outline: none;
	}
	.title-input::placeholder { color: var(--text-disabled); }

	.char-count { font-size: 11px; color: var(--text-disabled); flex-shrink: 0; }
	.char-count.near-limit { color: #d4a017; }
	.char-count.at-limit { color: var(--error); }

	.mode-btn {
		font-size: 11px;
		padding: 4px 10px;
		font-family: var(--font);
		background: var(--elevated);
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
		flex-shrink: 0;
		transition: color 0.1s, border-color 0.1s;
	}
	.mode-btn:hover { color: var(--text-primary); }
	.mode-btn.active { color: var(--primary); border-color: var(--primary); }

	/* Edit mode */
	.edit-area {
		flex: 1;
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		resize: none;
		font-size: 14px;
		line-height: 1.65;
		color: var(--text-secondary);
		font-family: var(--font);
		padding: 8px 0;
	}
	.edit-area::placeholder { color: var(--text-disabled); }

	/* Preview mode */
	.preview-area {
		flex: 1;
		overflow-y: auto;
		padding: 8px 0;
		font-size: 14px;
		line-height: 1.65;
		color: var(--text-secondary);
	}

	.preview-empty {
		font-size: 13px;
		color: var(--text-disabled);
	}

	/* Rendered markdown styles */
	.preview-area :global(h1) { font-size: 1.5em; font-weight: 700; color: var(--text-primary); margin: 0.5em 0 0.25em; line-height: 1.3; }
	.preview-area :global(h2) { font-size: 1.25em; font-weight: 600; color: var(--text-primary); margin: 0.5em 0 0.25em; }
	.preview-area :global(h3) { font-size: 1.1em; font-weight: 600; color: var(--text-primary); margin: 0.4em 0 0.2em; }
	.preview-area :global(h4), .preview-area :global(h5), .preview-area :global(h6) { font-weight: 600; color: var(--text-primary); margin: 0.3em 0 0.15em; }

	.preview-area :global(p) { margin: 0 0 0.5em; }

	.preview-area :global(blockquote) {
		border-left: 3px solid var(--primary);
		padding-left: 12px;
		color: var(--text-disabled);
		font-style: italic;
		margin: 0.5em 0;
	}

	.preview-area :global(hr) { border: none; border-top: 1px solid var(--border); margin: 0.75em 0; }

	.preview-area :global(ul) { padding-left: 20px; margin: 0.25em 0; }
	.preview-area :global(li) { margin: 0.1em 0; }

	.preview-area :global(code) {
		background: var(--elevated);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 12px;
		font-family: var(--font);
		color: var(--text-primary);
	}

	.preview-area :global(pre) {
		background: var(--elevated);
		padding: 10px 14px;
		border-radius: var(--radius);
		overflow-x: auto;
		margin: 0.5em 0;
	}
	.preview-area :global(pre code) { background: none; padding: 0; font-size: 13px; }

	.preview-area :global(a) { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }

	.preview-area :global(mark) {
		background: color-mix(in srgb, #f5c518 35%, transparent);
		border-radius: 2px;
		padding: 0 2px;
		color: inherit;
	}

	.preview-area :global(strong) { color: var(--text-primary); }

	/* KaTeX */
	.preview-area :global(.katex-block) {
		display: flex;
		justify-content: center;
		padding: 0.75em 0;
		overflow-x: auto;
	}

	.preview-area :global(.katex-inline) {
		display: inline;
	}
</style>

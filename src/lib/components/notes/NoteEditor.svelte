<script lang="ts">
	import { notesStore, type Note, NOTE_CHAR_LIMIT } from '$lib/stores/notesStore';
	import { tick } from 'svelte';

	export let note: Note;

	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let editorEl: HTMLDivElement;
	let activeLine = -1;
	let isFocused = false;

	$: charCount = note.content.length;
	$: nearLimit = charCount > NOTE_CHAR_LIMIT * 0.9;
	$: atLimit = charCount >= NOTE_CHAR_LIMIT;

	// ─── Markdown rendering ───────────────────────────────────────────────────

	/** Render a single line as HTML (non-active lines only) */
	function renderLine(raw: string): string {
		let s = raw;

		// Horizontal rule
		if (/^(-{3,}|\*{3,}|_{3,})$/.test(s.trim())) {
			return '<hr />';
		}

		// Headings
		const hMatch = s.match(/^(#{1,6})\s+(.*)/);
		if (hMatch) {
			const level = hMatch[1].length;
			const text = inlineRender(hMatch[2]);
			return `<h${level} class="md-heading md-h${level}">${text}</h${level}>`;
		}

		// Blockquote
		if (s.startsWith('> ')) {
			return `<blockquote class="md-blockquote">${inlineRender(s.slice(2))}</blockquote>`;
		}

		// Unordered list (- [ ] checkbox)
		const checkMatch = s.match(/^(\s*)-\s+\[( |x)\]\s+(.*)/);
		if (checkMatch) {
			const checked = checkMatch[2] === 'x';
			const label = inlineRender(checkMatch[3]);
			return `<span class="md-checkbox ${checked ? 'md-checked' : ''}">
				<span class="md-checkbox-box">${checked ? '✓' : ''}</span>
				<span class="md-checkbox-label">${label}</span>
			</span>`;
		}

		// Unordered list item (- or *)
		const ulMatch = s.match(/^(\s*)[-*+]\s+(.*)/);
		if (ulMatch) {
			const indent = Math.floor(ulMatch[1].length / 2);
			return `<span class="md-li" style="padding-left:${indent * 16 + 4}px"><span class="md-bullet">•</span>${inlineRender(ulMatch[2])}</span>`;
		}

		// Ordered list item
		const olMatch = s.match(/^(\s*)(\d+)\.\s+(.*)/);
		if (olMatch) {
			const indent = Math.floor(olMatch[1].length / 2);
			return `<span class="md-li" style="padding-left:${indent * 16 + 4}px"><span class="md-num">${olMatch[2]}.</span>${inlineRender(olMatch[3])}</span>`;
		}

		// Code block fence (just style the line)
		if (s.startsWith('```')) {
			const lang = s.slice(3).trim();
			return `<span class="md-code-fence">${lang ? `<span class="md-lang">${lang}</span>` : '```'}</span>`;
		}

		// Empty line → spacer
		if (s.trim() === '') return '<span class="md-empty"> </span>';

		// Paragraph
		return `<span class="md-p">${inlineRender(s)}</span>`;
	}

	/** Render inline markdown (bold, italic, code, links, strikethrough) */
	function inlineRender(s: string): string {
		// Escape HTML first
		s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		// Inline code (do first to avoid processing inner content)
		s = s.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
		// Bold+italic
		s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
		// Bold
		s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
		// Italic
		s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
		s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
		// Strikethrough
		s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
		// Links
		s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener">$1</a>');
		// Highlight
		s = s.replace(/==(.+?)==/g, '<mark class="md-mark">$1</mark>');
		return s;
	}

	// ─── Active line syntax highlighting ─────────────────────────────────────

	/** Colorize raw markdown syntax tokens on the active (editing) line */
	function syntaxHighlightRaw(raw: string): string {
		let s = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		// Heading hashes
		s = s.replace(/^(#{1,6})(\s)/, '<span class="syn-heading-marker">$1</span>$2');
		// Blockquote >
		s = s.replace(/^(&gt;\s)/, '<span class="syn-blockquote-marker">$1</span>');
		// HR
		if (/^(-{3,}|\*{3,}|_{3,})$/.test(raw.trim())) {
			return `<span class="syn-hr">${s}</span>`;
		}
		// Checkbox
		s = s.replace(/^(\s*-\s+\[)( |x)(\])/, '$1<span class="syn-checkbox-mark">$2</span>$3');
		// List marker
		s = s.replace(/^(\s*)([-*+])(\s)/, '$1<span class="syn-list-marker">$2</span>$3');
		// Ordered list number
		s = s.replace(/^(\s*)(\d+\.)(\s)/, '$1<span class="syn-list-marker">$2</span>$3');
		// Code fence
		s = s.replace(/^(```)(.*)/, '<span class="syn-code-fence">$1</span><span class="syn-lang">$2</span>');
		// Bold+italic markers
		s = s.replace(/(\*\*\*)(.*?)(\*\*\*)/g, '<span class="syn-mark">$1</span>$2<span class="syn-mark">$3</span>');
		// Bold
		s = s.replace(/(\*\*|__)(.*?)(\*\*|__)/g, '<span class="syn-mark">$1</span>$2<span class="syn-mark">$3</span>');
		// Italic
		s = s.replace(/(\*|_)(.*?)(\*|_)/g, '<span class="syn-mark">$1</span>$2<span class="syn-mark">$3</span>');
		// Strikethrough
		s = s.replace(/(~~)(.*?)(~~)/g, '<span class="syn-mark">$1</span>$2<span class="syn-mark">$3</span>');
		// Highlight
		s = s.replace(/(==)(.*?)(==)/g, '<span class="syn-mark">$1</span>$2<span class="syn-mark">$3</span>');
		// Inline code
		s = s.replace(/(`)(.*?)(`)/g, '<span class="syn-mark">$1</span><span class="syn-inline-code">$2</span><span class="syn-mark">$3</span>');
		// Links [text](url)
		s = s.replace(/(\[)(.*?)(\]\()([^)]*?)(\))/g,
			'<span class="syn-mark">$1</span>$2<span class="syn-mark">$3</span><span class="syn-url">$4</span><span class="syn-mark">$5</span>');
		return s;
	}

	// ─── Content ↔ DOM sync ───────────────────────────────────────────────────

	let lines: string[] = [];
	let isComposing = false;

	$: {
		// Only update DOM lines from store when not focused (avoid caret fighting)
		if (!isFocused) {
			lines = note.content.split('\n');
		}
	}

	function getLineIndex(el: HTMLElement): number {
		const lineEl = el.closest('[data-line]') as HTMLElement | null;
		if (!lineEl) return -1;
		return parseInt(lineEl.dataset.line ?? '-1', 10);
	}

	function handleFocus() {
		isFocused = true;
		lines = note.content.split('\n');
	}

	function handleBlur() {
		isFocused = false;
		activeLine = -1;
		flushToStore();
	}

	function handleClick(e: MouseEvent) {
		activeLine = getLineIndex(e.target as HTMLElement);
		tick().then(focusActiveLine);
	}

	function handleLineFocus(e: FocusEvent) {
		const idx = getLineIndex(e.target as HTMLElement);
		if (idx !== -1) activeLine = idx;
	}

	// Keep the actual editable span focused and caret at end when activeLine changes
	async function focusActiveLine() {
		if (activeLine < 0 || !editorEl) return;
		await tick();
		const lineEl = editorEl.querySelector(`[data-line="${activeLine}"] .line-input`) as HTMLElement | null;
		if (lineEl) {
			lineEl.focus({ preventScroll: true });
			// Place caret at end if nothing selected
			const sel = window.getSelection();
			if (sel && sel.rangeCount === 0) {
				const r = document.createRange();
				r.selectNodeContents(lineEl);
				r.collapse(false);
				sel.removeAllRanges();
				sel.addRange(r);
			}
		}
	}

	function handleLineInput(e: Event, idx: number) {
		if (isComposing) return;
		const el = e.target as HTMLElement;
		const newText = el.innerText.replace(/\n/g, '');
		lines[idx] = newText;
		scheduleStoreSave();
	}

	function handleCompositionStart() { isComposing = true; }
	function handleCompositionEnd(e: Event, idx: number) {
		isComposing = false;
		handleLineInput(e, idx);
	}

	function handleKeydown(e: KeyboardEvent, idx: number) {
		if (e.key === 'Enter') {
			e.preventDefault();
			// Split current line at caret
			const el = e.target as HTMLElement;
			const sel = window.getSelection();
			let caretOffset = el.innerText.length;
			if (sel && sel.rangeCount > 0) {
				const range = sel.getRangeAt(0);
				const pre = range.cloneRange();
				pre.selectNodeContents(el);
				pre.setEnd(range.startContainer, range.startOffset);
				caretOffset = pre.toString().length;
			}
			const current = lines[idx] ?? '';
			const before = current.slice(0, caretOffset);
			const after = current.slice(caretOffset);

			// Auto-continue list prefix
			const listMatch = before.match(/^(\s*[-*+]\s)/);
			const olMatch = before.match(/^(\s*)(\d+)\.\s/);
			let prefix = '';
			if (listMatch && before.trim() !== listMatch[1].trim()) prefix = listMatch[1];
			else if (olMatch && before.trim() !== '') {
				prefix = `${olMatch[1]}${parseInt(olMatch[2]) + 1}. `;
			}

			lines = [...lines.slice(0, idx + 1), prefix + after, ...lines.slice(idx + 1)];
			lines[idx] = before;
			activeLine = idx + 1;
			scheduleStoreSave();
			tick().then(focusActiveLine);
		} else if (e.key === 'Backspace') {
			const el = e.target as HTMLElement;
			if (el.innerText === '' && lines.length > 1) {
				e.preventDefault();
				lines = [...lines.slice(0, idx), ...lines.slice(idx + 1)];
				activeLine = Math.max(0, idx - 1);
				scheduleStoreSave();
				tick().then(() => {
					const lineEl = editorEl?.querySelector(`[data-line="${activeLine}"] .line-input`) as HTMLElement | null;
					if (lineEl) {
						lineEl.focus({ preventScroll: true });
						// Place caret at end
						const r = document.createRange();
						r.selectNodeContents(lineEl);
						r.collapse(false);
						const sel = window.getSelection();
						sel?.removeAllRanges();
						sel?.addRange(r);
					}
				});
			}
		} else if (e.key === 'ArrowUp' && idx > 0) {
			e.preventDefault();
			activeLine = idx - 1;
			tick().then(focusActiveLine);
		} else if (e.key === 'ArrowDown' && idx < lines.length - 1) {
			e.preventDefault();
			activeLine = idx + 1;
			tick().then(focusActiveLine);
		} else if (e.key === 'Tab') {
			e.preventDefault();
			document.execCommand('insertText', false, '  ');
		}
	}

	function scheduleStoreSave() {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(flushToStore, 500);
	}

	function flushToStore() {
		const content = lines.join('\n');
		if (content !== note.content) {
			notesStore.updateNote(note.id, { content });
			note = { ...note, content };
		}
	}

	function handleTitleInput(e: Event) {
		const title = (e.target as HTMLInputElement).value;
		note = { ...note, title };
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => notesStore.updateNote(note.id, { title }), 500);
	}

	// Detect when we're inside a code block for that line
	function isInCodeBlock(lineIdx: number): boolean {
		let inside = false;
		for (let i = 0; i < lineIdx; i++) {
			if (lines[i].startsWith('```')) inside = !inside;
		}
		return inside;
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
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="live-editor"
		bind:this={editorEl}
		on:click={handleClick}
		on:focus={handleFocus}
		on:blur|capture={handleBlur}
	>
		{#each lines as line, idx (idx)}
			{@const isActive = activeLine === idx}
			{@const inCode = isInCodeBlock(idx)}
			<div
				class="editor-line"
				class:active-line={isActive}
				data-line={idx}
				on:focus={handleLineFocus}
			>
				{#if isActive}
					<!-- Active line: contenteditable with syntax-colored markers -->
					<span
						class="line-input active-input"
						contenteditable="true"
						spellcheck="false"
						data-placeholder={idx === 0 && lines.length === 1 ? 'Write in Markdown...' : ''}
						on:input={(e) => handleLineInput(e, idx)}
						on:keydown={(e) => handleKeydown(e, idx)}
						on:compositionstart={handleCompositionStart}
						on:compositionend={(e) => handleCompositionEnd(e, idx)}
					>{line}</span>
					<!-- Syntax overlay (pointer-events:none, sits behind text via a ghost render) -->
					<span
						class="syn-overlay"
						aria-hidden="true"
					>{@html syntaxHighlightRaw(line)}</span>
				{:else if inCode}
					<!-- Inside code block: monospace, no formatting -->
					<span class="line-rendered code-line">{line}</span>
				{:else}
					<!-- Rendered markdown line -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="line-rendered"
						tabindex="-1"
						on:click|stopPropagation={() => { activeLine = idx; tick().then(focusActiveLine); }}
					>{@html renderLine(line)}</span>
				{/if}
			</div>
		{/each}

		<!-- Click empty space below lines to append -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="editor-padding" on:click|stopPropagation={() => {
			activeLine = lines.length - 1;
			tick().then(focusActiveLine);
		}}></div>
	</div>
</div>

<style>
	/* ── Layout ──────────────────────────────────────────────── */
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

	/* ── Live editor container ───────────────────────────────── */
	.live-editor {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 8px 0;
		outline: none;
		cursor: text;
	}

	.editor-padding {
		min-height: 120px;
	}

	/* ── Individual lines ────────────────────────────────────── */
	.editor-line {
		position: relative;
		display: flex;
		min-height: 1.65em;
		line-height: 1.65;
		border-radius: 3px;
		padding: 0 2px;
	}

	.active-line {
		background: color-mix(in srgb, var(--primary, #7c6cfc) 6%, transparent);
	}

	/* ── Rendered (non-active) lines ─────────────────────────── */
	.line-rendered {
		display: block;
		width: 100%;
		font-size: 14px;
		line-height: 1.65;
		color: var(--text-secondary);
		cursor: text;
		word-break: break-word;
		outline: none;
	}

	.line-rendered :global(h1.md-h1) { font-size: 1.5em; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.3; }
	.line-rendered :global(h2.md-h2) { font-size: 1.25em; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.35; }
	.line-rendered :global(h3.md-h3) { font-size: 1.1em; font-weight: 600; color: var(--text-primary); margin: 0; }
	.line-rendered :global(h4), .line-rendered :global(h5), .line-rendered :global(h6) { font-weight: 600; color: var(--text-primary); margin: 0; }

	.line-rendered :global(blockquote.md-blockquote) {
		display: block;
		border-left: 3px solid var(--primary, #7c6cfc);
		padding-left: 12px;
		color: var(--text-disabled);
		font-style: italic;
		margin: 0;
	}

	.line-rendered :global(hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 4px 0;
	}

	.line-rendered :global(.md-checkbox) {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.line-rendered :global(.md-checkbox-box) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border: 1.5px solid var(--text-disabled);
		border-radius: 3px;
		font-size: 10px;
		flex-shrink: 0;
		color: var(--primary, #7c6cfc);
	}
	.line-rendered :global(.md-checked .md-checkbox-box) {
		background: var(--primary, #7c6cfc);
		border-color: var(--primary, #7c6cfc);
		color: white;
	}
	.line-rendered :global(.md-checked .md-checkbox-label) {
		text-decoration: line-through;
		color: var(--text-disabled);
	}

	.line-rendered :global(.md-li) {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}
	.line-rendered :global(.md-bullet) {
		color: var(--primary, #7c6cfc);
		font-size: 0.8em;
		flex-shrink: 0;
	}
	.line-rendered :global(.md-num) {
		color: var(--primary, #7c6cfc);
		font-size: 0.85em;
		flex-shrink: 0;
		min-width: 20px;
	}

	.line-rendered :global(.md-code-fence) {
		font-family: monospace;
		font-size: 12px;
		color: var(--text-disabled);
	}
	.line-rendered :global(.md-lang) {
		color: var(--primary, #7c6cfc);
		font-size: 11px;
	}

	.line-rendered :global(code.md-inline-code) {
		background: var(--elevated);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 12px;
		font-family: monospace;
		color: var(--text-primary);
	}

	.line-rendered :global(a.md-link) {
		color: var(--primary, #7c6cfc);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.line-rendered :global(mark.md-mark) {
		background: color-mix(in srgb, #f5c518 35%, transparent);
		border-radius: 2px;
		padding: 0 2px;
		color: inherit;
	}

	.line-rendered :global(.md-empty) { display: block; }

	.code-line {
		font-family: monospace;
		font-size: 13px;
		color: var(--text-secondary);
		background: var(--elevated, rgba(0,0,0,0.05));
		padding: 0 8px;
	}

	/* ── Active line: contenteditable + overlay ─────────────── */
	.active-input {
		display: block;
		width: 100%;
		font-size: 14px;
		line-height: 1.65;
		outline: none;
		color: transparent; /* hidden — overlay paints the colored version */
		caret-color: var(--text-primary);
		white-space: pre-wrap;
		word-break: break-word;
		font-family: var(--font);
		position: relative;
		z-index: 2;
	}

	.active-input:empty::before {
		content: attr(data-placeholder);
		color: var(--text-disabled);
		pointer-events: none;
	}

	/* Syntax overlay: mirrors active-input exactly, pointer-events:none */
	.syn-overlay {
		position: absolute;
		top: 0;
		left: 2px;
		right: 2px;
		font-size: 14px;
		line-height: 1.65;
		white-space: pre-wrap;
		word-break: break-word;
		pointer-events: none;
		font-family: var(--font);
		color: var(--text-primary);
		z-index: 1;
	}

	/* Syntax token colors */
	.syn-overlay :global(.syn-heading-marker) { color: var(--primary, #7c6cfc); font-weight: 700; }
	.syn-overlay :global(.syn-blockquote-marker) { color: var(--primary, #7c6cfc); }
	.syn-overlay :global(.syn-hr) { color: var(--text-disabled); }
	.syn-overlay :global(.syn-mark) { color: var(--text-disabled); }
	.syn-overlay :global(.syn-list-marker) { color: var(--primary, #7c6cfc); }
	.syn-overlay :global(.syn-code-fence) { color: var(--text-disabled); font-family: monospace; }
	.syn-overlay :global(.syn-lang) { color: var(--primary, #7c6cfc); font-family: monospace; }
	.syn-overlay :global(.syn-inline-code) { background: var(--elevated); border-radius: 3px; padding: 0 3px; font-family: monospace; }
	.syn-overlay :global(.syn-url) { color: color-mix(in srgb, var(--primary, #7c6cfc) 70%, var(--text-disabled)); text-decoration: underline; }
	.syn-overlay :global(.syn-checkbox-mark) { color: var(--primary, #7c6cfc); }
</style>
import katex from 'katex';

/**
 * Extract $$...$$ (block) and $...$ (inline) LaTeX before HTML escaping,
 * replace with unique placeholders, return the rendered HTML and the map.
 */
function extractLatex(md: string): {
	text: string;
	blockRendered: string[];
	inlineRendered: string[];
} {
	const blockRendered: string[] = [];
	const inlineRendered: string[] = [];

	// Block LaTeX: $$...$$ — surround with \n\n so it becomes its own paragraph
	let text = md.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
		const i = blockRendered.length;
		blockRendered.push(
			katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })
		);
		return `\n\n\x02B${i}\x03\n\n`;
	});

	// Inline LaTeX: $...$ (no newlines inside)
	text = text.replace(/\$([^\n$]+?)\$/g, (_, expr) => {
		const i = inlineRendered.length;
		inlineRendered.push(
			katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })
		);
		return `\x02I${i}\x03`;
	});

	return { text, blockRendered, inlineRendered };
}

/**
 * Lightweight markdown renderer with LaTeX support via KaTeX.
 * Block LaTeX:  $$...$$ — rendered centered on its own line
 * Inline LaTeX: $...$  — rendered inline
 */
export function renderMarkdown(md: string): string {
	if (!md) return '';

	const { text: mdClean, blockRendered, inlineRendered } = extractLatex(md);

	let html = mdClean
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	// Code blocks (``` ... ```)
	html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);

	// Inline code
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

	// Headings
	html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
	html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
	html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
	html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
	html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
	html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

	// Horizontal rule
	html = html.replace(/^---$/gm, '<hr />');

	// Blockquote
	html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

	// Bold + italic
	html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
	html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

	// Strikethrough
	html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

	// Highlight
	html = html.replace(/==(.+?)==/g, '<mark>$1</mark>');

	// Links
	html = html.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		'<a href="$2" target="_blank" rel="noopener">$1</a>'
	);

	// Unordered list
	html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
	html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

	// Ordered list
	html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

	// Paragraphs (double newlines)
	html = html.replace(/\n\n+/g, '</p><p>');
	html = `<p>${html}</p>`;

	// Single newlines → <br>
	html = html.replace(/(?<!>)\n(?!<)/g, '<br />');

	// Clean up empty paragraphs and block-level elements wrapped in <p>
	html = html.replace(/<p><\/p>/g, '');
	html = html.replace(/<p>(<h[1-6]>)/g, '$1');
	html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
	html = html.replace(/<p>(<ul>)/g, '$1');
	html = html.replace(/(<\/ul>)<\/p>/g, '$1');
	html = html.replace(/<p>(<pre>)/g, '$1');
	html = html.replace(/(<\/pre>)<\/p>/g, '$1');
	html = html.replace(/<p>(<hr \/>)<\/p>/g, '$1');
	html = html.replace(/<p>(<blockquote>)/g, '$1');
	html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

	// Restore block LaTeX — replace <p>\x02Bn\x03</p> with centered div
	html = html.replace(/<p>\x02B(\d+)\x03<\/p>/g, (_, i) =>
		`<div class="katex-block">${blockRendered[parseInt(i)]}</div>`
	);

	// Restore inline LaTeX
	html = html.replace(/\x02I(\d+)\x03/g, (_, i) =>
		`<span class="katex-inline">${inlineRendered[parseInt(i)]}</span>`
	);

	return html;
}

export function formatDate(ts: number): string {
	return new Date(ts).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

export function formatDateTime(ts: number): string {
	return new Date(ts).toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatSeconds(s: number): string {
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

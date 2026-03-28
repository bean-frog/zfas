/**
 * Very lightweight markdown renderer — no deps.
 * Supports: headings, bold, italic, code blocks, inline code,
 * blockquotes, unordered/ordered lists, horizontal rules, links.
 */
export function renderMarkdown(md: string): string {
	if (!md) return '';

	let html = md
		// Escape HTML
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

	// Links
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

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

	// Clean up empty paragraphs
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

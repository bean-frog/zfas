<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/flashcards', label: 'Flashcards' },
		{ href: '/notes', label: 'Notes' },
		{ href: '/timer', label: 'Timer' },
		{ href: '/reader', label: 'Reader' },
		{ href: '/settings', label: 'Settings' }
	];
</script>

<nav class="sidebar">
	<ul class="nav-list">
		{#each navItems as item}
			<li>
				<a
					href={item.href}
					class="nav-link"
					class:active={$page.url.pathname === item.href}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>

	<div class="sidebar-footer">
		<a
			href="https://github.com/bean-frog/zfas"
			target="_blank"
			rel="noopener"
			class="footer-link"
		>
			GitHub
		</a>
	</div>
</nav>

<style>
	.sidebar {
		width: var(--sidebar-width);
		background: var(--surface);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		overflow-y: auto;
	}

	.nav-list {
		list-style: none;
		padding: 12px 0;
		flex: 1;
	}

	.nav-link {
		display: block;
		padding: 8px 16px;
		font-size: 13px;
		color: var(--text-secondary);
		text-decoration: none;
		border-left: 2px solid transparent;
	}

	.nav-link:hover {
		color: var(--text-primary);
		background: var(--elevated);
	}

	.nav-link.active {
		color: var(--text-primary);
		border-left-color: var(--primary);
		background: var(--elevated);
	}

	.sidebar-footer {
		padding: 12px 16px;
		border-top: 1px solid var(--border);
	}

	.footer-link {
		font-size: 11px;
		color: var(--text-disabled);
		text-decoration: none;
	}

	.footer-link:hover {
		color: var(--text-secondary);
	}
</style>

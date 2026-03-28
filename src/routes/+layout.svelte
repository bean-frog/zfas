<script lang="ts">
	import '../app.css';
	import 'katex/dist/katex.min.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import MainLayout from '$lib/components/layout/MainLayout.svelte';
	import { settingsStore, hasVisited, markVisited } from '$lib/stores/settingsStore';

	$: if (browser) {
		document.documentElement.style.setProperty('--primary', $settingsStore.primaryColor);
		document.documentElement.style.setProperty('--font', $settingsStore.font);
	}

	let embed = false;
	let showOnboarding = false;

	$: embed = $page.url.searchParams.get('embed') === 'true';

	onMount(() => {
		if (!hasVisited()) {
			showOnboarding = true;
		}
	});

	function dismissOnboarding() {
		markVisited();
		showOnboarding = false;
	}
</script>

{#if showOnboarding}
	<div class="onboarding-overlay">
		<div class="onboarding">
			<div class="onboarding-header">
				<span class="brand">ZFAS</span>
				<span class="tagline">Zero Frills Academic Suite</span>
			</div>
			<div class="onboarding-body">
				<p>Plain, simple tools that just work. No tracking, no subscriptions, no paywalls.</p>
				<p>
					Inspired by the <a href="https://suckless.org" target="_blank" rel="noopener">suckless philosophy</a> — 
					software should be small, fast, and reliable.
				</p>
				<p>Built by students, for students.</p>
				<div class="onboarding-tools">
					<div class="tool-item"><span class="tool-name">Flashcards</span><span class="tool-desc">Create sets, study, and play review games</span></div>
					<div class="tool-item"><span class="tool-name">Notes</span><span class="tool-desc">Markdown notes, saved locally</span></div>
					<div class="tool-item"><span class="tool-name">Timer</span><span class="tool-desc">Pomodoro and custom study timers</span></div>
					<div class="tool-item"><span class="tool-name">Dashboard</span><span class="tool-desc">Canvas grades and assignments</span></div>
				</div>
				<div class="onboarding-cta">
					<p class="cta-text">If you find ZFAS useful, please star the repo and consider contributing. Pull requests welcome.</p>
					<a href="https://github.com/bean-frog/zfas" target="_blank" rel="noopener" class="github-link">Star on GitHub</a>
				</div>
			</div>
			<div class="onboarding-footer">
				<button class="start-btn" on:click={dismissOnboarding}>Get Started</button>
			</div>
		</div>
	</div>
{/if}

<MainLayout {embed}>
	<slot />
</MainLayout>

<style>
	.onboarding-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 16px;
	}
	.onboarding {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		width: 100%;
		max-width: 480px;
		overflow: hidden;
	}
	.onboarding-header {
		padding: 24px 24px 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.brand {
		font-size: 22px;
		font-weight: 700;
		color: var(--primary);
		letter-spacing: 2px;
	}
	.tagline {
		font-size: 11px;
		color: var(--text-disabled);
		letter-spacing: 1px;
		text-transform: uppercase;
	}
	.onboarding-body {
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.onboarding-body p {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.6;
	}
	.onboarding-body a { color: var(--primary); }
	.onboarding-tools {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		margin: 4px 0;
	}
	.tool-item {
		display: flex;
		align-items: baseline;
		gap: 12px;
		padding: 8px 12px;
		border-bottom: 1px solid var(--border);
	}
	.tool-item:last-child { border-bottom: none; }
	.tool-name {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-primary);
		min-width: 80px;
	}
	.tool-desc { font-size: 11px; color: var(--text-secondary); }
	.onboarding-cta {
		border-top: 1px solid var(--border);
		padding-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.cta-text { font-size: 12px !important; color: var(--text-disabled) !important; }
	.github-link { font-size: 12px; color: var(--primary); text-decoration: none; }
	.github-link:hover { text-decoration: underline; }
	.onboarding-footer {
		padding: 16px 24px;
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: flex-end;
	}
	.start-btn {
		padding: 8px 20px;
		font-size: 13px;
		font-family: var(--font);
		font-weight: 600;
		background: var(--primary);
		color: #fff;
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
	}
	.start-btn:hover { background: var(--primary-hover); }
</style>

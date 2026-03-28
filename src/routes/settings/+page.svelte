<script lang="ts">
	import { settingsStore } from '$lib/stores/settingsStore';
	import { canvasStore } from '$lib/stores/canvasStore';
	import Button from '$lib/components/common/Button.svelte';
	import Input from '$lib/components/common/Input.svelte';

	let settings = { ...$settingsStore };
	let saved = false;
	let canvasLoading = false;
	let canvasError = '';
	let canvasSuccess = false;

	function save() {
		settingsStore.set(settings);
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	async function testCanvas() {
		canvasLoading = true;
		canvasError = '';
		canvasSuccess = false;
		settingsStore.set(settings);
		await canvasStore.fetch(settings.canvasBaseUrl, settings.canvasApiKey);
		const state = $canvasStore;
		canvasLoading = false;
		if (state.error) {
			canvasError = state.error;
		} else {
			canvasSuccess = true;
		}
	}

	const fonts = ['JetBrains Mono', 'Courier New', 'monospace', "Oxygen", "system-default"];
	const colors = [
		{ label: 'Forest', value: '#155f45' },
		{ label: 'Ocean', value: '#1a5276' },
		{ label: 'Plum', value: '#6c3483' },
		{ label: 'Rust', value: '#7b3f00' },
		{ label: 'Slate', value: '#2e4057' }
	];

	$: document.documentElement.style.setProperty('--primary', settings.primaryColor);
</script>

<div class="settings-page">
	<h1>Settings</h1>

	<section class="section">
		<h2 class="section-title">Appearance</h2>

		<div class="field-group">
			<div class="field">
				<label class="field-label" for="setting-font">Font</label>
				<select id="setting-font" class="field-select" bind:value={settings.font}>
					{#each fonts as f}
						<option value={f}>{f}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<span class="field-label">Accent Color</span>
				<div class="color-options">
					{#each colors as c}
						<button
							class="color-swatch"
							class:selected={settings.primaryColor === c.value}
							style="background: {c.value}"
							on:click={() => (settings.primaryColor = c.value)}
							title={c.label}
							aria-label={c.label}
						></button>
					{/each}
					<div class="custom-color">
						<input
							type="color"
							bind:value={settings.primaryColor}
							title="Custom color"
							class="color-input"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Canvas LMS</h2>
		<p class="section-desc">
			Connect your Canvas account to see grades and assignments on the dashboard.
			Your API key is stored locally only.
		</p>

		<div class="field-group">
			<div class="field">
				<label class="field-label" for="canvas-url">Canvas URL</label>
				<input
					class="field-input"
					bind:value={settings.canvasBaseUrl}
					placeholder="https://yourschool.instructure.com"
					type="url"
				/>
				<span class="field-hint">Your institution's Canvas domain.</span>
			</div>

			<div class="field">
				<label class="field-label" for="canvas-key">API Key</label>
				<input
					class="field-input"
					bind:value={settings.canvasApiKey}
					placeholder="API token..."
					type="password"
				/>
				<span class="field-hint">
					Generate at: Canvas → Account → Settings → Approved Integrations → New Access Token.
				</span>
			</div>

			<div class="canvas-actions">
				<Button variant="secondary" on:click={testCanvas} disabled={canvasLoading || !settings.canvasApiKey || !settings.canvasBaseUrl}>
					{canvasLoading ? 'Connecting...' : 'Test Connection'}
				</Button>
				{#if canvasSuccess}
					<span class="success-msg">Connected — {$canvasStore.courses.length} courses loaded.</span>
				{/if}
				{#if canvasError}
					<span class="error-msg">{canvasError}</span>
				{/if}
			</div>
		</div>
	</section>

	<section class="section">
		<h2 class="section-title">Data</h2>
		<p class="section-desc">
			All ZFAS data is stored in your browser's localStorage. Nothing is sent to any server.
		</p>
		<div class="data-actions">
			<Button
				variant="danger"
				size="sm"
				on:click={() => {
					if (confirm('Clear ALL ZFAS data? This cannot be undone.')) {
						localStorage.clear();
						window.location.reload();
					}
				}}
			>
				Clear All Data
			</Button>
		</div>
	</section>

	<div class="save-row">
		<Button variant="primary" on:click={save}>
			{saved ? 'Saved!' : 'Save Settings'}
		</Button>
	</div>

	<section class="section">
		<h2 class="section-title">About</h2>
		<div class="about-text">
			<p>ZFAS — Zero Frills Academic Suite</p>
			<p>
				Built by students, for students. Free, open source, no tracking.
				Inspired by <a href="https://suckless.org" target="_blank" rel="noopener">suckless.org</a>.
			</p>
			<p>
				<a href="https://github.com" target="_blank" rel="noopener">View on GitHub</a>
				· Contributions welcome · Submit a pull request
			</p>
		</div>
	</section>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		max-width: 560px;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.section-title {
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--text-disabled);
		padding-bottom: 10px;
		border-bottom: 1px solid var(--border);
	}

	.section-desc {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-label {
		font-size: 12px;
		color: var(--text-secondary);
		letter-spacing: 0.3px;
	}

	.field-hint {
		font-size: 11px;
		color: var(--text-disabled);
		line-height: 1.5;
	}

	.field-select, .field-input {
		padding: 7px 10px;
		font-size: 13px;
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text-primary);
		font-family: var(--font);
	}

	.field-select:focus, .field-input:focus {
		border-color: var(--primary);
		outline: none;
	}

	.color-options {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}

	.color-swatch {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		flex-shrink: 0;
	}

	.color-swatch.selected {
		border-color: var(--text-primary);
	}

	.color-swatch:hover {
		opacity: 0.85;
	}

	.custom-color {
		position: relative;
		width: 28px;
		height: 28px;
	}

	.color-input {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--border);
		padding: 0;
		cursor: pointer;
		background: transparent;
	}

	.canvas-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.success-msg {
		font-size: 12px;
		color: var(--primary);
	}

	.error-msg {
		font-size: 12px;
		color: var(--error);
	}

	.data-actions {
		display: flex;
		gap: 10px;
	}

	.save-row {
		display: flex;
	}

	.about-text {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.about-text p {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.about-text a {
		color: var(--primary);
		text-decoration: none;
	}

	.about-text a:hover {
		text-decoration: underline;
	}
</style>

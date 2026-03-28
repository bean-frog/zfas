<script lang="ts">
	import { timerStore } from '$lib/stores/timerStore';
	import Modal from '../common/Modal.svelte';
	import Button from '../common/Button.svelte';

	$: state = $timerStore;

	let showAddModal = false;
	let newName = '';
	let newWork = 25;
	let newBreak = 5;
	let formError = '';

	function select(id: string) {
		timerStore.selectPreset(id);
	}

	function openAdd() {
		newName = '';
		newWork = 25;
		newBreak = 5;
		formError = '';
		showAddModal = true;
	}

	function addPreset() {
		if (!newName.trim()) { formError = 'Name required.'; return; }
		if (newWork < 1) { formError = 'Work duration must be at least 1 minute.'; return; }
		if (newBreak < 1) { formError = 'Break duration must be at least 1 minute.'; return; }
		timerStore.addPreset({
			name: newName.trim(),
			workDuration: newWork * 60,
			breakDuration: newBreak * 60
		});
		showAddModal = false;
	}

	function deletePreset(id: string) {
		timerStore.deletePreset(id);
	}

	function fmtMin(secs: number) {
		return Math.round(secs / 60) + 'm';
	}
</script>

<div class="settings">
	<div class="settings-header">
		<span class="label">Presets</span>
		<button class="add-btn" on:click={openAdd}>+ Add</button>
	</div>

	<div class="presets">
		{#each state.presets as preset (preset.id)}
			<div
				class="preset-row"
				class:active={state.activePresetId === preset.id}
			>
				<button
					class="preset-select"
					on:click={() => select(preset.id)}
				>
					<span class="preset-name">{preset.name}</span>
					<span class="preset-meta">
						{fmtMin(preset.workDuration)} work · {fmtMin(preset.breakDuration)} break
					</span>
				</button>
				{#if state.presets.length > 1}
					<button
						class="preset-delete"
						on:click={() => deletePreset(preset.id)}
						aria-label="Delete preset"
					>✕</button>
				{/if}
			</div>
		{/each}
	</div>
</div>

<Modal title="Add Timer Preset" open={showAddModal} on:close={() => (showAddModal = false)}>
	<div class="modal-form">
		<div class="form-field">
			<label class="form-label">Name</label>
			<input class="form-input" bind:value={newName} placeholder="e.g. Deep Work" />
		</div>
		<div class="form-row">
			<div class="form-field">
				<label class="form-label">Work (minutes)</label>
				<input class="form-input" type="number" bind:value={newWork} min="1" max="180" />
			</div>
			<div class="form-field">
				<label class="form-label">Break (minutes)</label>
				<input class="form-input" type="number" bind:value={newBreak} min="1" max="60" />
			</div>
		</div>
		{#if formError}
			<span class="form-error">{formError}</span>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={() => (showAddModal = false)}>Cancel</Button>
		<Button variant="primary" on:click={addPreset}>Add Preset</Button>
	</svelte:fragment>
</Modal>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		max-width: 320px;
	}

	.settings-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.label {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--text-disabled);
		font-weight: 600;
	}

	.add-btn {
		font-size: 12px;
		font-family: var(--font);
		color: var(--primary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.add-btn:hover { text-decoration: underline; }

	.presets {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.preset-row {
		display: flex;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.preset-row.active {
		border-color: var(--primary);
	}

	.preset-select {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 9px 12px;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		font-family: var(--font);
	}

	.preset-select:hover {
		background: var(--elevated);
	}

	.preset-row.active .preset-select {
		background: rgba(21, 95, 69, 0.08);
	}

	.preset-name {
		font-size: 13px;
		color: var(--text-primary);
		font-weight: 500;
	}

	.preset-meta {
		font-size: 11px;
		color: var(--text-disabled);
	}

	.preset-delete {
		font-size: 10px;
		padding: 0 10px;
		height: 100%;
		background: none;
		border: none;
		border-left: 1px solid var(--border);
		color: var(--text-disabled);
		cursor: pointer;
		font-family: var(--font);
	}

	.preset-delete:hover {
		color: var(--error);
		background: rgba(207, 102, 121, 0.08);
	}

	/* Modal form */
	.modal-form { display: flex; flex-direction: column; gap: 12px; }
	.form-field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.form-row { display: flex; gap: 12px; }
	.form-label { font-size: 11px; color: var(--text-secondary); }
	.form-input { width: 100%; padding: 7px 10px; font-size: 13px; }
	.form-error { font-size: 12px; color: var(--error); }
</style>

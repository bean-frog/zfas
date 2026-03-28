<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { flashcardStore, type FlashcardSet, type Flashcard } from '$lib/stores/flashcardStore';
	import { compressImage } from '$lib/utils/imageCompression';
	import Button from '../common/Button.svelte';
	import Modal from '../common/Modal.svelte';

	export let set: FlashcardSet;

	const dispatch = createEventDispatcher();

	let setName = set.name;
	let editingCard: Flashcard | null = null;
	let showCardModal = false;
	let cardFront = '';
	let cardBack = '';
	let cardLatex = '';
	let cardImage = '';
	let imageError = '';

	function saveSetName() {
		if (setName.trim()) {
			flashcardStore.updateSet(set.id, { name: setName.trim() });
		}
	}

	function openNewCard() {
		editingCard = null;
		cardFront = '';
		cardBack = '';
		cardLatex = '';
		cardImage = '';
		imageError = '';
		showCardModal = true;
	}

	function openEditCard(card: Flashcard) {
		editingCard = card;
		cardFront = card.front;
		cardBack = card.back;
		cardLatex = card.latex ?? '';
		cardImage = card.image ?? '';
		imageError = '';
		showCardModal = true;
	}

	function saveCard() {
		if (!cardFront.trim() || !cardBack.trim()) return;
		const data = {
			front: cardFront.trim(),
			back: cardBack.trim(),
			...(cardLatex.trim() ? { latex: cardLatex.trim() } : {}),
			...(cardImage ? { image: cardImage } : {})
		};
		if (editingCard) {
			flashcardStore.updateCard(set.id, editingCard.id, data);
		} else {
			flashcardStore.addCard(set.id, data);
		}
		showCardModal = false;
	}

	function deleteCard(cardId: string) {
		if (confirm('Delete this card?')) {
			flashcardStore.deleteCard(set.id, cardId);
		}
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		imageError = '';
		try {
			cardImage = await compressImage(file);
		} catch {
			imageError = 'Failed to process image.';
		}
	}

	function removeImage() {
		cardImage = '';
	}
</script>

<div class="editor">
	<div class="editor-header">
		<button class="back-btn" on:click={() => dispatch('back')}>← Back</button>
		<div class="name-row">
			<input
				class="set-name-input"
				bind:value={setName}
				on:blur={saveSetName}
				on:keydown={(e) => e.key === 'Enter' && saveSetName()}
				placeholder="Set name..."
			/>
		</div>
		<Button variant="primary" size="sm" on:click={openNewCard}>+ Add Card</Button>
	</div>

	<div class="cards-count">
		{set.cards.length} card{set.cards.length !== 1 ? 's' : ''}
	</div>

	{#if set.cards.length === 0}
		<div class="empty-state">
			<p>No cards yet. Add your first card to get started.</p>
		</div>
	{:else}
		<div class="cards-list">
			{#each set.cards as card, i}
				<div class="card-row">
					<span class="card-num">{i + 1}</span>
					<div class="card-preview">
						<div class="card-side">
							{#if card.image}
								<img src={card.image} alt="" class="card-thumb" />
							{/if}
							<span class="card-text">{card.front}</span>
						</div>
						<span class="card-divider">→</span>
						<div class="card-side">
							<span class="card-text">{card.back}</span>
						</div>
					</div>
					<div class="card-actions">
						<button class="action-btn" on:click={() => openEditCard(card)}>Edit</button>
						<button class="action-btn danger" on:click={() => deleteCard(card.id)}>Del</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal
	title={editingCard ? 'Edit Card' : 'Add Card'}
	open={showCardModal}
	on:close={() => (showCardModal = false)}
>
	<div class="modal-form">
		<div class="form-field">
			<label class="form-label" for="card-front">Front</label>
			<textarea
				class="form-textarea"
				bind:value={cardFront}
				placeholder="Question or term..."
				rows="3"
			></textarea>
		</div>

		<div class="form-field">
			<label class="form-label" for="card-back">Back</label>
			<textarea
				class="form-textarea"
				bind:value={cardBack}
				placeholder="Answer or definition..."
				rows="3"
			></textarea>
		</div>

		<div class="form-field">
			<label class="form-label" for="card-latex">LaTeX (optional)</label>
			<input id="card-latex" class="form-input" bind:value={cardLatex} placeholder="e.g. E = mc^2" />
		</div>

		<div class="form-field">
			<label class="form-label" for="card-image">Image (optional)</label>
			{#if cardImage}
				<div class="image-preview-row">
					<img src={cardImage} alt="preview" class="image-preview" />
					<button class="remove-image" on:click={removeImage}>Remove</button>
				</div>
			{:else}
				<input type="file" accept="image/*" on:change={handleImageUpload} class="file-input" />
			{/if}
			{#if imageError}
				<span class="field-error">{imageError}</span>
			{/if}
		</div>
	</div>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={() => (showCardModal = false)}>Cancel</Button>
		<Button variant="primary" on:click={saveCard} disabled={!cardFront.trim() || !cardBack.trim()}>
			{editingCard ? 'Save' : 'Add'}
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.editor-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.back-btn {
		font-size: 12px;
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 0;
		font-family: var(--font);
		white-space: nowrap;
	}

	.back-btn:hover { color: var(--text-primary); }

	.name-row {
		flex: 1;
	}

	.set-name-input {
		width: 100%;
		font-size: 16px;
		font-weight: 600;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border);
		border-radius: 0;
		padding: 4px 0;
		color: var(--text-primary);
	}

	.set-name-input:focus {
		border-bottom-color: var(--primary);
		outline: none;
	}

	.cards-count {
		font-size: 12px;
		color: var(--text-disabled);
	}

	.empty-state {
		padding: 40px 0;
		text-align: center;
	}

	.cards-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.card-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.card-num {
		font-size: 11px;
		color: var(--text-disabled);
		min-width: 20px;
		text-align: right;
	}

	.card-preview {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10px;
		overflow: hidden;
	}

	.card-side {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		overflow: hidden;
	}

	.card-thumb {
		width: 28px;
		height: 28px;
		object-fit: cover;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.card-text {
		font-size: 13px;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-divider {
		font-size: 11px;
		color: var(--text-disabled);
		flex-shrink: 0;
	}

	.card-actions {
		display: flex;
		gap: 6px;
		flex-shrink: 0;
	}

	.action-btn {
		font-size: 11px;
		padding: 3px 8px;
		font-family: var(--font);
		background: var(--elevated);
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.action-btn:hover { color: var(--text-primary); }
	.action-btn.danger:hover { color: var(--error); border-color: var(--error); }

	/* Modal form */
	.modal-form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.form-label {
		font-size: 11px;
		color: var(--text-secondary);
		letter-spacing: 0.3px;
	}

	.form-textarea, .form-input {
		width: 100%;
		padding: 7px 10px;
		font-size: 13px;
		resize: vertical;
	}

	.form-textarea { min-height: 70px; }

	.image-preview-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.image-preview {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: var(--radius);
		border: 1px solid var(--border);
	}

	.remove-image {
		font-size: 12px;
		color: var(--error);
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font);
		padding: 0;
	}

	.file-input {
		font-size: 12px;
		color: var(--text-secondary);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.field-error {
		font-size: 11px;
		color: var(--error);
	}
</style>

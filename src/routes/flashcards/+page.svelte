<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import FlashcardSetList from '$lib/components/flashcards/FlashcardSetList.svelte';
	import FlashcardEditor from '$lib/components/flashcards/FlashcardEditor.svelte';
	import StudyView from '$lib/components/flashcards/StudyView.svelte';
	import MatchingGame from '$lib/components/flashcards/MatchingGame.svelte';
	import QuizView from '$lib/components/flashcards/QuizView.svelte';
	import { flashcardStore, type FlashcardSet } from '$lib/stores/flashcardStore';

	type View = 'list' | 'edit' | 'study' | 'match' | 'quiz';

	let view: View = 'list';
	let activeSet: FlashcardSet | null = null;

	// Support ?set=id for deep-linking from search
	$: {
		const setId = $page.url.searchParams.get('set');
		if (setId && view === 'list') {
			const found = $flashcardStore.find((s) => s.id === setId);
			if (found) {
				activeSet = found;
				view = 'study';
			}
		}
	}

	function goList() {
		view = 'list';
		activeSet = null;
		goto('/flashcards', { replaceState: true });
	}

	function handleEdit(e: CustomEvent<{ set: FlashcardSet }>) {
		activeSet = e.detail.set;
		view = 'edit';
	}

	function handleStudy(e: CustomEvent<{ set: FlashcardSet }>) {
		activeSet = e.detail.set;
		view = 'study';
	}

	function handleMatch(e: CustomEvent<{ set: FlashcardSet }>) {
		if (e.detail.set.cards.length < 2) {
			alert('Need at least 2 cards to play matching.');
			return;
		}
		activeSet = e.detail.set;
		view = 'match';
	}

	function handleQuiz(e: CustomEvent<{ set: FlashcardSet }>) {
		if (e.detail.set.cards.length === 0) {
			alert('Add some cards before starting a quiz.');
			return;
		}
		activeSet = e.detail.set;
		view = 'quiz';
	}

	// Keep activeSet reactive to store updates (e.g. after editing cards)
	$: if (activeSet) {
		const updated = $flashcardStore.find((s) => s.id === activeSet!.id);
		if (updated) activeSet = updated;
	}
</script>

{#if view === 'list'}
	<FlashcardSetList
		on:edit={handleEdit}
		on:study={handleStudy}
		on:match={handleMatch}
		on:quiz={handleQuiz}
	/>
{:else if view === 'edit' && activeSet}
	<FlashcardEditor set={activeSet} on:back={goList} />
{:else if view === 'study' && activeSet}
	<StudyView set={activeSet} on:back={goList} />
{:else if view === 'match' && activeSet}
	<MatchingGame set={activeSet} on:back={goList} />
{:else if view === 'quiz' && activeSet}
	<QuizView set={activeSet} on:back={goList} />
{/if}

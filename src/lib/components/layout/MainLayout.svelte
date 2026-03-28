<script lang="ts">
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';

	export let embed = false;
</script>

{#if embed}
	<div class="embed-container">
		<slot />
	</div>
{:else}
	<div class="app">
		<Header />
		<div class="body">
			<Sidebar />
			<main class="main">
				<slot />
			</main>
		</div>
	</div>
{/if}

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.main {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.embed-container {
		width: 100%;
		height: 100vh;
		overflow-y: auto;
		padding: 16px;
	}
</style>

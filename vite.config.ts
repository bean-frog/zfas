import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

const gitCommit = (() => {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'unknown';
	}
})();

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__GIT_COMMIT__: JSON.stringify(gitCommit)
	}
});

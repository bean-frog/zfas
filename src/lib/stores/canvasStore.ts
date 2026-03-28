import { writable } from 'svelte/store';

export interface CanvasCourse {
	id: number;
	name: string;
	course_code: string;
	enrollments?: Array<{ computed_current_grade?: string; computed_current_score?: number }>;
}

export interface CanvasAssignment {
	id: number;
	name: string;
	due_at: string | null;
	course_id: number;
	course_name?: string;
	html_url: string;
	submission?: { submitted_at: string | null; score: number | null };
	points_possible: number;
}

export interface CanvasState {
	loading: boolean;
	error: string | null;
	courses: CanvasCourse[];
	assignments: CanvasAssignment[];
	lastFetched: number | null;
}

const initial: CanvasState = {
	loading: false,
	error: null,
	courses: [],
	assignments: [],
	lastFetched: null
};

function createCanvasStore() {
	const { subscribe, set, update } = writable<CanvasState>(initial);

	async function apiFetch(baseUrl: string, apiKey: string, path: string): Promise<unknown> {
		const res = await fetch('/api/canvas', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ baseUrl, apiKey, path })
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.error || `Canvas API error: ${res.status}`);
		return data;
	}

	return {
		subscribe,

		fetch: async (baseUrl: string, apiKey: string) => {
			if (!baseUrl || !apiKey) {
				update((s) => ({ ...s, error: 'Canvas API key and URL are required.' }));
				return;
			}

			update((s) => ({ ...s, loading: true, error: null }));

			try {
				const courses = (await apiFetch(
					baseUrl,
					apiKey,
					'/courses?enrollment_state=active&include[]=total_scores&per_page=50'
				)) as CanvasCourse[];

				const assignmentFetches = courses.map((course) =>
					apiFetch(
						baseUrl,
						apiKey,
						`/courses/${course.id}/assignments?include[]=submission&order_by=due_at&per_page=50`
					).then((a) =>
						(a as CanvasAssignment[]).map((assignment) => ({
							...assignment,
							course_name: course.name
						}))
					)
				);

				const assignmentsByCoure = await Promise.all(assignmentFetches);
				const assignments = assignmentsByCoure.flat();

				update((s) => ({
					...s,
					loading: false,
					courses,
					assignments,
					lastFetched: Date.now()
				}));
			} catch (err) {
				update((s) => ({
					...s,
					loading: false,
					error: err instanceof Error ? err.message : 'Unknown error'
				}));
			}
		},

		clear: () => set(initial)
	};
}

export const canvasStore = createCanvasStore();

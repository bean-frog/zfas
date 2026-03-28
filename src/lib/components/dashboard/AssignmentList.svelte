<script lang="ts">
	import { canvasStore } from '$lib/stores/canvasStore';
	import { formatDateTime } from '$lib/utils/markdownParser';

	export let mode: 'upcoming' | 'overdue' = 'upcoming';

	$: assignments = $canvasStore.assignments;

	$: filtered = (() => {
		const now = Date.now();
		return assignments
			.filter((a) => {
				if (!a.due_at) return false;
				const due = new Date(a.due_at).getTime();
				const submitted = !!a.submission?.submitted_at;
				if (mode === 'overdue') {
					return due < now && !submitted;
				} else {
					return due > now && !submitted;
				}
			})
			.sort((a, b) => {
				const da = new Date(a.due_at!).getTime();
				const db = new Date(b.due_at!).getTime();
				return mode === 'upcoming' ? da - db : db - da;
			})
			.slice(0, 10);
	})();
</script>

<div class="assignment-list">
	<h3 class="panel-title">
		{mode === 'upcoming' ? 'Upcoming' : 'Past Due'}
	</h3>

	{#if filtered.length === 0}
		<p class="empty">
			{$canvasStore.courses.length === 0
				? 'Connect Canvas in Settings to see assignments.'
				: mode === 'overdue'
				? 'No past due assignments.'
				: 'No upcoming assignments.'}
		</p>
	{:else}
		<div class="list">
			{#each filtered as a}
				<a href={a.html_url} target="_blank" rel="noopener" class="assignment-row">
					<div class="assignment-info">
						<span class="assignment-name">{a.name}</span>
						<span class="assignment-course">{a.course_name}</span>
					</div>
					<div class="assignment-meta">
						<span class="due" class:overdue={mode === 'overdue'}>
							{a.due_at ? formatDateTime(new Date(a.due_at).getTime()) : 'No due date'}
						</span>
						{#if a.points_possible}
							<span class="pts">{a.points_possible} pts</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.assignment-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.panel-title {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--text-disabled);
		font-weight: 600;
	}

	.empty {
		font-size: 13px;
		color: var(--text-disabled);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.assignment-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 8px 10px;
		background: var(--elevated);
		border-radius: var(--radius);
		gap: 12px;
		text-decoration: none;
	}

	.assignment-row:hover {
		background: var(--border);
	}

	.assignment-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		overflow: hidden;
	}

	.assignment-name {
		font-size: 13px;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.assignment-course {
		font-size: 11px;
		color: var(--text-disabled);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.assignment-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
		flex-shrink: 0;
	}

	.due {
		font-size: 11px;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.due.overdue {
		color: var(--error);
	}

	.pts {
		font-size: 11px;
		color: var(--text-disabled);
	}
</style>

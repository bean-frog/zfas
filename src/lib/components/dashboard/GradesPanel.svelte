<script lang="ts">
	import { canvasStore } from '$lib/stores/canvasStore';

	$: courses = $canvasStore.courses;
</script>

<div class="grades-panel">
	<h3 class="panel-title">Grades</h3>
	{#if courses.length === 0}
		<p class="empty">No courses loaded.</p>
	{:else}
		<div class="courses">
			{#each courses as course}
				{@const grade = course.enrollments?.[0]?.computed_current_grade}
				{@const score = course.enrollments?.[0]?.computed_current_score}
				<div class="course-row">
					<span class="course-name">{course.name}</span>
					<span class="course-grade" class:no-grade={!grade}>
						{grade ?? '—'}
						{#if score != null}
							<span class="score">({score.toFixed(1)}%)</span>
						{/if}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.grades-panel {
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

	.courses {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.course-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 10px;
		background: var(--elevated);
		border-radius: var(--radius);
		gap: 12px;
	}

	.course-name {
		font-size: 13px;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.course-grade {
		font-size: 13px;
		font-weight: 600;
		color: var(--primary);
		white-space: nowrap;
	}

	.course-grade.no-grade {
		color: var(--text-disabled);
		font-weight: 400;
	}

	.score {
		font-weight: 400;
		color: var(--text-secondary);
		font-size: 11px;
	}
</style>

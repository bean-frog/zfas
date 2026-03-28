import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { baseUrl, apiKey, path } = await request.json();

	const url = `${(baseUrl as string).replace(/\/$/, '')}/api/v1${path}`;

	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${apiKey}` }
	});

	if (!res.ok) {
		return json(
			{ error: `Canvas API error: ${res.status} ${res.statusText}` },
			{ status: res.status }
		);
	}

	return json(await res.json());
};

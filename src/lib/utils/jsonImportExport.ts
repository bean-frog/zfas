export function exportJSON(data: unknown, filename: string): void {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function importJSONFromFile(): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return reject(new Error('No file selected'));
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const data = JSON.parse(e.target?.result as string);
					resolve(data);
				} catch {
					reject(new Error('Invalid JSON file'));
				}
			};
			reader.onerror = () => reject(new Error('Failed to read file'));
			reader.readAsText(file);
		};
		input.click();
	});
}

export function parseJSONString(raw: string): unknown {
	return JSON.parse(raw);
}

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.75;

export function compressImage(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				let { width, height } = img;

				if (width > MAX_WIDTH || height > MAX_HEIGHT) {
					const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
					width = Math.round(width * ratio);
					height = Math.round(height * ratio);
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, 0, 0, width, height);

				const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
				resolve(canvas.toDataURL(type, QUALITY));
			};
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = e.target?.result as string;
		};
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}

export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target?.result as string);
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}

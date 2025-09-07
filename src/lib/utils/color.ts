export const randomLightColorHex = (): string => {
	// Generate a visually pleasing, soft color using HSL and convert to hex.
	// 1. Choose a random hue (0–360) so we get the whole spectrum.
	const h = Math.floor(Math.random() * 360);

	// 2. Limit saturation to the 40-70 % range → avoids over-vivid colours.
	const s = 40 + Math.random() * 30;

	// 3. Keep lightness between 65-80 % for an “easy-on-the-eyes” pastel feel.
	const l = 65 + Math.random() * 15;

	// Convert HSL → RGB using the algorithm from the CSS Color Module.
	const c = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
	const hp = h / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));

	let r = 0,
		g = 0,
		b = 0;
	if (hp >= 0 && hp < 1) {
		r = c;
		g = x;
		b = 0;
	} else if (hp < 2) {
		r = x;
		g = c;
		b = 0;
	} else if (hp < 3) {
		r = 0;
		g = c;
		b = x;
	} else if (hp < 4) {
		r = 0;
		g = x;
		b = c;
	} else if (hp < 5) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	const m = l / 100 - c / 2;
	const toHex = (v: number) =>
		Math.round((v + m) * 255)
			.toString(16)
			.padStart(2, '0');

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Converts a hex colour (e.g. "#ffcc00" or "ffcc00") to an RGB tuple.
export const hexToRgb = (hex: string): [number, number, number] | undefined => {
	// Remove leading # if present
	const cleaned = hex.replace(/^#/, '');
	if (!/^([0-9A-Fa-f]{6})$/.test(cleaned)) return undefined;
	const r = parseInt(cleaned.slice(0, 2), 16);
	const g = parseInt(cleaned.slice(2, 4), 16);
	const b = parseInt(cleaned.slice(4, 6), 16);
	return [r, g, b];
};

// Convert an RGB tuple back into a hex string (e.g. [255, 204, 0] => "#ffcc00")
export const rgbToHex = ([r, g, b]: [number, number, number]): string =>
	`#${[r, g, b]
		.map((v) =>
			Math.max(0, Math.min(255, Math.round(v)))
				.toString(16)
				.padStart(2, '0')
		)
		.join('')}`;

// Average an array of hex colour strings. Returns undefined if no valid colours provided.
export const averageHexColors = (colors: string[]): string | undefined => {
	const rgbs = colors.map(hexToRgb).filter(Boolean) as [number, number, number][];
	if (rgbs.length === 0) return undefined;

	const total = rgbs.reduce(
		(acc, [r, g, b]) => {
			acc[0] += r;
			acc[1] += g;
			acc[2] += b;
			return acc;
		},
		[0, 0, 0] as [number, number, number]
	);

	const avg: [number, number, number] = [
		total[0] / rgbs.length,
		total[1] / rgbs.length,
		total[2] / rgbs.length
	];
	return rgbToHex(avg);
};

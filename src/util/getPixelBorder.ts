// Based on https://github.com/NigelOToole/pixel-borders

const borderSvg = (fill: string) =>
	`<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><path d='M2 2h2v2H2zM4 0h2v2H4zM10 4h2v2h-2zM0 4h2v2H0zM6 0h2v2H6zM8 2h2v2H8zM8 8h2v2H8zM6 10h2v2H6zM0 6h2v2H0zM10 6h2v2h-2zM4 10h2v2H4zM2 8h2v2H2z' fill='${encodeURIComponent(
		fill
	)}'/></svg>`;

export const getPixelBorder = (fill: string) =>
	`url("data:image/svg+xml,${borderSvg(fill)}")`;

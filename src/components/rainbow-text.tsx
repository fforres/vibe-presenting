import type * as React from "react";

interface RainbowTextProps {
	text: string;
	className?: string;
	style?: React.CSSProperties;
}

export function RainbowText({
	text,
	className = "",
	style = {},
}: RainbowTextProps) {
	// Define rainbow colors
	const rainbowColors = [
		"#FF0000", // Red
		"#FF7F00", // Orange
		"#FFFF00", // Yellow
		"#00FF00", // Green
		"#0000FF", // Blue
		"#4B0082", // Indigo
		"#9400D3", // Violet
	];

	// Split text into individual characters
	const characters = text.split("");

	return (
		<span className={className} style={style}>
			{characters.map((char, index) => {
				// For spaces, just render a space without color styling
				if (char === " ") {
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					return <span key={index}> </span>;
				}

				// Use modulo to cycle through colors for longer text
				const colorIndex = index % rainbowColors.length;

				return (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						style={{
							color: rainbowColors[colorIndex],
							textShadow:
								"1px 1px 2px rgba(0, 0, 0, 0.8), 2px 2px 0 rgba(128, 0, 128, 0.5)",
						}}
					>
						{char}
					</span>
				);
			})}
		</span>
	);
}

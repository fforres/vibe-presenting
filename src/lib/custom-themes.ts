import type { SlideThemes } from "./slide-theme";

export const darkTheme: SlideThemes = {
	title: {
		background: {
			gradient: "from-gray-900 to-gray-800",
		},
		text: {
			primary: "text-white",
			secondary: "text-gray-200",
		},
		container: {
			background: "bg-gray-800 bg-opacity-70",
		},
	},
	// Define other slide types...
};

export const corporateTheme: SlideThemes = {
	title: {
		background: {
			gradient: "from-blue-900 to-blue-800",
		},
		text: {
			primary: "text-white",
			secondary: "text-blue-100",
		},
		container: {
			background: "bg-blue-800 bg-opacity-70",
		},
	},
	// Define other slide types...
};

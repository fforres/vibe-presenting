export type SlideTheme = {
	background: {
		gradient: string;
		overlay?: string;
	};
	text: {
		primary: string;
		secondary: string;
	};
	container: {
		background: string;
	};
	dark?: {
		background: {
			gradient: string;
			overlay?: string;
		};
		text: {
			primary: string;
			secondary: string;
		};
		container: {
			background: string;
		};
	};
};

export type SlideThemes = {
	title: SlideTheme;
	oneColumn: SlideTheme;
	twoColumns: SlideTheme;
	twoColumnsImage: SlideTheme;
	bigImage: SlideTheme;
	// Add more as needed
};

export const defaultTheme: SlideThemes = {
	title: {
		background: {
			gradient: "from-blue-50 to-indigo-100",
		},
		text: {
			primary: "text-indigo-900",
			secondary: "text-indigo-700",
		},
		container: {
			background: "bg-white bg-opacity-70",
		},
		dark: {
			background: {
				gradient: "from-indigo-950 to-blue-900",
			},
			text: {
				primary: "text-indigo-100",
				secondary: "text-indigo-300",
			},
			container: {
				background: "bg-black bg-opacity-50",
			},
		},
	},
	oneColumn: {
		background: {
			gradient: "from-slate-50 to-slate-100",
		},
		text: {
			primary: "text-slate-800",
			secondary: "text-slate-700",
		},
		container: {
			background: "bg-white bg-opacity-70",
		},
		dark: {
			background: {
				gradient: "from-slate-950 to-slate-900",
			},
			text: {
				primary: "text-slate-100",
				secondary: "text-slate-300",
			},
			container: {
				background: "bg-black bg-opacity-50",
			},
		},
	},
	twoColumns: {
		background: {
			gradient: "from-emerald-50 to-teal-100",
		},
		text: {
			primary: "text-emerald-900",
			secondary: "text-emerald-800",
		},
		container: {
			background: "bg-white bg-opacity-70",
		},
		dark: {
			background: {
				gradient: "from-emerald-950 to-teal-900",
			},
			text: {
				primary: "text-emerald-100",
				secondary: "text-emerald-300",
			},
			container: {
				background: "bg-black bg-opacity-50",
			},
		},
	},
	twoColumnsImage: {
		background: {
			gradient: "from-amber-50 to-orange-100",
		},
		text: {
			primary: "text-amber-900",
			secondary: "text-amber-800",
		},
		container: {
			background: "bg-white bg-opacity-70",
		},
		dark: {
			background: {
				gradient: "from-amber-950 to-orange-900",
			},
			text: {
				primary: "text-amber-100",
				secondary: "text-amber-300",
			},
			container: {
				background: "bg-black bg-opacity-50",
			},
		},
	},
	bigImage: {
		background: {
			gradient: "from-purple-50 to-pink-100",
		},
		text: {
			primary: "text-purple-900",
			secondary: "text-purple-800",
		},
		container: {
			background: "bg-white bg-opacity-80",
		},
		dark: {
			background: {
				gradient: "from-purple-950 to-pink-900",
			},
			text: {
				primary: "text-purple-100",
				secondary: "text-purple-300",
			},
			container: {
				background: "bg-black bg-opacity-50",
			},
		},
	},
};

import type { PresentationAgentState } from "@/agents/presentations-agent";
import type {
	BackgroundImageWithTextSlideSchema,
	BigImageWithCaptionSlideSchema,
	FullSizeImageSlideSchema,
	OneTextColumnSlideSchema,
	SinglePresentationAgentState,
	TitleSlideSchema,
	TwoColumnsWithImageSlideSchema,
	TwoTextColumnsSlideSchema,
} from "@/agents/single-presentation-message-schema";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { cn } from "@/lib/utils";
import { LightbulbIcon, SparklesIcon } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePresentationKeyboardNavigation } from "@/hooks/use-presentation-keyboard-navigation";
import { Textarea } from "@/components/ui/textarea";
import { ScalableContainer } from "@/components/scalable-container";
import { defaultTheme } from "@/lib/slide-theme";
import type { SlideTheme, SlideThemes } from "@/lib/slide-theme";
import { useTheme } from "@/features/theme-provider";
import { CollaborationSheet } from "@/components/agent-mode/collaboration-sheet";

const remarkPlugins = [remarkGfm];

const Markdown = ({ content }: { content: string }) => {
	return (
		<ReactMarkdown
			remarkPlugins={remarkPlugins}
			components={{
				table: ({ children }) => {
					return (
						<div className="overflow-x-auto">
							<table className="min-w-full border-collapse">{children}</table>
						</div>
					);
				},
				th: ({ children }) => (
					<th className="border border-gray-300 px-4 py-2 bg-gray-100 font-bold">
						{children}
					</th>
				),
				td: ({ children }) => (
					<td className="border border-gray-300 px-4 py-2">{children}</td>
				),
				img: ({ src, alt }) => (
					<img
						src={src}
						alt={alt || ""}
						className="max-w-full h-auto object-contain"
					/>
				),
			}}
		>
			{content}
		</ReactMarkdown>
	);
};

const SpeakerNotesSheet = ({ notes }: { notes?: string }) => {
	return (
		<Sheet>
			<SheetTrigger className=" z-30 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all border shadow-2xl">
				<LightbulbIcon className="h-5 w-5 text-gray-700" />
			</SheetTrigger>
			<SheetContent side="right">
				<div className="p-4">
					<h3 className="text-lg font-semibold mb-4">Speaker Notes</h3>
					<div className="prose prose-lg text-accent-foreground">
						<Markdown content={notes ?? ""} />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

// Add this helper function at the top level
const getThemeVariant = (theme: SlideTheme, isDark: boolean) => {
	if (isDark && theme.dark) {
		return theme.dark;
	}
	return theme;
};

// Add this helper at the top level
const getProseClasses = (isDark: boolean) =>
	cn("prose max-w-none", {
		"prose-invert": isDark,
	});

// Title slide component
const TitleSlide = memo(
	({
		slideData,
		state,
	}: {
		slideData: typeof TitleSlideSchema._type;
		state: SinglePresentationAgentState;
	}) => {
		return (
			<div className="flex flex-col items-center justify-center h-full text-center p-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-950 dark:to-blue-900">
				<div className="rounded-lg">
					<h1 className="text-7xl pb-8 font-bold mb-2 text-indigo-900 dark:text-indigo-100">
						{slideData.title}
					</h1>
					{slideData.subtitle && (
						<h2 className="text-4xl mb-3 text-indigo-700 dark:text-indigo-300">
							{slideData.subtitle}
						</h2>
					)}
				</div>
			</div>
		);
	},
);

// Shared SlideImage component
const SlideImage = memo(
	({
		image,
		alt,
		// className,
		containerClassName,
	}: {
		image: { url?: string; prompt?: string };
		alt?: string;
		className?: string;
		containerClassName?: string;
	}) => {
		const [isLoading, setIsLoading] = useState(true);

		if (image.url) {
			return (
				<div className={cn("relative", containerClassName)}>
					<img
						src={image.url}
						alt={alt || "Slide image"}
						className="w-full h-full object-cover"
						onLoad={() => setIsLoading(false)}
						onError={() => setIsLoading(false)}
					/>
				</div>
			);
		}

		return (
			<div
				className={cn(
					"relative",
					containerClassName ||
						"relative w-full h-full flex items-center justify-center overflow-hidden",
					{
						"bg-gray-100": isLoading,
					},
				)}
			>
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
						<div className="text-center">
							<div className="animate-pulse mb-2">
								<SparklesIcon className="h-6 w-6 mx-auto text-indigo-500" />
							</div>
							<p className="text-sm font-medium text-gray-700">
								Generating image...
							</p>
						</div>
					</div>
				)}
				<img
					src={`/image/${encodeURIComponent(image.prompt ?? "")}`}
					alt={alt || "Generated image"}
					className="w-full h-full object-cover"
					onLoad={() => setIsLoading(false)}
					onError={() => setIsLoading(false)}
				/>
			</div>
		);
	},
);

SlideImage.displayName = "SlideImage";

// Full-size image slide component
const FullSizeImageSlide = memo(
	({
		slideData,
		state,
	}: {
		slideData: typeof FullSizeImageSlideSchema._type;
		state: SinglePresentationAgentState | null;
	}) => {
		return (
			<div className="relative h-full">
				<div
					className={cn("absolute inset-0 z-10", {
						"bg-black/50": slideData.title,
					})}
				/>
				<SlideImage image={slideData.image} alt={slideData.title} />
				<div className="absolute inset-0 z-20 flex flex-col justify-center p-4">
					<h2 className="text-xl font-bold text-white mb-2">
						{slideData.title}
					</h2>
					{slideData.description && (
						<p className="text-white text-base">{slideData.description}</p>
					)}
				</div>
			</div>
		);
	},
);

// One text column slide component
const OneTextColumnSlide = memo(
	({
		slideData,
		state,
	}: {
		slideData: typeof OneTextColumnSlideSchema._type;
		state: SinglePresentationAgentState | null;
	}) => {
		return (
			<div className="h-full p-6 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
				<div className="p-6 rounded-lg bg-white/70 dark:bg-black/50">
					<h2 className="text-5xl font-bold mb-2 text-slate-800 dark:text-slate-100">
						{slideData.title}
					</h2>
					<div className="flex-grow overflow-auto">
						{slideData.description && (
							<p className="mb-2 text-base text-slate-700 dark:text-slate-300">
								{slideData.description}
							</p>
						)}
						<div className="prose max-w-none dark:prose-invert">
							<Markdown content={slideData.markdownContent} />
						</div>
					</div>
				</div>
				{slideData.image && (
					<div className="mt-2 h-24">
						<SlideImage
							image={slideData.image}
							alt={slideData.title}
							containerClassName="h-full flex items-center justify-center p-2 rounded-lg bg-white/70 dark:bg-black/50"
						/>
					</div>
				)}
			</div>
		);
	},
);

// Two text columns slide component
const TwoTextColumnsSlide = memo(
	({
		slideData,
	}: {
		slideData: typeof TwoTextColumnsSlideSchema._type;
	}) => {
		return (
			<div className="h-full p-6 flex flex-col gap-5 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900">
				<h2 className="text-5xl font-bold text-emerald-900 dark:text-emerald-100">
					{slideData.title}
				</h2>
				{slideData.description && (
					<p className="text-emerald-800 dark:text-emerald-300 mb-2 text-base">
						{slideData.description}
					</p>
				)}
				<div className="grid grid-cols-2 gap-4 flex-grow overflow-auto">
					<div className="p-6 rounded-lg bg-white/70 dark:bg-black/50">
						<div className="prose prose-xl max-w-none dark:prose-invert">
							<Markdown content={slideData.markdownContentLeft} />
						</div>
					</div>
					<div className="p-6 rounded-lg bg-white/70 dark:bg-black/50">
						<div className="prose prose-xl max-w-none dark:prose-invert">
							<Markdown content={slideData.markdownContentRight} />
						</div>
					</div>
				</div>
			</div>
		);
	},
);

// Two columns with image slide component
const TwoColumnsWithImageSlide = memo(
	({
		slideData,
		state,
	}: {
		slideData: typeof TwoColumnsWithImageSlideSchema._type;
		state: SinglePresentationAgentState | null;
	}) => {
		return (
			<div className="h-full p-6 flex flex-col gap-5 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900">
				<h2 className="text-5xl font-bold text-amber-900 dark:text-amber-100">
					{slideData.title}
				</h2>
				<div className="grid grid-cols-2 gap-8 flex-grow overflow-auto">
					<div className="flex flex-col p-6 rounded-lg bg-white/70 dark:bg-black/50">
						{slideData.description && (
							<p className="text-amber-800 dark:text-amber-300 mb-4 text-lg">
								{slideData.description}
							</p>
						)}
						<div className="prose prose-xl max-w-none dark:prose-invert">
							<Markdown content={slideData.markdownContent} />
						</div>
					</div>
					<div className="flex items-center justify-center mt-0">
						<SlideImage
							image={slideData.image}
							alt={slideData.title}
							containerClassName="w-full h-full bg-white/70 dark:bg-black/50 flex items-center justify-center rounded-lg border border-amber-200 dark:border-amber-800"
						/>
					</div>
				</div>
			</div>
		);
	},
);

// Big image with caption slide component
const BigImageWithCaptionSlide = memo(
	({
		slideData,
		state,
	}: {
		slideData: typeof BigImageWithCaptionSlideSchema._type;
		state: SinglePresentationAgentState | null;
	}) => {
		return (
			<div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900">
				<h2 className="text-5xl font-bold p-4 text-purple-900 dark:text-purple-100">
					{slideData.title}
				</h2>
				<div className="flex-grow flex items-center justify-center p-4">
					<SlideImage
						image={slideData.image}
						alt={slideData.title}
						className="max-w-full max-h-full object-contain rounded-lg shadow-md"
						containerClassName="w-full h-full bg-white/70 dark:bg-black/50 flex items-center justify-center p-4 rounded-lg border border-purple-200 dark:border-purple-800"
					/>
				</div>
				<div className="p-6 bg-white/80 dark:bg-black/50">
					<div className="prose max-w-none dark:prose-invert">
						<Markdown content={slideData.caption} />
					</div>
				</div>
			</div>
		);
	},
);

// Background image with text slide component
const BackgroundImageWithTextSlide = memo(
	({
		slideData,
		state,
	}: {
		slideData: typeof BackgroundImageWithTextSlideSchema._type;
		state: SinglePresentationAgentState | null;
	}) => {
		// Determine text position classes based on the textPosition property
		const textPositionClasses = useMemo(() => {
			switch (slideData.textPosition) {
				case "top":
					return "items-start pt-16";
				case "bottom":
					return "items-end pb-16";
				case "center":
					return "items-center";
				default:
					return "items-center";
			}
		}, [slideData.textPosition]);

		return (
			<div className="relative h-full">
				<SlideImage
					image={slideData.image}
					alt={slideData.title}
					className="absolute inset-0 w-full h-full object-cover"
					containerClassName="absolute inset-0 bg-gray-200 flex items-center justify-center"
				/>
				<div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
				<div
					className={`absolute inset-0 z-20 flex flex-col justify-center ${textPositionClasses} p-10`}
				>
					<h2
						className="text-3xl font-bold mb-6 drop-shadow-md"
						style={{ color: slideData.textColor }}
					>
						{slideData.title}
					</h2>
					{slideData.overlayText && (
						<div className={cn("max-w-2xl mx-auto px-6 py-4 rounded-lg")}>
							<div className={getProseClasses(false)}>
								<Markdown content={slideData.overlayText} />
							</div>
						</div>
					)}
				</div>
			</div>
		);
	},
);

// Unknown slide design component
const UnknownSlideDesign = memo(
	({
		slideData,
		state,
	}: {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		slideData: any;
		state: SinglePresentationAgentState | null;
	}) => {
		return (
			<div className="p-8 bg-gray-50 h-full">
				<h2 className="text-5xl font-bold mb-4 text-red-600">
					Unknown slide design: {slideData.design}
				</h2>
				<pre className="bg-white p-4 rounded-lg shadow-inner overflow-auto border border-gray-200 text-sm">
					{JSON.stringify(slideData, null, 2)}
				</pre>
			</div>
		);
	},
);

// Main SingleSlide component that selects the appropriate slide component
export const SingleSlide = memo(
	({
		id,
		generalState,
		slidesAgent,
	}: {
		id: string;
		generalState: PresentationAgentState;
		slidesAgent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>;
	}) => {
		console.log("id", id);
		const { theme: currentTheme } = useTheme();
		const isDark = currentTheme === "dark";

		const slide = useMemo(() => {
			const slide = generalState?.presentation?.slides.find(
				(slide) => slide.id === id,
			);
			if (!slide) {
				return null;
			}
			return slide;
		}, [generalState?.presentation?.slides, id]);

		const [state, setState] = useState<SinglePresentationAgentState | null>(
			null,
		);

		const agent = useSkywardAgent<SinglePresentationAgentState>({
			agent: "single-presentation-agent",
			name: id,
			onStateUpdate(newState: SinglePresentationAgentState) {
				setState(newState);
			},
		});

		useEffect(() => {
			return () => {
				agent.close();
			};
		}, [agent]);

		// Add keyboard navigation
		usePresentationKeyboardNavigation(
			generalState,
			slidesAgent,
			!!slide, // Only enable when slide is loaded
		);

		// If slide data is not found, show a placeholder
		if (!slide || !state) {
			return (
				<div className="flex items-center justify-center h-full bg-gray-100 p-6">
					<p className="text-gray-500">Slide not found</p>
				</div>
			);
		}

		// Render the appropriate slide component based on design with 16:9 aspect ratio wrapper
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="aspect-video shadow-lg rounded-lg overflow-hidden relative bg-white dark:bg-gray-900">
					<ScalableContainer designWidth={1280} designHeight={720}>
						{(() => {
							switch (slide.design) {
								case "title":
									return (
										<TitleSlide key={id} slideData={slide} state={state} />
									);
								case "full-size-image":
									return (
										<FullSizeImageSlide
											key={id}
											slideData={slide}
											state={state}
										/>
									);
								case "one-text-column":
									return (
										<OneTextColumnSlide
											key={id}
											slideData={slide}
											state={state}
										/>
									);
								case "two-text-columns":
									return <TwoTextColumnsSlide key={id} slideData={slide} />;
								case "two-columns-with-image":
									return (
										<TwoColumnsWithImageSlide
											key={id}
											slideData={slide}
											state={state}
										/>
									);
								case "big-image-with-caption":
									return (
										<BigImageWithCaptionSlide
											key={id}
											slideData={slide}
											state={state}
										/>
									);
								case "background-image-with-text":
									return (
										<BackgroundImageWithTextSlide
											key={id}
											slideData={slide}
											state={state}
										/>
									);
								default:
									return <UnknownSlideDesign slideData={slide} state={state} />;
							}
						})()}
					</ScalableContainer>
				</div>
				<div className="flex gap-2 absolute bottom-4 right-4">
					<SpeakerNotesSheet notes={slide.speakerNotes} />
					{generalState.config.collaboration === "active" && (
						<CollaborationSheet slideId={id} slidesAgent={slidesAgent} />
					)}
				</div>
			</div>
		);
	},
);

SingleSlide.displayName = "SingleSlide";

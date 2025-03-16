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
import {
	LightbulbIcon,
	MessageSquareText,
	SparklesIcon,
	WandIcon,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePresentationKeyboardNavigation } from "@/hooks/use-presentation-keyboard-navigation";
import { Textarea } from "@/components/ui/textarea";
import { ScalableContainer } from "@/components/scalable-container";

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
					<div className="prose text-accent-foreground">
						<Markdown content={notes ?? ""} />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

const CollaborationSheet = () => {
	return (
		<Sheet>
			<SheetTrigger className=" z-30 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all border shadow-2xl">
				<SparklesIcon className="h-5 w-5 text-gray-700" />
			</SheetTrigger>
			<SheetContent side="right">
				<div className="p-4 flex flex-col flex-1 h-full">
					<h3 className="text-lg font-semibold mb-4">Collaboration Mode 🔥</h3>
					<div className="flex flex-1">{/* s */}</div>
					<Textarea
						className="resize-none"
						placeholder="Que no te quedó claro?"
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
};

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
			<div className="flex flex-col items-center justify-center h-full text-center p-4 @sm:p-6 @md:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
				<h1 className="text-lg @sm:text-xl @md:text-2xl @lg:text-2xl @xl:text-4xl font-bold mb-2 @sm:mb-4 text-indigo-900">
					{slideData.title}
				</h1>
				{slideData.subtitle && (
					<h2 className="text-base @sm:text-base @md:text-base @lg:text-xl @xl:text-2xl px-10 text-indigo-700 mb-3 @sm:mb-6">
						{slideData.subtitle}
					</h2>
				)}
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
				<div className="absolute inset-0 z-20 flex flex-col justify-center p-4 @sm:p-6 @md:p-10">
					<h2 className="text-xl @sm:text-2xl @md:text-3xl font-bold text-white mb-2 @sm:mb-4 drop-shadow-md">
						{slideData.title}
					</h2>
					{slideData.description && (
						<p className="text-white text-base @sm:text-lg @md:text-xl drop-shadow-md">
							{slideData.description}
						</p>
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
			<div className="h-full p-4 @sm:p-6 @md:p-8 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
				<h2 className="text-xl @sm:text-2xl @md:text-3xl font-bold mb-2 @sm:mb-4 text-slate-800">
					{slideData.title}
				</h2>
				<div className="flex-grow overflow-auto">
					{slideData.description && (
						<p className="text-slate-700 mb-2 @sm:mb-4 text-base @sm:text-lg">
							{slideData.description}
						</p>
					)}
					<div className="prose max-w-none prose-slate">
						<Markdown content={slideData.markdownContent} />
					</div>
				</div>
				{slideData.image && (
					<div className="mt-2 @sm:mt-4 h-24 @sm:h-40">
						<SlideImage
							image={slideData.image}
							alt={slideData.title}
							className="h-full object-contain"
							containerClassName="h-full bg-gray-100 flex items-center justify-center p-2 rounded-lg border border-gray-200"
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
		state,
	}: {
		slideData: typeof TwoTextColumnsSlideSchema._type;
		state: SinglePresentationAgentState | null;
	}) => {
		return (
			<div className="h-full p-4 @sm:p-6 @md:p-8 flex flex-col bg-gradient-to-br from-emerald-50 to-teal-100">
				<h2 className="text-xl @sm:text-2xl @md:text-3xl font-bold mb-2 @sm:mb-4 text-emerald-900">
					{slideData.title}
				</h2>
				{slideData.description && (
					<p className="text-emerald-800 mb-2 @sm:mb-4 text-base @sm:text-lg">
						{slideData.description}
					</p>
				)}
				<div className="grid grid-cols-1 @sm:grid-cols-2 gap-4 @sm:gap-8 flex-grow overflow-auto">
					<div className="prose max-w-none prose-emerald bg-white bg-opacity-70 p-2 @sm:p-4 rounded-lg">
						<Markdown content={slideData.markdownContentLeft} />
					</div>
					<div className="prose max-w-none prose-emerald bg-white bg-opacity-70 p-2 @sm:p-4 rounded-lg">
						<Markdown content={slideData.markdownContentRight} />
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
			<div className="h-full p-4 @sm:p-6 @md:p-8 flex flex-col bg-gradient-to-br from-amber-50 to-orange-100">
				<h2 className="text-xl @sm:text-2xl @md:text-3xl font-bold mb-2 @sm:mb-4 text-amber-900">
					{slideData.title}
				</h2>
				<div className="grid grid-cols-1 @sm:grid-cols-2 gap-4 @sm:gap-8 flex-grow overflow-auto">
					<div className="flex flex-col bg-white bg-opacity-70 p-2 @sm:p-4 rounded-lg">
						{slideData.description && (
							<p className="text-amber-800 mb-2 @sm:mb-4 text-base @sm:text-lg">
								{slideData.description}
							</p>
						)}
						<div className="prose max-w-none prose-amber">
							<Markdown content={slideData.markdownContent} />
						</div>
					</div>
					<div className="flex items-center justify-center mt-4 @sm:mt-0">
						<SlideImage
							image={slideData.image}
							alt={slideData.title}
							// className="max-w-full max-h-full object-contain rounded-lg shadow-md"
							containerClassName="w-full h-full bg-white flex items-center justify-center rounded-lg border border-amber-200"
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
			<div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-100">
				<h2 className="text-xl @sm:text-2xl @md:text-3xl font-bold p-4 @sm:p-6 text-purple-900">
					{slideData.title}
				</h2>
				<div className="flex-grow flex items-center justify-center p-2 @sm:p-4">
					<SlideImage
						image={slideData.image}
						alt={slideData.title}
						className="max-w-full max-h-full object-contain rounded-lg shadow-md"
						containerClassName="w-full h-full bg-white bg-opacity-70 flex items-center justify-center p-2 @sm:p-4 rounded-lg border border-amber-200"
					/>
				</div>
				<div className="p-4 @sm:p-6 bg-white bg-opacity-80">
					<p className="text-base @sm:text-lg text-center text-purple-800">
						{slideData.caption}
					</p>
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
					return "items-start pt-12 @sm:pt-16";
				case "bottom":
					return "items-end pb-12 @sm:pb-16";
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
					className={`absolute inset-0 z-20 flex flex-col justify-center ${textPositionClasses} p-4 @sm:p-6 @md:p-10`}
				>
					<h2
						className="text-xl @sm:text-2xl @md:text-3xl font-bold mb-4 @sm:mb-6 drop-shadow-md"
						style={{ color: slideData.textColor }}
					>
						{slideData.title}
					</h2>
					<div className="max-w-2xl mx-auto px-4 py-3 @sm:px-6 @sm:py-4 bg-black bg-opacity-50 rounded-lg">
						<p
							className="text-base @sm:text-xl @md:text-2xl text-center drop-shadow-md"
							style={{ color: slideData.textColor }}
						>
							{slideData.overlayText}
						</p>
					</div>
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
			<div className="p-4 @sm:p-8 bg-gray-50 h-full">
				<h2 className="text-xl @sm:text-2xl font-bold mb-2 @sm:mb-4 text-red-600">
					Unknown slide design: {slideData.design}
				</h2>
				<pre className="bg-white p-2 @sm:p-4 rounded-lg shadow-inner overflow-auto border border-gray-200 text-xs @sm:text-sm">
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
		const slide = useMemo(() => {
			const slide = generalState?.presentation?.slides.find(
				(slide) => slide.id === id,
			);
			if (!slide) {
				return null;
			}
			return slide;
		}, [generalState, id]);

		const [state, setState] = useState<SinglePresentationAgentState | null>(
			null,
		);

		useSkywardAgent<SinglePresentationAgentState>({
			agent: "single-presentation-agent",
			name: id,
			onStateUpdate(newState: SinglePresentationAgentState) {
				setState(newState);
			},
		});

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
				<div className="aspect-video bg-white shadow-lg rounded-lg overflow-hidden relative">
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
									return (
										<TwoTextColumnsSlide
											key={id}
											slideData={slide}
											state={state}
										/>
									);
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
						<CollaborationSheet />
					)}
				</div>
			</div>
		);
	},
);

SingleSlide.displayName = "SingleSlide";

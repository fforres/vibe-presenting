import type { PresentationAgentState } from "@/agents/presentations-agent";
import type {
	FullSizeImageSlideSchema,
	OneTextColumnSlideSchema,
	SinglePresentationAgentState,
	Slide,
	TitleSlideSchema,
	TwoColumnsWithImageSlideSchema,
	TwoTextColumnsSlideSchema,
} from "@/agents/single-presentation-message-schema";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
			}}
		>
			{content}
		</ReactMarkdown>
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
			<div className="flex flex-col items-center justify-center h-full text-center p-6">
				<h1 className="text-3xl font-bold mb-4">{slideData.title}</h1>
				{slideData.topic && (
					<h2 className="text-xl text-gray-700 mb-6">{slideData.topic}</h2>
				)}
				<div className="mt-auto text-sm text-gray-500">
					<p className="font-medium">Speaker Notes:</p>
					<p>{slideData.speakerNotes}</p>
				</div>
			</div>
		);
	},
);

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
				<div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
				{slideData.image?.url ? (
					<img
						src={slideData.image.url}
						alt={slideData.title}
						className="absolute inset-0 w-full h-full object-cover"
					/>
				) : slideData.image?.url ? (
					<img
						src={slideData.image.url}
						alt={slideData.title}
						className="absolute inset-0 w-full h-full object-cover"
					/>
				) : (
					<div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
						<p className="text-gray-500">
							Image prompt: {slideData.image?.prompt}
						</p>
					</div>
				)}
				<div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
					<h2 className="text-2xl font-bold text-white mb-4">
						{slideData.title}
					</h2>
					{slideData.description && (
						<p className="text-white text-lg">{slideData.description}</p>
					)}
					<div className="mt-auto bg-black bg-opacity-50 p-3 rounded text-sm text-white">
						<p className="font-medium">Speaker Notes:</p>
						<p>{slideData.speakerNotes}</p>
					</div>
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
			<div className="h-full p-6 flex flex-col">
				<h2 className="text-2xl font-bold mb-4">{slideData.title}</h2>
				<div className="flex-grow overflow-auto">
					{slideData.description && (
						<p className="text-gray-700 mb-4">{slideData.description}</p>
					)}
					<div className="prose max-w-none">
						<Markdown content={slideData.markdownContent} />
					</div>
				</div>
				{slideData.image && (
					<div className="mt-4 h-32">
						{slideData.image?.url ? (
							<img
								src={slideData.image.url}
								alt={slideData.title}
								className="h-full object-contain"
							/>
						) : (
							<div className="h-full bg-gray-100 flex items-center justify-center p-2 rounded">
								<p className="text-sm text-gray-500">
									Image prompt: {slideData.image?.prompt}
								</p>
							</div>
						)}
					</div>
				)}
				<div className="mt-4 text-sm text-gray-500 border-t pt-2">
					<p className="font-medium">Speaker Notes:</p>
					<p>{slideData.speakerNotes}</p>
				</div>
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
			<div className="h-full p-6 flex flex-col">
				<h2 className="text-2xl font-bold mb-4">{slideData.title}</h2>
				{slideData.description && (
					<p className="text-gray-700 mb-4">{slideData.description}</p>
				)}
				<div className="grid grid-cols-2 gap-6 flex-grow overflow-auto">
					<div className="prose max-w-none">
						<Markdown content={slideData.markdownContentLeft} />
					</div>
					<div className="prose max-w-none">
						<Markdown content={slideData.markdownContentRight} />
					</div>
				</div>
				<div className="mt-4 text-sm text-gray-500 border-t pt-2">
					<p className="font-medium">Speaker Notes:</p>
					<p>{slideData.speakerNotes}</p>
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
			<div className="h-full p-6 flex flex-col">
				<h2 className="text-2xl font-bold mb-4">{slideData.title}</h2>
				<div className="grid grid-cols-2 gap-6 flex-grow overflow-auto">
					<div className="flex flex-col">
						{slideData.description && (
							<p className="text-gray-700 mb-4">{slideData.description}</p>
						)}
						<div className="prose max-w-none">
							<Markdown content={slideData.markdownContent} />
						</div>
					</div>
					<div className="flex items-center justify-center">
						{slideData.image?.url ? (
							<img
								src={slideData.image.url}
								alt={slideData.title}
								className="max-w-full max-h-full object-contain"
							/>
						) : (
							<div className="w-full h-full bg-gray-100 flex items-center justify-center p-4 rounded">
								<p className="text-gray-500">
									Image prompt: {slideData.image?.prompt}
								</p>
							</div>
						)}
					</div>
				</div>
				<div className="mt-4 text-sm text-gray-500 border-t pt-2">
					<p className="font-medium">Speaker Notes:</p>
					<p>{slideData.speakerNotes}</p>
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
			<div className="p-6">
				<h2 className="text-xl font-bold mb-4">
					Unknown slide design: {slideData.design}
				</h2>
				<pre className="bg-gray-100 p-4 rounded overflow-auto">
					{JSON.stringify(slideData, null, 2)}
				</pre>
			</div>
		);
	},
);

// Set display names for all components
TitleSlide.displayName = "TitleSlide";
FullSizeImageSlide.displayName = "FullSizeImageSlide";
OneTextColumnSlide.displayName = "OneTextColumnSlide";
TwoTextColumnsSlide.displayName = "TwoTextColumnsSlide";
TwoColumnsWithImageSlide.displayName = "TwoColumnsWithImageSlide";
UnknownSlideDesign.displayName = "UnknownSlideDesign";

// Main SingleSlide component that selects the appropriate slide component
export const SingleSlide = memo(
	({
		id,
		generalState,
	}: {
		id: string;
		generalState: PresentationAgentState;
	}) => {
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

		console.log(
			"generalState?.presentation?.slides",
			generalState?.presentation?.slides,
			id,
		);

		// If slide data is not found, show a placeholder
		if (!slide || !state) {
			return (
				<div className="flex items-center justify-center h-full bg-gray-100 p-6">
					<p className="text-gray-500">Slide not found</p>
				</div>
			);
		}

		// Render the appropriate slide component based on design
		switch (slide.design) {
			case "title":
				return <TitleSlide slideData={slide} state={state} />;
			case "full-size-image":
				return <FullSizeImageSlide slideData={slide} state={state} />;
			case "one-text-column":
				return <OneTextColumnSlide slideData={slide} state={state} />;
			case "two-text-columns":
				return <TwoTextColumnsSlide slideData={slide} state={state} />;
			case "two-columns-with-image":
				return <TwoColumnsWithImageSlide slideData={slide} state={state} />;
			default:
				return <UnknownSlideDesign slideData={slide} state={state} />;
		}
	},
);

SingleSlide.displayName = "SingleSlide";

import { z } from "zod";

export type ScheduledItem = {
	id: string;
	type: "cron" | "scheduled" | "delayed";
	trigger: string;
	nextTrigger: string;
	description: string;
};

export type Presentation = {
	id: string;
	name: string;
	description: string;
	createdAt: number;
};
export type PresentationAgentState = {
	connectionCount: number;
	activePresentation: Presentation | null;
	status: "idle" | "loading" | "error" | "success";
	presentations: Presentation[];
};

// Define image object schema with validation
export const ImageSchema = z
	.object({
		prompt: z.string().optional(),
		url: z.string().optional(),
	})
	.refine((data) => data.prompt !== undefined || data.url !== undefined, {
		message: "Either image prompt or image URL must be provided",
	});

export type Image = z.infer<typeof ImageSchema>;

// Update slide design types
export const FullSizeImageSlideSchema = z.object({
	id: z.string(),
	title: z.string(),
	topic: z.string(),
	description: z.string().optional(),
	markdownContent: z.array(z.string()).default([]),
	image: ImageSchema,
	speakerNotes: z.string(),
	design: z.literal("full-size-image"),
});

export const OneTextColumnSlideSchema = z.object({
	id: z.string(),
	title: z.string(),
	topic: z.string(),
	description: z.string(),
	markdownContent: z.string(),
	image: ImageSchema.optional(),
	speakerNotes: z.string(),
	design: z.literal("one-text-column"),
});

export const TwoTextColumnsSlideSchema = z.object({
	id: z.string(),
	title: z.string(),
	topic: z.string(),
	description: z.string(),
	markdownContentLeft: z.string(),
	markdownContentRight: z.string(),
	speakerNotes: z.string(),
	design: z.literal("two-text-columns"),
});

export const TwoColumnsWithImageSlideSchema = z.object({
	id: z.string(),
	title: z.string(),
	topic: z.string(),
	description: z.string(),
	markdownContent: z.string(),
	image: ImageSchema,
	speakerNotes: z.string(),
	design: z.literal("two-columns-with-image"),
});

export const TitleSlideSchema = z.object({
	id: z.string(),
	title: z.string(),
	subtitle: z.string().optional(),
	topic: z.string(),
	description: z.string().optional(),
	speakerNotes: z.string(),
	design: z.literal("title"),
});

// Combined slide schema using discriminated union
export const SlideSchema = z.discriminatedUnion("design", [
	FullSizeImageSlideSchema,
	OneTextColumnSlideSchema,
	TwoTextColumnsSlideSchema,
	TwoColumnsWithImageSlideSchema,
	TitleSlideSchema,
]);

export type Slide = z.infer<typeof SlideSchema>;

// Define presentation structure
export const PresentationContentSchema = z.object({
	name: z.string(),
	description: z.string(),
	slides: z.array(SlideSchema).default([]),
	createdAt: z.number(),
	updatedAt: z.number(),
});

export type PresentationContent = z.infer<typeof PresentationContentSchema>;

// Define agent state
export type SinglePresentationAgentState = {
	presentationId: string | null;
	connectionCount: number;
	content: PresentationContent | null;
	status: "initializing" | "ready" | "loading" | "error" | "success";
	history: Array<{
		id: string;
		type: string;
		content: string;
		timestamp: number;
		response?: string;
	}>;
};

// Input message schemas
export const InitPresentationSchema = z.object({
	type: z.literal("init-presentation"),
	presentationId: z.string(),
	description: z.string(),
	name: z.string(),
});

export const AnalyzeTextSchema = z.object({
	type: z.literal("analyze-text"),
	text: z.string(),
});

export const UpdateSlideSchema = z.object({
	type: z.literal("update-slide"),
	slideId: z.string().optional(),
	title: z.string().optional(),
	topic: z.string().optional(),
	description: z.string().optional(),
	markdownContent: z.string(),
	image: z
		.object({
			prompt: z.string().optional(),
			url: z.string().optional(),
		})
		.optional(),
});

export const ReorderSlidesSchema = z.object({
	type: z.literal("reorder-slides"),
	slideIds: z.array(z.string()),
});

export const DeleteSlideSchema = z.object({
	type: z.literal("delete-slide"),
	slideId: z.string(),
});

export const GenerateNewSlideSchema = z.object({
	type: z.literal("generate-new-slide"),
	topic: z.string().optional(),
	afterSlideId: z.string().optional(),
});

// Combined input message schema
export const SinglePresentationIncomingMessageSchema = z.discriminatedUnion(
	"type",
	[
		InitPresentationSchema,
		AnalyzeTextSchema,
		UpdateSlideSchema,
		ReorderSlidesSchema,
		DeleteSlideSchema,
		GenerateNewSlideSchema,
	],
);

export type SinglePresentationIncomingMessage = z.infer<
	typeof SinglePresentationIncomingMessageSchema
>;

// Output message schemas
export const PresentationContentOutputSchema = z.object({
	type: z.literal("presentation-content"),
	data: PresentationContentSchema,
});

export const SlideGeneratedOutputSchema = z.object({
	type: z.literal("slide-generated"),
	slide: SlideSchema,
});

export const PresentationUpdatedOutputSchema = z.object({
	type: z.literal("presentation-updated"),
	data: PresentationContentSchema,
});

export const ErrorOutputSchema = z.object({
	type: z.literal("error"),
	data: z.string(),
});

// Combined output message schema
export const SinglePresentationOutgoingMessageSchema = z.discriminatedUnion(
	"type",
	[
		PresentationContentOutputSchema,
		SlideGeneratedOutputSchema,
		PresentationUpdatedOutputSchema,
		ErrorOutputSchema,
	],
);

export type SinglePresentationOutgoingMessage = z.infer<
	typeof SinglePresentationOutgoingMessageSchema
>;

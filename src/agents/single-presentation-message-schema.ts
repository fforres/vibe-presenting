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

// Define slide structure
export const SlideSchema = z.object({
	id: z.string(),
	title: z.string(),
	topic: z.string(),
	description: z.string().optional(),
	bulletPoints: z.array(z.string()).default([]),
	imagePrompt: z.string().optional(),
	imageUrl: z.string().optional(),
	speakerNotes: z.string(),
	order: z.number(),
});

export type Slide = z.infer<typeof SlideSchema>;

// Define presentation structure
export const PresentationContentSchema = z.object({
	id: z.string(),
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
	bulletPoints: z.array(z.string()).optional(),
	imagePrompt: z.string().optional(),
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

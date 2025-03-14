import { z } from "zod";

// Define the ScheduledItem schema first since it's used in multiple message types
export const ScheduledItemSchema = z.object({
	id: z.string(),
	// Add other fields that should be in ScheduledItem
	// For example:
	title: z.string(),
	scheduledTime: z.string().datetime().optional(),
	// Add any other fields as needed
});

export type ScheduledItem = z.infer<typeof ScheduledItemSchema>;

// Input message schemas
export const ScheduleInputSchema = z.object({
	type: z.literal("schedule"),
	input: z.string(),
});

const PresentationSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
});

export const CreatePresentationInputSchema = PresentationSchema.extend({
	type: z.literal("create-presentation"),
}).omit({
	id: true,
});

export const DeleteScheduleInputSchema = z.object({
	type: z.literal("delete-schedule"),
	id: z.string(),
});

export const PresentationsInitInputSchema = z.object({
	type: z.literal("presentations-init"),
});

export const SetActiveSlideInputSchema = z.object({
	type: z.literal("set-active-slide"),
	id: z.union([z.string(), z.null()]),
});

// Add this schema for toggling collaboration
export const ToggleCollaborationInputSchema = z.object({
	type: z.literal("toggle-collaboration"),
	enabled: z.boolean(),
});

export const NavigateNextSlideInputSchema = z.object({
	type: z.literal("navigate-next-slide"),
	currentSlideId: z.string(),
});

export const NavigatePreviousSlideInputSchema = z.object({
	type: z.literal("navigate-previous-slide"),
	currentSlideId: z.string(),
});

// Combined input message schema
export const IncomingMessageSchema = z.discriminatedUnion("type", [
	ScheduleInputSchema,
	DeleteScheduleInputSchema,
	CreatePresentationInputSchema,
	SetActiveSlideInputSchema,
	PresentationsInitInputSchema,
	ToggleCollaborationInputSchema,
	NavigateNextSlideInputSchema,
	NavigatePreviousSlideInputSchema,
]);

export type IncomingMessage = z.infer<typeof IncomingMessageSchema>;

// Output message schemas
export const SchedulesOutputSchema = z.object({
	type: z.literal("schedules"),
	data: z.array(ScheduledItemSchema),
});

export const RunScheduleOutputSchema = z.object({
	type: z.literal("run-schedule"),
	data: ScheduledItemSchema,
});

export const ErrorOutputSchema = z.object({
	type: z.literal("error"),
	data: z.string(),
});

export const ScheduleOutputSchema = z.object({
	type: z.literal("schedule"),
	data: ScheduledItemSchema,
});

export const AllPresentationsOutputSchema = z.object({
	type: z.literal("all-presentations"),
	data: z.array(PresentationSchema),
});

export const CreatedPresentationOutputSchema = z.object({
	type: z.literal("created-presentation"),
	id: z.string(),
});

export const InitialConnectionsOutputSchema = z.object({
	type: z.literal("initial-connections"),
	data: z.object({
		connectionCount: z.number(),
	}),
});

// Add a new outgoing message type for config updates
export const ConfigUpdatedOutputSchema = z.object({
	type: z.literal("config-updated"),
	data: z.object({
		collaboration: z.enum(["active", "inactive"]),
		// Add other config properties as needed
	}),
});

// Combined output message schema
export const OutgoingMessageSchema = z.discriminatedUnion("type", [
	SchedulesOutputSchema,
	RunScheduleOutputSchema,
	ErrorOutputSchema,
	ScheduleOutputSchema,
	AllPresentationsOutputSchema,
	CreatedPresentationOutputSchema,
	InitialConnectionsOutputSchema,
	ConfigUpdatedOutputSchema,
]);

export type OutgoingMessage = z.infer<typeof OutgoingMessageSchema>;

import type { Env } from "@/server";
import { createOpenAI } from "@ai-sdk/openai";
import { getAgentByName } from "agents-sdk";
import { AIChatAgent } from "agents-sdk/ai-chat-agent";
import {
	type StreamTextOnFinishCallback,
	createDataStreamResponse,
	generateId,
	streamText,
} from "ai";
import type { SinglePresentationAgent } from "./single-presentation-agent";
import { agentContext } from "./utils";

/**
 * Tools for the SingleSlideAgent to interact with slides
 */
const tools = [
	{
		name: "update_slide",
		description: "Update a slide in the presentation",
		parameters: {
			type: "object",
			properties: {
				slideId: {
					type: "string",
					description: "ID of the slide to update",
				},
				title: {
					type: "string",
					description: "New title for the slide",
				},
				topic: {
					type: "string",
					description: "New topic for the slide",
				},
				description: {
					type: "string",
					description: "New description for the slide",
				},
				bulletPoints: {
					type: "array",
					items: { type: "string" },
					description: "New bullet points for the slide",
				},
				imagePrompt: {
					type: "string",
					description: "New image prompt for the slide",
				},
			},
			required: ["slideId"],
		},
	},
];

/**
 * Tool execution handlers
 */
const executions = {
	update_slide: async ({
		slideId,
		title,
		topic,
		description,
		bulletPoints,
		imagePrompt,
	}) => {
		try {
			// Get the presentation agent
			const presentationAgentName = slideId.split("-")[0]; // Assuming the slideId format includes presentation ID
			const presentationAgent = await getAgentByName<SinglePresentationAgent>(
				presentationAgentName,
			);

			if (!presentationAgent) {
				return {
					error: `Presentation agent ${presentationAgentName} not found`,
				};
			}

			// Create update message
			const updateMessage = {
				type: "update-slide",
				slideId,
				...(title && { title }),
				...(topic && { topic }),
				...(description && { description }),
				...(bulletPoints && { bulletPoints }),
				...(imagePrompt && { imagePrompt }),
			};

			// Send update to all connections in the presentation agent
			presentationAgent.broadcastMessage({
				type: "presentation-updated",
				data: presentationAgent.state.content,
			});

			return {
				success: true,
				message: "Slide updated successfully",
				updatedFields: {
					...(title && { title }),
					...(topic && { topic }),
					...(description && { description }),
					...(bulletPoints && { bulletPoints }),
					...(imagePrompt && { imagePrompt }),
				},
			};
		} catch (error) {
			return {
				error:
					error instanceof Error ? error.message : "Failed to update slide",
			};
		}
	},
};

/**
 * SingleSlide Agent implementation that handles improving individual slides through chat
 */
export class SingleSlideAgent extends AIChatAgent<Env> {
	/**
	 * Handles incoming chat messages about slide improvements
	 * @param onFinish - Callback function executed when streaming completes
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async onChatMessage(onFinish: StreamTextOnFinishCallback<any>) {
		return agentContext.run(this, async () => {
			const dataStreamResponse = createDataStreamResponse({
				execute: async (dataStream) => {
					// Get the slide ID from the agent name or state
					const slideId = this.name.split("slide-")[1];

					// Get the presentation agent to fetch slide data
					const presentationAgentName = slideId.split("-")[0];
					const presentationAgent =
						await getAgentByName<SinglePresentationAgent>(
							presentationAgentName,
						);

					if (!presentationAgent || !presentationAgent.state.content) {
						dataStream.append({
							type: "error",
							error: `Could not find presentation data for slide ${slideId}`,
						});
						return;
					}

					// Find the current slide data
					const slide = presentationAgent.state.content.slides.find(
						(s) => s.id === slideId,
					);

					if (!slide) {
						dataStream.append({
							type: "error",
							error: `Slide with ID ${slideId} not found`,
						});
						return;
					}

					// Initialize OpenAI client with API key from environment
					const openai = createOpenAI({
						apiKey: this.env.OPENAI_API_KEY,
					});

					// Create a system message with slide context
					const systemMessage = `
You are a slide improvement assistant that helps users enhance their presentation slides.
You can update slide content based on user feedback and suggestions.

Current slide information:
- Title: ${slide.title}
- Topic: ${slide.topic}
- Description: ${slide.description}
- Bullet Points: ${slide.bulletPoints.join(", ")}
- Image Prompt: ${slide.imagePrompt}

Presentation context:
- Title: ${presentationAgent.state.content.name}
- Description: ${presentationAgent.state.content.description}

You can help the user improve any aspect of this slide. When making changes, use the update_slide tool.
`;

					const result = streamText({
						model: openai("gpt-4o"),
						system: systemMessage,
						messages: this.messages,
						tools,
						onFinish,
						maxSteps: 10,
					});

					// Merge the AI response stream with tool execution outputs
					result.mergeIntoDataStream(dataStream, {
						sendReasoning: true,
						sendSources: true,
						sendUsage: true,
					});
				},
			});

			return dataStreamResponse;
		});
	}
}

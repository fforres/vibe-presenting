import {
	type AnalyzeTextSchema,
	type DeleteSlideSchema,
	ErrorOutputSchema,
	type InitPresentationSchema,
	type PresentationContent,
	PresentationUpdatedOutputSchema,
	type ReorderSlidesSchema,
	SinglePresentationIncomingMessageSchema,
	type SinglePresentationOutgoingMessage,
	SinglePresentationOutgoingMessageSchema,
	SlideSchema,
	type UpdateSlideSchema,
} from "@/agents/single-presentation-message-schema";
import type { Env } from "@/server";
import { createOpenAI } from "@ai-sdk/openai";
import {
	Agent,
	getAgentByName,
	type Connection,
	type ConnectionContext,
	type WSMessage,
} from "agents-sdk";
import {
	generateId,
	generateObject,
	generateText,
	tool,
	streamObject,
} from "ai";
import { z } from "zod";
/**
 * SinglePresentation Agent implementation that handles presentation content generation and management
 */

export type ChatAgentState = {
	connections: number;
	messages: { isAdmin: boolean; message: string; id: string }[];
};
export class SinglePresentationAgent extends Agent<Env, ChatAgentState> {
	connections: Record<string, Connection<unknown>> = {};
	openai = createOpenAI({
		apiKey: this.env.OPENAI_API_KEY,
		//   baseURL: this.env.GATEWAY_BASE_URL,
	});

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(env: any, agent: any) {
		super(env, agent);
		this.setState({
			connections: 0,
			messages: [],
		});
	}

	onConnect(
		connection: Connection,
		ctx: ConnectionContext,
	): void | Promise<void> {
		super.onConnect(connection, ctx);
		this.connections[connection.id] = connection;
		this.setState({
			...this.state,
			connections: this.state.connections + 1,
		});
	}

	onClose(
		connection: Connection,
		code: number,
		reason: string,
		wasClean: boolean,
	): void | Promise<void> {
		super.onClose(connection, code, reason, wasClean);
		delete this.connections[connection.id];
		this.setState({
			...this.state,
			connections: this.state.connections - 1,
		});
	}

	async onMessage(connection: Connection<unknown>, message: WSMessage) {
		const messageObject = JSON.parse(message.toString()) as {
			type: "message" | "consolidate-messages";
			userId: string;
			slideId: string;
			isAdmin: boolean;
			message: string;
		};
		console.log("messageObject", messageObject);

		if (messageObject.isAdmin) {
			this.setState({
				...this.state,
				messages: [
					...this.state.messages,
					{
						isAdmin: messageObject.isAdmin,
						message: messageObject.message,
						id: generateId(),
					},
				],
			});
			// Handle presentation updates with LLM analysis
			const slidesAgent = await getAgentByName(
				this.env.Presentations,
				"fintoc-presentation",
			);

			const slideContent = await slidesAgent.getSlide(messageObject.slideId);

			console.log("slideContent", slideContent);
			try {
				const result = await generateText({
					model: this.openai("gpt-4o-mini"),
					prompt: `
You are an expert at analyzing feedback on presentation slides, and determining if the feedback requires some changes in the presentation slide.
You will receive:
- A bunch of feedback messages.
- Content of a presentation slide.

- You need to determine if the feedback requires some changes in the presentation slide.
- You will compare the feedback with the content of the slide.
- If it does, you need to generate more detailed explanation of the slide, and call the tool "update-slide" with the updated slide content.

<existing-slide>
${JSON.stringify(slideContent, null, 2)}
</existing-slide>

<feedback>
${this.state.messages
	.map((message) => {
		return `
  <message>
  <user-id>${message.id}</user-id>
  <message>${message.message}</message>
  </message>
  `;
	})
	.join("\n")}
</feedback>

Available tools:
- update-slide: Updates the content of a slide
  Parameters:
    - slideId: string (ID of the slide to update)
    - content: object (The updated slide content following the SlideSchema)

`,
					tools: {
						"update-slide": tool({
							description: "Updates the content of a slide",
							parameters: z.object({
								slideId: z.string().describe("The ID of the slide to update"),
								content: SlideSchema.describe("The updated slide content"),
							}),
							execute: async ({ slideId, content }) => {
								const theSlideAgent = await getAgentByName(
									this.env.Presentations,
									"fintoc-presentation",
								);
								console.log("theSlideAgent", theSlideAgent);
								await theSlideAgent.updateSlideContent(slideId, content);
								console.log(
									"FINAL SLIDE",
									await theSlideAgent.getSlide(slideId),
								);
							},
						}),
					},
				});
			} catch (error) {
				console.log("error in presentation update handling", error);
			}
			return;
		}

		// Validate incoming message format
		try {
			const result = await generateObject({
				model: this.openai("gpt-4o-mini"),
				system: `
          You are an assistant expert in validating that text is safe for work. You will be given a message. On many languages. Particularly spanish and english. And you will need to validate that the message is safe for work. If it is not, you will need to return a message saying that the message is not safe for work.
        `,
				messages: [
					{
						role: "user",
						content: messageObject.message,
					},
				],
				schema: z.object({
					valid: z.boolean(),
				}),
			});

			const message = result.object.valid
				? messageObject.message
				: `Message from connection ${connection.id} contains inappropriate content`;
			// If message passes moderation, add to state
			this.setState({
				...this.state,
				messages: [
					...this.state.messages,
					{ isAdmin: messageObject.isAdmin, message, id: generateId() },
				],
			});
		} catch (error) {
			// Send error message back to the connection
			console.log("error", error);
			return;
		}
	}

	broadcastMessage(message: string) {
		for (const connectionId in this.connections) {
			this.connections[connectionId].send(message);
		}
	}
}

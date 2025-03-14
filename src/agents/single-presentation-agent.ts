import {
	type AnalyzeTextSchema,
	type DeleteSlideSchema,
	ErrorOutputSchema,
	type InitPresentationSchema,
	type PresentationContent,
	PresentationUpdatedOutputSchema,
	type ReorderSlidesSchema,
	type SinglePresentationAgentState,
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
	type Connection,
	type ConnectionContext,
	type WSMessage,
} from "agents-sdk";
import { generateId, streamObject } from "ai";
import { z } from "zod";
/**
 * SinglePresentation Agent implementation that handles presentation content generation and management
 */
export class SinglePresentationAgent extends Agent<
	Env,
	SinglePresentationAgentState
> {
	connections: Record<string, Connection<unknown>> = {};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(env: any, agent: any) {
		super(env, agent);
		this.setState({
			connectionCount: 0,
			presentationId: null,
			content: null,
			status: "initializing",
			history: [],
		});
	}

	initialize(message: z.infer<typeof InitPresentationSchema>) {
		this.setStatus("initializing");
		// Update state
		this.setState({
			...this.state,
			presentationId: message.presentationId,
			content: {
				createdAt: Date.now(),
				updatedAt: Date.now(),
				name: message.name,
				description: message.description,
				slides: [],
			},
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
			connectionCount: this.state.connectionCount + 1,
		});
		// console.log("onConnect", connection, ctx);
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
			connectionCount: Math.max(this.state.connectionCount - 1, 0),
		});
	}

	async generateSlides() {
		console.log("generating slides");
		this.setStatus("loading");
		const name = this.state.content?.name;
		const description = this.state.content?.description;
		const openai = createOpenAI({
			apiKey: this.env.OPENAI_API_KEY,
		});
		const { partialObjectStream } = streamObject({
			model: openai("gpt-4o"),
			system: `You are a presentation expert that helps create well-structured presentations.
You will be given a presentation name and description.

You will then generate a well-structured presentation slides.
Each slide should have a title, topic, description, bullet points, and an image prompt.

The presentation should be well-structured and easy to follow.
The presentation should be 10-15 slides long.
The presentation should be 10-15 minutes long.
The presentation should be well-structured and easy to follow.

I need to not create generic slides but actual topics that I should be talking and discussing. Like, tell me what I should be saying.

`,
			messages: [
				{
					role: "user",
					content: `Presentation Name: ${name}\n
Presentation Description: ${description}`,
				},
			],
			schema: z.object({
				slides: z.array(SlideSchema),
			}),
		});

		for await (const chunk of partialObjectStream) {
			console.log("chunk", chunk);
			const slides = chunk.slides ?? [];
			this.setState({
				...this.state,
				content: {
					...(this.state.content ? this.state.content : {}),
					// @ts-expect-error It's hard to type this.
					slides: slides,
				},
			});
		}

		console.log("content");
		console.log(JSON.stringify(this.state.content));
		console.log("slides");
		console.log(JSON.stringify(this.state.content?.slides));
	}

	setStatus(status: SinglePresentationAgentState["status"]) {
		console.log("setting status", status);
		this.setState({
			...this.state,
			status,
		});
	}

	async onMessage(connection: Connection<unknown>, message: WSMessage) {
		const messageString = JSON.parse(message.toString());
		await this.handleMessage(connection, messageString);
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async handleMessage(connection: Connection<unknown>, message: any) {
		try {
			// Parse and validate the incoming message
			const parsedMessage =
				SinglePresentationIncomingMessageSchema.parse(message);
			this.setStatus("loading");

			console.log("parsedMessage", parsedMessage);

			// Add to history
			const messageId = generateId();
			this.setState({
				...this.state,
				history: [
					...this.state.history,
					{
						id: messageId,
						type: parsedMessage.type,
						content: JSON.stringify(parsedMessage),
						timestamp: Date.now(),
					},
				],
			});

			// Handle different message types
			switch (parsedMessage.type) {
				// case "init-presentation":
				// 	await this.handleInitPresentation(connection, parsedMessage);
				// 	break;

				case "analyze-text":
					await this.handleAnalyzeText(connection, parsedMessage, messageId);
					break;

				case "update-slide":
					await this.handleUpdateSlide(connection, parsedMessage);
					break;

				case "reorder-slides":
					await this.handleReorderSlides(connection, parsedMessage);
					break;

				case "delete-slide":
					await this.handleDeleteSlide(connection, parsedMessage);
					break;

				// case "generate-new-slide":
				// 	await this.handleGenerateNewSlide(
				// 		connection,
				// 		parsedMessage,
				// 		messageId,
				// 	);
				// 	break;
			}
		} catch (error) {
			// Handle validation errors
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data:
							error instanceof Error ? error.message : "Invalid message format",
					}),
				),
			);
		}
	}

	async handleAnalyzeText(
		connection: Connection<unknown>,
		message: z.infer<typeof AnalyzeTextSchema>,
		messageId: string,
	) {
		if (!this.state.content) {
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data: "No presentation initialized. Send init-presentation first.",
					}),
				),
			);
			return;
		}

		const openai = createOpenAI({
			apiKey: this.env.OPENAI_API_KEY,
		});
	}

	async handleUpdateSlide(
		connection: Connection<unknown>,
		message: z.infer<typeof UpdateSlideSchema>,
	) {
		if (!this.state.content) {
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data: "No presentation initialized. Send init-presentation first.",
					}),
				),
			);
			return;
		}

		// Find the slide to update
		const slideIndex = this.state.content.slides.findIndex(
			(s) => s.id === message.slideId,
		);

		if (slideIndex === -1) {
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data: `Slide with ID ${message.slideId} not found`,
					}),
				),
			);
			return;
		}

		// Update the slide
		const updatedSlides = [...this.state.content.slides];
		updatedSlides[slideIndex] = {
			...updatedSlides[slideIndex],
			...(message.title && { title: message.title }),
			...(message.topic && { topic: message.topic }),
			...(message.description && { description: message.description }),
			...(message.bulletPoints && { bulletPoints: message.bulletPoints }),
			...(message.imagePrompt && { imagePrompt: message.imagePrompt }),
		};

		// Update the presentation content
		const updatedContent: PresentationContent = {
			...this.state.content,
			slides: updatedSlides,
			updatedAt: Date.now(),
		};

		// Update state
		this.setState({
			...this.state,
			content: updatedContent,
		});

		// Send response
		await connection.send(
			JSON.stringify(
				PresentationUpdatedOutputSchema.parse({
					type: "presentation-updated",
					data: updatedContent,
				}),
			),
		);
	}

	async handleReorderSlides(
		connection: Connection<unknown>,
		message: z.infer<typeof ReorderSlidesSchema>,
	) {
		if (!this.state.content) {
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data: "No presentation initialized. Send init-presentation first.",
					}),
				),
			);
			return;
		}

		// Validate that all slide IDs exist
		const slideIds = new Set(this.state.content.slides.map((s) => s.id));
		for (const id of message.slideIds) {
			if (!slideIds.has(id)) {
				await connection.send(
					JSON.stringify(
						ErrorOutputSchema.parse({
							type: "error",
							data: `Slide with ID ${id} not found`,
						}),
					),
				);
				return;
			}
		}

		// Create a map of slides by ID
		const slidesMap = new Map(this.state.content.slides.map((s) => [s.id, s]));

		// Create reordered slides array
		const reorderedSlides = message.slideIds.map((id, index) => {
			const slide = slidesMap.get(id);
			if (!slide) {
				throw new Error(`Slide with ID ${id} not found`);
			}
			return {
				...slide,
				order: index,
			};
		});

		// Add any slides that weren't in the reorder list at the end
		const reorderedIds = new Set(message.slideIds);
		const remainingSlides = this.state.content.slides
			.filter((s) => !reorderedIds.has(s.id))
			.map((s, i) => ({
				...s,
				order: reorderedSlides.length + i,
			}));

		const allSlides = [...reorderedSlides, ...remainingSlides];

		// Update the presentation content
		const updatedContent: PresentationContent = {
			...this.state.content,
			slides: allSlides,
			updatedAt: Date.now(),
		};

		// Update state
		this.setState({
			...this.state,
			content: updatedContent,
		});

		// Send response
		await connection.send(
			JSON.stringify(
				PresentationUpdatedOutputSchema.parse({
					type: "presentation-updated",
					data: updatedContent,
				}),
			),
		);
	}

	async handleDeleteSlide(
		connection: Connection<unknown>,
		message: z.infer<typeof DeleteSlideSchema>,
	) {
		if (!this.state.content) {
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data: "No presentation initialized. Send init-presentation first.",
					}),
				),
			);
			return;
		}

		// Find the slide to delete
		const slideIndex = this.state.content.slides.findIndex(
			(s) => s.id === message.slideId,
		);

		if (slideIndex === -1) {
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data: `Slide with ID ${message.slideId} not found`,
					}),
				),
			);
			return;
		}

		// Remove the slide
		const updatedSlides = this.state.content.slides.filter(
			(s) => s.id !== message.slideId,
		);

		// Reorder remaining slides
		const reorderedSlides = updatedSlides.map((slide, index) => ({
			...slide,
			order: index,
		}));

		// Update the presentation content
		const updatedContent: PresentationContent = {
			...this.state.content,
			slides: reorderedSlides,
			updatedAt: Date.now(),
		};

		// Update state
		this.setState({
			...this.state,
			content: updatedContent,
		});

		// Send response
		await connection.send(
			JSON.stringify(
				PresentationUpdatedOutputSchema.parse({
					type: "presentation-updated",
					data: updatedContent,
				}),
			),
		);
	}

	broadcastMessage(message: SinglePresentationOutgoingMessage) {
		const validatedMessage =
			SinglePresentationOutgoingMessageSchema.parse(message);
		const messageString = JSON.stringify(validatedMessage);

		for (const connectionId in this.connections) {
			this.connections[connectionId].send(messageString);
		}
	}
}

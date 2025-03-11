import {
	type SinglePresentationAgentState,
	SinglePresentationIncomingMessageSchema,
	SinglePresentationOutgoingMessageSchema,
	type InitPresentationSchema,
	type AnalyzeTextSchema,
	type UpdateSlideSchema,
	type ReorderSlidesSchema,
	type DeleteSlideSchema,
	type GenerateNewSlideSchema,
	ErrorOutputSchema,
	type PresentationContent,
	type Slide,
	PresentationUpdatedOutputSchema,
	PresentationContentOutputSchema,
	SlideGeneratedOutputSchema,
	type SinglePresentationOutgoingMessage,
} from "@/agents/single-presentation-message-schema";
import type { Env } from "@/server";
import {
	Agent,
	type Connection,
	type ConnectionContext,
	type WSMessage,
	getAgentByName,
} from "agents-sdk";
import { generateId, streamText } from "ai";
import type { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
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
			presentationId: null,
			content: null,
			status: "idle",
			history: [],
		});
	}

	onConnect(
		connection: Connection,
		ctx: ConnectionContext,
	): void | Promise<void> {
		super.onConnect(connection, ctx);
		this.connections[connection.id] = connection;
	}

	onClose(
		connection: Connection,
		code: number,
		reason: string,
		wasClean: boolean,
	): void | Promise<void> {
		super.onClose(connection, code, reason, wasClean);
		delete this.connections[connection.id];
	}

	setStatus(status: SinglePresentationAgentState["status"]) {
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

				case "generate-new-slide":
					await this.handleGenerateNewSlide(
						connection,
						parsedMessage,
						messageId,
					);
					break;
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

		this.setStatus("idle");
	}

	async initialize(message: z.infer<typeof InitPresentationSchema>) {
		// Initialize or load presentation content
		let presentationContent: PresentationContent;
		if (
			this.state.content &&
			this.state.presentationId === message.presentationId
		) {
			// Use existing content if we already have it
			presentationContent = this.state.content;
		} else {
			// Create new content structure
			presentationContent = {
				id: message.presentationId,
				name: "New Presentation",
				description: "New Presentation Description",
				slides: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};
			// Generate initial slide if empty
			if (presentationContent.slides.length === 0) {
				const titleSlide: Slide = {
					id: generateId(),
					title: presentationContent.name,
					topic: "introduction",
					description: presentationContent.description,
					bulletPoints: [],
					order: 0,
				};
				presentationContent.slides.push(titleSlide);
			}
		}
		// Update state
		this.setState({
			...this.state,
			presentationId: message.presentationId,
			content: presentationContent,
		});
		// Send response
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

	async handleGenerateNewSlide(
		connection: Connection<unknown>,
		message: z.infer<typeof GenerateNewSlideSchema>,
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

		try {
			// Generate context for the AI
			const existingSlides = this.state.content.slides
				.sort((a, b) => a.order - b.order)
				.map((slide, index) => {
					return `Slide ${index + 1}: "${slide.title}" - ${slide.description} - ${slide.bulletPoints.join(", ")}`;
				})
				.join("\n");

			// Determine where to insert the new slide
			let insertPosition = this.state.content.slides.length;
			let contextMessage = "Add this slide at the end of the presentation.";

			if (message.afterSlideId) {
				const afterSlideIndex = this.state.content.slides.findIndex(
					(s) => s.id === message.afterSlideId,
				);
				if (afterSlideIndex !== -1) {
					insertPosition = afterSlideIndex + 1;
					contextMessage = `Add this slide after "${this.state.content.slides[afterSlideIndex].title}".`;
				}
			}

			// Generate a new slide
			const response = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{
						role: "system",
						content: `You are a presentation expert that helps create well-structured slides.
						The current presentation is titled "${this.state.content.name}" with the description: "${this.state.content.description}".

						Here are the existing slides in the presentation:
						${existingSlides}

						${contextMessage}
						${message.topic ? `The slide should focus on this topic: ${message.topic}` : "Generate an appropriate topic based on the presentation flow."}`,
					},
				],
				functions: [
					{
						name: "generate_slide",
						description: "Generate a new slide for the presentation",
						parameters: {
							type: "object",
							properties: {
								title: { type: "string", description: "Concise slide title" },
								topic: {
									type: "string",
									description: "The main topic of this slide",
								},
								description: {
									type: "string",
									description: "Brief description of the slide content",
								},
								bulletPoints: {
									type: "array",
									items: { type: "string" },
									description:
										"Key points to include on the slide (3-5 points)",
								},
								imagePrompt: {
									type: "string",
									description: "Prompt to generate an image for this slide",
								},
							},
							required: [
								"title",
								"topic",
								"description",
								"bulletPoints",
								"imagePrompt",
							],
						},
					},
				],
				function_call: { name: "generate_slide" },
			});

			const functionCall = response.choices[0]?.message?.function_call;

			if (functionCall && functionCall.name === "generate_slide") {
				const slideData = JSON.parse(functionCall.arguments);

				// Create the new slide
				const newSlide: Slide = {
					id: generateId(),
					title: slideData.title,
					topic: slideData.topic,
					description: slideData.description,
					bulletPoints: slideData.bulletPoints,
					imagePrompt: slideData.imagePrompt,
					order: insertPosition,
				};

				// Update slides with the new slide and reorder
				const updatedSlides = [...this.state.content.slides];

				// Increment order for slides that come after the new slide
				for (let i = 0; i < updatedSlides.length; i++) {
					if (updatedSlides[i].order >= insertPosition) {
						updatedSlides[i].order += 1;
					}
				}

				// Add the new slide
				updatedSlides.push(newSlide);

				// Sort by order
				updatedSlides.sort((a, b) => a.order - b.order);

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
					history: this.state.history.map((item) =>
						item.id === messageId
							? { ...item, response: JSON.stringify(slideData) }
							: item,
					),
				});

				// Send responses
				await connection.send(
					JSON.stringify(
						SlideGeneratedOutputSchema.parse({
							type: "slide-generated",
							slide: newSlide,
						}),
					),
				);

				await connection.send(
					JSON.stringify(
						PresentationUpdatedOutputSchema.parse({
							type: "presentation-updated",
							data: updatedContent,
						}),
					),
				);
			} else {
				throw new Error("Failed to generate new slide");
			}
		} catch (error) {
			await connection.send(
				JSON.stringify(
					ErrorOutputSchema.parse({
						type: "error",
						data:
							error instanceof Error
								? error.message
								: "Error generating new slide",
					}),
				),
			);
		}
	}

	// Helper method to send messages to all connections
	broadcastMessage(message: SinglePresentationOutgoingMessage) {
		const validatedMessage =
			SinglePresentationOutgoingMessageSchema.parse(message);
		const messageString = JSON.stringify(validatedMessage);

		for (const connectionId in this.connections) {
			this.connections[connectionId].send(messageString);
		}
	}
}

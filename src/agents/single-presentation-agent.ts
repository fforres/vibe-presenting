import { SlideSchema } from "@/agents/single-presentation-message-schema";
import type { Env } from "@/server";
import { createOpenAI } from "@ai-sdk/openai";
import {
	Agent,
	type Connection,
	type ConnectionContext,
	type WSMessage,
	getAgentByName,
} from "agents-sdk";
import { generateId, generateObject, generateText, tool } from "ai";
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
		if (this.state) {
			return;
		}
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

	getMessages() {
		return this.state.messages;
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

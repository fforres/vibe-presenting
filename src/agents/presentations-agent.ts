import {
	Agent,
	getAgentByName,
	type Connection,
	type ConnectionContext,
	type Schedule,
	type WSMessage,
} from "agents-sdk";
import { AIChatAgent } from "agents-sdk/ai-chat-agent";
import {
	createDataStreamResponse,
	generateId,
	streamText,
	type StreamTextOnFinishCallback,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { agentContext, processToolCalls } from "./utils";
import { tools, executions } from "./tools";
import type { Chat, Env } from "@/server";
import {
	type IncomingMessage,
	type OutgoingMessage,
	AllPresentationsOutputSchema,
	CreatedPresentationOutputSchema,
	IncomingMessageSchema,
	OutgoingMessageSchema,
} from "./message-schemas";

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
	activePresentation: Presentation | null;
	status: "idle" | "loading" | "error" | "success";
	presentations: Presentation[];
};
/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Presentations extends Agent<Env, PresentationAgentState> {
	conversations: Record<string, DurableObjectStub<Chat>> = {};
	connections: Record<string, Connection<unknown>> = {};
	onConnect(
		connection: Connection,
		ctx: ConnectionContext,
	): void | Promise<void> {
		super.onConnect(connection, ctx);
		this.connections[connection.id] = connection;
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
	}
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(env: any, agent: any) {
		super(env, agent);
		this.setState({
			status: "idle",
			activePresentation: null,
			presentations: [
				{
					id: generateId(),
					name: "Test",
					description: "",
					createdAt: Date.now(),
				},
			],
		});
	}
	createConversation({
		name,
		description,
		id,
	}: {
		name: string;
		description: string;
		id: string;
	}) {
		this.setState({
			...this.state,
			presentations: [
				...this.state.presentations,
				{
					id,
					name,
					description,
					createdAt: Date.now(),
				},
			],
		});
	}

	setStatus(status: PresentationAgentState["status"]) {
		this.setState({
			...this.state,
			status,
		});
	}

	async onMessage(connection: Connection<unknown>, message: WSMessage) {
		const messageString = JSON.parse(message.toString());
		await this.handleMessage(connection, messageString);
	}

	// Example usage in your agent
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	async handleMessage(connection: Connection<unknown>, message: any) {
		// if (this.state.status === "loading") {
		// 	return;
		// }
		try {
			// Parse and validate the incoming message
			const parsedMessage = IncomingMessageSchema.parse(message);
			this.setStatus("loading");

			console.log("parsedMessage", parsedMessage);

			if (parsedMessage.type === "create-presentation") {
				// Handle create-conversation message
				// ...
				const { Chat } = this.env;
				const id = generateId();
				this.createConversation({
					id,
					description: parsedMessage.description,
					name: parsedMessage.name,
				});
				await connection.send(
					JSON.stringify(
						CreatedPresentationOutputSchema.parse({
							type: "created-presentation",
							id,
						}),
					),
				);

				console.log("CREATED CONVERSATION", id);
			}

			if (parsedMessage.type === "presentations-init") {
				// Handle all-conversations message
				// ...
				console.log("this.state.presentations", this.state.presentations);
				this.setState({
					...this.state,
				});
				await connection.send(
					JSON.stringify(
						AllPresentationsOutputSchema.parse({
							type: "all-presentations",
							data: this.state.presentations,
						}),
					),
				);
			}
			if (parsedMessage.type === "set-active-presentation") {
				this.setState({
					...this.state,
					activePresentation:
						this.state.presentations.find(
							(presentation) => presentation.id === parsedMessage.id,
						) ?? null,
				});
			}
			// case "delete-schedule":
			// 	// Handle delete-schedule message
			// 	// ...
			// 	return {
			// 		type: "schedules",
			// 		data: [], // Return updated list of schedules
			// 	};

			// default:
			// 	return {
			// 		type: "error",
			// 		data: "Unknown message type",
			// 	};
		} catch (error) {
			// Handle validation errors
			return {
				type: "error",
				data: error instanceof Error ? error.message : "Invalid message format",
			};
		}
		this.setStatus("idle");
	}

	// When sending messages, you can also validate them
	sendMessage(message: OutgoingMessage) {
		// Validate outgoing message
		const validatedMessage = OutgoingMessageSchema.parse(message);

		// Send the validated message
		// ...
	}

	onStateUpdate(
		state: PresentationAgentState | undefined,
		source: Connection | "server",
	): void {
		// console.log("onStateUpdate", source, state);
	}
}

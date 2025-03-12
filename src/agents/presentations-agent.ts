import type { Chat, Env } from "@/server";
import {
	Agent,
	type Connection,
	type ConnectionContext,
	type WSMessage,
	getAgentByName,
} from "agents-sdk";
import { generateId } from "ai";
import {
	AllPresentationsOutputSchema,
	CreatedPresentationOutputSchema,
	IncomingMessageSchema,
	type OutgoingMessage,
	OutgoingMessageSchema,
} from "./message-schemas";
import { presentationDescription } from "@/agents/utils";

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
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(env: any, agent: any) {
		super(env, agent);
		this.setState({
			connectionCount: 0,
			status: "idle",
			activePresentation: null,
			presentations: [
				{
					id: generateId(),
					name: "Agent framework",
					description: presentationDescription,
					createdAt: Date.now(),
				},
			],
		});
	}
	createPresentation({
		name,
		description,
		id,
	}: {
		name: string;
		description: string;
		id: string;
	}) {
		const newPresentation = {
			id,
			name,
			description,
			createdAt: Date.now(),
		};
		this.setState({
			...this.state,
			presentations: [...this.state.presentations, newPresentation],
		});
		return newPresentation;
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

			if (parsedMessage.type === "create-presentation") {
				// Handle create-  message
				// ...
				const { SinglePresentationAgent } = this.env;
				const id = generateId();
				const createdPresentation = this.createPresentation({
					id,
					description: parsedMessage.description,
					name: parsedMessage.name,
				});
				const agent = await getAgentByName(SinglePresentationAgent, id);
				await agent.initialize({
					type: "init-presentation",
					presentationId: id,
					description: parsedMessage.description,
					name: parsedMessage.name,
				});
				this.setState({
					...this.state,
					activePresentation: createdPresentation,
				});
				this.ctx.waitUntil(agent.generateSlides());

				console.log("Created Presentation", id);
			}

			if (parsedMessage.type === "presentations-init") {
				// Handle all-conversations message
				// ...
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

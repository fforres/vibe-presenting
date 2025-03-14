import { presentationDescription } from "@/agents/utils";
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
import type { Slide } from "./single-presentation-message-schema";

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
	slides: Slide[];
};
export type PresentationAgentState = {
	connectionCount: number;
	activeSlide: string | null;
	status: "idle" | "loading" | "error" | "success";
	config: {
		sidebarNavigation: "active" | "inactive";
	};
	presentation: Presentation;
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
			activeSlide: null,
			config: {
				sidebarNavigation: "inactive",
			},
			presentation: {
				id: generateId(),
				name: "Agent framework",
				description: presentationDescription,
				createdAt: Date.now(),
				slides: [
					{
						id: "el-landing",
						title: "Arquitectura de aplicaciones en un mundo post AI",
						topic: "El landing",
						description:
							"Ideas, patrones y 'Rants' sobre desarrollar software AI-First. (Pensamientos al rededor de `Sync Engines`, `el Edge` y `LLMs`) ",
						// "Ideas, patterns and Rants for deveopint AI-First software. (Thoughts around Sync Engines, Edge Inference and LLMs) ",
						// Nueva propuesta: Veremos ideas y patrones modernos para el desarrollo de aplicaciones “AI First” aprovechando Sync Engines, Edge Inference y modelos de lenguaje. Exploraremos casos prácticos que facilitan escalabilidad horizontal sin afectar negativamente en performance. Una solución concreta para desarrolladores.
						speakerNotes:
							"Welcome to this presentation on Cloudflare Durable Objects. Today, we'll explore what Durable Objects are, why they are important, and how they fit into the modern web architecture. Let's start by defining what Durable Objects are and their significance in data storage and processing.",
						design: "title",
					},
					{
						id: "sobre-mi",
						title: "Sobre mi",
						topic: "Sobre mi",
						description: "Una introducción sobre mi y mi background.",
						markdownContent: `
- **Felipe Torres (x.com/fforres)**.
- CTO @ Skyward.AI.
- (Previously, @ OpenAI).
						`,
						image: {
							url: "https://imagedelivery.net/Cus4FWn40G3bInNzY0Wl9A/6cb81b67-8c30-49de-3d9b-e06361a90600/public",
						},
						speakerNotes:
							"Hello everyone! Before we dive into Cloudflare Durable Objects, I'd like to take a moment to introduce myself. I'm passionate about cloud technologies and have been working with serverless architectures for several years. My journey with Cloudflare technologies has been particularly exciting, and I'm looking forward to sharing my knowledge with you today.",
						design: "two-columns-with-image",
					},
					{
						id: "ai-first-app",
						title: "Que es una 'AI-First' app?",
						topic: "WTF Is AI-First?",
						description: "Una introducción sobre mi y mi background.",
						markdownContent: `
- My name and professional background
- Experience with web technologies
- Passion for cloud computing and serverless architecture
						`,
						image: {
							prompt: "Professional portrait with technology background",
						},
						speakerNotes:
							"Hello everyone! Before we dive into Cloudflare Durable Objects, I'd like to take a moment to introduce myself. I'm passionate about cloud technologies and have been working with serverless architectures for several years. My journey with Cloudflare technologies has been particularly exciting, and I'm looking forward to sharing my knowledge with you today.",
						design: "two-columns-with-image",
					},
					{
						id: "2",
						title: "What are Cloudflare Durable Objects?",
						topic: "Definition and Functionality",
						description:
							"Understanding the core concept and functionality of Durable Objects.",
						markdownContent: `
- Stateful serverless compute platform
- Data storage and processing at the Edge
- Unique data consistency model
						`,
						image: {
							prompt: "Diagram of serverless architecture with data nodes",
						},
						speakerNotes:
							"Cloudflare Durable Objects are a stateful serverless compute platform that allows you to store and process data at the Edge. They offer a unique data consistency model, which is crucial for applications that require real-time data processing and storage.",
						design: "one-text-column",
					},
					{
						id: "3",
						title: "Benefits of Using Durable Objects",
						topic: "Advantages",
						description:
							"Exploring the benefits of using Durable Objects in web applications.",
						markdownContentLeft: `
- Low latency data access
- Scalability and flexibility
- Improved data consistency
						`,
						markdownContentRight: `
- Low latency data access
- Scalability and flexibility
- Improved data consistency
						`,
						speakerNotes:
							"One of the key benefits of using Durable Objects is low latency data access, which is essential for real-time applications. They also offer scalability and flexibility, allowing your applications to grow without compromising performance. Additionally, Durable Objects improve data consistency, ensuring that your data is always up-to-date and reliable.",
						design: "two-text-columns",
					},
					{
						id: "4",
						title: "How Durable Objects Work",
						topic: "Technical Overview",
						description:
							"A technical overview of how Durable Objects function within the Cloudflare ecosystem.",
						markdownContent: `
- Event-driven architecture
- Data synchronization across nodes
- Integration with Cloudflare Workers
						`,
						image: {
							prompt: "Technical diagram of event-driven architecture",
						},
						speakerNotes:
							"Durable Objects operate on an event-driven architecture, which allows them to efficiently handle data synchronization across multiple nodes. They integrate seamlessly with Cloudflare Workers, providing a powerful platform for building scalable and efficient web applications.",
						design: "two-columns-with-image",
					},
					{
						id: "5",
						title: "Use Cases for Durable Objects",
						topic: "Applications",
						description:
							"Exploring various use cases where Durable Objects can be effectively utilized.",
						markdownContentLeft: `
- Real-time chat applications
- Gaming leaderboards
- Collaborative editing tools
						`,
						markdownContentRight: `
- Real-time chat applications
- Gaming leaderboards
- Collaborative editing tools
						`,
						speakerNotes:
							"Durable Objects are versatile and can be used in a variety of applications. Some common use cases include real-time chat applications, gaming leaderboards, and collaborative editing tools. These applications benefit from the low latency and data consistency that Durable Objects provide.",
						design: "two-text-columns",
					},
					{
						id: "6",
						title: "Durable Objects and the Edge",
						topic: "Edge Computing",
						description:
							"Understanding the role of Durable Objects in Edge computing.",
						markdownContent: `
- Processing data closer to users
- Reducing server load
- Enhancing user experience
						`,
						image: {
							prompt: "Map showing data processing at the Edge",
						},
						speakerNotes:
							"Durable Objects play a crucial role in Edge computing by processing data closer to users. This reduces server load and enhances the overall user experience by providing faster and more reliable data access.",
						design: "one-text-column",
					},
					{
						id: "7",
						title: "The Agents Framework",
						topic: "Integration with Agents",
						description: "How Durable Objects power the new Agents framework.",
						markdownContent: `
- Foundation for building intelligent agents
- Real-time data processing
- Seamless integration with existing systems
						`,
						image: {
							prompt: "Diagram of agents interacting with data",
						},
						speakerNotes:
							"Durable Objects are the foundation for building intelligent agents within the new Agents framework. They enable real-time data processing and offer seamless integration with existing systems, making it easier to build and deploy intelligent applications.",
						design: "two-columns-with-image",
					},
					{
						id: "8",
						title: "Security and Privacy Considerations",
						topic: "Security",
						description:
							"Addressing security and privacy concerns related to Durable Objects.",
						markdownContentLeft: `
- Data encryption
- Access control mechanisms
- Compliance with data protection regulations
						`,
						markdownContentRight: `
- Data encryption
- Access control mechanisms
- Compliance with data protection regulations
						`,
						speakerNotes:
							"Security and privacy are paramount when dealing with data. Durable Objects offer data encryption and robust access control mechanisms to ensure that your data is secure. They also comply with data protection regulations, providing peace of mind when handling sensitive information.",
						design: "two-text-columns",
					},
					{
						id: "9",
						title: "Challenges and Limitations",
						topic: "Challenges",
						description:
							"Discussing the challenges and limitations of using Durable Objects.",
						markdownContentLeft: `
- Complexity in implementation
- Potential latency issues
- Cost considerations
						`,
						markdownContentRight: `
- Complexity in implementation
- Potential latency issues
- Cost considerations
						`,
						speakerNotes:
							"While Durable Objects offer many benefits, there are also challenges and limitations to consider. Implementing them can be complex, and there may be potential latency issues depending on your application's architecture. Additionally, cost considerations should be taken into account when planning to use Durable Objects.",
						design: "two-text-columns",
					},
					{
						id: "10",
						title: "Future of Cloudflare Durable Objects",
						topic: "Future Prospects",
						description:
							"Exploring the future developments and potential of Durable Objects.",
						markdownContent: `
- Continued innovation
- Expansion of use cases
- Integration with emerging technologies
						`,
						speakerNotes:
							"The future of Cloudflare Durable Objects is bright, with continued innovation and expansion of use cases on the horizon. As technology evolves, Durable Objects will likely integrate with emerging technologies, offering even more possibilities for developers and businesses.",
						design: "one-text-column",
					},
					{
						id: "11",
						title: "Conclusion and Q&A",
						topic: "Conclusion",
						description:
							"Wrapping up the presentation and opening the floor for questions.",
						speakerNotes:
							"In conclusion, Cloudflare Durable Objects represent a significant advancement in data storage and processing at the Edge. We've covered their benefits, use cases, and future prospects. Now, I'd like to open the floor for any questions you may have.",
						design: "title",
					},
				] satisfies Slide[],
			},
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
			presentation: {
				...this.state.presentation,
				...newPresentation,
			},
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
				agent.initialize({
					type: "init-presentation",
					presentationId: id,
					description: parsedMessage.description,
					name: parsedMessage.name,
				});
				this.setState({
					...this.state,
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
							data: this.state.presentation,
						}),
					),
				);
			}
			if (parsedMessage.type === "set-active-slide") {
				this.setState({
					...this.state,
					activeSlide: parsedMessage.id,
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

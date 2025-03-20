import { presentationDescription } from "@/agents/utils";
import type { Chat, Env } from "@/server";
import {
	Agent,
	type Connection,
	type ConnectionContext,
	type WSMessage,
	getAgentByName,
} from "agents-sdk";
import { generateId, generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
	AllPresentationsOutputSchema,
	IncomingMessageSchema,
	type OutgoingMessage,
	OutgoingMessageSchema,
	UpdatedSlideOutputSchema,
} from "./message-schemas";
import { SlideSchema, type Slide } from "./single-presentation-message-schema";
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
	slides: Slide[];
};
export type PresentationAgentState = {
	connectionCount: number;
	activeSlide: string | null;
	status: "idle" | "loading" | "error" | "success";
	config: {
		sidebarNavigation: "active" | "inactive";
		collaboration: "active" | "inactive";
		speakerNotes: "public" | "private";
	};
	presentation: Presentation;
};
/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Presentations extends Agent<Env, PresentationAgentState> {
	conversations: Record<string, DurableObjectStub<Chat>> = {};
	connections: Record<string, Connection<unknown>> = {};
	openai = createOpenAI({
		apiKey: this.env.OPENAI_API_KEY,
		//   baseURL: this.env.GATEWAY_BASE_URL,
	});
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

	getSlide(slideId: string) {
		return this.state.presentation.slides.find((slide) => slide.id === slideId);
	}

	async updateSlideContent(slideId: string, content: Slide) {
		console.log("Holy shit, updating");
		await this.setState({
			...this.state,
			presentation: {
				...this.state.presentation,
				slides: this.state.presentation.slides.map((slide) =>
					slide.id === slideId ? content : slide,
				),
			},
		});

		this.broadcast(
			JSON.stringify(
				UpdatedSlideOutputSchema.parse({
					type: "updated-slide",
					data: {
						slideId,
						slide: content,
					},
				} satisfies typeof UpdatedSlideOutputSchema._type),
			),
		);
		console.log(this.state.presentation.slides);
	}
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(env: any, agent: any) {
		super(env, agent);
		this.setState({
			connectionCount: 0,
			status: "idle",
			// activeSlide: "wtf-is-an-agent",
			activeSlide: null,
			config: {
				sidebarNavigation: "inactive",
				collaboration: "inactive",
				speakerNotes: "private",
			},
			presentation: {
				id: generateId(),
				// id: generateId(),
				name: "Arquitectura de aplicaciones en un mundo post AI",
				description: presentationDescription,
				createdAt: Date.now(),
				slides: [
					{
						id: "Hi",
						title: "Hi 👋",
						topic: "Hi",
						// "Ideas, patterns and Rants for deveopint AI-First software. (Thoughts around Sync Engines, Edge Inference and LLMs) ",
						// Nueva propuesta: Veremos ideas y patrones modernos para el desarrollo de aplicaciones "AI First" aprovechando Sync Engines, Edge Inference y modelos de lenguaje. Exploraremos casos prácticos que facilitan escalabilidad horizontal sin afectar negativamente en performance. Una solución concreta para desarrolladores.
						speakerNotes: "Say hi to the audience",
						design: "title",
					},
					{
						id: "sobre-mi",
						title: "Hola, soy Felipe Torres 👋",
						topic: "Sobre mi",
						markdownContent: `
- *A.K.A. FForres*
- CTO @ [Skyward.AI](https://skyward.ai)
- (Previously, @ [OpenAI](https://openai.com), [Brex](https://brex.com), [Segment](https://segment.com))
- 1 Esposa, 2 Gatos
- ❤️: AI, The Web, JS, TS, good UX, local-first.
- 😡: Crypto/Scams,

### Socials
- ~~X:~~ Twitter [twitter.com/fforres](https://twitter.com/fforres)
- [github.com/fforres](https://github.com/fforres)
- [linkedin.com/in/fforres](https://linkedin.com/in/fforres)
						`,
						image: {
							url: "https://imagedelivery.net/Cus4FWn40G3bInNzY0Wl9A/6cb81b67-8c30-49de-3d9b-e06361a90600/public",
						},
						speakerNotes: "",
						design: "two-columns-with-image",
					},
					{
						id: "el-landing",
						title: "Arquitectura de aplicaciones en un mundo post AI",
						subtitle:
							"(Cosas que aprendí construyendo Skyward.AI, y pa donde veo que va la cosa)",
						topic: "El landing",
						description:
							"Ideas, patrones y 'Rants' sobre desarrollar software AI-First. (Pensamientos al rededor de `Sync Engines`, `el Edge` y `LLMs`) ",
						// "Ideas, patterns and Rants for deveopint AI-First software. (Thoughts around Sync Engines, Edge Inference and LLMs) ",
						// Nueva propuesta: Veremos ideas y patrones modernos para el desarrollo de aplicaciones "AI First" aprovechando Sync Engines, Edge Inference y modelos de lenguaje. Exploraremos casos prácticos que facilitan escalabilidad horizontal sin afectar negativamente en performance. Una solución concreta para desarrolladores.
						speakerNotes: "",
						design: "title",
					},
					{
						id: "thesis-1",
						title: "Implementar AI === Implementar una base de datos",
						topic: "Thesis 1",
						subtitle: "Thesis 1",
						speakerNotes: "",
						design: "title",
					},
					{
						id: "thesis-2",
						title:
							"El accesso a deeeeeeeep reasoning models va ser (estúpidamente) barato.",
						topic: "Thesis 2",
						subtitle: "Thesis 2",
						speakerNotes: "",
						design: "title",
					},
					{
						id: "thesis-3",
						title: `Gente "no-dev" va a crear software a medida.`,
						topic: "Thesis 3",
						subtitle: "Thesis 3",
						speakerNotes: "",
						design: "title",
					},
					{
						id: "so-what",
						title: "Como diferencio mi software de la competencia?",
						description: "",
						topic: "FML. What's our Moat then?",
						markdownContent: `
### Entonces:

1. ### Si AI estará en todos lados.
2. ### Si el acceso a "pensar" será barato.
3. ### Si la gente podra crear sus propias soluciones.

## 🤔🤔🤔
## Cual es el MOAT?
						`,
						image: {
							prompt:
								"An image of a person thinking deeply Even a bit disheartened. They are a javascript developer so put some js/ts books around. This is important. And they are thinking about the future of software.",
						},
						design: "two-columns-with-image",
					},
					{
						id: "agents",
						title: "Agents",
						topic: "Agents",
						subtitle: "An 'AI-First' way to build software",
						speakerNotes: "",
						design: "title",
					},
					// asdadss
					{
						id: "wtf-is-ai-first",
						title: "Que diablos es AI-First‽‽",
						topic: "WTF is AI-First ‽‽",
						markdownContent: `
- ### IA es el componente fundamental de la solucion.
- ### No es una característica añadida, sino el núcleo de la arquitectura.
- ### Un problema: Falta de determinismo en la AI generativa.
- ### Agent-Based
`,
						image: {
							prompt:
								"Modern AI application architecture diagram with neural networks integrated into core systems",
						},
						speakerNotes: "",
						design: "two-columns-with-image",
					},

					{
						id: "wtf-is-an-agent",
						title: "¿Qué diablos es un Agent?",
						topic: "WTF is an Agent?",
						markdownContent: `
### Un programa autónomo que puede:
  - Interactuar con su entorno
  - Obtener data de fuentes externas
  - Realizar acciones (MCP anyone?)

### Características :
  - **"Razonamiento" (LLMs para decidir)** ✨
  - Herramientas predefinidas (APIs, BDD, agentes)
  - Autonomía (opera sin intervención constante)
  - **Persistencia (mantiene estado)** ✨
`,
						image: {
							prompt:
								"Diagram showing an AI agent system with perception, reasoning, and action components interacting with various tools and APIs",
						},
						speakerNotes:
							"Un agent es fundamentalmente diferente de un simple chatbot o una aplicación tradicional con IA. Es un sistema autónomo que combina la capacidad de razonamiento de los LLMs con la habilidad de interactuar con herramientas externas y mantener un estado persistente. Los agents pueden trabajar en segundo plano, tomar decisiones complejas y ejecutar tareas sin necesidad de supervisión constante. Esto los hace ideales para automatizar flujos de trabajo complejos que antes requerían intervención humana.",
						design: "two-columns-with-image",
					},
					{
						id: "is-there-actually-a-moat",
						title: "Entonces... Hay un Moat?",
						description: "",
						topic: "Entonces... Hay un Moat?",
						markdownContent: `

# Si

# 1. Data Privada
# 2. Buen UX
# 3. Buen AX
						`,
						image: {
							prompt:
								"A diagram of a moat with a drawbridge and a castle on top",
						},
						design: "two-columns-with-image",
					},
					{
						id: "good-ux-for-ai-first-software",
						title: "Buen UX / Buen AX (AI-First Software)",
						topic: "Good UX / Good AX (AI-First Software)",
						description: "",
						markdownContentLeft: `
### UX — User Experience
- Entender y priorizar las necesidades y objetivos del usuario.
- Resuelve?
- Es simple de usar? Es facil de entender?
- Es eficiente/es rapido?
            `,
						markdownContentRight: `
### AX — Agent Experience
Lo mismo que hace bueno al software tradicional...pero para agentes.
- Mathias Billmann (CEO Netlify)
- [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax/)
- [The Era of Agent Experience (AX)](https://www.netlify.com/blog/the-era-of-agent-experience-ax/)

> La experiencia que los agentes tienen, cuando trabajan con el contenido que producimos, o los sistemas que exponemos.

`,
						design: "two-text-columns",
					},
					{
						id: "separator",
						title: "====== <br /> ======",
						topic: "====== <br /> ======",
						subtitle: "Preguntas? Consultas? Reclamos?",
						design: "title",
					},
					{
						id: "summary",
						title: "Consolidando ideas",
						topic: "Summary",
						description: "",
						markdownContentLeft: `
### Tenemos que
- AI va a ser base de muchisimo software.
- LLMs habilitan crear software "on-demand".
- AI-First software va en subida.
- Agentes es el core de AI-First software.
- Todo esto implica muchísimos más agentes.
- Tenemos Moats de un buen software de AI.

`,
						markdownContentRight: `
### El equipo @ Skyward.AI analizó:
- Que es lo mas frustrante de trabajar con Llms.
- Que no es tan frustrante, pero que nos gustaría que pasara.
- Que es lo que nos encanta de trabajar con Llms.
- En el panorama futuro. Que debería cambiar?
`,
						design: "two-text-columns",
					},
					{
						id: "good-ux-ax-is-not-a-nice-to-have",
						title: "Buen UX y AX son jugadas de arquitectura",
						subtitle: "Y performance",
						topic: "Good UX y AX no son 'nice-to-have'",
						speakerNotes: "",
						design: "title",
					},
					{
						id: "lets-talk-architecture",
						title: "¿El Edge?",
						topic: "¿El Edge?",
						speakerNotes: "",
						design: "title",
					},
					{
						id: "lets-talk-architecture-2",
						title: "¿El Edge?",
						subtitle:
							"Paradigma de computación distribuida. Compute y storage se mueven más cerca de la fuente de datos. (AKA... no estan en un US-WEST-1).",
						topic: "¿El Edge? (What is it?)",
						speakerNotes: "",
						design: "title",
					},
					{
						id: "cloudflare-edge",
						title: "",
						topic: "Cloudflare",
						speakerNotes: "",
						image: {
							url: "https://analyticsindiamag.com/wp-content/uploads/2024/03/CF_MetaImage_1200x628-1.png",
						},
						design: "full-size-image",
					},
					{
						id: "Architectura-Workers",
						title: "Que son los Cloudflare Workers?",
						topic: "Cloudflare Workers",
						description:
							"'Isolados' de V8, que corren en el Edge de Cloudflare. (2017)",
						markdownContent: `
- Serverless en el Edge.
- No hay "US-WEST-1", tiene un solo location. "Earth"
- Un request es un worker. (No se comparte estado entre requests)
- JavaScript/WASM (Python y Rust en Beta)
- Escala muy muy rápido.
- Barato (100K requests/month al dia Gratis. 10M/Mes por 5 USD).
						`,
						image: {
							url: "https://imagedelivery.net/Cus4FWn40G3bInNzY0Wl9A/8b656f37-cbb0-44ef-490e-afbed7f84500/public",
						},
						speakerNotes: "",
						design: "two-columns-with-image",
					},
					{
						id: "Durable Objects",
						title: "Que son los Durable Objects?",
						topic: "Durable Objects",
						description:
							"Tipo de 'worker' que se ejecuta en el Edge de Cloudflare. (2021)",
						markdownContent: `
- Es un tipo de worker.
- Se instancia como una clase.
- Cada instancia de la clase tiene un ID unico en el mundo.
- Tienen sockets. Timers.
- Cada Durable Object tiene un "durable storage" asociado. (POJO o SQLite)

Cuento corto:  Durable Objects habilitan "Stateful Serverless".`,
						image: {
							url: "https://cf-assets.www.cloudflare.com/zkvhlag99gkb/41hmxqTyMhQIZ7scR0xi17/bee0d4adde9913c3c2495e1a0f37c109/Earth-desktop-background-copy-2_2x.png",
						},
						speakerNotes: "",
						design: "two-columns-with-image",
					},
					{
						id: "separator 2",
						title: "====== <br /> 2 ======",
						topic: "====== <br /> 2 ======",
						subtitle: "Preguntas? Consultas? Reclamos?",
						design: "title",
					},
					{
						id: "summary 2",
						title: "Consolidando ideas",
						topic: "Summary",
						markdownContent: `
- Agentes:
    - Logica de negocios encapsulada
    - Persistencia (mantiene estado)
- Lo mas frustrante de LLMs es la latencia.
- UX/AX no son negociables para nuestros usuarios.
- Desbloquear buen UX/AX son architecture plays.
- Cloudflare tiene las infaestructura para reducir latencia y escalar estupidamente.

... Metamos agentes en Cloudflare!

`,
						image: {
							url: "https://imagedelivery.net/Cus4FWn40G3bInNzY0Wl9A/99d59b22-756d-4e18-c00a-549b7ad8e000/public",
						},
						design: "two-columns-with-image",
					},
					{
						id: "story-time",
						title: "Story Time",
						subtitle: "Cloudflare Launchpad + Rita",
						topic: "Story Time",
						design: "title",
					},
					{
						id: "boom-synnergy",
						title: "Boom! Sinergy!",
						topic: "Boom! Sinergy!",
						image: {
							url: "https://imagedelivery.net/Cus4FWn40G3bInNzY0Wl9A/99d59b22-756d-4e18-c00a-549b7ad8e000/public",
						},
						caption: `
        const agent = new DurableObject()
  `,
						design: "big-image-with-caption",
					},
					{
						id: "tradeoffs",
						title: "Tradeoffs",
						topic: "Tradeoffs",
						description: "",
						markdownContent: `
- Hay que pensar en sistemas distribuidos
  - Max 1000 Subrequest Limits (a D1/R2/Fetch/Other Workers)
- Hay que pensar en serverless
- 1 request = 1 server. (Pero de verdad, no como en Lambdas)
- Low-ish Level APIs. (AsyncLocalStorage)
- No FS API.
- Hay que preocuparse de performance.
  - Debe iniciar en menos de 400ms.
  - 128mb de memoria x request.
  - 10mb por Script.

            `,
						image: {
							url: "https://imagedelivery.net/Cus4FWn40G3bInNzY0Wl9A/8d35bab5-7f6b-4726-5cff-1e0d0ec4e500/public",
						},
						design: "two-columns-with-image",
					},
					{
						id: "code-example",
						title: "Code Example",
						subtitle: "Fuck it, lets look at some code",
						topic: "Code Example",
						description: "",
						design: "title",
					},
					{
						id: "11",
						title: "Conclusion and Q&A",
						topic: "Conclusion",
						description: "",
						speakerNotes: "",
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

			if (parsedMessage.type === "consolidate-messages") {
				// Handle consolidate-messages message
				// ...
				console.log("Consolidando");
				const { SinglePresentationAgent } = this.env;
				const agent = await getAgentByName(
					SinglePresentationAgent,
					parsedMessage.slideId,
				);
				const messages = await agent.getMessages();
				const slideContent = await this.getSlide(parsedMessage.slideId);
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
  ${messages
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
									await this.updateSlideContent(slideId, content);
									console.log("FINAL SLIDE", await this.getSlide(slideId));
								},
							}),
						},
					});
				} catch (error) {
					console.log("error in presentation update handling", error);
				}
				return;
			}

			// if (parsedMessage.type === "create-presentation") {
			// 	// Handle create-  message
			// 	// ...
			// 	const { SinglePresentationAgent } = this.env;
			// 	const id = generateId();
			// 	// const createdPresentation = this.createPresentation({
			// 	// 	id,
			// 	// 	description: parsedMessage.description,
			// 	// 	name: parsedMessage.name,
			// 	// });
			// 	const agent = await getAgentByName(SinglePresentationAgent, id);
			// 	agent.initialize({
			// 		type: "init-presentation",
			// 		presentationId: id,
			// 		description: parsedMessage.description,
			// 		name: parsedMessage.name,
			// 	});
			// 	this.setState({
			// 		...this.state,
			// 	});
			// 	this.ctx.waitUntil(agent.generateSlides());
			// }

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
				// await connection.send(
				// 	JSON.stringify(
				// 		AllPresentationsOutputSchema.parse({
				// 			type: "all-presentations",
				// 			data: this.state.presentation,
				// 		}),
				// 	),
				// );
			}
			if (parsedMessage.type === "set-active-slide") {
				this.setState({
					...this.state,
					activeSlide: parsedMessage.id,
				});
			}
			if (parsedMessage.type === "toggle-collaboration") {
				this.setState({
					...this.state,
					config: {
						...this.state.config,
						collaboration: parsedMessage.enabled ? "active" : "inactive",
					},
				});
			}
			// Handle navigate-next-slide message
			if (parsedMessage.type === "navigate-next-slide") {
				const { currentSlideId } = parsedMessage;
				const slides = this.state.presentation.slides;
				const currentIndex = slides.findIndex(
					(slide) => slide.id === currentSlideId,
				);

				if (currentIndex !== -1 && currentIndex < slides.length - 1) {
					// Move to the next slide
					const nextSlideId = slides[currentIndex + 1].id;
					this.setState({
						...this.state,
						activeSlide: nextSlideId,
					});
				}
			}
			// Handle navigate-previous-slide message
			if (parsedMessage.type === "navigate-previous-slide") {
				const { currentSlideId } = parsedMessage;
				const slides = this.state.presentation.slides;
				const currentIndex = slides.findIndex(
					(slide) => slide.id === currentSlideId,
				);

				if (currentIndex > 0) {
					// Move to the previous slide
					const previousSlideId = slides[currentIndex - 1].id;
					this.setState({
						...this.state,
						activeSlide: previousSlideId,
					});
				}
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

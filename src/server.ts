import { type AgentNamespace, routeAgentRequest } from "agents-sdk";
import { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";

import { Chat } from "./agents";
import { audioApp } from "@/api/audio";
export * from "./agents";

// Environment variables type definition
export type Env = {
	OPENAI_API_KEY: string;
	Chat: AgentNamespace<Chat>;
};

// Basic setup
const app = new Hono<{ Bindings: Env }>();

// Add request logging middleware
app.use("*", async (c, next) => {
	const start = Date.now();
	const { method, url } = c.req.raw;
	const path = new URL(url).pathname;

	console.log(`→ ${method} ${path}`);

	await next();

	const ms = Date.now() - start;
	console.log(`← ${method} ${path} - ${c.res.status} (${ms}ms)`);
});

// Auth middleware
app.use(
	"*",
	agentsMiddleware({
		onError: (error) => console.error(error),
		options: {
			onBeforeConnect: async (req) => {
				const token = req.headers.get("authorization");
				// validate token
				if (!token) {
					return new Response("Unauthorized", { status: 401 });
				}
			},
		},
	}),
);

app.route("*", audioApp);

// /**
//  * Worker entry point that routes incoming requests to the appropriate handler
//  */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		console.log("request", request);
		if (!env.OPENAI_API_KEY) {
			console.error(
				"OPENAI_API_KEY is not set, don't forget to set it locally in .dev.vars, and use `wrangler secret bulk .dev.vars` to upload it to production",
			);
			return new Response("OPENAI_API_KEY is not set", { status: 500 });
		}
		return app.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

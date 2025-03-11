import { type AgentNamespace, routeAgentRequest } from "agents-sdk";

import type * as Agents from "./agents";
export * from "./agents";

// Environment variables type definition
export type Env = {
	OPENAI_API_KEY: string;
	Chat: AgentNamespace<Agents.Chat>;
	Presentations: AgentNamespace<Agents.Presentations>;
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		// console.log("env", env);
		// return app.fetch(request, env, ctx);
		// return (
		// 	(await routeAgentRequest(request, env)) ||
		// 	new Response("Not found", { status: 404 })
		// );
		try {
			const url = new URL(request.url);
			console.log("request", url.pathname);
			if (url.pathname.startsWith("/agents")) {
				const response = await routeAgentRequest(request, env);
				if (!response) {
					return new Response("Not found", { status: 404 });
				}
				return response;
			}
		} catch (error) {
			console.error("error", error);
			return new Response("Internal server error", { status: 500 });
		}
		return new Response("Internal server error", { status: 500 });
	},
	// email: emailHandler,
} satisfies ExportedHandler<Env>;

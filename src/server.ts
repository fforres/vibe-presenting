import { type AgentNamespace, routeAgentRequest } from "agents-sdk";

import type * as Agents from "./agents";
import { getImage } from "@/api/image";
export * from "./agents";

// Environment variables type definition
export type Env = {
	AI: Ai;
	OPENAI_API_KEY: string;
	Chat: AgentNamespace<Agents.Chat>;
	Presentations: AgentNamespace<Agents.Presentations>;
	SinglePresentationAgent: AgentNamespace<Agents.SinglePresentationAgent>;
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
			if (url.pathname.startsWith("/agents")) {
				const response = await routeAgentRequest(request, env);
				if (!response) {
					return new Response("Not found", { status: 404 });
				}
				return response;
			}
			if (url.pathname.startsWith("/image")) {
				const encodedPrompt = url.pathname.split("/").at(2);
				const prompt = encodedPrompt ? decodeURIComponent(encodedPrompt) : "";
				if (!prompt) {
					return new Response("Not found", { status: 404 });
				}
				const response = await getImage({
					prompt,
					AI: env.AI,
				});
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

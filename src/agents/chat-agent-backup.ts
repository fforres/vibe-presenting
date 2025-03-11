import { Agent, type Schedule } from "agents-sdk";
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
import type { Env } from "@/server";

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends Agent<Env> {
	/**
	 * Handles incoming chat messages and manages the response stream
	 * @param onFinish - Callback function executed when streaming completes
	 */
	async onChatMessage(onFinish: StreamTextOnFinishCallback<any>) {
		// Create a streaming response that handles both text and tool outputs
		return agentContext.run(this, async () => {
			const dataStreamResponse = createDataStreamResponse({
				execute: async (dataStream) => {
					// Process any pending tool calls from previous messages
					// This handles human-in-the-loop confirmations for tools
					const processedMessages = await processToolCalls({
						messages: this.messages,
						dataStream,
						tools,
						executions,
					});

					// Initialize OpenAI client with API key from environment
					const openai = createOpenAI({
						apiKey: this.env.OPENAI_API_KEY,
						//   baseURL: this.env.GATEWAY_BASE_URL,
					});

					// Stream the AI response using GPT-4
					const result = streamText({
						model: openai("gpt-4o-mini"),
						system: `
              You are a helpful assistant that can do various tasks. If the user asks, then you can also schedule tasks to be executed later. The input may have a date/time/cron pattern to be input as an object into a scheduler The time is now: ${new Date().toISOString()}.
              `,
						messages: processedMessages,
						tools,
						onChunk: (chunk) => {
							console.log("onChunk", chunk);
							// dataStream.append(chunk);
						},
						onError: (error) => {
							console.error("onError", error);
							// onFinish({ error });
						},
						onFinish: (...args) => {
							console.log("onFinish", args);
							onFinish(...args);
						},
						maxSteps: 10,
					});

					// Merge the AI response stream with tool execution outputs
					result.mergeIntoDataStream(dataStream, {
						sendReasoning: true,
						sendSources: true,
						sendUsage: true,
					});
				},
			});

			return dataStreamResponse;
		});
	}
	async executeTask(description: string, task: Schedule<string>) {
		await this.saveMessages([
			...this.messages,
			{
				id: generateId(),
				role: "user",
				content: `scheduled message: ${description}`,
			},
		]);
	}

	createConversation = ({
		id,
		name,
		description,
	}: {
		id: string;
		name: string;
		description: string;
	}) => {
		// this.setState({
		// 	...this.state,
		// 	conversations: [...this.state.conversations, name],
		// });
	};
}

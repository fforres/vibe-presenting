// via https://github.com/vercel/ai/blob/main/examples/next-openai/app/api/use-chat-human-in-the-loop/utils.ts

import { AsyncLocalStorage } from "node:async_hooks";
import type { Chat } from "@/server";
import { type Message, formatDataStreamPart } from "@ai-sdk/ui-utils";
import {
	type DataStreamWriter,
	type ToolExecutionOptions,
	type ToolSet,
	convertToCoreMessages,
} from "ai";
import type { z } from "zod";
import { APPROVAL } from "../shared";

// we use ALS to expose the agent context to the tools
export const agentContext = new AsyncLocalStorage<Chat>();

function isValidToolName<K extends PropertyKey, T extends object>(
	key: K,
	obj: T,
): key is K & keyof T {
	return key in obj;
}

/**
 * Processes tool invocations where human input is required, executing tools when authorized.
 *
 * @param options - The function options
 * @param options.tools - Map of tool names to Tool instances that may expose execute functions
 * @param options.dataStream - Data stream for sending results back to the client
 * @param options.messages - Array of messages to process
 * @param executionFunctions - Map of tool names to execute functions
 * @returns Promise resolving to the processed messages
 */
export async function processToolCalls<
	Tools extends ToolSet,
	ExecutableTools extends {
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		[Tool in keyof Tools as Tools[Tool] extends { execute: Function }
			? never
			: Tool]: Tools[Tool];
	},
>({
	dataStream,
	messages,
	executions,
}: {
	tools: Tools; // used for type inference
	dataStream: DataStreamWriter;
	messages: Message[];
	executions: {
		[K in keyof Tools & keyof ExecutableTools]?: (
			args: z.infer<ExecutableTools[K]["parameters"]>,
			context: ToolExecutionOptions,
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		) => Promise<any>;
	};
}): Promise<Message[]> {
	const lastMessage = messages[messages.length - 1];
	const parts = lastMessage.parts;
	if (!parts) return messages;

	const processedParts = await Promise.all(
		parts.map(async (part) => {
			// Only process tool invocations parts
			if (part.type !== "tool-invocation") return part;

			const { toolInvocation } = part;
			const toolName = toolInvocation.toolName;

			// Only continue if we have an execute function for the tool (meaning it requires confirmation) and it's in a 'result' state
			if (!(toolName in executions) || toolInvocation.state !== "result")
				return part;

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			let result: any | string;

			if (toolInvocation.result === APPROVAL.YES) {
				// Get the tool and check if the tool has an execute function.
				if (
					!isValidToolName(toolName, executions) ||
					toolInvocation.state !== "result"
				) {
					return part;
				}

				const toolInstance = executions[toolName];
				if (toolInstance) {
					result = await toolInstance(toolInvocation.args, {
						messages: convertToCoreMessages(messages),
						toolCallId: toolInvocation.toolCallId,
					});
				} else {
					result = "Error: No execute function found on tool";
				}
			} else if (toolInvocation.result === APPROVAL.NO) {
				result = "Error: User denied access to tool execution";
			} else {
				// For any unhandled responses, return the original part.
				return part;
			}

			// Forward updated tool result to the client.
			dataStream.write(
				formatDataStreamPart("tool_result", {
					toolCallId: toolInvocation.toolCallId,
					result,
				}),
			);

			// Return updated toolInvocation with the actual result.
			return {
				...part,
				toolInvocation: {
					...toolInvocation,
					result,
				},
			};
		}),
	);

	// Finally return the processed messages
	return [...messages.slice(0, -1), { ...lastMessage, parts: processedParts }];
}

// export function getToolsRequiringConfirmation<
//   T extends ToolSet
//   // E extends {
//   //   [K in keyof T as T[K] extends { execute: Function } ? never : K]: T[K];
//   // },
// >(tools: T): string[] {
//   return (Object.keys(tools) as (keyof T)[]).filter((key) => {
//     const maybeTool = tools[key];
//     return typeof maybeTool.execute !== "function";
//   }) as string[];
// }

export const presentationDescription = `This is a presentation about AI agents, and the impact that these agent architectures are going to have in the way that we create software.
You are tasked with developing a presentation that explores new software and application architectures in a future where AI and large language models (LLMs) are ubiquitous.
The presentation should emphasize modern development patterns using technologies like Cloudflare Durable Objects, Cloudflare Agents, and a recently created Agent framework.
These technologies support isolation and componentization of business logic, durable execution (with per-agent SQLite instances), and a streamlined user-data interaction that boosts speed and efficiency.

`;

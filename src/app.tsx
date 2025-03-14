import { useTheme } from "@/features/theme-provider";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import type { Message } from "@ai-sdk/react";
import { useAgentChat } from "agents-sdk/ai-react";
import { Bot, Bug, Moon, Send, Sun, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { tools } from "./agents/tools";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Switch } from "./components/ui/switch";
import { APPROVAL } from "./shared";
// List of tools that require human confirmation
const toolsRequiringConfirmation: (keyof typeof tools)[] = [
	"getWeatherInformation",
];

export default function Chat() {
	const { theme, setTheme } = useTheme();
	const [showDebug, setShowDebug] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Scroll to bottom on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scrollToBottom();
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
	};

	const agent = useSkywardAgent({
		agent: "chat",
	});

	const {
		messages: agentMessages,
		input: agentInput,
		handleInputChange: handleAgentInputChange,
		handleSubmit: handleAgentSubmit,
		addToolResult,
		clearHistory,
	} = useAgentChat({
		agent,
		maxSteps: 5,
		// experimental_prepareRequestBody: ({
		//   messages,
		//   requestData,
		//   requestBody,
		// }) => {
		//   // e.g. only the text of the last message:
		//   return {
		//     message: messages[messages.length - 1],
		//     requestData,
		//     requestBody,
		//   };
		// },
	});

	// Scroll to bottom when messages change
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scrollToBottom();
	}, [agentMessages]);

	const pendingToolCallConfirmation = agentMessages.some((m: Message) =>
		m.parts?.some(
			(part) =>
				part.type === "tool-invocation" &&
				part.toolInvocation.state === "call" &&
				toolsRequiringConfirmation.includes(
					part.toolInvocation.toolName as keyof typeof tools,
				),
		),
	);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	return (
		<div className="h-full w-full p-4 flex justify-center items-center bg-fixed overflow-hidden">
			<div className="w-full mx-auto flex flex-col shadow-xl rounded-md overflow-hidden relative border border-assistant-border/20">
				<div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-background sticky top-0 z-10">
					<div className="flex items-center justify-center h-8 w-8">
						<div className="size-6 shrink-0">
							{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
							<svg
								width="100%"
								height="100%"
								viewBox="0 0 44 66"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								// {...props}
								// ref={ref}
							>
								<path
									d="M21.4211 1.55307C21.6473 0.499667 23.1503 0.499664 23.3765 1.55306L24.9445 8.85485C27.1349 19.0552 33.9736 27.5798 43.3297 31.9614C44.1676 32.3538 44.1676 33.6425 43.3297 34.0349C33.9736 38.4165 27.1349 46.941 24.9445 57.1414L23.3765 64.4432C23.1503 65.4966 21.6473 65.4966 21.4211 64.4432L19.8531 57.1414C17.6627 46.941 10.824 38.4165 1.46787 34.0349C0.62995 33.6425 0.62995 32.3538 1.46787 31.9614C10.824 27.5798 17.6627 19.0552 19.8531 8.85486L21.4211 1.55307Z"
									fill="#FB3F15"
								/>
							</svg>
						</div>
					</div>

					<div className="flex-1">
						<h2 className="font-semibold text-base">Vibe Presenting</h2>
					</div>

					<div className="flex items-center gap-2 mr-2">
						<Bug className="h-4 w-4 text-muted-foreground/50 dark:text-gray-500" />
						<Switch
							checked={showDebug}
							onCheckedChange={setShowDebug}
							aria-label="Toggle debug mode"
							className="data-[state=checked]:bg-gray-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700"
						/>
					</div>

					<Button
						variant="ghost"
						size="icon"
						className="rounded-full h-9 w-9"
						onClick={toggleTheme}
					>
						{theme === "dark" ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="rounded-full h-9 w-9"
						onClick={clearHistory}
					>
						<Trash2 className="h-5 w-5" />
					</Button>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto space-y-4 pb-24">
					{agentMessages.length === 0 && (
						<div className="h-full flex items-center justify-center m-0">
							<Card className="bg-secondary/30 border-secondary/50 p-6 mx-auto">
								<div className="text-center space-y-4">
									<h3 className="font-semibold text-lg">Welcome to AI Chat</h3>
								</div>
							</Card>
						</div>
					)}

					{agentMessages.map((m: Message, index) => {
						const isUser = m.role === "user";
						const showAvatar =
							index === 0 || agentMessages[index - 1]?.role !== m.role;
						const showRole = showAvatar && !isUser;

						return (
							<div key={m.id}>
								{showDebug && (
									<pre className="text-xs text-muted-foreground overflow-scroll">
										{JSON.stringify(m, null, 2)}
									</pre>
								)}
								<div
									className={`flex ${isUser ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`flex gap-2 max-w-[85%] ${
											isUser ? "flex-row-reverse" : "flex-row"
										}`}
									>
										{showAvatar && !isUser ? (
											<Avatar className="h-8 w-8 mt-1 flex-shrink-0">
												<AvatarFallback className="bg-[#F48120] text-white">
													VP
												</AvatarFallback>
											</Avatar>
										) : (
											!isUser && <div className="w-8" />
										)}

										<div>
											<div>
												{m.parts?.map((part, i) => {
													if (part.type === "reasoning") {
														return (
															// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
															<div key={i}>
																<Card
																	className={`p-3 rounded-md ${
																		isUser
																			? "bg-primary text-primary-foreground rounded-br-none"
																			: "rounded-bl-none border-assistant-border"
																	} relative`}
																>
																	<p className="text-sm whitespace-pre-wrap italic">
																		{part.reasoning}
																	</p>
																</Card>
																<p
																	className={`text-xs text-muted-foreground mt-1 ${
																		isUser ? "text-right" : "text-left"
																	}`}
																>
																	{formatTime(
																		new Date(m.createdAt as unknown as string),
																	)}
																</p>
															</div>
														);
													}
													if (part.type === "text") {
														return (
															// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
															<div key={i}>
																<Card
																	className={`p-3 rounded-md ${
																		isUser
																			? "bg-primary text-primary-foreground rounded-br-none"
																			: "rounded-bl-none border-assistant-border"
																	} ${
																		part.text.startsWith("scheduled message")
																			? "border-accent/50"
																			: ""
																	} relative`}
																>
																	{part.text.startsWith(
																		"scheduled message",
																	) && (
																		<span className="absolute -top-3 -left-2 text-base">
																			🕒
																		</span>
																	)}
																	<p className="text-sm whitespace-pre-wrap">
																		{part.text.replace(
																			/^scheduled message: /,
																			"",
																		)}
																	</p>
																</Card>
																<p
																	className={`text-xs text-muted-foreground mt-1 ${
																		isUser ? "text-right" : "text-left"
																	}`}
																>
																	{formatTime(
																		new Date(m.createdAt as unknown as string),
																	)}
																</p>
															</div>
														);
													}

													if (part.type === "tool-invocation") {
														const toolInvocation = part.toolInvocation;
														const toolCallId = toolInvocation.toolCallId;

														if (
															toolsRequiringConfirmation.includes(
																toolInvocation.toolName as keyof typeof tools,
															) &&
															toolInvocation.state === "call"
														) {
															return (
																<Card
																	// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
																	key={i}
																	className="p-4 my-3 bg-secondary/30 border-secondary/50 rounded-md"
																>
																	<div className="flex items-center gap-2 mb-3">
																		<div className="bg-[#F48120]/10 p-1.5 rounded-full">
																			<Bot className="h-4 w-4 text-[#F48120]" />
																		</div>
																		<h4 className="font-medium">
																			{toolInvocation.toolName}
																		</h4>
																	</div>

																	<div className="mb-3">
																		<h5 className="text-xs font-medium mb-1 text-muted-foreground">
																			Arguments:
																		</h5>
																		<pre className="bg-background/80 p-2 rounded-md text-xs overflow-auto">
																			{JSON.stringify(
																				toolInvocation.args,
																				null,
																				2,
																			)}
																		</pre>
																	</div>

																	<div className="flex gap-2 justify-end">
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() =>
																				addToolResult({
																					toolCallId,
																					result: APPROVAL.NO,
																				})
																			}
																		>
																			Reject
																		</Button>
																		<Button
																			variant="default"
																			size="sm"
																			onClick={() =>
																				addToolResult({
																					toolCallId,
																					result: APPROVAL.YES,
																				})
																			}
																		>
																			Approve
																		</Button>
																	</div>
																</Card>
															);
														}
														// return (
														//   <Card
														//     key={i}
														//     className="p-3 rounded-2xl bg-secondary border-secondary"
														//   >
														//     <pre className="text-xs">
														//       {JSON.stringify(toolInvocation, null, 2)}
														//     </pre>
														//   </Card>
														// );
													}
													return null;
													// return (
													//   <div key={i}>
													//     <Card className="p-3 rounded-2xl bg-secondary border-secondary">
													//       <pre className="text-xs">
													//         {JSON.stringify(part, null, 2)}
													//       </pre>
													//     </Card>
													//   </div>
													// );
												})}
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<form
					onSubmit={(e) =>
						handleAgentSubmit(e, {
							data: {
								annotations: {
									hello: "world",
								},
							},
						})
					}
					className="p-3 bg-input-background absolute bottom-0 left-0 right-0 z-10 border-t border-assistant-border/30"
				>
					<div className="flex items-center gap-2">
						<div className="flex-1 relative">
							<Input
								disabled={pendingToolCallConfirmation}
								placeholder={
									pendingToolCallConfirmation
										? "Please respond to the tool confirmation above..."
										: "Type your message..."
								}
								className="pr-10 py-6 rounded-full bg-muted border-muted"
								value={agentInput}
								onChange={handleAgentInputChange}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleAgentSubmit(e as unknown as React.FormEvent);
									}
								}}
							/>
						</div>

						<Button
							type="submit"
							size="icon"
							className="rounded-full h-10 w-10 flex-shrink-0"
							disabled={pendingToolCallConfirmation || !agentInput.trim()}
						>
							<Send className="h-5 w-5" />
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

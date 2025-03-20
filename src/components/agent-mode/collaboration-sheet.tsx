import type { ChatAgentState } from "@/agents/single-presentation-agent";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { SparklesIcon } from "lucide-react";
import { useState } from "react";

export const CollaborationSheet = ({
	slideId,
}: {
	slideId: string;
}) => {
	const { userId, isAdmin } = useAuth();
	const [agentInput, setAgentInput] = useState("");
	const [state, setState] = useState<ChatAgentState | null>(null);
	const agent = useSkywardAgent<ChatAgentState>({
		agent: "single-presentation-agent",
		name: slideId,
		onStateUpdate: (state) => {
			setState(state);
		},
	});

	// const {
	// 	messages: agentMessages,
	// 	input: agentInput,
	// 	handleInputChange: handleAgentInputChange,
	// 	handleSubmit: handleAgentSubmit,
	// 	// addToolResult,
	// 	// clearHistory,
	// } = useAgentChat({
	// 	agent,
	// 	// maxSteps: 5,
	// 	// experimental_prepareRequestBody: ({
	// 	//   messages,
	// 	//   requestData,
	// 	//   requestBody,
	// 	// }) => {
	// 	//   // e.g. only the text of the last message:
	// 	//   return {
	// 	//     message: messages[messages.length - 1],
	// 	//     requestData,
	// 	//     requestBody,
	// 	//   };
	// 	// },
	// });

	const handleSubmit = () => {
		agent.send(
			JSON.stringify({
				type: "message",
				userId,
				isAdmin,
				slideId,
				message: agentInput,
			}),
		);
		setAgentInput("");
	};

	return (
		<Sheet>
			<SheetTrigger className=" z-30 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all border shadow-2xl">
				<SparklesIcon className="h-5 w-5 text-gray-700" />
			</SheetTrigger>
			<SheetContent side="right">
				<div className="p-4 flex flex-col flex-1 gap-4 h-full">
					<h3 className="text-lg font-semibold">Collaboration Mode 🔥</h3>
					<div className="flex flex-col flex-1 space-y-4 overflow-y-auto">
						{state?.messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.isAdmin ? "justify-start" : "justify-end"
								}`}
							>
								<div
									className={`max-w-[80%] rounded-lg p-3 ${
										message.isAdmin
											? "bg-green-500 text-white"
											: "bg-blue-500 text-white"
									}`}
								>
									{message.message}
								</div>
							</div>
						))}
					</div>
					<Textarea
						value={agentInput}
						onChange={(e) => setAgentInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit();
							}
						}}
						className="resize-none"
						placeholder="Que no te quedó claro?"
					/>
					<div className="flex justify-end pt-4">
						<Button onClick={handleSubmit}>Send</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

import { ToggleCollaborationInputSchema } from "@/agents/message-schemas";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { AlertTriangleIcon, SparkleIcon, UsersIcon } from "lucide-react";
import * as React from "react";

interface SettingsModalProps {
	agent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	collaborationEnabled: boolean;
}

export function SettingsModal({
	agent,
	open,
	onOpenChange,
	collaborationEnabled,
}: SettingsModalProps) {
	const [isCollaborationEnabled, setIsCollaborationEnabled] =
		React.useState(collaborationEnabled);

	React.useEffect(() => {
		setIsCollaborationEnabled(collaborationEnabled);
	}, [collaborationEnabled]);

	const handleToggleCollaboration = () => {
		const newValue = Boolean(isCollaborationEnabled);
		setIsCollaborationEnabled(newValue);

		agent?.send(
			JSON.stringify(
				ToggleCollaborationInputSchema.parse({
					type: "toggle-collaboration",
					enabled: newValue,
				}),
			),
		);

		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle
						className="text-center text-xl font-bold"
						style={{ fontFamily: "'Comic Sans MS', cursive" }}
					>
						<span style={{ color: "#FF0000" }}>V</span>
						<span style={{ color: "#FF7F00" }}>i</span>
						<span style={{ color: "#FFFF00" }}>b</span>
						<span style={{ color: "#00FF00" }}>e</span>
						<span> </span>
						<span style={{ color: "#0000FF" }}>S</span>
						<span style={{ color: "#4B0082" }}>e</span>
						<span style={{ color: "#9400D3" }}>t</span>
						<span style={{ color: "#FF0000" }}>t</span>
						<span style={{ color: "#FF7F00" }}>i</span>
						<span style={{ color: "#FFFF00" }}>n</span>
						<span style={{ color: "#00FF00" }}>g</span>
						<span style={{ color: "#0000FF" }}>s</span>
					</DialogTitle>
					<DialogDescription className="text-center">
						Configure your presentation collaboration settings
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="flex items-center justify-between p-4 border rounded-md bg-gradient-to-r from-blue-50 to-purple-50">
						<div className="flex flex-col gap-1">
							<Label
								htmlFor="collaboration-mode"
								className="text-base font-medium flex items-center gap-2"
							>
								<UsersIcon className="h-5 w-5 text-indigo-600" />
								Agent Mode
							</Label>
							<p className="text-sm text-gray-500">
								Enable vibe-presenting's agent mode.
							</p>
						</div>
						<Switch
							id="collaboration-mode"
							checked={isCollaborationEnabled}
							onCheckedChange={() =>
								setIsCollaborationEnabled(!isCollaborationEnabled)
							}
							className="data-[state=checked]:bg-indigo-600"
						/>
					</div>
					{/*
					{isCollaborationEnabled && (
						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
							<p className="text-sm text-yellow-700 flex items-center gap-2">
								<AlertTriangleIcon />
								Allow users to "interact" the presentation
							</p>
						</div>
					)} */}

					<div className="flex items-center justify-between p-4 border rounded-md bg-gradient-to-r from-blue-50 to-purple-50">
						<div className="flex flex-col gap-1">
							<Label
								htmlFor="collaboration-mode"
								className="text-base font-medium flex items-center gap-2"
							>
								<SparkleIcon className="h-5 w-5 text-indigo-600" />
								90's/GeoCities Mode
							</Label>
							<p className="text-sm text-gray-500">
								Enable vibe-presenting's 90's/GeoCities mode.
							</p>
						</div>

						<Switch
							id="collaboration-mode"
							checked={true}
							disabled
							onCheckedChange={() =>
								setIsCollaborationEnabled(!isCollaborationEnabled)
							}
							className="data-[state=checked]:bg-indigo-600"
						/>
					</div>
				</div>

				<DialogFooter className="flex flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						onClick={handleToggleCollaboration}
						className="w-full sm:w-auto bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500"
					>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

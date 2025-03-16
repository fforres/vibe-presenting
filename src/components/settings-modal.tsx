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
import { Input } from "@/components/ui/input";
import type { useSkywardAgent } from "@/hooks/use-skyward-agent";
import {
	LogInIcon,
	LogOutIcon,
	MoonIcon,
	SparkleIcon,
	SunIcon,
	UsersIcon,
	type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { useTheme } from "@/features/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";

interface SettingsModalProps {
	agent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	collaborationEnabled: boolean;
}

// New component for settings item
function SettingsItem({
	id,
	icon: Icon,
	title,
	description,
	checked,
	onCheckedChange,
	disabled = false,
	className = "",
}: {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
	checked: boolean;
	onCheckedChange: () => void;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<div
			className={`flex items-center justify-between p-4 border rounded-md bg-accent ${className}`}
		>
			<div className="flex flex-col gap-1">
				<Label
					htmlFor={id}
					className="text-base font-medium flex items-center gap-2"
				>
					<Icon className="size-5 text-indigo-600" />
					{title}
				</Label>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					{description}
				</p>
			</div>
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={onCheckedChange}
				disabled={disabled}
				className={disabled ? "data-[state=checked]:bg-indigo-600" : ""}
			/>
		</div>
	);
}

// New component for login
function LoginSection() {
	const { isLoggedIn, username, login, logout } = useAuth();
	const [inputUsername, setInputUsername] = React.useState("");
	const [error, setError] = React.useState("");

	const handleLogin = () => {
		if (!inputUsername.trim()) {
			setError("Please enter a username");
			return;
		}

		const success = login(inputUsername);
		if (!success) {
			setError("Login failed");
		} else {
			setError("");
			setInputUsername("");
		}
	};

	return (
		// className={`flex items-center justify-between p-4 border rounded-md ${className}`}

		<div className="flex flex-col gap-4 p-4 border rounded-md bg-accent">
			{isLoggedIn ? (
				<>
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<Label className="text-base font-medium flex items-center gap-2">
								<LogInIcon className="size-5 text-green-600" />
								Logged In
							</Label>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Welcome back, <span className="font-bold">{username}</span>!
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={logout}
							className="flex items-center gap-1"
						>
							<LogOutIcon className="h-4 w-4" />
							Logout
						</Button>
					</div>
				</>
			) : (
				<>
					<div className="flex flex-col">
						<Label
							htmlFor="username-input"
							className="text-base font-medium flex items-center gap-2 mb-2"
						>
							<LogInIcon className="size-5 text-indigo-600 " />
							Login
						</Label>
						<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
							Enter the super secret password to login
						</p>

						<div className="flex flex-col gap-2">
							<div className="flex gap-2">
								<Input
									id="username-input"
									value={inputUsername}
									onChange={(e) => setInputUsername(e.target.value)}
									placeholder="Enter username"
									className="flex-1"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleLogin();
										}
									}}
								/>
								<Button onClick={handleLogin} variant="outline">
									Login
								</Button>
							</div>
							{error && <p className="text-sm text-red-500">{error}</p>}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export function SettingsModal({
	agent,
	open,
	onOpenChange,
	collaborationEnabled,
}: SettingsModalProps) {
	const [isCollaborationEnabled, setIsCollaborationEnabled] =
		React.useState(collaborationEnabled);
	const { theme, setTheme } = useTheme();
	const isDarkMode = theme === "dark";
	const { isLoggedIn } = useAuth();

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

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
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
					{/* Login Section */}
					<SettingsItem
						id="collaboration-mode"
						icon={UsersIcon}
						title="Agent Mode"
						description="Enable vibe-presenting's agent mode."
						checked={isCollaborationEnabled}
						onCheckedChange={() =>
							setIsCollaborationEnabled(!isCollaborationEnabled)
						}
					/>

					<SettingsItem
						id="theme-mode"
						icon={theme === "dark" ? MoonIcon : SunIcon}
						title={`${theme === "dark" ? "Dark" : "Light"} Mode`}
						description="Toggle between light and dark theme."
						checked={theme === "dark"}
						onCheckedChange={toggleTheme}
					/>

					<SettingsItem
						id="geocities-mode"
						icon={SparkleIcon}
						title="90's/GeoCities Mode"
						description="Enable vibe-presenting's 90's/GeoCities mode."
						checked={true}
						onCheckedChange={() =>
							setIsCollaborationEnabled(!isCollaborationEnabled)
						}
						disabled={true}
					/>
					<Separator />
					<LoginSection />
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
						variant="geocities"
						className="w-full sm:w-auto"
					>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

import { SetActiveSlideInputSchema } from "@/agents/message-schemas";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import { CreatePresentationModal } from "@/components/create-presentation-modal";
import { RainbowText } from "@/components/rainbow-text";
import { SettingsModal } from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useTheme } from "@/features/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import type { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { cn } from "@/lib/utils";
import { SettingsIcon } from "lucide-react";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

// New components for sidebar buttons
const SidebarMainButton = ({
	title,
	isActive,
	onClick,
	showBlink = false,
}: {
	title: string;
	isActive: boolean;
	onClick?: () => void;
	showBlink?: boolean;
}) => {
	const { theme } = useTheme();
	const isDarkMode = theme === "dark";

	return (
		<Button
			variant={"ghost"}
			className={cn("font-medium w-full justify-start mb-1 relative", {
				"cursor-pointer": !!onClick,
				"cursor-default": !onClick,
				"bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300":
					isActive,
			})}
			style={{
				fontFamily: "'Times New Roman', serif",
				color: isActive ? "#9400D3" : isDarkMode ? "#4D9FFF" : "#0000EE",
				textDecoration: "none",
			}}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					onClick?.();
				}
			}}
		>
			{title}
			{title === "New Presentation" && showBlink && (
				<span className="absolute right-2 top-2 text-xs text-red-600">
					NEW!
				</span>
			)}
		</Button>
	);
};

const SidebarSubButton = ({
	title,
	isActive,
	onClick,
}: {
	title: string;
	isActive: boolean;
	onClick: () => void;
}) => {
	const { theme } = useTheme();
	const isDarkMode = theme === "dark";

	return (
		<Button
			variant={isActive ? "default" : "ghost"}
			size="sm"
			className={cn(
				"font-medium mb-0.5",
				isActive &&
					"bg-gradient-to-r from-yellow-100 to-green-100 border border-yellow-300",
			)}
			style={{
				fontFamily: "'Arial', sans-serif",
				color: isActive ? "#9400D3" : isDarkMode ? "#4D9FFF" : "#0000EE",
				textDecoration: isActive ? "none" : "underline",
			}}
			onClick={onClick}
		>
			{title}
			{isActive && <span className="ml-1">👈</span>}
		</Button>
	);
};

export function AppSidebar({
	state,
	agent,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	state: PresentationAgentState;
	agent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>;
}) {
	const { isAdmin } = useAuth();
	const { theme, setTheme } = useTheme();
	const [showBlink, setShowBlink] = useState(true);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [settingsModalOpen, setSettingsModalOpen] = useState(false);

	// Toggle blinking elements for 90s effect
	useEffect(() => {
		const timer = setInterval(() => {
			setShowBlink((prev) => !prev);
		}, 800);

		return () => clearInterval(timer);
	}, []);

	const setActiveSlide = useCallback(
		(id: string | null) => {
			if (!isAdmin) {
				return;
			}
			agent?.send(
				JSON.stringify(
					SetActiveSlideInputSchema.parse({ type: "set-active-slide", id }),
				),
			);
		},
		[agent, isAdmin],
	);

	const data = useMemo(() => {
		return {
			navMain: [
				{
					title: "Home",
					isActive: state.activeSlide === null && !createModalOpen,
					onClick: () => {
						setActiveSlide(null);
					},
				},
				{
					title: "Slides",
					items: state.presentation.slides.map((slide) => ({
						id: slide.id,
						title: slide.topic,
						isActive: state.activeSlide === slide.id,
					})),
				},
			],
		};
	}, [state.presentation, state.activeSlide, createModalOpen, setActiveSlide]);

	const isDarkMode = theme === "dark";

	return (
		<>
			<CreatePresentationModal
				agent={agent}
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
			/>
			<SettingsModal
				agent={agent}
				open={settingsModalOpen}
				onOpenChange={setSettingsModalOpen}
				collaborationEnabled={false}
			/>
			<Sidebar
				{...props}
				variant="sidebar"
				collapsible="offcanvas"
				className="border-r-4 border-dashed pr-2"
				style={{
					borderImageSource:
						"linear-gradient(to bottom, #FF00FF, #00FFFF, #FFFF00)",
					borderImageSlice: 1,
					background: "linear-gradient(135deg, #f5f5f5, #e0e0ff)",
				}}
			>
				<SidebarHeader className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 border-b-2 border-black">
					<div className="flex items-center gap-2 justify-start p-2">
						<Button
							variant="link"
							className="px-2 py-2 m-0 relative group"
							style={{
								fontFamily: "'Comic Sans MS', cursive",
								fontSize: "1.25rem",
								fontWeight: "bold",
								color: "#FFFFFF",
								textShadow: "2px 2px 0 #000000",
							}}
							onClick={() => {
								setActiveSlide(null);
							}}
						>
							<span className="relative z-10">
								<RainbowText text="Vibe Presenting" />
							</span>
							{/* Animated stars on hover */}
							<span className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
								{showBlink && (
									<span className="absolute -top-1 -left-2 text-yellow-300">
										★
									</span>
								)}
								{!showBlink && (
									<span className="absolute -bottom-1 -right-2 text-yellow-300">
										★
									</span>
								)}
							</span>
						</Button>
					</div>

					{/* Hit counter */}
					<div className="flex justify-center mb-2">
						<div
							className="bg-black text-white text-xs px-2 py-1"
							style={{ fontFamily: "monospace" }}
						>
							Visitors: {state.connectionCount}
						</div>
					</div>
				</SidebarHeader>

				<SidebarContent className="relative">
					<SidebarGroup>
						<SidebarMenu>
							{data.navMain.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<SidebarMainButton
											title={item.title}
											isActive={item.isActive ?? false}
											onClick={item?.onClick}
											showBlink={showBlink}
										/>
									</SidebarMenuButton>
									{item.items?.map((presentation) => (
										<SidebarMenuSub key={presentation.id}>
											<SidebarMenuSubItem key={presentation.id}>
												<SidebarMenuSubButton asChild>
													<SidebarSubButton
														title={presentation.title}
														isActive={presentation.isActive}
														onClick={() => {
															setActiveSlide(presentation.id);
														}}
													/>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									))}
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>

				<SidebarRail className="bg-gradient-to-b from-gray-300 to-gray-400 border-r border-l border-gray-500" />

				<SidebarFooter className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 border-t-2 border-black">
					<SidebarMenu className="flex flex-row justify-between items-center gap-2">
						<SidebarMenuItem className="flex-1">
							<SidebarMenuButton size="lg" asChild>
								<a
									href="https://skyward.ai"
									target="_blank"
									rel="noreferrer"
									className="bg-white/50 hover:bg-white/70 py-1 rounded border border-gray-400 px-4"
								>
									<span className="font-medium inline-flex items-center gap-1 justify-center text-black">
										By
										<div className="size-5 shrink-0">
											{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
											<svg
												width="100%"
												height="100%"
												viewBox="0 0 44 66"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
												className={showBlink ? "animate-pulse" : ""}
											>
												<path
													d="M21.4211 1.55307C21.6473 0.499667 23.1503 0.499664 23.3765 1.55306L24.9445 8.85485C27.1349 19.0552 33.9736 27.5798 43.3297 31.9614C44.1676 32.3538 44.1676 33.6425 43.3297 34.0349C33.9736 38.4165 27.1349 46.941 24.9445 57.1414L23.3765 64.4432C23.1503 65.4966 21.6473 65.4966 21.4211 64.4432L19.8531 57.1414C17.6627 46.941 10.824 38.4165 1.46787 34.0349C0.62995 33.6425 0.62995 32.3538 1.46787 31.9614C10.824 27.5798 17.6627 19.0552 19.8531 8.85486L21.4211 1.55307Z"
													fill="#FB3F15"
												/>
											</svg>
										</div>{" "}
										<span>Skyward</span>
									</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full size-10 cursor-pointer bg-white/50 hover:bg-white/70"
								onClick={() => setSettingsModalOpen(true)}
							>
								<SettingsIcon className="size-5 text-black" />
							</Button>
						</SidebarMenuItem>
					</SidebarMenu>

					{/* 90s copyright notice */}
					<div
						className="text-[10px] text-center mt-2 mb-1 text-white"
						style={{ fontFamily: "monospace", textShadow: "1px 1px 1px #000" }}
					>
						Copyright © 1997 <br />
						Made with Microsoft's Frontpage
					</div>
				</SidebarFooter>
			</Sidebar>

			{/* Add this to your CSS for any custom animations */}
			<style>{`
        @keyframes blink {
          0%,
          49% {
            opacity: 0;
          }
          50%,
          100% {
            opacity: 1;
          }
        }
      `}</style>
		</>
	);
}

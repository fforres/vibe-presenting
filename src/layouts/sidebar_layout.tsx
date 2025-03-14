import { PresentationsInitInputSchema } from "@/agents/message-schemas";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import type { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { useEffect, useState } from "react";
import { AppSidebar } from "~/components/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "~/components/ui/sidebar";

export default function SidebarLayout({
	children,
	state,
	agent,
}: {
	children: React.ReactNode;
	state: PresentationAgentState;
	agent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>;
}) {
	// For the blinking text effect
	const [showBlink, setShowBlink] = useState(true);

	// Toggle blinking text visibility for 90s effect
	useEffect(() => {
		const timer = setInterval(() => {
			setShowBlink((prev) => !prev);
		}, 800);

		return () => clearInterval(timer);
	}, []);

	return (
		<SidebarProvider>
			<AppSidebar state={state} agent={agent} />
			<SidebarInset className="@container">
				{/* 90s style header with gradient background */}
				<header
					className="flex h-16 shrink-0 items-center gap-2 border-b relative overflow-hidden"
					style={{
						background: "linear-gradient(to right, #00BFFF, #9370DB, #FF69B4)",
						borderBottom: "3px ridge #C0C0C0",
					}}
				>
					{/* Background pattern - subtle tiled stars */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage:
								"url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDJsMiA2aDZ2LTZoLTh6bTAgMTZsLTItNmgtNnY2aDh6IiBmaWxsPSIjZmZmIi8+PC9zdmc+')",
							backgroundRepeat: "repeat",
						}}
					/>

					<div className="flex items-center gap-2 px-3 z-10">
						{/* Custom styled sidebar trigger */}
						<div className="relative">
							<SidebarTrigger className="bg-yellow-300 hover:bg-yellow-400 border-2 border-black text-black" />
							{showBlink && (
								<span
									className="absolute -top-1 -right-1 text-xs font-bold"
									style={{
										color: "#FF0000",
										textShadow: "0 0 2px #FFFFFF",
									}}
								>
									★
								</span>
							)}
						</div>

						<Separator
							orientation="vertical"
							className="mr-2 h-4 bg-white/50"
						/>

						{/* Styled breadcrumb */}
						<Breadcrumb>
							<BreadcrumbList className="bg-white/80 px-2 py-1 rounded border border-gray-400">
								{state.activeSlide ? (
									<>
										<BreadcrumbItem className="hidden md:block">
											<BreadcrumbLink
												href="#"
												className="text-blue-800 hover:text-blue-600 font-bold underline"
												style={{ fontFamily: "'Times New Roman', serif" }}
											>
												Presentation
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator className="hidden md:block text-purple-800">
											→
										</BreadcrumbSeparator>
										<BreadcrumbItem>
											<BreadcrumbPage
												className="font-bold"
												style={{
													fontFamily: "'Comic Sans MS', cursive",
													color: "#9400D3",
												}}
											>
												{
													state.presentation.slides.find(
														(slide) => slide.id === state.activeSlide,
													)?.title
												}
												{showBlink && (
													<span className="ml-1 text-red-600 animate-pulse">
														!
													</span>
												)}
											</BreadcrumbPage>
										</BreadcrumbItem>
									</>
								) : (
									<BreadcrumbPage
										className="font-bold"
										style={{
											fontFamily: "'Comic Sans MS', cursive",
											color: "#9400D3",
										}}
									>
										{state.presentation.name}
										{showBlink && (
											<span className="ml-1 text-red-600 animate-pulse">!</span>
										)}
									</BreadcrumbPage>
								)}
							</BreadcrumbList>
						</Breadcrumb>
					</div>

					{/* 90s visitor counter in header */}
					<div className="ml-auto mr-4 flex items-center">
						<div
							className="bg-black text-white text-xs px-2 py-1 border border-white"
							style={{ fontFamily: "monospace" }}
						>
							Last updated: {new Date().toLocaleDateString()}
						</div>
					</div>
				</header>

				{/* Content area with subtle background */}
				<div
					className="flex flex-1 flex-col gap-4 p-4"
					style={{
						background: "linear-gradient(to bottom, #FFFFFF, #F0F8FF)",
						backgroundImage:
							"url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI0YwRjhGRiIvPjwvc3ZnPg==')",
						backgroundRepeat: "repeat",
						backgroundBlendMode: "overlay",
					}}
				>
					{children}
				</div>

				{/* 90s footer */}
				<footer
					className="h-8 border-t flex items-center justify-center text-xs"
					style={{
						borderTop: "3px ridge #C0C0C0",
						background: "linear-gradient(to right, #00BFFF, #9370DB, #FF69B4)",
						fontFamily: "'Times New Roman', serif",
						color: "white",
						textShadow: "1px 1px 1px #000",
					}}
				>
					<div className="flex items-center gap-2">
						<span>© 1999 Vibe Presenting</span>
						<span>|</span>
						<span>Best viewed in 800×600</span>
						<span>|</span>
						<span className={showBlink ? "visible" : "invisible"}>
							Under Construction
						</span>
					</div>
				</footer>
			</SidebarInset>

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
		</SidebarProvider>
	);
}

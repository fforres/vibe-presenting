import type { PresentationAgentState } from "@/agents/presentations-agent";

export const Index = ({ state }: { state: PresentationAgentState }) => {
	return (
		<div className="w-full max-w-3xl mx-auto p-3 sm:p-6 space-y-6">
			{/* Animated rainbow border - responsive padding */}
			<div
				className="border-4 sm:border-8 border-dashed p-2 sm:p-4"
				style={{
					borderImageSource:
						"linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)",
					borderImageSlice: 1,
				}}
			>
				<div className="text-center">
					{/* Retro font and styling - responsive text size */}
					<h1
						className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 break-words"
						style={{
							fontFamily: "'Comic Sans MS', cursive, sans-serif",
							color: "#FF00FF",
							textShadow: "1px 1px 0 #00FFFF, 2px 2px 0 #0000FF",
							letterSpacing: "1px",
							lineHeight: "1.2",
						}}
					>
						<span style={{ color: "red" }}>V</span>
						<span style={{ color: "orange" }}>i</span>
						<span style={{ color: "yellow" }}>b</span>
						<span style={{ color: "green" }}>e</span>
						<span> </span>
						<span style={{ color: "blue" }}>P</span>
						<span style={{ color: "indigo" }}>r</span>
						<span style={{ color: "violet" }}>e</span>
						<span style={{ color: "red" }}>s</span>
						<span style={{ color: "orange" }}>e</span>
						<span style={{ color: "yellow" }}>n</span>
						<span style={{ color: "green" }}>t</span>
						<span style={{ color: "blue" }}>i</span>
						<span style={{ color: "indigo" }}>n</span>
						<span style={{ color: "violet" }}>g</span>
					</h1>
					{/* Fixed marquee element - continuous animation */}
					<div className="overflow-hidden mb-2 sm:mb-4 py-1">
						<div className="marquee-container">
							<span
								className="text-base sm:text-xl font-bold inline-block whitespace-nowrap"
								style={{ color: "#FF0000" }}
							>
								★★★ Welcome to Vibe Presenting! The BEST presentation tool on
								the web! ★★★ Welcome to Vibe Presenting! The Bestest
								presentation tool on the web! ★★★
							</span>
						</div>
					</div>

					<p
						className="mb-3 sm:mb-6 font-bold text-sm sm:text-base px-2 leading-relaxed"
						style={{ fontFamily: "'Courier New', monospace" }}
					>
						Vibe Presenting is a{" "}
						<span
							style={{
								color: "#FF00FF",
								backgroundColor: "#00FFFF",
								padding: "3px",
							}}
						>
							RADICAL
						</span>{" "}
						tool that helps you create and manage{" "}
						<span
							style={{
								color: "#00FFFF",
								backgroundColor: "#FF00FF",
								padding: "3px",
							}}
						>
							AWESOME
						</span>{" "}
						presentations!
					</p>

					{/* Hit counter and visitor stats - responsive layout */}
					<div className="flex flex-wrap justify-center items-center gap-2 mb-3 sm:mb-4">
						<div
							className="bg-black text-white px-2 py-1 text-xs"
							style={{ fontFamily: "monospace" }}
						>
							Visitors: {state.connectionCount}
						</div>
						<div className="bg-gray-200 border border-gray-400 px-2 py-1 text-xs">
							Last updated: {new Date().toLocaleDateString()}
						</div>
					</div>

					{/* Under construction gif - responsive sizing */}
					<div className="flex justify-center mb-3 sm:mb-4">
						<div className="bg-yellow-300 px-2 sm:px-4 py-1 sm:py-2 border-2 border-black animate-pulse">
							<span
								className="font-bold text-sm sm:text-base"
								style={{ fontFamily: "'Comic Sans MS', cursive" }}
							>
								🚧 UNDER CONSTRUCTION 🚧
							</span>
						</div>
					</div>

					{/* Guestbook link - responsive text and layout */}
					<div className="mb-3 sm:mb-6 flex flex-wrap justify-center gap-2">
						<a
							// biome-ignore lint/a11y/useValidAnchor: <explanation>
							href="#"
							className="text-blue-600 underline hover:no-underline text-sm sm:text-base"
							style={{ fontFamily: "'Times New Roman', serif" }}
						>
							📝 Sign our guestbook!
						</a>
						<span className="hidden sm:inline mx-2">|</span>
						<a
							href="mailto:felipe@skyward.ai"
							className="text-blue-600 underline hover:no-underline text-sm sm:text-base"
							style={{ fontFamily: "'Times New Roman', serif" }}
						>
							📧 Email the webmaster
						</a>
					</div>
				</div>
			</div>

			{/* Updated CSS for continuous marquee animation */}
			<style>{`
        .marquee-container {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-scroll 20s linear infinite;
        }

        @keyframes marquee-scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @media (max-width: 640px) {
          .marquee-container {
            animation: marquee-scroll 15s linear infinite;
          }
        }
      `}</style>
		</div>
	);
};

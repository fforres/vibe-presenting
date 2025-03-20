import type { PresentationAgentState } from "@/agents/presentations-agent";
import { RainbowText } from "@/components/rainbow-text";

export const Index = ({ state }: { state: PresentationAgentState }) => {
	return (
		<div className="w-full max-w-3xl mx-auto space-y-6 flex flex-col justify-center h-full">
			{/* Animated rainbow border - responsive padding */}
			<div
				className="border-4 @sm:border-8 border-dashed py-8 text-center"
				style={{
					borderImageSource:
						"conic-gradient(from var(--angle), red, orange, yellow, green, blue, indigo, violet, red)",
					borderImageSlice: 1,
					borderImageWidth: "10px",
					animation: "rotate-border 6s linear infinite",
				}}
			>
				{/* Retro font and styling - responsive text size */}
				<h1
					className="text-4xl @sm:text-6xl font-bold mb-4 @sm:mb-6 break-words px-6"
					style={{
						fontFamily: "'Comic Sans MS', cursive, sans-serif",
						textShadow: "1px 1px 0 #00FFFF, 2px 2px 0 #0000FF",
						letterSpacing: "1px",
						lineHeight: "1.2",
					}}
				>
					<RainbowText text="Vibe Presenting" animated />
				</h1>
				{/* Fixed marquee element - continuous animation */}
				<div className="overflow-hidden mb-4 @sm:mb-6 py-1">
					<div className="marquee-container">
						<span
							className="text-base @sm:text-xl font-bold inline-block whitespace-nowrap"
							style={{ color: "#FF0000" }}
						>
							★★★ Welcome to Vibe Presenting! The Bestest presentation tool on
							the The Information Superhighway ! ★★★ Welcome to Vibe Presenting!
							The Bestest presentation tool on the Cybesrpace! ★★★
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-4 px-4">
					<p
						className="mb-4 @sm:mb-6 font-bold text-xl leading-relaxed"
						style={{ fontFamily: "'Courier New', monospace" }}
					>
						Vibe Presenting is a{" "}
						<span
							style={{
								color: "#FF00FF",
								backgroundColor: "#00FFFF",
								padding: "4px",
							}}
						>
							RADICAL
						</span>{" "}
						<span
							style={{
								color: "#00FFFF",
								backgroundColor: "#FF00FF",
								padding: "4px",
							}}
						>
							(& IN PROGRESS)
						</span>{" "}
						tool that helps you create, manage and adapt presentations using AI
						Agents.
					</p>

					{/* Hit counter and visitor stats - responsive layout */}
					<div className="flex flex-wrap justify-center text-base items-center gap-2 mb-4 @sm:mb-6">
						<div
							className="bg-black text-white px-2 py-1"
							style={{ fontFamily: "monospace" }}
						>
							Visitors: {state.connectionCount}
						</div>
						<div className=" border bg-accent-foreground text-secondary px-2 py-1">
							Last updated: {new Date().toLocaleDateString()}
						</div>
					</div>

					{/* Under construction gif - responsive sizing */}
					<div className="flex justify-center mb-3 @sm:mb-4">
						<div className="bg-yellow-300 px-2 @sm:px-4 py-1 @sm:py-2 border-2 border-black">
							<span
								className="font-bold text-sm @sm:text-base text-red-600"
								style={{ fontFamily: "'Comic Sans MS', cursive" }}
							>
								🚧 UNDER CONSTRUCTION 🚧
							</span>
						</div>
					</div>

					{/* Guestbook link - responsive text and layout */}
					<div className="mb-3 @sm:mb-6 flex flex-wrap justify-center gap-2">
						<a
							// biome-ignore lint/a11y/useValidAnchor: <explanation>
							href="#"
							className="text-blue-600 underline hover:no-underline text-sm @sm:text-base"
						>
							📝 Sign our guestbook!
						</a>
						<span className="hidden @sm:inline mx-2">|</span>
						<a
							href="mailto:felipe@skyward.ai"
							className="text-blue-600 underline hover:no-underline text-sm @sm:text-base"
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

        @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
        }

        @keyframes rotate-border {
            to {
                --angle: 360deg;
            }
        }
      `}</style>
		</div>
	);
};

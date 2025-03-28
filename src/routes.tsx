import {
	OutgoingMessageSchema,
	PresentationsInitInputSchema,
} from "@/agents/message-schemas";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import SidebarLayout from "@/layouts/sidebar_layout";
import { Index } from "@/routes/index";
import { SingleSlide } from "@/routes/slide";
import { useEffect, useState } from "react";
export const DynamicRouteChange = () => {
	const [state, setState] = useState<PresentationAgentState | null>(null);
	const agent = useSkywardAgent({
		agent: "presentations",
		onStateUpdate(state: PresentationAgentState) {
			console.log("YOOOOOO UPDATED STATE", state);
			setState(state);
		},
		onOpen() {
			agent?.send(
				JSON.stringify(
					PresentationsInitInputSchema.parse({
						type: "presentations-init",
					}),
				),
			);
		},
		// onMessage(message) {
		// 	const parsedMessage = OutgoingMessageSchema.parse(
		// 		JSON.parse(message.data),
		// 	);
		// 	console.log("PARSED MESSAGE", parsedMessage);
		// 	if (parsedMessage.type === "initial-connections") {
		// 		setState((prev) => {
		// 			if (!prev) {
		// 				return null;
		// 			}
		// 			return {
		// 				...prev,
		// 				connectionCount: parsedMessage.data.connectionCount,
		// 			};
		// 		});
		// 	}
		// 	if (parsedMessage.type === "updated-slide") {
		// 		setState((prev) => {
		// 			if (!prev) {
		// 				return null;
		// 			}
		// 			return {
		// 				...prev,
		// 				presentation: {
		// 					...prev.presentation,
		// 					slides: prev.presentation.slides.map((slide) =>
		// 						slide.id === parsedMessage.data.slideId
		// 							? parsedMessage.data.slide
		// 							: slide,
		// 					),
		// 				},
		// 			};
		// 		});
		// 	}
		// },
	});

	useEffect(() => {
		// preload every image in the presentation slides.
		if (state?.presentation?.slides) {
			for (const slide of state.presentation.slides) {
				if (slide.design === "full-size-image" && slide.image.url) {
					const image = new Image();
					image.src = slide.image.url;
				}
			}
		}
	}, [state?.presentation?.slides]);

	if (!state) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center p-6 border-4 border-yellow-400 border-dashed rounded-lg">
					<div className="mx-auto mb-4">
						<img
							src="https://media.tenor.com/MRCIli40TYoAAAAj/under-construction90s-90s.gif"
							alt="Under Construction"
							className="h-16 mx-auto mb-2"
						/>
						<div className="animate-pulse h-8 w-8 bg-red-500 rounded-full mx-auto mb-2" />
					</div>
					<h2 className="text-xl font-bold text-yellow-300 mb-2">
						⚡ LOADING YOUR CONTENT ⚡
					</h2>
					<p className="text-cyan-400 font-bold">
						<span className="animate-pulse">★</span> Please wait while we
						prepare your experience... <span className="animate-pulse">★</span>
					</p>
					<div className="w-full py-1 mb-2 sm:mb-4">
						<div className="marquee-container">
							<span
								className="text-xs sm:text-sm font-bold inline-block whitespace-nowrap"
								style={{ color: "#FF0000" }}
							>
								★★★ Best viewed in Netscape Navigator 4.0 at 800x600 resolution
								★★★
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
	return (
		<SidebarLayout state={state} agent={agent}>
			{state.activeSlide ? (
				<SingleSlide
					id={state.activeSlide}
					generalState={state}
					slidesAgent={agent}
				/>
			) : (
				<Index state={state} />
			)}
		</SidebarLayout>
	);
};

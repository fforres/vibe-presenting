import { useEffect } from "react";
import type { useSkywardAgent } from "@/hooks/use-skyward-agent";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import {
	NavigateNextSlideInputSchema,
	NavigatePreviousSlideInputSchema,
	SetActiveSlideInputSchema,
} from "@/agents/message-schemas";

/**
 * Hook to handle keyboard navigation for presentations
 * Captures left/right arrow keys to navigate between slides
 *
 * @param generalState The current presentation state
 * @param slidesAgent The agent instance returned by useSkywardAgent
 * @param enabled Whether keyboard navigation is enabled
 */
export function usePresentationKeyboardNavigation(
	generalState: PresentationAgentState,
	slidesAgent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>,
	enabled = true,
) {
	const currentSlideId = generalState.activeSlide;

	useEffect(() => {
		if (!enabled || !currentSlideId) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			// Handle right arrow key for next slide
			if (event.key === "ArrowRight") {
				slidesAgent.send(
					JSON.stringify(
						NavigateNextSlideInputSchema.parse({
							type: "navigate-next-slide",
							currentSlideId,
						} satisfies typeof NavigateNextSlideInputSchema._type),
					),
				);
			}
			// Handle left arrow key for previous slide
			else if (event.key === "ArrowLeft") {
				slidesAgent.send(
					JSON.stringify(
						NavigatePreviousSlideInputSchema.parse({
							type: "navigate-previous-slide",
							currentSlideId,
						} satisfies typeof NavigatePreviousSlideInputSchema._type),
					),
				);
			}
		};
		window.addEventListener("keydown", handleKeyDown);

		// Clean up event listener on unmount
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [slidesAgent, currentSlideId, enabled]);
}

/**
 * Helper function to determine the next slide ID
 */
function getNextSlideId(
	currentId: string,
	state: PresentationAgentState,
): string | null {
	const slides = state.presentation.slides;
	const currentIndex = slides.findIndex((slide) => slide.id === currentId);

	if (currentIndex === -1 || currentIndex >= slides.length - 1) {
		return null; // No next slide
	}

	return slides[currentIndex + 1].id;
}

/**
 * Helper function to determine the previous slide ID
 */
function getPreviousSlideId(
	currentId: string,
	state: PresentationAgentState,
): string | null {
	const slides = state.presentation.slides;
	const currentIndex = slides.findIndex((slide) => slide.id === currentId);

	if (currentIndex <= 0) {
		return null; // No previous slide
	}

	return slides[currentIndex - 1].id;
}

import type { PresentationAgentState } from "@/agents/presentations-agent";
import type { SinglePresentationAgentState } from "@/agents/single-presentation-message-schema";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { useState, useEffect, memo } from "react";

// Slide card component extracted and memoized for better performance
const SlideCard = memo(
  ({ slide, isLoading }: { slide: any; isLoading: boolean }) => {
    return (
      <div className="border rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div
          className={`p-4 aspect-[16/9] flex flex-col overflow-auto ${
            isLoading ? "bg-gray-50" : "bg-white"
          }`}
          style={{
            minHeight: "240px",
            maxHeight: "240px",
          }}
        >
          {isLoading ? (
            // Loading state with shimmer effect
            <div className="flex flex-col h-full items-center justify-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Generating slide...</p>
            </div>
          ) : (
            // Actual slide content
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -m-4 mb-2 p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {slide.title || (
                    <span className="animate-pulse">Loading title...</span>
                  )}
                </h2>
              </div>

              {slide.description ? (
                <p className="text-sm mb-3 flex-shrink-0 text-gray-700">
                  {slide.description}
                </p>
              ) : (
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
              )}

              {slide.bulletPoints && slide.bulletPoints.length > 0 ? (
                <ul className="list-disc pl-5 mb-3 text-sm space-y-1">
                  {slide.bulletPoints.map((point: string, index: number) => (
                    <li
                      key={`${slide.id}-point-${index}`}
                      className="text-gray-700"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              )}

              {slide.imagePrompt ? (
                <div className="mt-auto p-2 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-600">
                  <span className="font-medium">Image:</span>{" "}
                  {slide.imagePrompt}
                </div>
              ) : (
                <div className="mt-auto h-10 bg-gray-100 rounded animate-pulse" />
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

SlideCard.displayName = "SlideCard";

export const SinglePresentation = ({ id }: { id: string }) => {
  const [state, setState] = useState<SinglePresentationAgentState | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [renderedSlides, setRenderedSlides] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);

  const agent = useSkywardAgent<SinglePresentationAgentState>({
    agent: "single-presentation-agent",
    name: id,
    onStateUpdate(newState: SinglePresentationAgentState) {
      setState((prevState) => {
        // If we have no previous state, just use the new state
        if (!prevState) return newState;

        // Check if we're still generating
        if (newState.status === "loading" && prevState.status !== "loading") {
          setIsGenerating(true);
        }

        // Merge the new state with the previous state
        return {
          ...prevState,
          ...newState,
          // Ensure content is properly merged if it exists
          content: newState.content
            ? {
                ...prevState.content,
                ...newState.content,
                // Special handling for slides to preserve any that might not be in the new state
                slides:
                  newState.content.slides || prevState.content?.slides || [],
              }
            : prevState.content,
        };
      });
    },
  });

  useEffect(() => {
    return () => {
      agent.close();
    };
  }, [agent]);

  // Update rendered slides whenever state changes
  useEffect(() => {
    if (state?.content?.slides) {
      // Create a safe copy of slides to render
      const safeSlides = state.content.slides.map((slide) => ({
        id: slide.id || `temp-${Math.random()}`,
        title: slide.title || "",
        description: slide.description || "",
        bulletPoints: Array.isArray(slide.bulletPoints)
          ? slide.bulletPoints
          : [],
        imagePrompt: slide.imagePrompt || "",
        isComplete: !!(
          slide.title &&
          slide.description &&
          slide.bulletPoints?.length
        ),
      }));

      setRenderedSlides(safeSlides);

      // Check if we should still show generating state
      if (state.status === "loading" && isGenerating) {
        setIsGenerating(false);
      }
    }
  }, [state, isGenerating]);

  // Check if slides are complete
  const incompleteSlides = renderedSlides.filter(
    (slide) => !slide.isComplete
  ).length;
  const totalSlides = renderedSlides.length;
  const progress =
    totalSlides > 0
      ? Math.round(((totalSlides - incompleteSlides) / totalSlides) * 100)
      : 0;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-8 bg-white rounded-lg shadow-md p-6 border">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          {state?.content?.name || "Presentation"}
        </h1>

        <p className="text-gray-700 mb-4">
          {state?.content?.description || "Loading presentation..."}
        </p>

        {isGenerating && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {totalSlides > 0
                  ? `${totalSlides - incompleteSlides}/${totalSlides} slides`
                  : "Preparing..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {renderedSlides.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md border">
          {/* <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div> */}
          <p className="text-xl text-gray-600">Creating your presentation...</p>
          <p className="text-gray-500 mt-2">This may take a minute</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderedSlides.map((slide, index) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              isLoading={!slide.isComplete && isGenerating}
            />
          ))}
        </div>
      )}
    </div>
  );
};

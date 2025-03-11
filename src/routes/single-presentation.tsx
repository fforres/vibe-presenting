import type { PresentationAgentState } from "@/agents/presentations-agent";
import type {
  SinglePresentationAgentState,
  Slide,
} from "@/agents/single-presentation-message-schema";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { useState, useEffect, memo, useRef, useCallback } from "react";

// Slide card component extracted and memoized for better performance
const SlideCard = memo(
  ({
    slide,
    isLoading,
    scale = 1,
    onClick,
    isSelected = false,
  }: {
    slide: Slide;
    isLoading: boolean;
    scale?: number;
    onClick?: () => void;
    isSelected?: boolean;
  }) => {
    return (
      <div
        className={`slide-card flex-shrink-0 border rounded-lg overflow-hidden transition-all duration-300 cursor-pointer
          ${
            isSelected
              ? "ring-4 ring-blue-500 shadow-lg"
              : "shadow-md hover:shadow-lg"
          }`}
        style={{
          width: `${16 * 30 * scale}px`,
          height: `${9 * 30 * scale}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          margin:
            scale < 1
              ? `0 ${(1 - scale) * 8}rem ${(1 - scale) * 8}rem 0`
              : "0 1rem 1rem 0",
        }}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClick?.();
          }
        }}
      >
        <div
          className={`h-full p-4 flex flex-col overflow-hidden ${
            isLoading ? "bg-gray-50" : "bg-white"
          }`}
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -m-4 mb-3 p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800 truncate">
                  {slide.title || (
                    <span className="animate-pulse">Loading title...</span>
                  )}
                </h2>
              </div>

              {slide.description ? (
                <p className="text-sm mb-3 flex-shrink-0 text-gray-700 line-clamp-2">
                  {slide.description}
                </p>
              ) : (
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
              )}

              {slide.bulletPoints && slide.bulletPoints.length > 0 ? (
                <ul className="list-disc pl-5 mb-3 text-sm space-y-1 overflow-hidden">
                  {slide.bulletPoints
                    .slice(0, 4)
                    .map((point: string, index: number) => (
                      <li
                        key={`${slide.id}-point-${index}`}
                        className="text-gray-700 truncate"
                      >
                        {point}
                      </li>
                    ))}
                  {slide.bulletPoints.length > 4 && (
                    <li className="text-gray-500 italic">
                      +{slide.bulletPoints.length - 4} more points
                    </li>
                  )}
                </ul>
              ) : (
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              )}

              {slide.imagePrompt ? (
                <div className="mt-auto p-2 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-600 line-clamp-2">
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

// Full screen slide component
const FullScreenSlide = memo(
  ({ slide, onClose }: { slide: Slide; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
          </div>

          <div className="p-6 overflow-auto flex-grow">
            {slide.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600">{slide.description}</p>
              </div>
            )}

            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Key Points
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  {slide.bulletPoints.map((point: string, index: number) => (
                    <li
                      key={`${slide.id}-point-${index}`}
                      className="text-gray-600"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {slide.imagePrompt && (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Image Description
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-600">
                  {slide.imagePrompt}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 border-t flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
              type="button"
            >
              Close
            </button>
            <div className="text-sm text-gray-500">Slide ID: {slide.id}</div>
          </div>
        </div>
      </div>
    );
  }
);

SlideCard.displayName = "SlideCard";
FullScreenSlide.displayName = "FullScreenSlide";

export const SinglePresentation = ({ id }: { id: string }) => {
  const [state, setState] = useState<SinglePresentationAgentState | null>(null);
  const [renderedSlides, setRenderedSlides] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState<any | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle slide selection
  const handleSlideClick = useCallback((slide: Slide) => {
    setSelectedSlide(slide);
  }, []);

  const handleCloseFullScreen = useCallback(() => {
    setSelectedSlide(null);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSlide) return;

      const currentIndex = renderedSlides.findIndex(
        (slide) => slide.id === selectedSlide.id
      );

      if (e.key === "Escape") {
        handleCloseFullScreen();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (currentIndex < renderedSlides.length - 1) {
          setSelectedSlide(renderedSlides[currentIndex + 1]);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (currentIndex > 0) {
          setSelectedSlide(renderedSlides[currentIndex - 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSlide, renderedSlides, handleCloseFullScreen]);

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
    <div className="p-4 max-w-full mx-auto">
      {selectedSlide && (
        <FullScreenSlide
          slide={selectedSlide}
          onClose={handleCloseFullScreen}
        />
      )}

      <div className="mb-4 bg-white rounded-lg shadow-md p-6 border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              {state?.content?.name || "Presentation"}
            </h1>
            <p className="text-gray-700">
              {state?.content?.description || "Loading presentation..."}
            </p>
          </div>
        </div>

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
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl text-gray-600">Creating your presentation...</p>
          <p className="text-gray-500 mt-2">This may take a minute</p>
        </div>
      ) : (
        <div className="bg-gray-100 border rounded-lg p-4 overflow-auto">
          <p className="text-sm text-gray-500 mb-4">
            Click on any slide to view it in full screen
          </p>
          <div
            ref={slidesContainerRef}
            className="flex flex-wrap justify-start gap-4"
          >
            {renderedSlides.map((slide) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                isLoading={!slide.isComplete && isGenerating}
                onClick={() => handleSlideClick(slide)}
                isSelected={selectedSlide?.id === slide.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

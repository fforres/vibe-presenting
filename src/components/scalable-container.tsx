import { useRef, useEffect, useState, type ReactNode } from "react";

type ScalableContainerProps = {
	children: ReactNode;
	designWidth?: number; // Default design width (e.g., 800px)
	designHeight?: number; // Default design height (e.g., 600px)
};

export const ScalableContainer = ({
	children,
	designWidth = 1280,
	designHeight = 720,
}: ScalableContainerProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const handleResize = () => {
			if (containerRef.current) {
				const containerWidth = containerRef.current.clientWidth;
				// Compute the scale factor from the container's width versus design width.
				const newScale = containerWidth / designWidth;
				setScale(newScale);
				// Optionally update container height to preserve the aspect ratio:
				containerRef.current.style.height = `${designHeight * newScale}px`;
			}
		};

		window.addEventListener("resize", handleResize);
		// Initial call to set scale based on current size
		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, [designWidth, designHeight]);

	return (
		<div ref={containerRef} style={{ overflow: "hidden", width: "100%" }}>
			<div
				style={{
					transform: `scale(${scale})`,
					transformOrigin: "top left",
					width: designWidth,
					height: designHeight,
				}}
			>
				{children}
			</div>
		</div>
	);
};

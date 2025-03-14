import * as d3 from "d3";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type AudioVisualizerProps = {
	audioData: number[];
	isRecording: boolean;
	volume: number;
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
	audioData,
	isRecording,
	volume,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [recordingDuration, setRecordingDuration] = useState(0);

	// Track recording duration with millisecond precision
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isRecording) {
			// Start the timer when recording begins, update every 100ms
			interval = setInterval(() => {
				setRecordingDuration((prev) => prev + 0.01);
			}, 10);
		} else {
			// Reset duration when recording stops
			setRecordingDuration(0);
		}

		// Clean up interval on unmount or when recording state changes
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isRecording]);

	useEffect(() => {
		if (!svgRef.current) {
			return;
		}

		const svg = d3.select(svgRef.current);
		const width = 200;
		const height = 200;
		const centerX = width / 2;
		const centerY = height / 2;
		const baseRadius = 40;

		// Clear previous paths
		svg.selectAll(".audio-path").remove();

		// Calculate audio intensity - use this to determine if we should show spikes
		const audioSum = audioData.reduce((sum, val) => sum + Math.abs(val), 0);
		const avgIntensity = audioSum / (audioData.length || 1);

		// Increase the normalization factor to make intensity changes more dramatic
		// Changed from 50 to 30 to make it more sensitive
		const normalizedIntensity = Math.min(1, avgIntensity / 30);

		// Lower threshold for faster reaction to quiet sounds
		const wobbleThreshold = 10; // Reduced from 5
		const isQuiet = avgIntensity < wobbleThreshold || !isRecording;

		// Generate points around a circle with subtle wobble for audio
		const numPoints = 180;
		const angleStep = (2 * Math.PI) / numPoints;

		const points = Array.from({ length: numPoints }, (_, i) => {
			const angle = i * angleStep;

			// Smooth distribution of audio data around the circle
			const dataIndex = Math.floor(
				((i % audioData.length) / audioData.length) * audioData.length,
			);
			const dataPoint = Math.abs(audioData[dataIndex] || 0);

			// Increase scaling factor for more dramatic movements
			// Changed from 0.8 to 1.2
			const scalingFactor = normalizedIntensity * 1.2;

			// Increase the random factor slightly for more natural movement
			const noise = 0.15 * Math.random() * baseRadius * scalingFactor;

			// Increase wobble amount for faster, more dramatic response
			// Changed multiplier from 1.0 to 1.5
			const wobbleAmount = (dataPoint / 255) * baseRadius * scalingFactor * 1.5;
			const radius = baseRadius + wobbleAmount + noise;

			// Convert to cartesian coordinates
			const x = centerX + Math.cos(angle) * radius;
			const y = centerY + Math.sin(angle) * radius;

			return [x, y];
		});

		// Create a line generator with gentle curve
		const lineGenerator = d3.line().curve(d3.curveBasisClosed);

		// Create the path
		svg
			.append("path")
			.attr("class", "audio-path")
			.attr("d", lineGenerator(points as [number, number][]))
			.attr("fill", "oklch(0.65 0.23 33.1)")
			.attr("opacity", 0.7)
			.attr("stroke", "oklch(0.65 0.23 33.1)")
			.attr("stroke-width", 1.5);
	}, [audioData, isRecording]);

	// Format the recording time with milliseconds
	const formatRecordingTime = () => {
		const minutes = Math.floor(recordingDuration / 60);
		const seconds = Math.floor(recordingDuration % 60);
		const milliseconds = Math.floor((recordingDuration % 1) * 100);

		return `${minutes}:${String(seconds).padStart(2, "0")}.${milliseconds}`;
	};

	return (
		<div className="flex items-center mt-4">
			<div className="relative w-[200px] h-[200px] rounded-full flex items-center justify-center">
				<svg
					ref={svgRef}
					width="200"
					height="200"
					viewBox="0 0 200 200"
					className="absolute overflow-visible"
				/>

				{/* Center dot */}
				<div className="absolute w-2 h-2 bg-primary rounded-full z-10" />
			</div>

			{/* Audio info display */}
			<div className="ml-4 p-3">
				{/* Volume display */}
				<h3 className="text-lg font-semibold">Volume</h3>
				<p className="text-xl font-mono">{volume.toFixed(1)} dB</p>

				{/* Duration display with milliseconds */}
				<h3 className="text-lg font-semibold mt-2">Duration</h3>
				<p className="text-xl font-mono">{formatRecordingTime()}</p>
			</div>
		</div>
	);
};

import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioAnalysis() {
	const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
	const [volume, setVolume] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);

	const streamRef = useRef<MediaStream | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);
	const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const rafIdRef = useRef<number | null>(null);

	// Function to request microphone access
	const startRecording = useCallback(async () => {
		setError(null);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			// Initialize audio context
			const audioContext =
				new // biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(window.AudioContext || (window as any).webkitAudioContext)();
			audioContextRef.current = audioContext;

			// Create analyzer
			const analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			analyserRef.current = analyser;

			// Create buffer for frequency data
			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);
			dataArrayRef.current = dataArray;
			setAudioData(dataArray);

			// Connect audio source to analyzer
			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);
			sourceRef.current = source;

			// Start analysis loop
			const updateAnalysis = () => {
				if (!analyserRef.current || !dataArrayRef.current) {
					return;
				}

				// For volume, use time domain data instead of frequency data
				const timeDomainData = new Uint8Array(
					analyserRef.current.frequencyBinCount,
				);
				analyserRef.current.getByteTimeDomainData(timeDomainData);

				// Calculate RMS (root mean square) for better volume representation
				let sumOfSquares = 0;
				for (let i = 0; i < timeDomainData.length; i++) {
					// Convert to -128 to 127 range
					const amplitude = timeDomainData[i] - 128;
					sumOfSquares += amplitude * amplitude;
				}
				const rms = Math.sqrt(sumOfSquares / timeDomainData.length);
				// Normalize to 0-100 range for easier interpretation
				const normalizedVolume = Math.min(100, Math.max(0, rms * 2));

				setVolume(normalizedVolume);

				// Still get frequency data for visualization
				analyserRef.current.getByteFrequencyData(dataArrayRef.current);
				setAudioData(new Uint8Array(dataArrayRef.current));

				// Continue loop
				rafIdRef.current = requestAnimationFrame(updateAnalysis);
			};

			updateAnalysis();
		} catch (err) {
			setError(
				`Error accessing microphone: ${
					err instanceof Error ? err.message : String(err)
				}`,
			);
		}
	}, []);

	// Function to stop recording
	const stopRecording = useCallback(() => {
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}

		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}

		if (sourceRef.current) {
			sourceRef.current.disconnect();
			sourceRef.current = null;
		}

		if (audioContextRef.current) {
			if (audioContextRef.current.state !== "closed") {
				audioContextRef.current.close();
			}
			audioContextRef.current = null;
		}

		analyserRef.current = null;
		dataArrayRef.current = null;
		setAudioData(new Uint8Array(0));
		setVolume(0);
	}, []);

	// // React to isRecording changes
	// useEffect(() => {
	//   if (isRecording && !streamRef.current) {
	//     startRecording();
	//   } else if (!isRecording && streamRef.current) {
	//     stopRecording();
	//   }

	//   return () => {
	//     if (streamRef.current) {
	//       streamRef.current.getTracks().forEach((track) => track.stop());
	//     }
	//     if (rafIdRef.current) {
	//       cancelAnimationFrame(rafIdRef.current);
	//     }
	//   };
	// }, [isRecording, startRecording, stopRecording]);

	// Cleanup function to stop and release resources
	const cleanup = useCallback(() => {
		stopRecording();
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}

		if (sourceRef.current) {
			sourceRef.current.disconnect();
			sourceRef.current = null;
		}

		if (audioContextRef.current) {
			if (audioContextRef.current.state !== "closed") {
				audioContextRef.current.close();
			}
			audioContextRef.current = null;
		}

		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}

		analyserRef.current = null;
		dataArrayRef.current = null;
		setAudioData(new Uint8Array(0));
		setVolume(0);
	}, [stopRecording]);

	// Clean up when component unmounts
	useEffect(() => {
		return cleanup;
	}, [cleanup]);

	return {
		audioData,
		volume,
		mediaStream: streamRef.current,
		sourceRef: sourceRef.current,
		startRecording,
		stopRecording,
		cleanup,
		error,
	};
}

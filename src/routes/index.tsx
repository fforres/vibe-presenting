import { useState, useRef, useEffect } from "react";
import { AudioVisualizer } from "../components/AudioVisualizer";
import { useAudioAnalysis } from "../hooks/useAudioAnalysis";
import { Button } from "@/components/ui/button";

export const Index = () => {
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Remove Web Speech API reference
  // const recognitionRef = useRef<any | null>(null);

  // Use our custom hook for audio analysis - now handling media stream internally
  const {
    audioData,
    volume,
    mediaStream,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    cleanup: cleanupAudio,
    error: audioError,
  } = useAudioAnalysis();

  const isRecording = Boolean(mediaStream);
  // Set error from audio hook
  useEffect(() => {
    if (audioError) {
      setError(audioError);
    }
  }, [audioError]);

  // Remove Web Speech API initialization effect

  // Reference to store the media recorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    setError(null);
    setTranscript("");

    try {
      // Start audio recording - now handled by the hook
      await startAudioRecording();

      if (mediaStream) {
        // Create a new MediaRecorder with the stream
        const mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = mediaRecorder;

        // Set up the stream to the server
        let streamToServer: ReadableStreamDefaultController<any> | null = null;

        // Start a fetch request with a writable stream
        fetch("/audio/stream", {
          method: "POST",
          headers: {
            "Content-Type": "audio/webm",
          },
          body: new ReadableStream({
            start(controller) {
              streamToServer = controller;
            },
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(
                `API returned ${response.status}: ${await response.text()}`
              );
            }
            return response.json();
          })
          .then((data: { transcript: string }) => {
            if (data.transcript) {
              setTranscript(data.transcript);
            }
          })
          .catch((err) => {
            setError(
              `Error processing audio: ${
                err instanceof Error ? err.message : String(err)
              }`
            );
          })
          .finally(() => {
            setIsProcessing(false);
          });

        // Handle data available event to stream audio chunks to the server
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && streamToServer !== null) {
            // Convert blob to array buffer and then to Uint8Array
            event.data.arrayBuffer().then((buffer) => {
              // streamToServer?.write(new Uint8Array(buffer));
              streamToServer?.enqueue(new Uint8Array(buffer));
            });
          }
        };

        // Handle recording stop
        mediaRecorder.onstop = () => {
          // Close the stream to the server when recording stops
          if (streamToServer) {
            streamToServer.close();
          }
        };

        // Start recording
        mediaRecorder.start(100); // Collect data in 100ms chunks
        // setIsRecording(true);
      }
    } catch (err) {
      setError(
        `Error starting recording: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const stopRecording = async () => {
    // setIsRecording(false);
    setIsProcessing(true);

    // Stop the media recorder if it exists
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      // Stop the recorder - this will trigger the onstop event
      mediaRecorderRef.current.stop();
    }

    // Stop audio recording from the hook
    stopAudioRecording();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-center">
        <Button
          size="lg"
          variant="secondary"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording
            ? "Stop Recording"
            : isProcessing
            ? "Processing..."
            : "Start Recording"}
        </Button>
      </div>

      {isRecording && (
        <AudioVisualizer
          audioData={Array.from(audioData)}
          isRecording={isRecording}
          volume={volume}
        />
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      <div className="p-4 h-60 overflow-y-auto bg-card text-card-foreground border rounded-md">
        <h2 className="text-lg font-semibold mb-2">Transcription:</h2>
        {transcript ? (
          <p className="whitespace-pre-line">{transcript}</p>
        ) : (
          <p className="text-muted-foreground italic">
            {isRecording ? "Listening..." : "Transcription will appear here..."}
          </p>
        )}
      </div>
    </div>
  );
};

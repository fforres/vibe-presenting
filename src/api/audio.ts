import type { Env } from "@/server";
import { Hono } from "hono";

export const audioApp = new Hono<{ Bindings: Env }>().basePath("/audio");

// Endpoint to receive streaming audio
audioApp.post("/stream", async (c) => {
	console.log("Received stream request");

	// Check if the request is actually a stream
	const contentType = c.req.header("Content-Type");
	console.log("Content-Type:", contentType);
	if (!contentType || !contentType.includes("audio/")) {
		return c.json({ error: "Expected audio stream" }, 400);
	}

	try {
		// Get the stream directly from the request
		const reader = c.req.raw.body?.getReader();

		if (!reader) {
			return c.json({ error: "No audio stream provided" }, 400);
		}

		// Buffer to accumulate audio data
		const chunks = [];
		let transcription = "";

		// Log when chunks are received
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				console.log("Stream completed");
				break;
			}

			// Log chunk size
			console.log(`Received chunk: ${value.byteLength} bytes`);

			// Add the chunk to our buffer
			chunks.push(value);

			// // If we've accumulated enough data, send a batch for transcription
			// // (Whisper needs complete audio segments to transcribe)
			// if (chunks.length >= 10) {  // Arbitrary threshold, adjust as needed
			//   const audioBlob = new Blob(chunks, { type: contentType });
			//   const partialTranscript = await transcribeAudio(audioBlob);

			//   if (partialTranscript) {
			//     transcription += " " + partialTranscript;
			//   }

			//   // Clear the buffer after processing
			//   chunks.length = 0;
			// }
		}

		// Process any remaining chunks
		if (chunks.length > 0) {
			const audioBlob = new Blob(chunks, { type: contentType });
			const finalTranscript = await transcribeAudio(audioBlob);

			if (finalTranscript) {
				transcription += ` ${finalTranscript}`;
			}
		}

		return c.json({
			success: true,
			transcript: transcription.trim(),
		});
	} catch (err) {
		console.error("Error processing audio stream:", err);
		return c.json(
			{
				error: `Stream processing error: ${
					err instanceof Error ? err.message : String(err)
				}`,
			},
			500,
		);
	}
});

// // Helper function to transcribe audio using Whisper
async function transcribeAudio(audioBlob: Blob) {
	try {
		const formData = new FormData();
		formData.append("file", audioBlob);

		const response = await fetch(
			"https://gateway.ai.cloudflare.com/v1/b75ee9798c9c48a874af240b29724270/vibe-presenting/workers-ai/@cf/openai/whisper-large-v3-turbo",
			{
				method: "POST",
				headers: {
					Authorization: "Bearer _MXXC3bknR6iyST5T4M8bUBOkXawy1ikTJkGm86R",
					"X-Model": "@cf/openai/whisper/large-v3-turbo",
				},
				body: formData,
			},
		);
		console.log("response", response);

		if (!response.ok) {
			console.error("Whisper API error:", await response.text());
			return "";
		}

		const result = (await response.json()) as { result: { text: string } };
		return result.result?.text || "";
	} catch (error) {
		console.error("Transcription error:", error);
		return "";
	}
}

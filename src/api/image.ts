const model = "@cf/bytedance/stable-diffusion-xl-lightning";
const model3 = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
const model4 = "@cf/black-forest-labs/flux-1-schnell";

export const getImage = async ({
	prompt,
	AI,
}: {
	prompt: string;
	AI: Ai;
}) => {
	const initialTime = Date.now();
	const result = Promise.race([
		getImage1({ prompt, AI }).then((result) => {
			console.log("Finished 1", Date.now() - initialTime);
			return result;
		}),
		// getImage2({ prompt, AI }).then((result) => {
		// 	console.log("Finished 2", Date.now() - initialTime);
		// 	return result;
		// }),
		// getImage3({ prompt, AI }).then((result) => {
		// 	console.log("Finished 3", Date.now() - initialTime);
		// 	return result;
		// }),
	]);

	console.log("Got image!");
	return result;
};
export const getImage1 = async ({
	prompt,
	AI,
}: {
	prompt: string;
	AI: Ai;
}) => {
	const response = await AI.run(model, {
		prompt: `You'll generate an image. It will have a 90's web-design aesthetic. Stylized and cartoonish. Here's your prompt: ${prompt}`,
		negative_prompt: "text",
		height: 1024,
		width: 1024,
	});

	return new Response(response, {
		headers: {
			"content-type": "image/jpg",
		},
	});
};

export const getImage2 = async ({
	prompt,
	AI,
}: {
	prompt: string;
	AI: Ai;
}) => {
	const response = await AI.run(model3, {
		prompt: `You'll generate an image. It will have a 90's web-design aesthetic. Here's your prompt: ${prompt}`,
		// height: 512,
		// width: 512,
	});

	return new Response(response, {
		headers: {
			"content-type": "image/jpg",
		},
	});
};

export const getImage3 = async ({
	prompt,
	AI,
}: {
	prompt: string;
	AI: Ai;
}) => {
	const response = await AI.run(model4, {
		prompt: `You'll generate an image. It will have a 90's web-design aesthetic. Here's your prompt: ${prompt}`,
	});

	if (!response.image) {
		return new Response("No image", {
			status: 404,
		});
	}
	const binaryString = atob(response.image);
	// Create byte representation
	const img = Uint8Array.from(binaryString, (m) => m.codePointAt(0) || 0);

	return new Response(img, {
		headers: {
			"content-type": "image/jpg",
		},
	});
};

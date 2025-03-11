import { useAgent, type UseAgentOptions } from "agents-sdk/react";

export const useSkywardAgent = <State>(
	props: Omit<UseAgentOptions<State>, "host">,
) => {
	return useAgent({
		// host: "localhost:5173",
		...props,
	});
};

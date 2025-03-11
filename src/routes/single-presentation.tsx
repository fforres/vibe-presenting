import type { PresentationAgentState } from "@/agents/presentations-agent";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { useState } from "react";

export const SinglePresentation = ({ id }: { id: string }) => {
  const [state, setState] = useState<PresentationAgentState | null>(null);
  const agent = useSkywardAgent<PresentationAgentState>({
    agent: "presentations",
    name: id,
    onStateUpdate(state: PresentationAgentState) {
      setState(state);
    },
  });
  return <div>SinglePresentation {id}</div>;
};

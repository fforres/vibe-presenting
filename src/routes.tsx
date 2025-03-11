import { Routes } from "react-router";
import { Index } from "@/routes/index";
import { Route } from "react-router";
import { SinglePresentation } from "@/routes/single-presentation";
import { Toaster } from "@/components/ui/sonner";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { useState } from "react";
import type { PresentationAgentState } from "@/agents/presentations-agent";
export const DynamicRouteChange = () => {
  const [state, setState] = useState<PresentationAgentState | null>(null);
  const agent = useSkywardAgent({
    agent: "presentations",
    onStateUpdate(state: PresentationAgentState) {
      setState(state);
    },
  });

  console.log("state", state);
  if (!state) {
    return <div>Loading...</div>;
  }
  if (!state.activePresentation) {
    return <Index />;
  }
  if (state.activePresentation) {
    return <SinglePresentation id={state.activePresentation.id} />;
  }
};

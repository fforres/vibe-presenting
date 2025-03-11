import { Routes } from "react-router";
import { Index } from "@/routes/index";
import { Route } from "react-router";
import { SinglePresentation } from "@/routes/single-presentation";
import { Toaster } from "@/components/ui/sonner";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { useState } from "react";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import {
  OutgoingMessageSchema,
  PresentationsInitInputSchema,
} from "@/agents/message-schemas";
export const DynamicRouteChange = () => {
  const [state, setState] = useState<PresentationAgentState | null>(null);
  const agent = useSkywardAgent({
    agent: "presentations",
    onStateUpdate(state: PresentationAgentState) {
      setState(state);
    },
    onOpen(event) {
      agent?.send(
        JSON.stringify(
          PresentationsInitInputSchema.parse({
            type: "presentations-init",
          })
        )
      );
    },
    onMessage(message) {
      const parsedMessage = OutgoingMessageSchema.parse(
        JSON.parse(message.data)
      );
      if (parsedMessage.type === "initial-connections") {
        setState((prev) => {
          if (!prev) {
            return null;
          }
          return {
            ...prev,
            connectionCount: parsedMessage.data.connectionCount,
          };
        });
      }
      console.log("message", message);
    },
  });

  console.log("state", state);
  if (!state) {
    return <div>Loading...</div>;
  }
  if (!state.activePresentation) {
    return <Index state={state} />;
  }
  if (state.activePresentation) {
    return <SinglePresentation id={state.activePresentation.id} />;
  }
};

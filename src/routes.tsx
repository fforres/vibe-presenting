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
import SidebarLayout from "@/layouts/sidebar_layout";
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
    },
  });

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 rounded-lg shadow-md bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading your content
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your experience...
          </p>
        </div>
      </div>
    );
  }
  return (
    <SidebarLayout state={state} agent={agent}>
      {state.activePresentation ? (
        <SinglePresentation id={state.activePresentation.id} />
      ) : (
        <Index state={state} />
      )}
    </SidebarLayout>
  );
};

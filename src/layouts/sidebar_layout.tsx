import { PresentationsInitInputSchema } from "@/agents/message-schemas";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import { useState } from "react";
import { useMatch } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PresentationAgentState>({
    status: "idle",
    activePresentation: null,
    presentations: [],
  });
  const agent = useSkywardAgent<PresentationAgentState>({
    agent: "presentations",
    onOpen(event) {
      // console.log("onOpen", event);
      agent?.send(
        JSON.stringify(
          PresentationsInitInputSchema.parse({
            type: "presentations-init",
          })
        )
      );
    },
    onStateUpdate(state, source) {
      setState(state);
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar state={state} agent={agent} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {/* {matches?.params.id ? ( */}
                {state.activePresentation ? (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Presentation</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {state.activePresentation?.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbPage>New Presentation</BreadcrumbPage>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

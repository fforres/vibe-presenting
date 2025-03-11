import type * as React from "react";
import { MoonIcon, PlusIcon, SunIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/features/theme-provider";
import type { useSkywardAgent } from "@/hooks/use-skyward-agent";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import {
  PresentationsInitInputSchema,
  SetActivePresentationInputSchema,
} from "@/agents/message-schemas";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CreatePresentationModal } from "@/components/create-presentation-modal";
export function AppSidebar({
  state,
  agent,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  state: PresentationAgentState;
  agent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>;
}) {
  const { theme, setTheme } = useTheme();

  const data = useMemo(() => {
    return {
      navMain: [
        {
          title: "New Presentation",
          isActive: state.activePresentation === null,
          onClick: () => {
            setCreateModalOpen(true);
          },
        },
        {
          title: "Presentations",

          items: state.presentations.map((presentation) => ({
            id: presentation.id,
            title: presentation.name,
            isActive: state.activePresentation?.id === presentation.id,
          })),
        },
      ],
    };
  }, [state.presentations, state.activePresentation]);
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <CreatePresentationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={(id) => {
          agent?.send(
            JSON.stringify(
              SetActivePresentationInputSchema.parse({
                type: "set-active-presentation",
                id,
              })
            )
          );
        }}
      />
      <Sidebar {...props} variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2  justify-start">
            <Button
              variant="link"
              className="px-2 py-6 m-0"
              onClick={() => {
                agent?.send(
                  JSON.stringify(
                    SetActivePresentationInputSchema.parse({
                      type: "set-active-presentation",
                      id: null,
                    })
                  )
                );
              }}
            >
              Vibe Presenting
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Button
                      variant={"ghost"}
                      className={cn("font-medium w-full justify-start", {
                        "cursor-pointer": !!item?.onClick,
                        "cursor-default": !item?.onClick,
                      })}
                      onClick={item?.onClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          item?.onClick?.();
                        }
                      }}
                    >
                      {item.title}
                    </Button>
                  </SidebarMenuButton>
                  {item.items?.map((presentation) => (
                    <SidebarMenuSub key={presentation.id}>
                      <SidebarMenuSubItem key={presentation.id}>
                        <SidebarMenuSubButton asChild>
                          <Button
                            variant={
                              presentation.isActive ? "default" : "ghost"
                            }
                            size="sm"
                            className={cn(
                              "font-medium"
                              // presentation.isActive && "text-primary"
                            )}
                            onClick={() => {
                              agent?.send(
                                JSON.stringify(
                                  SetActivePresentationInputSchema.parse({
                                    type: "set-active-presentation",
                                    id: presentation.id,
                                  })
                                )
                              );
                            }}
                          >
                            {presentation.title}
                          </Button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  ))}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 cursor-pointer"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="https://skyward.ai" target="_blank" rel="noreferrer">
                  <span className="font-medium inline-flex items-center gap-1 justify-center">
                    By
                    <div className="size-5 shrink-0">
                      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 44 66"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.4211 1.55307C21.6473 0.499667 23.1503 0.499664 23.3765 1.55306L24.9445 8.85485C27.1349 19.0552 33.9736 27.5798 43.3297 31.9614C44.1676 32.3538 44.1676 33.6425 43.3297 34.0349C33.9736 38.4165 27.1349 46.941 24.9445 57.1414L23.3765 64.4432C23.1503 65.4966 21.6473 65.4966 21.4211 64.4432L19.8531 57.1414C17.6627 46.941 10.824 38.4165 1.46787 34.0349C0.62995 33.6425 0.62995 32.3538 1.46787 31.9614C10.824 27.5798 17.6627 19.0552 19.8531 8.85486L21.4211 1.55307Z"
                          fill="#FB3F15"
                        />
                      </svg>
                    </div>{" "}
                    Skyward
                  </span>
                  {/* <span className="">v1.0.0</span> */}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

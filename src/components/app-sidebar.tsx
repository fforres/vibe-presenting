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
  SetActiveSlideInputSchema,
} from "@/agents/message-schemas";
import { useMemo, useState, useEffect } from "react";
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
  const [showBlink, setShowBlink] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Toggle blinking elements for 90s effect
  useEffect(() => {
    const timer = setInterval(() => {
      setShowBlink((prev) => !prev);
    }, 800);

    return () => clearInterval(timer);
  }, []);

  const data = useMemo(() => {
    return {
      navMain: [
        {
          title: "Home",
          isActive: state.activeSlide === null && !createModalOpen,
          onClick: () => {
            agent?.send(
              JSON.stringify(
                SetActiveSlideInputSchema.parse({
                  type: "set-active-slide",
                  id: null,
                })
              )
            );
          },
        },
        {
          title: "Slides",
          items: state.presentation.slides.map((slide) => ({
            id: slide.id,
            title: slide.topic,
            isActive: state.activeSlide === slide.id,
          })),
        },
      ],
    };
  }, [state.presentation, state.activeSlide, agent, createModalOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <CreatePresentationModal
        agent={agent}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <Sidebar
        {...props}
        variant="sidebar"
        collapsible="offcanvas"
        className="border-r-4 border-dashed"
        style={{
          borderImageSource:
            "linear-gradient(to bottom, #FF00FF, #00FFFF, #FFFF00)",
          borderImageSlice: 1,
          background: "linear-gradient(135deg, #f5f5f5, #e0e0ff)",
        }}
      >
        <SidebarHeader className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 border-b-2 border-black">
          <div className="flex items-center gap-2 justify-start p-2">
            <Button
              variant="link"
              className="px-2 py-2 m-0 relative group"
              style={{
                fontFamily: "'Comic Sans MS', cursive",
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#FFFFFF",
                textShadow: "2px 2px 0 #000000",
              }}
              onClick={() => {
                agent?.send(
                  JSON.stringify(
                    SetActiveSlideInputSchema.parse({
                      type: "set-active-slide",
                      id: null,
                    })
                  )
                );
              }}
            >
              <span className="relative z-10">
                <span style={{ color: "#FF0000" }}>V</span>
                <span style={{ color: "#FF7F00" }}>i</span>
                <span style={{ color: "#FFFF00" }}>b</span>
                <span style={{ color: "#00FF00" }}>e</span>
                <span> </span>
                <span style={{ color: "#0000FF" }}>P</span>
                <span style={{ color: "#4B0082" }}>r</span>
                <span style={{ color: "#9400D3" }}>e</span>
                <span style={{ color: "#FF0000" }}>s</span>
                <span style={{ color: "#FF7F00" }}>e</span>
                <span style={{ color: "#FFFF00" }}>n</span>
                <span style={{ color: "#00FF00" }}>t</span>
                <span style={{ color: "#0000FF" }}>i</span>
                <span style={{ color: "#4B0082" }}>n</span>
                <span style={{ color: "#9400D3" }}>g</span>
              </span>
              {/* Animated stars on hover */}
              <span className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {showBlink && (
                  <span className="absolute -top-1 -left-2 text-yellow-300">
                    ★
                  </span>
                )}
                {!showBlink && (
                  <span className="absolute -bottom-1 -right-2 text-yellow-300">
                    ★
                  </span>
                )}
              </span>
            </Button>
          </div>

          {/* Hit counter */}
          <div className="flex justify-center mb-2">
            <div
              className="bg-black text-white text-xs px-2 py-1"
              style={{ fontFamily: "monospace" }}
            >
              Visitors: {state.connectionCount}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="relative">
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Button
                      variant={"ghost"}
                      className={cn(
                        "font-medium w-full justify-start mb-1 relative",
                        {
                          "cursor-pointer": !!item?.onClick,
                          "cursor-default": !item?.onClick,
                          "bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300":
                            item.isActive,
                        }
                      )}
                      style={{
                        fontFamily: "'Times New Roman', serif",
                        color: item.isActive ? "#9400D3" : "#0000EE",
                        textDecoration: "none",
                      }}
                      onClick={item?.onClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          item?.onClick?.();
                        }
                      }}
                    >
                      {item.title}
                      {item.title === "New Presentation" && showBlink && (
                        <span className="absolute right-2 top-2 text-xs text-red-600">
                          NEW!
                        </span>
                      )}
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
                              "font-medium ml-2 mb-1",
                              presentation.isActive &&
                                "bg-gradient-to-r from-yellow-100 to-green-100 border border-yellow-300"
                            )}
                            style={{
                              fontFamily: "'Arial', sans-serif",
                              color: presentation.isActive
                                ? "#9400D3"
                                : "#0000EE",
                              textDecoration: presentation.isActive
                                ? "none"
                                : "underline",
                            }}
                            onClick={() => {
                              agent?.send(
                                JSON.stringify(
                                  SetActiveSlideInputSchema.parse({
                                    type: "set-active-slide",
                                    id: presentation.id,
                                  })
                                )
                              );
                            }}
                          >
                            {presentation.title}
                            {presentation.isActive && (
                              <span className="ml-1">👈</span>
                            )}
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

        <SidebarRail className="bg-gradient-to-b from-gray-300 to-gray-400 border-r border-l border-gray-500" />

        <SidebarFooter className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 border-t-2 border-black">
          <SidebarMenu>
            {/* <SidebarMenuItem>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 cursor-pointer bg-white/50 hover:bg-white/70"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-yellow-600" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-indigo-800" />
                )}
              </Button>
            </SidebarMenuItem> */}
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a
                  href="https://skyward.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white/50 hover:bg-white/70 px-2 py-1 rounded border border-gray-400"
                >
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
                        className={showBlink ? "animate-pulse" : ""}
                      >
                        <path
                          d="M21.4211 1.55307C21.6473 0.499667 23.1503 0.499664 23.3765 1.55306L24.9445 8.85485C27.1349 19.0552 33.9736 27.5798 43.3297 31.9614C44.1676 32.3538 44.1676 33.6425 43.3297 34.0349C33.9736 38.4165 27.1349 46.941 24.9445 57.1414L23.3765 64.4432C23.1503 65.4966 21.6473 65.4966 21.4211 64.4432L19.8531 57.1414C17.6627 46.941 10.824 38.4165 1.46787 34.0349C0.62995 33.6425 0.62995 32.3538 1.46787 31.9614C10.824 27.5798 17.6627 19.0552 19.8531 8.85486L21.4211 1.55307Z"
                          fill="#FB3F15"
                        />
                      </svg>
                    </div>{" "}
                    <span style={{ fontFamily: "'Times New Roman', serif" }}>
                      Skyward
                    </span>
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* 90s copyright notice */}
          <div
            className="text-[10px] text-center mt-2 mb-1 text-white"
            style={{ fontFamily: "monospace", textShadow: "1px 1px 1px #000" }}
          >
            Copyright © 1999 <br />
            Made with Notepad
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Add this to your CSS for any custom animations */}
      <style>{`
        @keyframes blink {
          0%,
          49% {
            opacity: 0;
          }
          50%,
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

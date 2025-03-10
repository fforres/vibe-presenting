import * as React from "react";
import { GalleryVerticalEnd, MoonIcon, SunIcon } from "lucide-react";

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
import { Link } from "react-router";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { theme, setTheme } = useTheme();
	const data = React.useMemo(() => {
		return {
			navMain: [
				{
					title: "Presentations",
					url: "#",
					items: [
						{
							title: "Installation",
							url: "#",
						},
						{
							title: "Project Structure",
							url: "#",
						},
					],
				},
				{
					title: "Settings",
					url: "#",
					items: [
						{
							title: "Prompts",
							url: "#",
						},
						{
							title: "Access",
							url: "#",
							isActive: true,
						},
					],
				},
			],
		};
	}, []);
	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};
	return (
		<Sidebar {...props} variant="sidebar" collapsible="offcanvas">
			<SidebarHeader></SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{data.navMain.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									<a href={item.url} className="font-medium">
										{item.title}
									</a>
								</SidebarMenuButton>
								{item.items?.length ? (
									<SidebarMenuSub>
										{item.items.map((item) => (
											<SidebarMenuSubItem key={item.title}>
												<SidebarMenuSubButton asChild isActive={item.isActive}>
													<a href={item.url}>{item.title}</a>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								) : null}
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
							<Link to="/">
								<span className="font-medium inline-flex items-center gap-1 justify-center">
									By
									<div className="size-5 shrink-0">
										{" "}
										<svg
											width="100%"
											height="100%"
											viewBox="0 0 44 66"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											// {...props}
											// ref={ref}
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
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

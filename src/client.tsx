import "./styles.css";
import SidebarLayout from "@/layouts/sidebar_layout";
import { DynamicRouteChange } from "@/routes";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app";
import { ThemeProvider } from "./features/theme-provider";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = createRoot(document.getElementById("app")!);

root.render(
	<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
		<DynamicRouteChange />
	</ThemeProvider>,
);

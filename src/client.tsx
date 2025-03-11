import "./styles.css";
import { createRoot } from "react-dom/client";
import App from "./app";
import { ThemeProvider } from "./features/theme-provider";
import { BrowserRouter } from "react-router";
import { DynamicRouteChange } from "@/routes";
import SidebarLayout from "@/layouts/sidebar_layout";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = createRoot(document.getElementById("app")!);

root.render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <DynamicRouteChange />
  </ThemeProvider>
);

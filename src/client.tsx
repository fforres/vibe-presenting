import "./styles.css";
import { createRoot } from "react-dom/client";
import App from "./app";
import { ThemeProvider } from "./features/theme-provider";
import { BrowserRouter } from "react-router";
import { AllRoutes } from "@/routes";
import SidebarLayout from "@/layouts/sidebar_layout";

const root = createRoot(document.getElementById("app")!);

root.render(
	<BrowserRouter>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<SidebarLayout>
				<AllRoutes />
			</SidebarLayout>
		</ThemeProvider>
	</BrowserRouter>,
);

import "./styles.css";
import { createRoot } from "react-dom/client";
import App from "./app";
import { ThemeProvider } from "./features/theme-provider";

const root = createRoot(document.getElementById("app")!);

root.render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <App />
  </ThemeProvider>
);

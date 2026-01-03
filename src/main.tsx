import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkPWAAndRedirect } from "./utils/pwaRedirect.ts";

// Check if we need to redirect PWA users to scan page
checkPWAAndRedirect();

createRoot(document.getElementById("root")!).render(<App />);

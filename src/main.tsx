import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initServiceWorker } from "./utils/serviceWorker";

// Initialize service worker for push notifications
initServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);

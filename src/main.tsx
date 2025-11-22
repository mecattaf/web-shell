import "./style/index.css";
import "@fontsource/jetbrains-mono";
import "@fontsource-variable/readex-pro";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BridgeProvider } from "./contexts/BridgeContext";

// Initialize manual test utilities in development mode
if (import.meta.env.DEV) {
  import("./test/manual-test-helper").then(({ initManualTestUtils }) => {
    initManualTestUtils();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BridgeProvider>
      <App />
    </BridgeProvider>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthProvider";
import { CreditScoreProvider } from "./contexts/CreditScoreContext";
import { SuiProvider } from "./lib/suiProvider";
import "@mysten/dapp-kit/dist/index.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SuiProvider>
        <AuthProvider>
          <CreditScoreProvider>
            <App />
            <Toaster />
          </CreditScoreProvider>
        </AuthProvider>
      </SuiProvider>
    </BrowserRouter>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import App from "./App.tsx";
import "./index.css";
import { warmupDatabases } from './lib/database';
import { getApiBaseUrl } from './lib/utils';

async function maybeWarmupLocalDb() {
  try {
    const base = getApiBaseUrl();
    const resp1 = await fetch(`${base}/api/health`, { method: 'GET' });
    if (resp1.ok) return;
    const resp2 = await fetch(`${base}/health`, { method: 'GET' });
    if (resp2.ok) return;
  } catch {}
  try { await warmupDatabases(); } catch {}
}

void maybeWarmupLocalDb();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <HashRouter>
        <App />
        <Toaster />
      </HashRouter>
    </LanguageProvider>
  </StrictMode>
);

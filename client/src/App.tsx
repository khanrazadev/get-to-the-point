import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserButton } from "@clerk/react";
import ContentPage from "@/pages/ContentPage";
import HomePage from "@/pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8">
          <a href="/" className="group flex items-center gap-3">
            <span className="flex size-8 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
              G
            </span>

            <div className="leading-none">
              <p className="text-sm font-bold tracking-tight">
                GET TO THE <span className="text-accent">POINT</span>
              </p>

              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Research archive
              </p>
            </div>
          </a>

          <UserButton />
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/content/:contentId" element={<ContentPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

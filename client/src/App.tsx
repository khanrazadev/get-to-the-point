import {
  Show,
  SignInButton,
  SignUpButton,
} from "@clerk/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import ContentPage from "@/pages/ContentPage";
import HomePage from "@/pages/HomePage";

function AuthLanding() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md border border-border bg-card p-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Editorial Intelligence Archive
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Get to the point.
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Turn videos and audio into searchable knowledge.
        </p>

        <div className="mt-8 flex gap-3">
          <SignInButton mode="modal">
            <button className="flex-1 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              Sign in
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="flex-1 border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
              Create account
            </button>
          </SignUpButton>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <>
      <Show when="signed-out">
        <AuthLanding />
      </Show>

      <Show when="signed-in">
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/content/:contentId"
                element={<ContentPage />}
              />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </Show>
    </>
  );
}

export default App;
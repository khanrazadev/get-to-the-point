import type { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
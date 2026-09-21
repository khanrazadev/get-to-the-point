import { Link, NavLink } from "react-router-dom";
import { Library, Plus, Settings } from "lucide-react";

function Sidebar() {
  return (
    <aside className="hidden h-dvh w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <div className="border-b border-border bg-background px-5 py-4">
        <Link to="/" className="font-semibold tracking-tight">
          Get To The Point
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Library className="size-4" />
          Library
        </NavLink>

        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
          New content
        </NavLink>
      </nav>
      <div className="border-t border-border bg-background p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <Settings className="size-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

import { UserButton } from "@clerk/react";

function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-border px-4 sm:px-6">
      <UserButton />
    </header>
  );
}

export default Header;
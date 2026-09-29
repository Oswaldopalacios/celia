import { PublicMenuButton } from "@/components/public/menu-button";
import { PublicLogo } from "@/components/public/public-logo";

export function PublicMobileHeader() {
  return (
    <header className="flex items-center justify-between px-4 pt-5 lg:hidden">
      <PublicLogo compact />
      <PublicMenuButton light={false} />
    </header>
  );
}

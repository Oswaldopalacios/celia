import { PublicBottomNav } from "@/components/public/bottom-nav";
import { PublicDesktopFooter } from "@/components/public/desktop-footer";
import { PublicDesktopNav } from "@/components/public/desktop-nav";
import { OrderBar } from "@/components/public/order/order-bar";

export function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#EAD7BD] font-[family-name:var(--font-nunito)] text-[#3A2218] lg:bg-[#FAF3E6]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#FAF3E6] shadow-[0_0_80px_rgba(43,23,14,0.14)] lg:max-w-none lg:overflow-visible lg:shadow-none">
        <PublicDesktopNav />
        <div className="flex-1 pb-[5.75rem] lg:pb-0">{children}</div>
        <PublicBottomNav />
        <PublicDesktopFooter />
        <OrderBar />
      </div>
    </div>
  );
}

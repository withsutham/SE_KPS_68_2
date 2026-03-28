import { ManagerSideMenu } from "@/components/manager/manager-side-menu";
import { ManagerChromeToggle } from "@/components/manager/manager-chrome-toggle";

export default function ManagerRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex">
      <ManagerChromeToggle />
      <ManagerSideMenu />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

import { Outlet } from "react-router";
import BottomNav from "./BottomNav";

function Layout() {
  return (
    <>
      <main className="flex-1 flex flex-col min-h-[100svh] pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}

export default Layout;

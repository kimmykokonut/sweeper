import { useEffect } from "react";
import { Outlet, useMatches } from "react-router";
import BottomNav from "./BottomNav";

interface RouteHandle {
  title?: string;
  hideNav?: boolean;
}

function Layout() {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1];
  const handle = currentMatch?.handle as RouteHandle | undefined;
  const pageTitle = handle?.title;
  const hideNav = Boolean(handle?.hideNav);

  useEffect(() => {
    document.title = pageTitle ? `Sweeper - ${pageTitle}` : "Sweeper";
  }, [pageTitle]);

  return (
    <>
      <main className={`flex-1 flex flex-col min-h-[100svh] ${hideNav ? "" : "pb-16"}`}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </>
  );
}

export default Layout;

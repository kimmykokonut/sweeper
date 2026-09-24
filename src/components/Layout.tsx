import { useEffect } from "react";
import { Outlet, useMatches } from "react-router";
import BottomNav from "./BottomNav";

interface RouteHandle {
  title?: string;
}

function Layout() {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1];
  const pageTitle = (currentMatch?.handle as RouteHandle | undefined)?.title;

  useEffect(() => {
    document.title = pageTitle ? `Sweeper - ${pageTitle}` : "Sweeper";
  }, [pageTitle]);

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

import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple.soft via-white to-purple.soft/20">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
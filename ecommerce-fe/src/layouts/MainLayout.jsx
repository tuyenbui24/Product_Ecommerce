// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "@components/common/Header";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4 md:py-6">
          {children || <Outlet />}
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-5 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Clothing Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

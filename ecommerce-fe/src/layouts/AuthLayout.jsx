import AuthTopBar from "@components/common/AuthTopBar";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <AuthTopBar />
      <main className="grid place-items-center px-4 py-8">{children}</main>
    </div>
  );
}

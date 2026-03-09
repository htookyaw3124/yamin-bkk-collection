import type { ReactNode } from "react";

interface AdminGateProps {
  authToken: string | null;
  onRequestLogin: () => void;
  children: ReactNode;
}

export const AdminGate = ({
  authToken,
  onRequestLogin,
  children,
}: AdminGateProps) => {
  if (!authToken) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 px-4">
        <p className="text-sm text-slate-500 max-w-sm">
          This area is restricted. Please log in as an administrator to add or
          update products.
        </p>
        <button
          onClick={onRequestLogin}
          className="px-6 py-3 text-xs font-bold tracking-[0.3em] uppercase border border-slate-200 rounded-full hover:border-slate-900 transition-colors"
        >
          Admin Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

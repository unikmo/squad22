import type { ReactNode } from "react";
import { IPNFooter } from "./ipn-footer";
import { IPNNav } from "./ipn-nav";

export function PublicPage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-white"><IPNNav /><main className="flex-1">{children}</main><IPNFooter /></div>;
}

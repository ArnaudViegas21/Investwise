import { Suspense, type ReactNode } from "react";
import AppHeader from "@/components/AppHeader";
import ToastQueryListener from "@/components/ToastQueryListener";
import { ToastProvider } from "@/components/ToastProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppHeader />
      <Suspense fallback={null}>
        <ToastQueryListener />
      </Suspense>
      {children}
    </ToastProvider>
  );
}

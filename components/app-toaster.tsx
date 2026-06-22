"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border shadow-lg touch-manipulation",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
        },
      }}
      mobileOffset={{ top: "4.5rem" }}
      style={{ zIndex: 60 }}
    />
  );
}

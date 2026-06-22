"use client";

import type { Role } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NavLinks, SidebarFooter } from "@/components/layout/sidebar";

export function MobileMenuSheet({
  open,
  onOpenChange,
  role,
  shopName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  shopName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col p-0 sm:max-w-sm">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{shopName}</DialogTitle>
        </DialogHeader>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLinks role={role} onNavigate={() => onOpenChange(false)} />
        </nav>
        <SidebarFooter className="mt-auto" />
      </DialogContent>
    </Dialog>
  );
}

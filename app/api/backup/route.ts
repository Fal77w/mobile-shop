import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportBackup, restoreBackup } from "@/lib/application/services/backup-service";
import { canManageBackup } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canManageBackup(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const backup = await exportBackup();
  const filename = `moblies-shop-backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !canManageBackup(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    await restoreBackup(payload);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Restore failed" },
      { status: 400 }
    );
  }
}

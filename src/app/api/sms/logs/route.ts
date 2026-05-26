import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.deliveryStatus = status;

  const [logs, total] = await Promise.all([
    prisma.sMSLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: "desc" },
      include: { patient: { select: { fullName: true, phoneNumber: true } } },
    }),
    prisma.sMSLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

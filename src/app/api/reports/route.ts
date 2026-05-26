import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "dashboard";

  switch (type) {
    case "dashboard": {
      const [
        totalPatients,
        totalAppointments,
        scheduledAppointments,
        missedAppointments,
        totalSMS,
        deliveredSMS,
        failedSMS,
      ] = await Promise.all([
        prisma.patient.count(),
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: "SCHEDULED" } }),
        prisma.appointment.count({ where: { status: "MISSED" } }),
        prisma.sMSLog.count(),
        prisma.sMSLog.count({ where: { deliveryStatus: "DELIVERED" } }),
        prisma.sMSLog.count({ where: { deliveryStatus: "FAILED" } }),
      ]);

      return NextResponse.json({
        totalPatients,
        totalAppointments,
        scheduledAppointments,
        missedAppointments,
        totalSMS,
        deliveredSMS,
        failedSMS,
        smsDeliveryRate:
          totalSMS > 0
            ? Math.round((deliveredSMS / totalSMS) * 100)
            : 0,
      });
    }

    case "appointments": {
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      const where: Record<string, unknown> = {};
      if (from || to) {
        where.appointmentDate = {};
        if (from) (where.appointmentDate as Record<string, unknown>).gte = new Date(from);
        if (to) (where.appointmentDate as Record<string, unknown>).lte = new Date(to);
      }

      const appointments = await prisma.appointment.findMany({
        where,
        orderBy: { appointmentDate: "desc" },
        include: { patient: { select: { fullName: true, phoneNumber: true } } },
      });

      const statusCounts = await prisma.appointment.groupBy({
        by: ["status"],
        where,
        _count: true,
      });

      return NextResponse.json({ appointments, statusCounts });
    }

    case "sms": {
      const statusCounts = await prisma.sMSLog.groupBy({
        by: ["deliveryStatus"],
        _count: true,
      });

      const typeCounts = await prisma.sMSLog.groupBy({
        by: ["reminderType"],
        _count: true,
      });

      return NextResponse.json({ statusCounts, typeCounts });
    }

    default:
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }
}

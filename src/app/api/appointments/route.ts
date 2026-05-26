import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.appointmentDate = { gte: start, lt: end };
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { appointmentDate: "asc" },
      include: { patient: { select: { fullName: true, phoneNumber: true } } },
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({
    appointments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!["ADMIN", "RECEPTIONIST"].includes(session.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { patientId, doctorName, appointmentDate, notes } =
      await request.json();

    if (!patientId || !doctorName || !appointmentDate) {
      return NextResponse.json(
        { error: "Patient, doctor, and appointment date are required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorName,
        appointmentDate: new Date(appointmentDate),
        notes: notes || null,
      },
      include: { patient: { select: { fullName: true, phoneNumber: true } } },
    });

    return NextResponse.json(
      { appointment, message: "Appointment created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

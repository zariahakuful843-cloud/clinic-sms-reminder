import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { doctorName, appointmentDate, status, notes } = await request.json();

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        ...(doctorName && { doctorName }),
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: { patient: { select: { fullName: true, phoneNumber: true } } },
    });

    return NextResponse.json({ appointment, message: "Appointment updated successfully" });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!["ADMIN", "RECEPTIONIST"].includes(session.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.appointment.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

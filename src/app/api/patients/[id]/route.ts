import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id: parseInt(id) },
    include: {
      appointments: { orderBy: { appointmentDate: "desc" }, take: 10 },
      smsLogs: { orderBy: { sentAt: "desc" }, take: 10 },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function PUT(
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
    const { fullName, gender, phoneNumber, address, dateOfBirth } =
      await request.json();

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        ...(fullName && { fullName }),
        ...(gender && { gender }),
        ...(phoneNumber && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(dateOfBirth !== undefined && {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        }),
      },
    });

    return NextResponse.json({ patient, message: "Patient updated successfully" });
  } catch (error) {
    console.error("Update patient error:", error);
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

  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can delete patients" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.patient.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Delete patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

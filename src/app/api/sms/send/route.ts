import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendSMS, generateReminderMessage } from "@/lib/sms";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { patientId, message, reminderType, appointmentId } =
      await request.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    let smsMessage = message;

    if (!smsMessage && appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      if (appointment) {
        smsMessage = generateReminderMessage(
          patient.fullName,
          process.env.NEXT_PUBLIC_APP_NAME || "Our Health Facility",
          appointment.appointmentDate
        );

        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { reminderSent: true },
        });
      }
    }

    if (!smsMessage) {
      return NextResponse.json(
        { error: "Message or appointment ID is required" },
        { status: 400 }
      );
    }

    const result = await sendSMS({
      phoneNumber: patient.phoneNumber,
      message: smsMessage,
      patientId: patient.id,
      reminderType: reminderType || "APPOINTMENT",
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Send SMS error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

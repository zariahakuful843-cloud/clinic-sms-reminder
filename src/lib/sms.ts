import { prisma } from "./prisma";

export interface SMSPayload {
  phoneNumber: string;
  message: string;
  patientId: number;
  reminderType?: "APPOINTMENT" | "MEDICATION" | "VACCINATION" | "ANTENATAL";
}

export async function sendSMS(payload: SMSPayload): Promise<{
  success: boolean;
  logId: number;
  message: string;
}> {
  const { phoneNumber, message, patientId, reminderType = "APPOINTMENT" } = payload;

  const log = await prisma.sMSLog.create({
    data: {
      patientId,
      message,
      phoneNumber,
      reminderType,
      deliveryStatus: "PENDING",
    },
  });

  try {
    // In production, integrate with Arkesel/Hubtel API here
    // For development, we simulate a successful send
    const apiKey = process.env.SMS_API_KEY;

    if (apiKey && apiKey !== "mock-sms-api-key") {
      // Real SMS API call would go here
      // const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', { ... });
      throw new Error("Real SMS API not configured");
    }

    // Mock: simulate successful delivery
    await prisma.sMSLog.update({
      where: { id: log.id },
      data: { deliveryStatus: "DELIVERED" },
    });

    return {
      success: true,
      logId: log.id,
      message: `SMS sent to ${phoneNumber} (simulated)`,
    };
  } catch (error) {
    await prisma.sMSLog.update({
      where: { id: log.id },
      data: { deliveryStatus: "FAILED" },
    });

    return {
      success: false,
      logId: log.id,
      message: `SMS failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export function generateReminderMessage(
  patientName: string,
  facilityName: string,
  appointmentDate: Date
): string {
  const dateStr = appointmentDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = appointmentDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `Dear ${patientName}, this is a reminder of your appointment at ${facilityName} on ${dateStr} at ${timeStr}. Please attend on time.`;
}

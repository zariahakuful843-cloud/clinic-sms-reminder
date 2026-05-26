import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    // Only admins can register new users (except for first user)
    const userCount = await prisma.user.count();
    if (userCount > 0 && (!session || session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can register new users" },
        { status: 403 }
      );
    }

    const { username, password, fullName, role } = await request.json();

    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const validRoles = ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        role: role as "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "NURSE",
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

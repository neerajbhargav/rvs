import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, action } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Login flow
    if (action === "login") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      return NextResponse.json(user);
    }

    // Signup flow
    try {
      const user = await prisma.user.create({
        data: { email, password, step: 2 },
      });
      return NextResponse.json(user, { status: 201 });
    } catch (err: unknown) {
      // Handle unique constraint violation (email already exists)
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.password === password) {
          return NextResponse.json(existing);
        }
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}

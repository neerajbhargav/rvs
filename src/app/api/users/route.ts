import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password, action } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Login flow
    if (action === "login") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const cookieStore = await cookies();
      cookieStore.set("supportiq_session", user.id, { path: "/", httpOnly: true });
      return NextResponse.json(user);
    }

    // Signup flow
    try {
      const user = await prisma.user.create({
        data: { email, password, step: 2 },
      });
      const cookieStore = await cookies();
      cookieStore.set("supportiq_session", user.id, { path: "/", httpOnly: true });
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
        if (existing) {
          const cookieStore = await cookies();
          cookieStore.set("supportiq_session", existing.id, { path: "/", httpOnly: true });
          return NextResponse.json(existing);
        }
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      throw err;
    }
  } catch (error: unknown) {
    console.error("POST /api/users error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error("GET /api/users error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createUser, getAllUsers, getUserByEmail } from "@/lib/db";

// POST /api/users — Register a new user OR resume session
export async function POST(req: NextRequest) {
  try {
    const { email, password, action } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Resume: check if user exists and credentials match
    if (action === "login") {
      const user = await getUserByEmail(email);
      if (user && user.password === password) {
        return NextResponse.json(user);
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Register: create new user
    try {
      const user = await createUser(email, password);
      return NextResponse.json(user, { status: 201 });
    } catch (err: unknown) {
      // User already exists — treat as login attempt
      const existing = await getUserByEmail(email);
      if (existing && existing.password === password) {
        return NextResponse.json(existing);
      }
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Registration failed" },
        { status: 409 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// GET /api/users — List all users (for data table)
export async function GET() {
  const users = await getAllUsers();
  return NextResponse.json(users);
}

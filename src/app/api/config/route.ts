import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.pageConfig.findUnique({ where: { id: "config" } });
    if (!config) {
      config = await prisma.pageConfig.create({
        data: { id: "config", aboutMe: 2, address: 2, birthdate: 3 },
      });
    }
    return NextResponse.json(config);
  } catch (error: any) {
    console.error("GET /api/config error:", error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { aboutMe, address, birthdate } = await req.json();

    // Validate each value is 2 or 3
    for (const [key, val] of Object.entries({ aboutMe, address, birthdate })) {
      if (val !== 2 && val !== 3) {
        return NextResponse.json(
          { error: `${key} must be 2 or 3` },
          { status: 400 }
        );
      }
    }

    // Validate that both page 2 and page 3 have at least 1 component
    const page2Components = [aboutMe, address, birthdate].filter((v) => v === 2).length;
    const page3Components = [aboutMe, address, birthdate].filter((v) => v === 3).length;

    if (page2Components === 0) {
      return NextResponse.json(
        { error: "Page 2 must have at least one component" },
        { status: 400 }
      );
    }
    if (page3Components === 0) {
      return NextResponse.json(
        { error: "Page 3 must have at least one component" },
        { status: 400 }
      );
    }

    const config = await prisma.pageConfig.upsert({
      where: { id: "config" },
      update: { aboutMe, address, birthdate },
      create: { id: "config", aboutMe, address, birthdate },
    });

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("PUT /api/config error:", error);
    return NextResponse.json({ error: String(error.message || error) }, { status: 500 });
  }
}

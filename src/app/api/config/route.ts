import { NextRequest, NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/db";

// GET /api/config
export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

// PUT /api/config — Update which components appear on which page
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { aboutMe, address, birthdate } = body;

    // Validate: each must be 2 or 3
    if (![2, 3].includes(aboutMe) || ![2, 3].includes(address) || ![2, 3].includes(birthdate)) {
      return NextResponse.json({ error: "Each component must be on page 2 or 3" }, { status: 400 });
    }

    // Validate: each page must have at least one component
    const page2Count = [aboutMe, address, birthdate].filter((p) => p === 2).length;
    const page3Count = [aboutMe, address, birthdate].filter((p) => p === 3).length;
    if (page2Count === 0 || page3Count === 0) {
      return NextResponse.json(
        { error: "Each page must have at least one component" },
        { status: 400 }
      );
    }

    const config = await updateConfig({ aboutMe, address, birthdate });
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

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

    const page1: { id: string; type: string; label: string }[] = [];
    const page2: { id: string; type: string; label: string }[] = [];
    const page3: { id: string; type: string; label: string }[] = [];

    const pushComp = (type: string, label: string, val: number) => {
      const comp = { id: type, type, label };
      if (val === 1) page1.push(comp);
      else if (val === 2) page2.push(comp);
      else if (val === 3) page3.push(comp);
    };

    pushComp("about_me", "About Me", config.aboutMe);
    pushComp("address", "Address", config.address);
    pushComp("birthdate", "Birthdate", config.birthdate);

    return NextResponse.json({ page1, page2, page3 });
  } catch (error: unknown) {
    console.error("GET /api/config error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { page1, page2, page3 } = await req.json();

    if ((!page1 || page1.length === 0) && (!page2 || page2.length === 0) && (!page3 || page3.length === 0)) {
      return NextResponse.json({ error: "At least one page must have components" }, { status: 400 });
    }

    let aboutMe = 0, address = 0, birthdate = 0;

    for (const comp of page1 || []) {
      if (comp.type === "about_me") aboutMe = 1;
      if (comp.type === "address") address = 1;
      if (comp.type === "birthdate") birthdate = 1;
    }
    for (const comp of page2 || []) {
      if (comp.type === "about_me") aboutMe = 2;
      if (comp.type === "address") address = 2;
      if (comp.type === "birthdate") birthdate = 2;
    }
    for (const comp of page3 || []) {
      if (comp.type === "about_me") aboutMe = 3;
      if (comp.type === "address") address = 3;
      if (comp.type === "birthdate") birthdate = 3;
    }

    if (!aboutMe || !address || !birthdate) {
      return NextResponse.json({ error: "All components must be assigned to a page" }, { status: 400 });
    }

    await prisma.pageConfig.upsert({
      where: { id: "config" },
      update: { aboutMe, address, birthdate },
      create: { id: "config", aboutMe, address, birthdate },
    });

    return NextResponse.json({ page2, page3 });
  } catch (error: unknown) {
    console.error("PUT /api/config error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

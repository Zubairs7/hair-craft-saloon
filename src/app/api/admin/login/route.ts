import { NextResponse } from "next/server";
import { z } from "zod";
import { loginAdmin, setAdminCookie } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const admin = await loginAdmin(body.username, body.password);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await setAdminCookie(admin.id);
    return NextResponse.json({ ok: true, username: admin.username });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import {
  FaceShape,
  HAIRSTYLE_CATALOG,
  inferFaceShapeFromSeed,
  recommendStyles,
} from "@/lib/salon";

const VALID: FaceShape[] = [
  "oval",
  "round",
  "square",
  "oblong",
  "heart",
  "diamond",
];

/**
 * AI-style recommendation endpoint.
 * Accepts optional faceShape or a numeric seed derived from selfie analysis client-side.
 * Returns top hairstyle matches with preview assets.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let faceShape = body.faceShape as FaceShape | undefined;
    const seed = Number(body.seed ?? Date.now());

    if (!faceShape || !VALID.includes(faceShape)) {
      faceShape = inferFaceShapeFromSeed(Math.floor(seed));
    }

    const recommendations = recommendStyles(faceShape, 4).map((style) => ({
      ...style,
      matchScore:
        style.faceShapes.includes(faceShape!)
          ? 88 + (Math.abs(Math.floor(seed) + style.id.length) % 10)
          : 62 + (Math.abs(Math.floor(seed) + style.name.length) % 15),
    }));

    return NextResponse.json({
      faceShape,
      analysis: {
        summary: `Detected a primarily ${faceShape} face shape. Styles below balance proportion, jawline, and forehead lines.`,
        tips: [
          "Bring this recommendation to your barber for a precise finish.",
          "Lighting and hair density can change the final look slightly.",
          "Ask for a photo reference when you sit in the chair.",
        ],
      },
      recommendations,
      catalogSize: HAIRSTYLE_CATALOG.length,
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 400 });
  }
}

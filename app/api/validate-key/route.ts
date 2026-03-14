import { NextRequest, NextResponse } from "next/server";
import { validateInstantlyKey } from "@/lib/api/instantly";
import { validateHeyReachKey } from "@/lib/api/heyreach";

/**
 * POST /api/validate-key
 * Tests whether a given API key is valid for the specified platform.
 * Body: { platform: "instantly" | "heyreach", apiKey: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { platform, apiKey } = body as { platform: string; apiKey: string };

        if (!platform || !apiKey) {
            return NextResponse.json(
                { valid: false, error: "Missing platform or apiKey" },
                { status: 400 }
            );
        }

        let valid = false;

        if (platform === "instantly") {
            valid = await validateInstantlyKey(apiKey);
        } else if (platform === "heyreach") {
            valid = await validateHeyReachKey(apiKey);
        } else {
            return NextResponse.json(
                { valid: false, error: `Unknown platform: ${platform}` },
                { status: 400 }
            );
        }

        return NextResponse.json({ valid });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { valid: false, error: message },
            { status: 500 }
        );
    }
}

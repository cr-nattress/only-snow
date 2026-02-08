import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (...args: any[]) => Promise<NextResponse>;

function log(entry: Record<string, unknown>) {
  console.log(JSON.stringify(entry));
}

export function withLogging<T extends RouteHandler>(handler: T): T {
  return (async (request: NextRequest, ...rest: unknown[]) => {
    const start = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;
    const query = Object.fromEntries(request.nextUrl.searchParams);

    try {
      const response = await handler(request, ...rest);
      log({ type: "api", method, path, query, status: response.status, durationMs: Date.now() - start });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log({ type: "api", method, path, query, status: 500, durationMs: Date.now() - start, error: message });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }) as T;
}

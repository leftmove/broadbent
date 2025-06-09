import { NextRequest, NextResponse } from "next/server";
import { ensureSuperTokensInit } from "lib/supertokens/backend";
import { middleware } from "supertokens-node/framework/express";
import { createServer } from "http";

ensureSuperTokensInit();

async function handleAuth(request: NextRequest) {
  // Create a mock Express-like request/response for SuperTokens
  const req = {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.body,
    query: Object.fromEntries(new URL(request.url).searchParams.entries()),
  };

  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: "",
    setHeader: function(name: string, value: string) {
      this.headers[name] = value;
    },
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    send: function(data: any) {
      this.body = data;
      return this;
    },
    json: function(data: any) {
      this.body = JSON.stringify(data);
      this.setHeader("Content-Type", "application/json");
      return this;
    },
  };

  try {
    await new Promise<void>((resolve, reject) => {
      middleware()(req as any, res as any, (err?: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return new NextResponse(res.body, {
      status: res.statusCode,
      headers: res.headers,
    });
  } catch (error) {
    console.error("SuperTokens middleware error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleAuth(request);
}

export async function POST(request: NextRequest) {
  return handleAuth(request);
}

export async function DELETE(request: NextRequest) {
  return handleAuth(request);
}

export async function PUT(request: NextRequest) {
  return handleAuth(request);
}

export async function PATCH(request: NextRequest) {
  return handleAuth(request);
}
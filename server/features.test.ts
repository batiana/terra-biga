import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("products", () => {
  it("list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.products.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("cagnottes", () => {
  it("list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.cagnottes.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("donations", () => {
  it("list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.donations.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin", () => {
  it("stats requires admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("stats returns data for admin", async () => {
    const caller = appRouter.createCaller(createAuthContext("admin"));
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("users");
    expect(result).toHaveProperty("orders");
    expect(result).toHaveProperty("cagnottes");
    expect(result).toHaveProperty("donations");
    expect(result).toHaveProperty("revenue");
  });
});

describe("auth", () => {
  it("me returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).toHaveProperty("name", "Test User");
    expect(result).toHaveProperty("role", "user");
  });
});

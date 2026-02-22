import { describe, expect, it, vi, beforeEach } from "vitest";
import express from "express";
import { registerOgRoutes } from "./ogRoutes";
import type { Request, Response } from "express";

// Mock the db module
vi.mock("./db", () => ({
  getCagnotteById: vi.fn(),
}));

import { getCagnotteById } from "./db";

const mockGetCagnotteById = getCagnotteById as ReturnType<typeof vi.fn>;

function createMockReqRes(params: Record<string, string>) {
  const req = { params } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
}

describe("OG Routes - /api/og/cagnotte/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cagnotte share data with correct fields", async () => {
    const mockCagnotte = {
      id: 1,
      title: "Mariage de Fatou & Ibrahim",
      description: "Aidez-nous à célébrer notre union !",
      currentAmount: 175000,
      targetAmount: 500000,
      contributorsCount: 12,
      category: "mariage_bapteme",
      status: "active",
    };

    mockGetCagnotteById.mockResolvedValue(mockCagnotte);

    const app = express();
    registerOgRoutes(app);

    // Simulate the route handler directly
    const { req, res } = createMockReqRes({ id: "1" });

    // Get the route handler
    const routeStack = (app as any)._router.stack;
    const ogRoute = routeStack.find(
      (layer: any) =>
        layer.route && layer.route.path === "/api/og/cagnotte/:id"
    );

    expect(ogRoute).toBeDefined();

    // Call the handler
    await ogRoute.route.stack[0].handle(req, res);

    expect(mockGetCagnotteById).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        title: "Mariage de Fatou & Ibrahim",
        description: "Aidez-nous à célébrer notre union !",
        percent: 35,
        contributorsCount: 12,
        shareText: expect.stringContaining("Mariage de Fatou"),
      })
    );
  });

  it("returns 404 for non-existent cagnotte", async () => {
    mockGetCagnotteById.mockResolvedValue(undefined);

    const app = express();
    registerOgRoutes(app);

    const { req, res } = createMockReqRes({ id: "999" });

    const routeStack = (app as any)._router.stack;
    const ogRoute = routeStack.find(
      (layer: any) =>
        layer.route && layer.route.path === "/api/og/cagnotte/:id"
    );

    await ogRoute.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cagnotte not found" });
  });

  it("returns 400 for invalid ID", async () => {
    const app = express();
    registerOgRoutes(app);

    const { req, res } = createMockReqRes({ id: "abc" });

    const routeStack = (app as any)._router.stack;
    const ogRoute = routeStack.find(
      (layer: any) =>
        layer.route && layer.route.path === "/api/og/cagnotte/:id"
    );

    await ogRoute.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid cagnotte ID" });
  });

  it("calculates percentage correctly at 100% cap", async () => {
    const mockCagnotte = {
      id: 2,
      title: "Cagnotte complète",
      description: null,
      currentAmount: 600000,
      targetAmount: 500000,
      contributorsCount: 50,
      category: "autre",
      status: "active",
    };

    mockGetCagnotteById.mockResolvedValue(mockCagnotte);

    const app = express();
    registerOgRoutes(app);

    const { req, res } = createMockReqRes({ id: "2" });

    const routeStack = (app as any)._router.stack;
    const ogRoute = routeStack.find(
      (layer: any) =>
        layer.route && layer.route.path === "/api/og/cagnotte/:id"
    );

    await ogRoute.route.stack[0].handle(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        percent: 100,
      })
    );
  });
});

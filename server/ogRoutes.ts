import { Router } from "express";
import { getCagnotteById } from "./db";

/**
 * Serves dynamic Open Graph meta tags for cagnotte pages.
 * Social crawlers (Facebook, Twitter, WhatsApp, Telegram) fetch the URL
 * and read these meta tags to build rich link previews.
 */
export function registerOgRoutes(app: Router) {
  app.get("/api/og/cagnotte/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid cagnotte ID" });
      }

      const cagnotte = await getCagnotteById(id);
      if (!cagnotte) {
        return res.status(404).json({ error: "Cagnotte not found" });
      }

      const percent =
        cagnotte.targetAmount > 0
          ? Math.min(
              Math.round(
                (cagnotte.currentAmount / cagnotte.targetAmount) * 100
              ),
              100
            )
          : 0;

      const formatFCFA = (n: number) =>
        new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

      return res.json({
        id: cagnotte.id,
        title: cagnotte.title,
        description:
          cagnotte.description ||
          `Cagnotte collective sur Terra Biga`,
        currentAmount: cagnotte.currentAmount,
        targetAmount: cagnotte.targetAmount,
        percent,
        contributorsCount: cagnotte.contributorsCount,
        category: cagnotte.category,
        shareText: `🤝 Soutenez "${cagnotte.title}" sur Terra Biga ! ${formatFCFA(cagnotte.currentAmount)} collectés sur ${formatFCFA(cagnotte.targetAmount)} (${percent}%). Chaque contribution compte !`,
      });
    } catch (error) {
      console.error("[OG Route] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}

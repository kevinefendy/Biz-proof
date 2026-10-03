import type { Request, Response, NextFunction } from "express";
import { config } from "../config";

/** API-key sederhana untuk endpoint lender (MVP). Verifikasi publik tetap tanpa auth. */
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("X-API-Key") || "";
  if (!key || !config.apiKeys.includes(key)) {
    return res.status(401).json({ error: "API key lender tidak valid (header X-API-Key)" });
  }
  next();
}

import type { Request, Response } from "express";
import * as authService from "./auth.service";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role, image } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      image?: string;
    };

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Password is required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const allowedRole = role === "TUTOR" ? "TUTOR" : "STUDENT";
    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role: allowedRole,
      image: image ?? null,
    });

    return res.status(201).json({ success: true, user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Registration failed";
    if (message.includes("already exists")) {
      return res.status(409).json({ success: false, message });
    }
    console.error("[Auth] register error:", e);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
}

export async function verifyCredentials(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await authService.verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    return res.status(200).json({ success: true, user });
  } catch (e) {
    console.error("[Auth] verify-credentials error:", e);
    return res.status(500).json({ success: false, message: "Authentication failed" });
  }
}

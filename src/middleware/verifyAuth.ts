import type { NextFunction, Request, Response } from "express";
import { getAuthUserFromRequest } from "../lib/auth";

export enum UserRole {
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  ADMIN = "ADMIN",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

const verifyAuth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getAuthUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  };
};

export { verifyAuth };

import type { NextFunction, Request, Response } from "express"
import { auth } from "../lib/auth";


export enum UserRole {
    STUDENT = "STUDENT",
    TUTOR = "TUTOR",
    ADMIN = "ADMIN"
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
        //Get user session
        const session = await auth.api.getSession({
            headers: req.headers as any,
        });

        if (!session) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized" });
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
            emailVerified: session.user.emailVerified
        };

        if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) {
            return res.status(403).json({ 
                success: false, 
                message: "Forbidden" });
        }

        next();
    };
};

export { verifyAuth };
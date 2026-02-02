import type { Request, Response } from "express";
import { adminService } from "./admin.service";

const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await adminService.getAllUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to get users", details: error });
    }
};

const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        if (typeof active !== "boolean") {
            return res.status(400).json({ success: false, message: "active must be a boolean" });
        }
        const user = await adminService.updateUserStatus(id, active);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to update user status", details: error });
    }
};

export const adminController = {
    getUsers,
    updateUserStatus,
};

import type { Request, Response, NextFunction } from "express";
import { bookingsService } from "./bookings.service";
import { Role } from "../../../generated/prisma/enums";


const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const booking = await bookingsService.createBooking(req.body);
        res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: "Failed to create booking", details: error });
    }
};


const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const studentId = req.user?.id!;
        const cancelledBooking = await bookingsService.cancelBooking(bookingId as string, studentId);
        res.status(200).json({ success: true, data: cancelledBooking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: "Booking cancellation failed", details: error  });
    }
};


const completeBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const tutorId = req.user?.id!;
        const completedBooking = await bookingsService.completeBooking(bookingId as string, tutorId);
        res.status(200).json({ success: true, data: completedBooking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: "Booking completion failed", details: error });
    }
};


const getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;
        const userId = req.user?.id!;
        const role = req.user?.role!;
        const bookings = await bookingsService.getBookings({ userId, role, status: status as any });
        res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
        res.status(400).json({ success: false, message: "Failed to retrieve bookings", details: error });
    }
};


const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user?.id!;
        const role = req.user?.role!;
        const booking = await bookingsService.getBookingById(bookingId as string, userId, role as Role);
        res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: "Failed to retrieve booking", details: error });
    }
};


const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user?.id!;
        const review = await bookingsService.createReview({ ...req.body, studentId });
        res.status(201).json({ success: true, data: review });
    } catch (error: any) {
        res.status(400).json({ success: false, message: "Failed to create review", details: error });
    }
};

export const bookingsController = {
    createBooking,
    cancelBooking,
    completeBooking,
    getBookings,
    getBookingById,
    createReview,
};

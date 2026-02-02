import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = Router();

router.post("/",verifyAuth(UserRole.STUDENT),bookingsController.createBooking
);

router.patch("/:bookingId/cancel",verifyAuth(UserRole.STUDENT),bookingsController.cancelBooking
);


router.patch("/:bookingId/complete",verifyAuth(UserRole.TUTOR),bookingsController.completeBooking
);


router.get("/",verifyAuth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),bookingsController.getBookings
);


router.get("/:bookingId",verifyAuth(UserRole.STUDENT, UserRole.TUTOR),bookingsController.getBookingById
);

// Create a review for a completed booking (Student only)
router.post("/:bookingId/review",verifyAuth(UserRole.STUDENT),bookingsController.createReview
);

export const bookingRouter = router;
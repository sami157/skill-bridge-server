import type { BookingStatus, Role } from "../../../generated/prisma/enums";

interface CreateTutorProfileInput {
    userId: string;
    bio?: string;
    subjectsIds: string[];
    availability?: any | null;
    pricePerHour: number;
}

interface UpdateTutorProfileInput {
    userId: string;
    bio?: string | null;
    subjectsIds?: string[];
    availability?: any | null;
    pricePerHour?: number;
}

interface TutorSearchFilters {
    subjectId?: string;
    categoryId?: string;
    minRating?: number;
    maxPrice?: number;
    sortBy?: "rating_asc" | "rating_desc" | "price_asc" | "price_desc";
}

/** Booking creation: tutorUserId must be the tutor's User.id (not TutorProfile.id). */
interface CreateBookingPayload {
    studentId: string;
    tutorUserId: string;
    startTime: Date;
    endTime: Date;
}

interface GetBookingsParams {
    userId: string;
    role: Role;
    status?: BookingStatus;
    isAdmin?: boolean;
}

interface CreateReviewInput {
    bookingId: string;
    studentId: string;
    rating: number;
    comment?: string;
}

interface UpdateStudentProfileInput  {
    name: string;
    phone: string;
    image: string;
};

export type { 
    CreateTutorProfileInput,
    UpdateTutorProfileInput, 
    TutorSearchFilters,
    CreateReviewInput,
    CreateBookingPayload,
    GetBookingsParams,
    UpdateStudentProfileInput
};
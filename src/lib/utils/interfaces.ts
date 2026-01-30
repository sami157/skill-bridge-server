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

interface CreateBookingPayload {
    studentId: string;
    tutorId: string;
    startTime: Date;
    endTime: Date;
}

interface GetBookingsParams {
    userId: string;
    role: Omit<Role, "ADMIN">;
    status?: BookingStatus;
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
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

export type { 
    CreateTutorProfileInput,
    UpdateTutorProfileInput, 
    TutorSearchFilters 
};
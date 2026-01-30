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
}

export type { 
    CreateTutorProfileInput,
    UpdateTutorProfileInput, 
    TutorSearchFilters 
};
import { Review } from "@/types";

const EMPTY_AROMA = {
    earthy: 0, sour_acidic: 0, sweet: 0, bitter: 0,
    spicy: 0, light_grain: 0, dark_grain: 0, citrus: 0,
    berry: 0, tropical: 0, floral: 0, nutty: 0
};

export const MOCK_REVIEWS: Review[] = [
    {
        id: "review-1",
        beer_id: "angela",
        rating: 5,
        comment: "Excellent carbonation and bright hop aroma. Truly scientific perfection.",
        reviewer_name: "John Doe",
        reviewer_sex: "male",
        reviewer_age: 34,
        metrics: {
            appearance: 9,
            aroma: 10,
            flavor: 9,
            mouthfeel: 8,
            bubbles: 9,
            bitterness: 7
        },
        aroma_profile: { ...EMPTY_AROMA, citrus: 8, floral: 6 },
        created_at: new Date().toISOString()
    },
    {
        id: "review-2",
        beer_id: "mc-ginnis",
        rating: 4,
        comment: "Rich and creamy. The mouthfeel is exceptional.",
        reviewer_name: "Jane Smith",
        reviewer_sex: "female",
        reviewer_age: 28,
        metrics: {
            appearance: 8,
            aroma: 7,
            flavor: 8,
            mouthfeel: 10,
            bubbles: 8,
            bitterness: 4
        },
        aroma_profile: { ...EMPTY_AROMA, light_grain: 9, earthy: 5 },
        created_at: new Date().toISOString()
    }
];

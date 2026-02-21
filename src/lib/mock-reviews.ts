import { Review } from "@/types";

const EMPTY_AROMA = {
    menthol: 0, tea: 0, green_fruits: 0, citrus: 0,
    green: 0, vegetal: 0, cream_caramel: 0, woody_aromatic: 0,
    spicy_herbal: 0, red_berries: 0, sweet_fruits: 0, floral: 0
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
            bubbles: 9
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
            bubbles: 8
        },
        aroma_profile: { ...EMPTY_AROMA, cream_caramel: 9, woody_aromatic: 5 },
        created_at: new Date().toISOString()
    }
];

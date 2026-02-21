export type Beer = {
    id: string;
    name: string;
    style: string;
    abv: number;
    description: string;
    label_url: string;
    mockup_url?: string;
    color?: string; // Dominant color from label for accents
    scientific_profile: {
        appearance: string;
        aroma: string;
        flavor: string;
        mouthfeel: string;
        bubbles: string;
    };
};

export type AromaProfile = {
    menthol: number;
    tea: number;
    green_fruits: number;
    citrus: number;
    green: number;
    vegetal: number;
    cream_caramel: number;
    woody_aromatic: number;
    spicy_herbal: number;
    red_berries: number;
    sweet_fruits: number;
    floral: number;
};

export type Review = {
    id: string;
    beer_id: string;
    rating: number; // 1-5 stars
    comment: string;
    reviewer_name?: string;
    reviewer_sex?: string;
    reviewer_age?: number;
    metrics: {
        appearance: number; // 1-10
        aroma: number; // 1-10
        flavor: number; // 1-10
        mouthfeel: number; // 1-10
        bubbles: number; // 1-10
    };
    aroma_profile: AromaProfile;
    created_at: string;
};

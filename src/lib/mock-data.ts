import { Beer } from "@/types";

export const MOCK_BEERS: Beer[] = [
    {
        id: "angela",
        name: "Angela",
        style: "IPA",
        abv: 6.0,
        description: "A vibrant and aromatic IPA with bold citrus notes.",
        label_url: "/assets/Beer Labels/angela.png",
        scientific_profile: {
            appearance: "Clear golden pour with a persistent white head.",
            aroma: "Intense hops, grapefruit, and pine needles.",
            flavor: "Balanced bitterness with a crisp, dry finish.",
            mouthfeel: "Medium body, lively carbonation.",
            bubbles: "Crisp and lively carbonation with fine bubbles."
        }
    },
    {
        id: "mc-ginnis",
        name: "Mc Ginnis",
        style: "Stout",
        abv: 7.0,
        description: "A deep, dark stout with rich roasted malt character.",
        label_url: "/assets/Beer Labels/mc-ginnis.png",
        scientific_profile: {
            appearance: "Opaque black with a thick tan head.",
            aroma: "Coffee, dark chocolate, and roasted barley.",
            flavor: "Complex malt sweetness with a hint of dark fruit.",
            mouthfeel: "Full-bodied, creamy and smooth.",
            bubbles: "Gentle and creamy with small, soft bubbles."
        }
    }
];

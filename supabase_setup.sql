-- Create the beers table
CREATE TABLE beers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    style TEXT NOT NULL,
    abv REAL NOT NULL,
    description TEXT,
    label_url TEXT,
    mockup_url TEXT,
    scientific_profile JSONB NOT NULL DEFAULT '{
        "appearance": "",
        "aroma": "",
        "flavor": "",
        "mouthfeel": "",
        "bubbles": ""
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beer_id TEXT REFERENCES beers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    metrics JSONB NOT NULL,
    reviewer_name TEXT,
    reviewer_sex TEXT,
    reviewer_age INTEGER,
    aroma_profile JSONB NOT NULL DEFAULT '{
        "menthol": 0, "tea": 0, "green_fruits": 0, "citrus": 0,
        "green": 0, "vegetal": 0, "cream_caramel": 0, "woody_aromatic": 0,
        "spicy_herbal": 0, "red_berries": 0, "sweet_fruits": 0, "floral": 0
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE beers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Read-only for beers, Insert for reviews)
CREATE POLICY "Public Read Access for Beers" ON beers FOR SELECT USING (true);
CREATE POLICY "Public Insert Access for Beers" ON beers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access for Beers" ON beers FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access for Beers" ON beers FOR DELETE USING (true);

CREATE POLICY "Public Insert Access for Reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Access for Reviews" ON reviews FOR SELECT USING (true);

-- Create Storage bucket for beer labels
-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('beer-labels', 'beer-labels', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for the beer-labels bucket
CREATE POLICY "Public Access for Beer Labels" ON storage.objects FOR SELECT USING (bucket_id = 'beer-labels');
CREATE POLICY "Public Upload Access for Beer Labels" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'beer-labels');
CREATE POLICY "Public Update Access for Beer Labels" ON storage.objects FOR UPDATE USING (bucket_id = 'beer-labels');
CREATE POLICY "Public Delete Access for Beer Labels" ON storage.objects FOR DELETE USING (bucket_id = 'beer-labels');

-- Insert Initial Mock Data (Optional)
INSERT INTO beers (id, name, style, abv, description, label_url, scientific_profile)
VALUES 
('angela', 'Angela', 'IPA', 6.0, 'A vibrant and aromatic IPA with bold citrus notes.', '/assets/Beer Labels/angela.png', '{"appearance": "Clear golden pour with a persistent white head.", "aroma": "Intense hops, grapefruit, and pine needles.", "flavor": "Balanced bitterness with a crisp, dry finish.", "mouthfeel": "Medium body, lively carbonation."}'),
('mc-ginnis', 'Mc Ginnis', 'Stout', 7.0, 'A deep, dark stout with rich roasted malt character.', '/assets/Beer Labels/mc-ginnis.png', '{"appearance": "Opaque black with a thick tan head.", "aroma": "Coffee, dark chocolate, and roasted barley.", "flavor": "Complex malt sweetness with a hint of dark fruit.", "mouthfeel": "Full-bodied, creamy and smooth."}');

-- OutdoorSpot Database Schema
-- PostgreSQL database schema for camping and outdoor activities finder

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    location_preferences JSONB,
    activity_preferences JSONB,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (camping spots, hiking trails, etc.)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_type VARCHAR(50) NOT NULL, -- 'camping', 'hiking', 'biking', 'kayaking', 'photography'
    coordinates POINT NOT NULL, -- PostGIS point for lat/lng
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'US',
    elevation INTEGER, -- in feet
    terrain_type VARCHAR(50), -- 'mountain', 'forest', 'desert', 'coastal', 'lake', 'river'
    climate_zone VARCHAR(50), -- 'temperate', 'arctic', 'tropical', 'desert', 'mediterranean'
    amenities JSONB, -- array of available amenities
    cost_per_night DECIMAL(10,2),
    max_capacity INTEGER,
    pet_friendly BOOLEAN DEFAULT FALSE,
    reservation_required BOOLEAN DEFAULT FALSE,
    season_start DATE, -- seasonal availability
    season_end DATE,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    safety_notes TEXT,
    regulations TEXT,
    contact_info JSONB,
    website_url TEXT,
    images JSONB, -- array of image URLs
    verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (specific activities at locations)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'hiking', 'mountain_biking', 'kayaking', 'photography', 'climbing'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    distance_miles DECIMAL(8,2), -- trail length or activity distance
    elevation_gain INTEGER, -- in feet
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_duration_hours DECIMAL(4,1),
    equipment_required JSONB, -- array of required equipment
    best_season VARCHAR(50), -- 'spring', 'summer', 'fall', 'winter', 'year_round'
    trail_conditions TEXT,
    highlights TEXT, -- key features or viewpoints
    safety_considerations TEXT,
    coordinates POINT, -- for specific trail/activity points
    images JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (local outdoor events, meetups, guided tours)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id),
    organizer_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- 'meetup', 'guided_tour', 'workshop', 'competition', 'festival'
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    cost DECIMAL(10,2),
    equipment_provided JSONB,
    skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'all_levels'
    age_restriction VARCHAR(50),
    registration_deadline TIMESTAMP WITH TIME ZONE,
    contact_info JSONB,
    images JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    content TEXT,
    visit_date DATE,
    images JSONB,
    helpful_votes INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, location_id, activity_id, event_id)
);

-- User bookmarks/favorites
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, location_id, activity_id, event_id)
);

-- Trip planning
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'confirmed', 'completed', 'cancelled'
    total_cost DECIMAL(10,2),
    participants JSONB, -- array of participant info
    itinerary JSONB, -- structured itinerary data
    packing_list JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip locations (many-to-many relationship)
CREATE TABLE trip_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    visit_date DATE,
    duration_hours DECIMAL(4,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather data (for climate filtering)
CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    temperature_high INTEGER, -- Fahrenheit
    temperature_low INTEGER,
    precipitation_chance INTEGER, -- percentage
    wind_speed INTEGER, -- mph
    conditions VARCHAR(100), -- 'sunny', 'cloudy', 'rainy', etc.
    uv_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, date)
);

-- Categories for better organization
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color code
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location categories (many-to-many)
CREATE TABLE location_categories (
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (location_id, category_id)
);

-- Indexes for performance
CREATE INDEX idx_locations_coordinates ON locations USING GIST (coordinates);
CREATE INDEX idx_locations_location_type ON locations(location_type);
CREATE INDEX idx_locations_terrain_type ON locations(terrain_type);
CREATE INDEX idx_locations_cost ON locations(cost_per_night);
CREATE INDEX idx_locations_verified ON locations(verified);
CREATE INDEX idx_activities_location_id ON activities(location_id);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);
CREATE INDEX idx_activities_difficulty ON activities(difficulty_level);
CREATE INDEX idx_reviews_location_id ON reviews(location_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_location_id ON events(location_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_weather_data_location_date ON weather_data(location_id, date);

-- Full-text search indexes
CREATE INDEX idx_locations_search ON locations USING GIN (to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_activities_search ON activities USING GIN (to_tsvector('english', name || ' ' || description));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion functions
CREATE OR REPLACE FUNCTION seed_sample_categories()
RETURNS VOID AS $$
BEGIN
    INSERT INTO categories (name, description, icon, color) VALUES
    ('Camping', 'Traditional camping spots with tent and RV sites', 'tent', '#2D5016'),
    ('Hiking', 'Trails and hiking opportunities', 'hiking', '#87CEEB'),
    ('Mountain Biking', 'Mountain bike trails and bike parks', 'bike', '#FF6B35'),
    ('Water Sports', 'Kayaking, canoeing, and water activities', 'water', '#4A90E2'),
    ('Photography', 'Scenic spots perfect for photography', 'camera', '#9B59B6'),
    ('Rock Climbing', 'Climbing areas and bouldering spots', 'climbing', '#E74C3C'),
    ('Wildlife Viewing', 'Areas known for wildlife observation', 'binoculars', '#27AE60'),
    ('Stargazing', 'Dark sky areas for astronomy', 'star', '#34495E')
    ON CONFLICT (name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
CREATE VIEW location_summary AS
SELECT 
    l.id,
    l.name,
    l.description,
    l.location_type,
    l.coordinates,
    l.city,
    l.state,
    l.cost_per_night,
    l.difficulty_level,
    l.terrain_type,
    l.pet_friendly,
    l.verified,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as review_count,
    COUNT(DISTINCT a.id) as activity_count
FROM locations l
LEFT JOIN reviews r ON l.id = r.location_id AND r.is_active = true
LEFT JOIN activities a ON l.id = a.location_id AND a.is_active = true
WHERE l.is_active = true
GROUP BY l.id, l.name, l.description, l.location_type, l.coordinates, 
         l.city, l.state, l.cost_per_night, l.difficulty_level, 
         l.terrain_type, l.pet_friendly, l.verified;

CREATE VIEW popular_activities AS
SELECT 
    a.id,
    a.name,
    a.activity_type,
    a.difficulty_level,
    a.distance_miles,
    a.estimated_duration_hours,
    l.name as location_name,
    l.city,
    l.state,
    l.coordinates,
    COUNT(DISTINCT r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as average_rating
FROM activities a
JOIN locations l ON a.location_id = l.id
LEFT JOIN reviews r ON a.id = r.activity_id AND r.is_active = true
WHERE a.is_active = true AND l.is_active = true
GROUP BY a.id, a.name, a.activity_type, a.difficulty_level, 
         a.distance_miles, a.estimated_duration_hours,
         l.name, l.city, l.state, l.coordinates;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO outdoor_spot_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO outdoor_spot_user;

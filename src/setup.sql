CREATE TABLE IF NOT EXISTS organizations (
    organization_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    logo_filename VARCHAR(255)
);

ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS logo_filename VARCHAR(255);

INSERT INTO organizations (name, description, email, logo_filename) VALUES
    ('BrightFuture Builders', 'Building brighter neighborhoods through community action.', 'info@brightfuture.org', 'brightfuture-logo.png'),
    ('GreenHarvest Growers', 'Growing healthy food and stronger local connections.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
    ('UnityServe Volunteers', 'Bringing people together to support neighbors in need.', 'hello@unityserve.org', 'unityserve-logo.png')
ON CONFLICT (name) DO UPDATE
SET logo_filename = EXCLUDED.logo_filename;

CREATE TABLE IF NOT EXISTS service_projects (
    project_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    project_date DATE NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    organization_id INTEGER NOT NULL REFERENCES organizations (organization_id) ON DELETE CASCADE,
    UNIQUE (organization_id, title)
);

ALTER TABLE service_projects
    ADD COLUMN IF NOT EXISTS location VARCHAR(255);

INSERT INTO service_projects (title, project_date, description, location, organization_id)
SELECT project.title, project.project_date::DATE, project.description, project.location, organization.organization_id
FROM (VALUES
    ('Neighborhood Park Cleanup', '2027-01-16', 'Clean trails, collect litter, and refresh shared park spaces.', 'Neighborhood Park', 'BrightFuture Builders'),
    ('Community Garden Build', '2027-02-06', 'Prepare garden beds for a new neighborhood growing season.', 'Community Garden', 'BrightFuture Builders'),
    ('Accessible Playground Refresh', '2027-03-13', 'Repair and repaint equipment at a local accessible playground.', 'Accessible Playground', 'BrightFuture Builders'),
    ('School Reading Corner', '2027-04-10', 'Create welcoming reading spaces for elementary school students.', 'Local Elementary School', 'BrightFuture Builders'),
    ('Senior Center Repairs', '2027-05-08', 'Complete small repairs and improvements at a neighborhood senior center.', 'Neighborhood Senior Center', 'BrightFuture Builders'),
    ('Community Garden Planting', '2027-01-23', 'Plant seasonal vegetables and herbs in community garden plots.', 'Community Garden', 'GreenHarvest Growers'),
    ('Farmers Market Food Drive', '2027-02-20', 'Collect fresh produce donations for local food pantries.', 'Farmers Market', 'GreenHarvest Growers'),
    ('School Garden Workshops', '2027-03-20', 'Help students learn how to grow and care for food plants.', 'Local School Garden', 'GreenHarvest Growers'),
    ('Neighborhood Compost Day', '2027-04-17', 'Teach residents composting basics and prepare shared compost bins.', 'Community Compost Site', 'GreenHarvest Growers'),
    ('Harvest Box Packing', '2027-05-15', 'Pack locally grown produce boxes for families in need.', 'Community Farm', 'GreenHarvest Growers'),
    ('Community Food Pantry Shift', '2027-01-30', 'Sort donations and help prepare food pantry orders.', 'Community Food Pantry', 'UnityServe Volunteers'),
    ('After-School Tutoring', '2027-02-27', 'Support students with reading, homework, and study skills.', 'Community Learning Center', 'UnityServe Volunteers'),
    ('Wellness Fair Volunteers', '2027-03-27', 'Help local residents connect with health and wellness resources.', 'Community Center', 'UnityServe Volunteers'),
    ('Winter Clothing Distribution', '2027-04-24', 'Organize donated clothing and assist visitors at a community distribution.', 'Community Distribution Center', 'UnityServe Volunteers'),
    ('Neighbor Check-In Visits', '2027-05-22', 'Visit older neighbors and connect them with community support.', 'Local Neighborhoods', 'UnityServe Volunteers')
) AS project (title, project_date, description, location, organization_name)
JOIN organizations AS organization ON organization.name = project.organization_name
ON CONFLICT (organization_id, title) DO UPDATE
SET location = EXCLUDED.location;

CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
);

INSERT INTO categories (name) VALUES
    ('Environment'),
    ('Education'),
    ('Food Security'),
    ('Community Support'),
    ('Health and Wellness')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS project_categories (
    project_id INTEGER NOT NULL REFERENCES service_projects (project_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories (category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

INSERT INTO project_categories (project_id, category_id)
SELECT project.project_id, category.category_id
FROM (VALUES
    ('Neighborhood Park Cleanup', 'Environment'),
    ('Community Garden Build', 'Environment'),
    ('Community Garden Build', 'Food Security'),
    ('Accessible Playground Refresh', 'Community Support'),
    ('School Reading Corner', 'Education'),
    ('Senior Center Repairs', 'Community Support'),
    ('Community Garden Planting', 'Environment'),
    ('Community Garden Planting', 'Food Security'),
    ('Farmers Market Food Drive', 'Food Security'),
    ('School Garden Workshops', 'Education'),
    ('School Garden Workshops', 'Environment'),
    ('Neighborhood Compost Day', 'Environment'),
    ('Harvest Box Packing', 'Food Security'),
    ('Community Food Pantry Shift', 'Food Security'),
    ('Community Food Pantry Shift', 'Community Support'),
    ('After-School Tutoring', 'Education'),
    ('Wellness Fair Volunteers', 'Health and Wellness'),
    ('Winter Clothing Distribution', 'Community Support'),
    ('Neighbor Check-In Visits', 'Health and Wellness'),
    ('Neighbor Check-In Visits', 'Community Support')
) AS assignment (project_title, category_name)
JOIN service_projects AS project ON project.title = assignment.project_title
JOIN categories AS category ON category.name = assignment.category_name
ON CONFLICT (project_id, category_id) DO NOTHING;

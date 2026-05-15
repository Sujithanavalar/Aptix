/*
# Add Icon Identifiers to Topics

Add icon field to topics table to store Lucide icon names for consistent UI display.
*/

-- Add icon column to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'BookOpen';

-- Update each topic with relevant icon
UPDATE topics SET icon = 'Clock' WHERE slug = 'ages';
UPDATE topics SET icon = 'Gauge' WHERE slug = 'speed-time-distance';
UPDATE topics SET icon = 'Scale' WHERE slug = 'ratio-proportion';
UPDATE topics SET icon = 'TrendingUp' WHERE slug = 'arithmetic-progression';
UPDATE topics SET icon = 'Superscript' WHERE slug = 'surds-indices';
UPDATE topics SET icon = 'Ship' WHERE slug = 'boats-streams';
UPDATE topics SET icon = 'Droplets' WHERE slug = 'pipes-cisterns';
UPDATE topics SET icon = 'FlaskConical' WHERE slug = 'allegation-mixtures';

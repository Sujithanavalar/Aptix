/*
# Add video URLs to topics

## Purpose
Add YouTube video links to each topic for enhanced learning experience.

## Changes
- Add video_url column to topics table
- Update existing topics with their respective YouTube video URLs

## Video Mapping
- Ages: https://youtu.be/viKaYznFJbw
- Speed, Time and Distance: https://youtu.be/Z4aRxGL4ltU
- Ratio and Proportion: https://youtu.be/xRLNYich5Ls
- Arithmetic Progression: https://youtu.be/fwUMJhTDGog
- Surds and Indices: https://youtu.be/6xQCumDHOFA
- Boats and Streams: https://youtu.be/Agnaf5cv9lY
- Pipes and Cisterns: https://youtu.be/j6vo6d6H6Ho
- Allegation and Mixtures: https://youtu.be/PQ8ux_3hdT4
*/

-- Add video_url column to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS video_url text;

-- Update topics with their respective video URLs
UPDATE topics SET video_url = 'https://www.youtube.com/embed/viKaYznFJbw' WHERE slug = 'ages';
UPDATE topics SET video_url = 'https://www.youtube.com/embed/Z4aRxGL4ltU' WHERE slug = 'speed-time-distance';
UPDATE topics SET video_url = 'https://www.youtube.com/embed/xRLNYich5Ls' WHERE slug = 'ratio-proportion';
UPDATE topics SET video_url = 'https://www.youtube.com/embed/fwUMJhTDGog' WHERE slug = 'arithmetic-progression';
UPDATE topics SET video_url = 'https://www.youtube.com/embed/6xQCumDHOFA' WHERE slug = 'surds-indices';
UPDATE topics SET video_url = 'https://www.youtube.com/embed/Agnaf5cv9lY' WHERE slug = 'boats-streams';
UPDATE topics SET video_url = 'https://www.youtube.com/embed/j6vo6d6H6Ho' WHERE slug = 'pipes-cisterns';
UPDATE topics SET video_url = 'https://www.youtube.com/embed/PQ8ux_3hdT4' WHERE slug = 'allegation-mixtures';
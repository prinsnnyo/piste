-- Run this SQL in your Supabase SQL Editor to fix the coordinates issue
-- This creates a function that returns messages with extracted lat/lng

-- First, completely drop any existing versions of the function
DROP FUNCTION IF EXISTS messages_nearby_with_coords(double precision, double precision, double precision);
DROP FUNCTION IF EXISTS messages_nearby_with_coords;

-- Now create the function with correct types
CREATE FUNCTION messages_nearby_with_coords(
  center_lat double precision,
  center_lng double precision,
  radius_meters double precision DEFAULT 5000
)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamp with time zone,
  lat double precision,
  lng double precision,
  distance_meters double precision
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id::uuid,
    m.content::text,
    m.created_at::timestamp with time zone,
    ST_Y(m.location::geometry)::double precision,
    ST_X(m.location::geometry)::double precision,
    ST_Distance(
      m.location,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
    )::double precision
  FROM messages m
  WHERE ST_DWithin(
    m.location,
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY ST_Distance(
    m.location,
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
  );
END;
$$;

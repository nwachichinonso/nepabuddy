import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OSMNode {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OSMWay {
  type: string;
  id: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OSMRelation {
  type: string;
  id: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

type OSMElement = OSMNode | OSMWay | OSMRelation;

// Generate a simple geohash prefix from coordinates
function generateGeohash(lat: number, lon: number): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let hash = '';
  let minLat = -90, maxLat = 90;
  let minLon = -180, maxLon = 180;
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (hash.length < 6) {
    if (isEven) {
      const midLon = (minLon + maxLon) / 2;
      if (lon > midLon) {
        ch |= 1 << (4 - bit);
        minLon = midLon;
      } else {
        maxLon = midLon;
      }
    } else {
      const midLat = (minLat + maxLat) / 2;
      if (lat > midLat) {
        ch |= 1 << (4 - bit);
        minLat = midLat;
      } else {
        maxLat = midLat;
      }
    }
    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      hash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}

// Convert OSM name to a clean zone name
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Lagos bounding box (expanded to cover greater Lagos)
    const bbox = '6.3,3.0,6.8,4.0'; // south,west,north,east

    // Overpass API query for neighborhoods, suburbs, and places in Lagos
    const overpassQuery = `
      [out:json][timeout:60];
      (
        node["place"~"neighbourhood|suburb|quarter|village"](${bbox});
        way["place"~"neighbourhood|suburb|quarter"](${bbox});
        relation["place"~"neighbourhood|suburb"](${bbox});
        node["name"]["admin_level"="10"](${bbox});
      );
      out center;
    `;

    console.log('Fetching data from Overpass API...');
    
    const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!overpassResponse.ok) {
      throw new Error(`Overpass API error: ${overpassResponse.statusText}`);
    }

    const data = await overpassResponse.json();
    const elements: OSMElement[] = data.elements || [];
    
    console.log(`Found ${elements.length} elements from OSM`);

    // Get existing zones to avoid duplicates
    const { data: existingZones } = await supabase
      .from('zones')
      .select('name, geohash_prefix');

    const existingNames = new Set(existingZones?.map(z => z.name) || []);
    const existingGeohashes = new Set(existingZones?.map(z => z.geohash_prefix) || []);

    const newZones: Array<{
      name: string;
      display_name: string;
      latitude: number;
      longitude: number;
      geohash_prefix: string;
      source: string;
    }> = [];

    for (const element of elements) {
      let lat: number | undefined;
      let lon: number | undefined;
      let name: string | undefined;

      // Extract coordinates based on element type
      if (element.type === 'node') {
        const node = element as OSMNode;
        lat = node.lat;
        lon = node.lon;
        name = node.tags?.name;
      } else if (element.type === 'way' || element.type === 'relation') {
        const entity = element as OSMWay | OSMRelation;
        lat = entity.center?.lat;
        lon = entity.center?.lon;
        name = entity.tags?.name;
      }

      // Skip if missing required data
      if (!lat || !lon || !name) continue;

      const zoneName = sanitizeName(name);
      const geohash = generateGeohash(lat, lon);

      // Skip duplicates
      if (existingNames.has(zoneName)) continue;
      
      // Skip if geohash is too similar (same 5-char prefix = very close)
      const shortHash = geohash.substring(0, 5);
      if (existingGeohashes.has(shortHash)) continue;

      newZones.push({
        name: zoneName,
        display_name: name,
        latitude: lat,
        longitude: lon,
        geohash_prefix: geohash,
        source: 'osm',
      });

      existingNames.add(zoneName);
      existingGeohashes.add(shortHash);
    }

    console.log(`Prepared ${newZones.length} new zones for insertion`);

    // Insert new zones in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < newZones.length; i += batchSize) {
      const batch = newZones.slice(i, i + batchSize);
      const { error } = await supabase
        .from('zones')
        .insert(batch);

      if (error) {
        console.error('Insert error:', error);
      } else {
        inserted += batch.length;
      }
    }

    // Also create zone_power_status entries for new zones
    const { data: allZones } = await supabase
      .from('zones')
      .select('id')
      .eq('source', 'osm');

    if (allZones) {
      const { data: existingStatus } = await supabase
        .from('zone_power_status')
        .select('zone_id');

      const existingStatusIds = new Set(existingStatus?.map(s => s.zone_id) || []);
      const newStatusEntries = allZones
        .filter(z => !existingStatusIds.has(z.id))
        .map(z => ({
          zone_id: z.id,
          status: 'unknown',
          confidence: 'low',
          buddy_count: 0,
          plugged_count: 0,
          unplugged_count: 0,
        }));

      if (newStatusEntries.length > 0) {
        await supabase.from('zone_power_status').insert(newStatusEntries);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${inserted} new zones from OpenStreetMap`,
        found: elements.length,
        imported: inserted,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function run() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { data: gData, error: gError } = await supabase.from('games').select('*').limit(1);
  if (gError) {
    console.log('games table check: ERROR -', gError.message, gError);
  } else {
    console.log('games table check: OK - games count:', gData.length);
    if (gData.length > 0) {
      console.log('Game structure:', Object.keys(gData[0]));
    }
  }
  
  const { data: rData, error: rError } = await supabase.from('rounds').select('*').limit(1);
  if (rError) {
    console.log('rounds table check: ERROR -', rError.message, rError);
  } else {
    console.log('rounds table check: OK - rounds count:', rData.length);
    if (rData.length > 0) {
      console.log('Round structure:', Object.keys(rData[0]));
    }
  }
}

run().catch(err => console.error('Unexpected error:', err));

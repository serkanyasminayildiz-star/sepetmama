import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('HATA: .env dosyasında Supabase degiskenleri yok.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const TABLE = 'Product';

async function inspect() {
  const { data, error, count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .limit(3);

  if (error) {
    console.error(`"${TABLE}" tablosu okunamadi:`, error.message);
    return;
  }

  console.log(`\n=== ${TABLE} tablosu ===`);
  console.log(`Toplam kayit: ${count}`);

  if (!data || data.length === 0) {
    console.log('Tablo bos.');
    return;
  }

  console.log('\n--- Sutunlar ve tipleri ---');
  const sample = data[0];
  Object.keys(sample).forEach((key) => {
    const val = sample[key];
    const type = val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val;
    const preview =
      val === null
        ? '(null)'
        : typeof val === 'object'
        ? JSON.stringify(val).slice(0, 60)
        : String(val).slice(0, 60);
    console.log(`  ${key.padEnd(25)} ${type.padEnd(10)} -> ${preview}`);
  });

  console.log('\n--- Ilk 3 satirin tamami (JSON) ---');
  console.log(JSON.stringify(data, null, 2));
}

inspect();

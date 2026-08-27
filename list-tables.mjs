import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Olasi tablo adlarini dene
const candidates = [
  'products', 'Products', 'urunler', 'Urunler',
  'items', 'Items', 'product', 'urun',
  'sepetmama_products', 'mama', 'foods'
];

console.log('Tablo adlari taraniyor...\n');
for (const name of candidates) {
  const { count, error } = await supabase
    .from(name)
    .select('*', { count: 'exact', head: true });
  if (!error) {
    console.log(`✓ BULUNDU: "${name}" (${count} kayit)`);
  }
}
console.log('\nTarama bitti.');

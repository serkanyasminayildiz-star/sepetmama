import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fetchAll(table, orderBy) {
  let all = [];
  let from = 0;
  const PAGE_SIZE = 500;
  while (true) {
    const { data, error } = await supabase
      .from(table).select('*')
      .range(from, from + PAGE_SIZE - 1)
      .order(orderBy, { ascending: true });
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

const products = await fetchAll('Product', 'createdAt');
const images = await fetchAll('ProductImage', 'id');

const countByProduct = new Map();
for (const img of images) {
  countByProduct.set(img.productId, (countByProduct.get(img.productId) || 0) + 1);
}

const withImage = products.filter(p => countByProduct.has(p.id));
const withoutImage = products.filter(p => !countByProduct.has(p.id));
const multi = [...countByProduct.values()].filter(c => c > 1).length;

console.log(`Toplam urun:                ${products.length}`);
console.log(`Toplam resim kaydi:         ${images.length}`);
console.log(`Resmi OLAN urun:            ${withImage.length}`);
console.log(`Resmi OLMAYAN urun:         ${withoutImage.length}`);
console.log(`Birden fazla resmi olan:    ${multi}`);

if (withoutImage.length > 0) {
  console.log('\nResimsiz urunlerden ilk 10:');
  withoutImage.slice(0, 10).forEach(p => console.log(`  - ${p.name}`));
}

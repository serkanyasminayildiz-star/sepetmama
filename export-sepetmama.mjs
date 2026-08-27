import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PAGE_SIZE = 500;
const DELIMITER = ',';

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(DELIMITER) || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function fetchAll(table, orderBy) {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1)
      .order(orderBy, { ascending: true });
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

function buildCategoryPath(categoryId, categoryMap) {
  const parts = [];
  let current = categoryMap.get(categoryId);
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    parts.unshift(current.name);
    current = current.parentId ? categoryMap.get(current.parentId) : null;
  }
  return parts.join('>');
}

function filenameFromUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split('/').pop() || '');
  } catch {
    return url.split('/').pop() || '';
  }
}

async function main() {
  console.log('Veriler cekiliyor...');
  const products = await fetchAll('Product', 'createdAt');
  console.log(`  Product:         ${products.length}`);
  const images = await fetchAll('ProductImage', 'id');
  console.log(`  ProductImage:    ${images.length}`);
  const categories = await fetchAll('Category', 'id');
  console.log(`  Category:        ${categories.length}`);
  const catProducts = await fetchAll('CategoryProduct', 'categoryId');
  console.log(`  CategoryProduct: ${catProducts.length}`);

  const imagesByProduct = new Map();
  for (const img of images) {
    if (!imagesByProduct.has(img.productId)) imagesByProduct.set(img.productId, []);
    imagesByProduct.get(img.productId).push(img);
  }
  for (const arr of imagesByProduct.values()) {
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const categoriesByProduct = new Map();
  for (const cp of catProducts) {
    if (!categoriesByProduct.has(cp.productId)) categoriesByProduct.set(cp.productId, []);
    categoriesByProduct.get(cp.productId).push(cp.categoryId);
  }

  const headers = [
    'ID','Title','Content','Short Description','Sku','Global Unique Id',
    'Regular Price','Sale Price','Stock Status','Image URL','Image Filename',
    'Image Path','Image ID','Image Title','Image Caption','Image Description',
    'Image Alt Text','Image Featured','Markalar','Ürün kategorileri','Product Tags'
  ];

  const rows = [headers.map(csvEscape).join(DELIMITER)];

  products.forEach((p, idx) => {
    const productImages = imagesByProduct.get(p.id) || [];
    const firstImage = productImages[0];
    const imageUrl = firstImage ? firstImage.url : '';
    const imageFilename = filenameFromUrl(imageUrl);
    const imageTitle = imageFilename.replace(/\.[^.]+$/, '');

    const catIds = categoriesByProduct.get(p.id) || [];
    const catPaths = catIds.map(id => buildCategoryPath(id, categoryMap)).filter(Boolean);
    const categoriesStr = catPaths.join('|');

    const stockStatus = (p.stock != null && Number(p.stock) > 0) ? 'instock' : 'outofstock';

    const row = [
      idx + 1,
      p.name || '',
      p.description || '',
      '',
      p.sku || '',
      '',
      p.price ?? '',
      p.salePrice ?? '',
      stockStatus,
      imageUrl,
      imageFilename,
      '',
      '',
      imageTitle,
      '',
      '',
      '',
      imageUrl,
      p.brand || '',
      categoriesStr,
      ''
    ];

    rows.push(row.map(csvEscape).join(DELIMITER));
  });

  const csv = '\uFEFF' + rows.join('\r\n') + '\r\n';
  const today = new Date().toISOString().split('T')[0];
  const filename = `sepetmama-export-${today}.csv`;
  fs.writeFileSync(filename, csv, 'utf8');

  console.log(`\n✓ ${filename} olusturuldu (${products.length} urun)`);
}

main().catch(e => { console.error('HATA:', e.message); process.exit(1); });

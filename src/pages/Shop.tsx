import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

interface ShopProps {
  brandHandle?: string;
}

const Shop: React.FC<ShopProps> = ({ brandHandle: brandProp }) => {
  const params = useParams();
  const brandHandle = brandProp || params.brand;
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q')?.toLowerCase() || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [priceMax, setPriceMax] = useState(200000);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const perPage = 16;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let pq = supabase.from('ecom_products').select('*').eq('status', 'active');

      if (brandHandle) {
        const { data: col } = await supabase
          .from('ecom_collections')
          .select('*')
          .eq('handle', brandHandle)
          .single();
        if (col) {
          setCollection(col);
          const { data: links } = await supabase
            .from('ecom_product_collections')
            .select('product_id')
            .eq('collection_id', col.id);
          const ids = (links || []).map((l) => l.product_id);
          if (ids.length) pq = pq.in('id', ids);
          else {
            setProducts([]);
            setLoading(false);
            return;
          }
        } else {
          const vendorName = brandHandle.replace(/-/g, ' ');
          const { data: vendorProducts } = await supabase
            .from('ecom_products')
            .select('*')
            .eq('status', 'active')
            .ilike('vendor', `%${vendorName}%`);
          setCollection({ title: vendorName });
          setProducts(vendorProducts || []);
          setLoading(false);
          return;
        }
      } else {
        setCollection(null);
      }

      const { data } = await pq;
      setProducts(data || []);
      setLoading(false);
    };
    load();
    setPage(1);
    if (categoryParam) setSelectedCats([categoryParam]);
  }, [brandHandle, categoryParam]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => p.product_type && cats.add(p.product_type));
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (queryParam) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(queryParam) ||
          p.vendor?.toLowerCase().includes(queryParam) ||
          p.product_type?.toLowerCase().includes(queryParam)
      );
    }
    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.product_type));
    list = list.filter((p) => p.price <= priceMax * 100);
    if (onSaleOnly) list = list.filter((p) => p.tags?.includes('sale'));
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        list.sort((a, b) => (b.tags?.includes('bestseller') ? 1 : 0) - (a.tags?.includes('bestseller') ? 1 : 0));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [products, queryParam, selectedCats, priceMax, onSaleOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleCat = (c: string) =>
    setSelectedCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <Layout>
      {/* Header */}
      <section className="bg-[#FAFAF8] py-12 lg:py-20 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-xs text-gray-500 mb-3">
            Home / {collection ? collection.title : 'Shop'}
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-light mb-4">
            {queryParam
              ? `Search: "${queryParam}"`
              : collection
              ? collection.title
              : 'All Watches'}
          </h1>
          {collection?.description && (
            <p className="max-w-2xl text-gray-600">{collection.description}</p>
          )}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm self-start mb-4"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          {/* Sidebar filters */}
          <aside
            className={`${
              filterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
            } lg:relative lg:block lg:w-64 lg:flex-shrink-0`}
          >
            <div className="lg:sticky lg:top-32">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="font-serif text-lg">Filters</h3>
                <button onClick={() => setFilterOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {categories.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#D4AF37]">
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {categories.map((c) => (
                      <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#D4AF37]">
                        <input
                          type="checkbox"
                          checked={selectedCats.includes(c)}
                          onChange={() => toggleCat(c)}
                          className="accent-[#D4AF37]"
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#D4AF37]">
                  Price Range
                </h4>
                <input
                  type="range"
                  min={500}
                  max={200000}
                  step={500}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>$0</span>
                  <span>${priceMax.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#D4AF37]">
                  Special Offers
                </h4>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  On sale only
                </label>
              </div>

              <button
                onClick={() => {
                  setSelectedCats([]);
                  setPriceMax(200000);
                  setOnSaleOnly(false);
                }}
                className="text-xs uppercase tracking-wider border-b border-gray-300 pb-1 hover:text-[#D4AF37]"
              >
                Clear filters
              </button>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–
                {Math.min(page * perPage, filtered.length)} of {filtered.length} results
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="newest">Newest</option>
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-serif text-2xl mb-3">No products found</p>
                <p className="text-gray-500">Try adjusting your filters.</p>
              </div>
            ) : (
              <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {paginated.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </motion.div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 text-sm transition-colors ${
                      page === i + 1
                        ? 'bg-[#0A0A0A] text-white'
                        : 'border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;

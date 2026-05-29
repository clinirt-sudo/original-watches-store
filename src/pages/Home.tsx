import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { ArrowRight, ChevronDown } from 'lucide-react';

const HERO_IMAGES = [
  'https://d64gsuwffb70l.cloudfront.net/6a0b1742f18aa958975dcc88_1779113397629_bb9db9e5.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a0b1742f18aa958975dcc88_1779113446804_441cc7eb.jpg',
  'https://d64gsuwffb70l.cloudfront.net/6a0b1742f18aa958975dcc88_1779113467758_c4eaba62.jpg',
];

const Home: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    supabase
      .from('ecom_products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => setProducts(data || []));
  }, []);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const latestProducts = useMemo(
    () => products.filter((p) => p.new_arrival === true),
    [products]
  );

  const latestDisplay = useMemo(() => latestProducts, [latestProducts]);

  const popularBrands = useMemo(() => {
    const map = new Map<string, { name: string; handle: string; image: string }>();
    products
      .filter((p) => p.new_arrival !== true)
      .forEach((p) => {
        if (!p.vendor) return;
        const handle = slugify(p.vendor);
        if (!map.has(handle)) {
          map.set(handle, {
            name: p.vendor,
            handle,
            image: p.images?.[0] || '/placeholder.svg',
          });
        }
      });
    return Array.from(map.values()).slice(0, 6);
  }, [products]);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-black">
        {HERO_IMAGES.map((src, i) => (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: heroIdx === i ? 1 : 0, scale: heroIdx === i ? 1.05 : 1 }}
            transition={{ opacity: { duration: 1.5 }, scale: { duration: 7, ease: 'linear' } }}
          >
            <img src={src} alt="Hero" className="w-full h-full object-cover" />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-[#D4AF37] text-xs sm:text-sm tracking-[0.4em] uppercase mb-6"
            >
              · The Pinnacle of Horology ·
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-serif text-white text-4xl sm:text-6xl lg:text-7xl font-light leading-[1.1] mb-8"
            >
              Timeless Style
              <br />
              <span className="italic text-[#D4AF37]">Unmatched Precision</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-10"
            >
              Curated Swiss luxury timepieces from the world's most prestigious horological maisons.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/shop"
                className="group bg-[#059669] hover:bg-[#047857] text-white px-8 py-4 text-sm tracking-[0.2em] uppercase font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(5,150,105,0.4)]"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/brand/rolex"
                className="border border-white/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-white px-8 py-4 text-sm tracking-[0.2em] uppercase font-semibold transition-all duration-300"
              >
                Explore Brands
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>

        {/* Hero indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`h-0.5 transition-all duration-500 ${
                heroIdx === i ? 'w-12 bg-[#D4AF37]' : 'w-6 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Latest products */}
      <section className="py-20 lg:py-28 px-4 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4"
          >
            · Latest Arrivals ·
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light"
          >
            Our Latest Products
          </motion.h2>
          <div className="w-16 h-px bg-[#D4AF37] mx-auto mt-6" />
        </div>

        {latestDisplay.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {latestDisplay.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white py-20 px-8 text-center text-gray-600">
            No latest arrivals are available right now. Only products marked as "New Arrival" appear in this section.
          </div>
        )}

        <div className="text-center mt-14">
          <Link
            to="/shop"
            className="inline-block border-b-2 border-[#D4AF37] text-sm tracking-[0.2em] uppercase pb-1 hover:text-[#D4AF37] transition-colors"
          >
            View entire collection
          </Link>
        </div>
      </section>

      {/* Parallax banner */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/6a0b1742f18aa958975dcc88_1779113467758_c4eaba62.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-full flex items-center justify-center text-center px-6"
        >
          <div className="max-w-2xl">
            <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4">
              · A Heritage of Excellence ·
            </p>
            <h2 className="font-serif text-white text-3xl sm:text-5xl font-light mb-6">
              Crafted for Generations
            </h2>
            <p className="text-white/80 mb-8">
              Every timepiece in our collection is meticulously authenticated, ensuring you receive
              only the finest examples of Swiss watchmaking craftsmanship.
            </p>
            <Link
              to="/about"
              className="inline-block border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black px-8 py-3 text-sm tracking-[0.2em] uppercase font-semibold transition-all"
            >
              Our Story
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Popular brands */}
      <section className="py-20 lg:py-28 px-4 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4">· Maisons ·</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#D4AF37]">
            Our Most Popular Brands
          </h2>
          <div className="w-16 h-px bg-[#D4AF37] mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10">
          {popularBrands.map((b, i) => (
            <motion.div
              key={b.handle}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/brand/${b.handle}`} className="block group">
                <div className="relative aspect-square overflow-hidden bg-[#FAFAF8] mb-4">
                  <img
                    src={b.image}
                    alt={b.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity tracking-[0.2em] text-sm uppercase border border-white/80 px-6 py-2">
                      Explore
                    </span>
                  </div>
                </div>
                <h3 className="text-center font-serif text-lg group-hover:text-[#D4AF37] transition-colors">
                  {b.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial / what they say */}
      <section className="bg-[#FAFAF8] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4">· Testimonials ·</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light mb-12">What They Are Saying</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Marcus T.', text: 'The quality of the watches is just fantastic — I bought a Royal Oak and the attention to detail is unmatched.' },
              { name: 'Sarah J.', text: 'Best luxury watch retailer online. Discreet shipping, authentic timepieces, exceptional service.' },
              { name: 'Daniel L.', text: 'My third purchase from Original Watches. The concierge made the entire process seamless.' },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 shadow-sm"
              >
                <div className="text-[#D4AF37] mb-3">★★★★★</div>
                <p className="text-sm text-gray-700 italic leading-relaxed mb-4">"{t.text}"</p>
                <p className="text-sm font-semibold">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;

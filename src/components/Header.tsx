import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Home', to: '/' },
  { name: 'Shop', to: '/shop' },
  { name: 'About', to: '/about' },
  { name: 'Reviews', to: '/reviews' },
  { name: 'Contact', to: '/contact' },
];

const DEFAULT_BRANDS = [
  { name: 'Rolex', handle: 'rolex' },
  { name: 'Patek Philippe', handle: 'patek-philippe' },
  { name: 'Audemars Piguet', handle: 'audemars-piguet' },
  { name: 'Richard Mille', handle: 'richard-mille' },
  { name: 'Omega', handle: 'omega' },
  { name: 'Cartier', handle: 'cartier' },
  { name: 'Franck Muller', handle: 'franck-muller' },
  { name: 'Panerai', handle: 'panerai' },
];

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [promoText, setPromoText] = useState('Pay with crypto & save 15%! Code: LUXURY15');
  const { count, openCart, format, subtotalCents } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slugifyBrand = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  useEffect(() => {
    supabase
      .from('shop_settings')
      .select('promo_text')
      .eq('id', 1)
      .single()
      .then(({ data }) => data?.promo_text && setPromoText(data.promo_text));
  }, []);

  useEffect(() => {
    supabase
      .from('ecom_products')
      .select('vendor')
      .eq('status', 'active')
      .then(({ data }) => {
        if (!data) return;
        const unique: Record<string, string> = {};
        data.forEach((item: any) => {
          const vendor = item.vendor?.trim();
          if (vendor) unique[vendor] = slugifyBrand(vendor);
        });
        setBrands(
          Object.keys(unique).map((vendor) => ({
            name: vendor,
            handle: unique[vendor],
          }))
        );
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('ecom_products')
        .select('id, name, handle, vendor, images, price')
        .or(`name.ilike.%${searchTerm}%,vendor.ilike.%${searchTerm}%,product_type.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .limit(6);
      setSuggestions(data || []);
    }, 200);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Top promo bar */}
      <div className="bg-[#0A0A0A] text-[11px] sm:text-xs text-white/80 tracking-[0.15em] uppercase text-center py-2 px-4 hidden md:block">
        <span>Worldwide Shipping</span>
        <span className="mx-4 text-[#D4AF37]">|</span>
        <span>30-Day Returns</span>
        <span className="mx-4 text-[#D4AF37]">|</span>
        <span>Authentic Swiss Timepieces</span>
      </div>

      <motion.header
        className={`sticky top-0 z-50 bg-white transition-all duration-500 ${
          scrolled ? 'shadow-[0_4px_30px_rgba(0,0,0,0.06)]' : ''
        }`}
      >
        {/* Main top navbar */}
        <div className="border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4 lg:py-5 flex items-center gap-6">
            {/* Mobile: hamburger + logo + cart */}
            <button
              className="lg:hidden flex items-center gap-2"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
              <span className="text-sm font-medium">Menu</span>
            </button>

            <div className="flex-1 lg:flex-initial flex justify-center lg:justify-start">
              <Logo />
            </div>

            {/* Center search (desktop) */}
            <form
              onSubmit={onSearchSubmit}
              className="hidden lg:block flex-1 max-w-xl mx-8 relative"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search products..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] focus:bg-white transition-all"
                />
              </div>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {suggestions.map((s) => (
                      <Link
                        key={s.id}
                        to={`/product/${encodeURIComponent(s.handle)}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <img
                          src={s.images?.[0]}
                          alt={s.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold">
                            {s.vendor}
                          </div>
                          <div className="text-sm font-medium truncate">{s.name}</div>
                        </div>
                        <div className="text-sm font-semibold">{format(s.price)}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Right nav links + icons */}
            <nav className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.name}
                  to={l.to}
                  className="relative text-sm font-medium text-gray-800 hover:text-[#D4AF37] transition-colors group"
                >
                  {l.name}
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#D4AF37] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              ))}
              <Link to="/account" className="text-gray-800 hover:text-[#D4AF37] transition-colors">
                <User className="w-5 h-5" />
              </Link>
            </nav>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 group"
            >
              <span className="hidden sm:inline text-sm font-medium">{format(subtotalCents)}</span>
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-800 group-hover:text-[#D4AF37] transition-colors" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>
        </div>

        {/* Secondary nav: brands (desktop) */}
        <div className="hidden lg:block bg-[#0A0A0A] text-white">
          <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
            <ul className="flex items-center">
              <li>
                <Link
                  to="/"
                  className="block px-4 py-3.5 text-sm font-medium hover:text-[#D4AF37] transition-colors"
                >
                  Home
                </Link>
              </li>
              {brands.map((b) => (
                <li key={b.handle}>
                  <Link
                    to={`/brand/${b.handle}`}
                    className="flex items-center px-4 py-3.5 text-sm font-medium hover:text-[#D4AF37] transition-colors"
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Promo bar */}
        <div className="bg-[#D4AF37] text-white text-center text-xs sm:text-sm font-medium py-2.5 px-4">
          ⚡ {promoText}
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[70] lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <Logo />
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={onSearchSubmit} className="p-5 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </form>

              <nav className="p-2">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.name}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium border-b border-gray-50"
                  >
                    {l.name}
                  </Link>
                ))}
                <div className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500 mt-2">
                  Brands
                </div>
                {brands.map((b) => (
                  <Link
                    key={b.handle}
                    to={`/brand/${b.handle}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium border-b border-gray-50"
                  >
                    {b.name}
                  </Link>
                ))}
              </nav>

              <div className="p-5 border-t mt-4">
                <Link to="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm py-2">
                  <User className="w-4 h-4" /> My Account
                </Link>
                <a href="https://t.me/Originalwatches90" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm py-2 text-[#D4AF37]">
                  Telegram Support
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

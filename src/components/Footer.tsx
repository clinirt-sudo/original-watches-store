import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Instagram, Facebook, Twitter, Youtube, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

const BRANDS = ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'Cartier', 'Panerai', 'Franck Muller', 'Richard Mille'];

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('https://famous.ai/api/crm/6a0b1742f18aa958975dcc88/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'footer-signup',
          tags: ['newsletter', 'luxury-watches'],
        }),
      });
      toast.success('Subscribed!', { description: 'Welcome to the inner circle.' });
      setEmail('');
    } catch {
      toast.error('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] text-white">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { title: 'Free Worldwide Shipping', desc: 'For all orders above $1,000' },
            { title: '30-Day Easy Returns', desc: '30 days money back guarantee' },
            { title: 'International Warranty', desc: 'Offered in the country of usage' },
            { title: 'Secure Encrypted Payments', desc: 'Bank-level payment security' },
          ].map((t, i) => (
            <div key={i} className="text-center md:text-left group cursor-default">
              <div className="w-12 h-12 mb-4 mx-auto md:mx-0 rounded-full border border-[#D4AF37]/40 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors">
                <span className="text-[#D4AF37] text-xl">{['✦', '↻', '◈', '⚜'][i]}</span>
              </div>
              <h4 className="font-serif text-base mb-1">{t.title}</h4>
              <p className="text-xs text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
        <div className="col-span-2 lg:col-span-2">
          <Logo variant="light" />
          <p className="text-sm text-gray-400 mt-5 leading-relaxed max-w-md">
            Original Watches Shop is the world's premier destination for authentic Swiss luxury timepieces.
            Curated excellence from the most prestigious horological maisons.
          </p>
          <form onSubmit={onSubscribe} className="mt-6 max-w-sm">
            <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3 block">
              Join the inner circle
            </label>
            <div className="flex border-b border-white/30 focus-within:border-[#D4AF37] transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent text-sm py-2 focus:outline-none placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-[#D4AF37] hover:text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        <div>
          <h5 className="font-serif text-sm uppercase tracking-wider mb-5 text-[#D4AF37]">About</h5>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/reviews" className="hover:text-white transition-colors">Reviews</Link></li>
            <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-serif text-sm uppercase tracking-wider mb-5 text-[#D4AF37]">Help</h5>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Returns</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Support</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-serif text-sm uppercase tracking-wider mb-5 text-[#D4AF37]">Brands</h5>
          <ul className="space-y-3 text-sm text-gray-400">
            {BRANDS.slice(0, 6).map((b) => (
              <li key={b}>
                <Link
                  to={`/brand/${b.toLowerCase().replace(/ /g, '-')}`}
                  className="hover:text-white transition-colors"
                >
                  {b}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Original Watches Shop. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <a href="#" className="hover:text-[#D4AF37] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors"><Youtube className="w-4 h-4" /></a>
            <a href="mailto:sales@originalwatches.shop" className="hover:text-[#D4AF37] transition-colors"><Mail className="w-4 h-4" /></a>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>VISA</span><span>•</span><span>Mastercard</span><span>•</span><span>Amex</span><span>•</span><span>Crypto</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

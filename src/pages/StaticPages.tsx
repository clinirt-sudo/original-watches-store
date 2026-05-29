import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

export const About: React.FC = () => (
  <Layout>
    <div className="max-w-4xl mx-auto px-6 py-20">
      <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4 text-center">· Our Story ·</p>
      <h1 className="font-serif text-4xl sm:text-5xl text-center font-light mb-12">A Legacy of Excellence</h1>
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
        <p>Founded with a singular vision — to bring the world's finest timepieces to discerning collectors — Original Watches Shop has established itself as a premier destination for luxury horology.</p>
        <p>Every watch in our collection is meticulously authenticated by our master horologists. We work exclusively with the most prestigious Swiss maisons including Rolex, Patek Philippe, Audemars Piguet, Cartier, Omega, and Panerai.</p>
        <p>Our commitment extends beyond the transaction. From discreet worldwide shipping to international warranty service, we ensure that every Original Watches Shop client receives the white-glove experience that befits these extraordinary timepieces.</p>
        <h2 className="font-serif text-2xl mt-12">Our Promise</h2>
        <ul className="space-y-2">
          <li>✦ 100% authentic Swiss timepieces</li>
          <li>✦ Discreet worldwide shipping</li>
          <li>✦ International manufacturer warranty</li>
          <li>✦ Lifetime concierge support</li>
        </ul>
      </div>
    </div>
  </Layout>
);

export const Contact: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    whatsapp: '+1 (541) 780-8979',
    email: 'sales@originalwatches.shop',
    telegram_url: 'https://t.me/originalwatchesshop',
  });
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('shop_settings').select('*').eq('id', 1).single().then(({ data }) => data && setSettings(data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('contact_messages').insert(form);
      await fetch('https://famous.ai/api/crm/6a0b1742f18aa958975dcc88/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name, source: 'contact-form', tags: ['contact'] }),
      }).catch(() => {});
      toast.success('Message sent! We will reply shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4 text-center">· Get in Touch ·</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-center font-light mb-16">Contact Us</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl mb-6">Reach Our Concierge</h2>
            <div className="space-y-5">
              <a href={`tel:${settings.whatsapp}`} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#FAFAF8] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">WhatsApp</p>
                  <p className="font-medium">{settings.whatsapp}</p>
                </div>
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#FAFAF8] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
                  <p className="font-medium">{settings.email}</p>
                </div>
              </a>
              <a href={settings.telegram_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#FAFAF8] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-colors">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Telegram</p>
                  <p className="font-medium">@originalwatchesshop</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAFAF8] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Boutique</p>
                  <p className="font-medium">Worldwide Shipping</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="bg-[#FAFAF8] p-8">
            <h2 className="font-serif text-2xl mb-6">Send a Message</h2>
            <div className="space-y-4">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" />
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" />
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your message..." className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" />
              <button disabled={loading} className="w-full bg-[#059669] hover:bg-[#047857] text-white py-3.5 text-sm font-semibold tracking-wide disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export const Reviews: React.FC = () => {
  const reviews = [
    { name: 'Marcus Thompson', loc: 'New York, USA', rating: 5, text: 'Absolutely flawless transaction. My Royal Oak arrived in pristine condition with full documentation. Will definitely return for my next acquisition.' },
    { name: 'Sarah Johnson', loc: 'London, UK', rating: 5, text: 'The discretion and professionalism of the team is second to none. From inquiry to delivery, every step was elegant and seamless.' },
    { name: 'Daniel Lee', loc: 'Singapore', rating: 5, text: 'My third purchase from Original Watches. The concierge service is what keeps me coming back — they truly understand luxury.' },
    { name: 'Isabella García', loc: 'Madrid, Spain', rating: 5, text: 'I was hesitant to buy a Patek online, but the authentication process and detailed condition reports gave me complete confidence.' },
    { name: 'Hans Müller', loc: 'Zurich, Switzerland', rating: 5, text: 'Even as a Swiss collector, I find Original Watches to be a trusted partner. Their attention to detail is remarkable.' },
    { name: 'Aisha Al-Mansour', loc: 'Dubai, UAE', rating: 5, text: 'The Cartier Santos I received exceeded my expectations. Original packaging, certificate of authenticity, and stunning presentation.' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4 text-center">· Client Testimonials ·</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-center font-light mb-16">What They Are Saying</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="text-[#D4AF37] mb-4">{'★'.repeat(r.rating)}</div>
              <p className="text-gray-700 italic leading-relaxed mb-6">"{r.text}"</p>
              <div className="border-t pt-4">
                <p className="font-serif text-base">{r.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{r.loc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export const Policy: React.FC<{ title: string; content: string[] }> = ({ title, content }) => (
  <Layout>
    <div className="max-w-3xl mx-auto px-6 py-20">
      <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4">· Legal ·</p>
      <h1 className="font-serif text-4xl sm:text-5xl font-light mb-12">{title}</h1>
      <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
        {content.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  </Layout>
);

export const PrivacyPolicy = () => (
  <Policy title="Privacy Policy" content={[
    'Original Watches Shop ("we", "us") respects your privacy. This policy explains how we collect, use, and protect your personal information.',
    'We collect information you provide when placing an order, creating an account, or contacting our concierge — including name, email, shipping address, and phone number.',
    'Your data is used solely to process orders, deliver products, and provide customer support. We never sell or share your information with third parties for marketing purposes.',
    'We employ industry-leading security measures including SSL encryption to protect your personal data. Payment information is processed via secure third-party providers and is never stored on our servers.',
    'You have the right to access, correct, or delete your personal information at any time by contacting our team.',
  ]} />
);

export const RefundPolicy = () => (
  <Policy title="Refund & Returns Policy" content={[
    'Your satisfaction is our highest priority. We offer a 30-day return policy on all unworn timepieces.',
    'To be eligible for a return, the watch must be unworn, in its original packaging, with all tags, documentation, and accessories included.',
    'Custom orders, engraved watches, and personalized pieces are non-refundable.',
    'To initiate a return, contact our concierge team at sales@originalwatches.shop within 30 days of delivery. We will provide return shipping instructions and a prepaid label for orders over $5,000.',
    'Refunds are processed within 5-7 business days after we receive and authenticate the returned item.',
  ]} />
);

export const ShippingPolicy = () => (
  <Policy title="Shipping Policy" content={[
    'We ship worldwide via FedEx and USPS with full insurance and signature confirmation.',
    'Standard delivery within the U.S.A. takes 2–5 working days. International shipping typically takes 5–10 working days, depending on customs.',
    'All shipments are fully insured and require an adult signature upon delivery. Tracking information is provided once your order is dispatched.',
    'Shipping is complimentary on all orders above $1,000. A flat-rate shipping fee applies to orders below this threshold.',
    'For ultra-rare or highly-valued timepieces, we offer private courier and white-glove delivery services. Contact our concierge for arrangements.',
  ]} />
);

export const Account: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [searched, setSearched] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: customer } = await supabase.from('ecom_customers').select('id').eq('email', email).maybeSingle();
    if (customer) {
      const { data } = await supabase.from('ecom_orders').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false });
      setOrders(data || []);
    } else {
      setOrders([]);
    }
    setSearched(true);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-4 text-center">· Your Account ·</p>
        <h1 className="font-serif text-4xl text-center font-light mb-12">My Orders</h1>
        <form onSubmit={lookup} className="bg-[#FAFAF8] p-8 mb-8">
          <p className="text-sm text-gray-600 mb-4">Enter the email used during checkout to view your orders.</p>
          <div className="flex gap-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" />
            <button className="bg-[#0A0A0A] text-white px-6 text-sm tracking-wider uppercase hover:bg-[#D4AF37] transition-colors">Lookup</button>
          </div>
        </form>
        {searched && orders.length === 0 && <p className="text-center text-gray-500">No orders found for this email.</p>}
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-gray-100 p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">Order #{o.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs uppercase tracking-wider px-3 py-1 rounded ${o.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {o.status}
              </span>
              <p className="font-serif text-lg">${(o.total / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

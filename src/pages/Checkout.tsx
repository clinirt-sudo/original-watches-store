import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Check, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  { id: 'apple_pay', label: 'Apple Pay', desc: true },
  { id: 'zelle', label: 'Zelle Pay' },
  { id: 'cash_app', label: 'Cash App' },
  { id: 'chime', label: 'Chime' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'crypto', label: 'Crypto Payment (BTC / USDT)' },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotalCents, format, clearCart } = useCart();
  const [settings, setSettings] = useState<any>({
    whatsapp: '+447414512857',
    email: 'watchesoriginal90@gmail.com',
    shipping_fee: 4809,
  });
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    country: 'United States (US)',
    address: '',
    city: '',
    state: 'California',
    zip: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [coupon, setCoupon] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState('apple_pay');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('shop_settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => data && setSettings(data));
  }, []);

  const shippingCents = items.length > 0 ? settings.shipping_fee || 4809 : 0;
  const totalCents = subtotalCents + shippingCents - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'LUXURY15') {
      setDiscount(Math.round(subtotalCents * 0.15));
      toast.success('Coupon applied! 15% off');
    } else if (coupon) {
      toast.error('Invalid coupon code');
    }
  };

  const onPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      // CRM subscribe
      await fetch('https://famous.ai/api/crm/6a0b1742f18aa958975dcc88/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          name: `${form.firstName} ${form.lastName}`,
          source: 'checkout',
          tags: ['customer', 'order-placed'],
        }),
      }).catch(() => {});

      // Create customer
      const { data: customer } = await supabase
        .from('ecom_customers')
        .upsert(
          {
            email: form.email,
            name: `${form.firstName} ${form.lastName}`,
            phone: form.phone,
            address: {
              line1: form.address,
              city: form.city,
              state: form.state,
              postal_code: form.zip,
              country: form.country,
            },
          },
          { onConflict: 'email' }
        )
        .select('id')
        .single();

      // Create order with status 'pending' (manual payment workflow per spec)
      const { data: order, error } = await supabase
        .from('ecom_orders')
        .insert({
          customer_id: customer?.id,
          status: 'pending',
          subtotal: subtotalCents,
          tax: 0,
          shipping: shippingCents,
          total: totalCents,
          shipping_address: {
            name: `${form.firstName} ${form.lastName}`,
            line1: form.address,
            city: form.city,
            state: form.state,
            postal_code: form.zip,
            country: form.country,
            phone: form.phone,
            email: form.email,
          },
          notes: `Payment method: ${payment}. ${form.notes}`,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order!.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: item.name,
        variant_title: item.variant_title || null,
        sku: item.sku || null,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
      }));
      await supabase.from('ecom_order_items').insert(orderItems);

      clearCart();
      toast.success('Thank you for your order', { description: 'Your order has been received. Our concierge team will contact you shortly with payment instructions.' });
      navigate(`/order-confirmation?id=${order!.id}`);
    } catch (err: any) {
      toast.error('Failed to place order', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
          <Link to="/shop" className="text-[#D4AF37]">Continue shopping →</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1300px] mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h1 className="font-serif text-3xl">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-12 max-w-2xl mx-auto">
          {['Shopping Cart', 'Shipping & Checkout', 'Confirmation'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i <= 1 ? 'bg-[#059669] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] uppercase tracking-wider mt-2 hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${i < 1 ? 'bg-[#059669]' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-6">
          <button onClick={() => setCouponOpen(!couponOpen)} className="text-sm text-gray-600">
            Have a coupon?{' '}
            <span className="underline text-[#D4AF37]">Click here to enter your code</span>
          </button>
          {couponOpen && (
            <div className="mt-3 flex gap-2 max-w-md">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
              <button onClick={applyCoupon} className="bg-[#0A0A0A] text-white px-5 py-2 text-sm">
                Apply
              </button>
            </div>
          )}
        </div>

        <form onSubmit={onPlace} className="grid lg:grid-cols-[1fr_440px] gap-12">
          {/* Billing */}
          <div>
            <h2 className="font-serif text-2xl mb-6">Billing details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} required />
              <Field label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} required />
              <SelectField label="Country / Region" value={form.country} onChange={(v) => setForm({ ...form, country: v })} options={['United States (US)', 'United Kingdom (UK)', 'Canada', 'Australia', 'Germany', 'France', 'United Arab Emirates']} className="col-span-2" />
              <Field label="Street address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required placeholder="House number and street name" className="col-span-2" />
              <Field label="Town / City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required className="col-span-2" />
              <SelectField label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} options={['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'Massachusetts', 'Washington']} />
              <Field label="ZIP Code" value={form.zip} onChange={(v) => setForm({ ...form, zip: v })} required />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required type="tel" className="col-span-2" />
              <Field label="Email address" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required type="email" className="col-span-2" />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2">Order notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                placeholder="Notes about your order, e.g. special notes for delivery."
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="font-serif text-2xl mb-6">Your order</h2>
            <div className="border border-gray-200 p-6 space-y-5">
              {items.map((item) => (
                <div key={item.product_id + (item.variant_id || '')} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover bg-gray-50" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-gray-500">× {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">{format(item.price * item.quantity)}</p>
                </div>
              ))}

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{format(subtotalCents)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#059669]">
                    <span>Discount (LUXURY15)</span>
                    <span>-{format(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <p className="font-semibold mb-1">Shipment</p>
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="text-[#D4AF37]">●</span>
                    <span className="flex-1">
                      FedEx or USPS U.S.A. 2–5 Working Days Delivery Tariff Included (Excluding product preparation time):
                    </span>
                    <span className="font-semibold text-gray-900">{format(shippingCents)}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-3 border-t font-serif text-xl">
                  <span>Total</span>
                  <span>{format(totalCents)}</span>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-6 border border-gray-200">
              {PAYMENT_METHODS.map((m, i) => (
                <div
                  key={m.id}
                  className={`p-4 border-b last:border-b-0 cursor-pointer ${
                    payment === m.id ? 'bg-[#FAFAF8]' : ''
                  }`}
                  onClick={() => setPayment(m.id)}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                      className="accent-[#D4AF37]"
                    />
                    <span className="font-semibold uppercase text-sm tracking-wider">{m.label}</span>
                  </label>
                  {payment === m.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 text-xs text-gray-600 space-y-1 pl-7"
                    >
                      <p>To finalize your order, please contact us for payment instructions.</p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> WhatsApp: {settings.whatsapp}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> Email: {settings.email}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-[#059669] hover:bg-[#047857] text-white py-4 text-sm font-semibold tracking-wide transition-all disabled:opacity-50"
            >
              {submitting ? 'Placing order...' : 'PLACE ORDER'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const Field: React.FC<any> = ({ label, value, onChange, required, type = 'text', placeholder, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      type={type}
      placeholder={placeholder}
      className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
    />
  </div>
);

const SelectField: React.FC<any> = ({ label, value, onChange, options, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
    >
      {options.map((o: string) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default Checkout;

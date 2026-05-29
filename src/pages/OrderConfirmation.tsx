import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const OrderConfirmation: React.FC = () => {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const { format } = useCart();
  const id = params.get('id');

  useEffect(() => {
    if (!id) return;
    supabase.from('ecom_orders').select('*').eq('id', id).single().then(({ data }) => setOrder(data));
    supabase.from('ecom_order_items').select('*').eq('order_id', id).then(({ data }) => setItems(data || []));
  }, [id]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#059669] text-white flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-4xl mb-3">Thank you for your order</h1>
        <p className="text-gray-600 mb-8">
          Your order has been received. Our concierge team will contact you shortly with payment instructions.
        </p>
        {order && (
          <div className="bg-[#FAFAF8] p-6 text-left mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm border-b pb-4 mb-4">
              <div><p className="text-xs text-gray-500 uppercase mb-1">Order #</p><p className="font-semibold">{order.id.slice(0, 8)}</p></div>
              <div><p className="text-xs text-gray-500 uppercase mb-1">Date</p><p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-gray-500 uppercase mb-1">Total</p><p className="font-semibold">{format(order.total)}</p></div>
              <div><p className="text-xs text-gray-500 uppercase mb-1">Status</p><p className="font-semibold uppercase text-[#D4AF37]">{order.status}</p></div>
            </div>
            <h3 className="font-semibold mb-3">Order details</h3>
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                <span>{it.product_name} × {it.quantity}</span>
                <span>{format(it.total)}</span>
              </div>
            ))}
          </div>
        )}
        <Link to="/shop" className="inline-block bg-[#0A0A0A] text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-[#D4AF37] transition-colors">
          Continue shopping
        </Link>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;

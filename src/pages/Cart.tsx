import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, subtotalCents, format } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-20 px-6 text-center">
          <h1 className="font-serif text-4xl mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Discover our curated luxury timepieces.</p>
          <Link to="/shop" className="inline-block bg-[#0A0A0A] text-white px-8 py-3 text-sm tracking-wider uppercase hover:bg-[#D4AF37] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-serif text-4xl mb-10">Shopping Cart</h1>
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          <div>
            <div className="hidden md:grid grid-cols-[1fr_120px_140px_60px] gap-4 pb-4 border-b text-xs uppercase tracking-wider text-gray-500">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Subtotal</span>
              <span />
            </div>
            {items.map((item) => (
              <div key={item.product_id + (item.variant_id || '')} className="grid grid-cols-[80px_1fr] md:grid-cols-[1fr_120px_140px_60px] gap-4 py-6 border-b items-center">
                <div className="md:flex items-center gap-4 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-gray-50" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">{item.brand}</p>
                      <Link to={`/product/${item.handle}`} className="font-medium hover:text-[#D4AF37]">{item.name}</Link>
                      <p className="text-sm font-semibold mt-1 md:hidden">{format(item.price)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center border border-gray-200 w-fit justify-self-center">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.variant_id)} className="p-2 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                  <span className="px-4 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.variant_id)} className="p-2 hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                </div>
                <p className="font-semibold text-right">{format(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.product_id, item.variant_id)} className="text-gray-400 hover:text-red-500 justify-self-end">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <aside className="bg-[#FAFAF8] p-6 h-fit sticky top-32">
            <h2 className="font-serif text-2xl mb-6">Cart Totals</h2>
            <div className="space-y-3 text-sm border-b pb-4">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{format(subtotalCents)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>Calculated at checkout</span></div>
            </div>
            <div className="flex justify-between py-4 font-serif text-lg">
              <span>Total</span>
              <span>{format(subtotalCents)}</span>
            </div>
            <Link to="/checkout" className="block w-full bg-[#059669] hover:bg-[#047857] text-white text-center py-3.5 text-sm font-semibold tracking-wide transition-colors">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;

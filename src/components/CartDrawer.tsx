import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartDrawer: React.FC = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotalCents, format } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-[80]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[90] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-serif text-xl">Shopping Cart ({items.length})</h2>
              <button onClick={closeCart} className="hover:text-[#D4AF37] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                <p className="font-serif text-lg mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-500 mb-6">Discover our luxury collection</p>
                <button
                  onClick={closeCart}
                  className="bg-[#0A0A0A] text-white px-6 py-2.5 text-sm tracking-wide hover:bg-[#D4AF37] transition-colors"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {items.map((item) => (
                    <div key={item.product_id + (item.variant_id || '')} className="flex gap-4">
                      <Link to={`/product/${item.handle}`} onClick={closeCart}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover bg-gray-50 rounded"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{item.brand}</p>
                        <Link to={`/product/${item.handle}`} onClick={closeCart} className="text-sm font-medium line-clamp-2 hover:text-[#D4AF37] transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-sm font-semibold mt-1">{format(item.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded">
                            <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.variant_id)} className="p-1.5 hover:bg-gray-50">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.variant_id)} className="p-1.5 hover:bg-gray-50">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.product_id, item.variant_id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="font-serif text-lg font-semibold">{format(subtotalCents)}</span>
                  </div>
                  <p className="text-xs text-gray-500">Shipping & taxes calculated at checkout.</p>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="block w-full bg-[#059669] text-white text-center py-3.5 text-sm font-semibold tracking-wide hover:bg-[#047857] transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="block w-full border border-gray-300 text-center py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Cart
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

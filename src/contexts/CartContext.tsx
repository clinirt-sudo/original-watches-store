import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  name: string;
  variant_title?: string;
  sku?: string;
  price: number; // in cents
  image?: string;
  handle?: string;
  brand?: string;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem, qty?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, qty: number, variantId?: string) => void;
  clearCart: () => void;
  subtotalCents: number;
  count: number;
  currency: 'USD' | 'EUR' | 'GBP';
  setCurrency: (c: 'USD' | 'EUR' | 'GBP') => void;
  rate: number;
  symbol: string;
  format: (cents: number) => string;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const RATES: Record<string, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.79, symbol: '£' },
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ecom_cart') || '[]');
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrencyState] = useState<'USD' | 'EUR' | 'GBP'>(() => {
    return (localStorage.getItem('ows_currency') as any) || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('ecom_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('ows_currency', currency);
  }, [currency]);

  const addItem = useCallback((item: CartItem, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
    toast.success('Added to cart', { description: item.name });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === productId && i.variant_id === variantId))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number, variantId?: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product_id === productId && i.variant_id === variantId
            ? { ...i, quantity: Math.max(1, qty) }
            : i
        )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotalCents = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const { rate, symbol } = RATES[currency];

  const format = useCallback(
    (cents: number) => {
      const converted = (cents / 100) * rate;
      return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [rate, symbol]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotalCents,
        count,
        currency,
        setCurrency: setCurrencyState,
        rate,
        symbol,
        format,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, ShoppingBag, Heart, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const SPEC_LABELS: Record<string, string> = {
  case: 'Case',
  dial: 'Dial',
  movement: 'Movement',
  bracelet: 'Bracelet',
  waterResistance: 'Water Resistance',
  warranty: 'Warranty',
};

const ProductDetail: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, format, currency, setCurrency, openCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    supabase
      .from('ecom_products')
      .select('*')
      .eq('handle', slug)
      .single()
      .then(async ({ data }) => {
        setProduct(data);
        if (data) {
          const { data: rel } = await supabase
            .from('ecom_products')
            .select('*')
            .eq('vendor', data.vendor)
            .neq('id', data.id)
            .limit(4);
          setRelated(rel || []);
        }
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'instant' as any });
      });
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16 grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-24 bg-gray-100 animate-pulse" />
            <div className="h-10 w-3/4 bg-gray-100 animate-pulse" />
            <div className="h-6 w-32 bg-gray-100 animate-pulse" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">Product not found</h1>
          <Link to="/shop" className="text-[#D4AF37]">Back to shop</Link>
        </div>
      </Layout>
    );
  }

  const inStock = product.inventory_qty == null || product.inventory_qty > 0;
  const images = product.images?.length ? product.images : ['/placeholder.svg'];
  const onSale = product.tags?.includes('sale');
  const originalPrice = onSale ? Math.round(product.price / 0.92) : null;

  const handleAdd = (buyNow = false) => {
    if (!inStock) return;
    addItem(
      {
        product_id: product.id,
        name: product.name,
        sku: product.sku || product.handle,
        price: product.price,
        image: product.images?.[0],
        handle: product.handle,
        brand: product.vendor,
      },
      qty
    );
    if (buyNow) {
      setTimeout(() => navigate('/checkout'), 100);
    }
  };

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <p className="text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#D4AF37]">Home</Link> /{' '}
          <Link to={`/brand/${product.vendor?.toLowerCase().replace(/ /g, '-')}`} className="hover:text-[#D4AF37]">
            {product.vendor}
          </Link>{' '}
          / <span>{product.name}</span>
        </p>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-[#FAFAF8] overflow-hidden mb-4 group"
            >
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square bg-[#FAFAF8] overflow-hidden border-2 transition-colors ${
                      activeImg === i ? 'border-[#D4AF37]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
              {product.vendor}
            </p>
            <h1 className="font-serif text-3xl lg:text-4xl font-light mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-5">
              {originalPrice && (
                <span className="text-lg text-gray-400 line-through">{format(originalPrice)}</span>
              )}
              <span className="font-serif text-3xl font-semibold">
                {format(product.price)}
              </span>
              {onSale && (
                <span className="bg-[#059669] text-white text-xs px-2 py-0.5 rounded">SAVE</span>
              )}
            </div>

            <p className={`flex items-center gap-2 text-sm mb-6 ${inStock ? 'text-[#059669]' : 'text-red-500'}`}>
              <Check className="w-4 h-4" /> {inStock ? 'In stock — ships within 24 hours' : 'Out of stock'}
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>

            {/* Currency switcher */}
            <div className="mb-6">
              <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block">
                Currency
              </label>
              <div className="flex gap-2">
                {(['USD', 'EUR', 'GBP'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      currency === c
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                        : 'border-gray-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + actions */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
              <div className="flex items-center border border-gray-200">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-gray-50">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 font-medium">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => handleAdd(false)}
                disabled={!inStock}
                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white px-8 py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-[0_0_25px_rgba(5,150,105,0.3)]"
              >
                <ShoppingBag className="w-4 h-4" /> Add to cart
              </button>
              <button
                onClick={() => handleAdd(true)}
                disabled={!inStock}
                className="flex-1 bg-[#0A0A0A] hover:bg-[#D4AF37] text-white px-8 py-3.5 text-sm font-semibold tracking-wide transition-colors disabled:opacity-50"
              >
                Buy now
              </button>
            </div>

            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#D4AF37] mb-8">
              <Heart className="w-4 h-4" /> Add to wishlist
            </button>

            {/* Specs */}
            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <div className="border-t pt-8">
                <h3 className="font-serif text-xl mb-5">Specifications</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(product.metadata).map(([k, v]) =>
                    v ? (
                      <div key={k} className="flex justify-between border-b border-gray-100 py-2 text-sm">
                        <dt className="text-gray-500">{SPEC_LABELS[k] || k}</dt>
                        <dd className="font-medium text-right">{String(v)}</dd>
                      </div>
                    ) : null
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="text-center mb-12">
              <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3">· You may also like ·</p>
              <h2 className="font-serif text-3xl font-light">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;

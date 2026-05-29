import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: any;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addItem, format } = useCart();
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const onSaleTag = product.tags?.includes('sale');
  // Synthetic discount for visual flair on sale items
  const displayDiscount = onSaleTag ? 8 : 0;
  const originalPrice = displayDiscount ? Math.round(product.price / (1 - displayDiscount / 100)) : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      sku: product.sku || product.handle,
      price: product.price,
      image: product.images?.[0],
      handle: product.handle,
      brand: product.vendor,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group"
    >
      <Link to={`/product/${product.handle}`} className="block">
        <div className="relative bg-white overflow-hidden mb-4">
          {displayDiscount > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-[#059669] text-white text-xs font-bold px-2 py-1 rounded">
              -{displayDiscount}%
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#D4AF37] hover:text-white"
          >
            <Heart className="w-4 h-4" />
          </button>

          <div className="aspect-square bg-[#FAFAF8] overflow-hidden">
            <img
              src={product.images?.[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Add to cart button reveal */}
          <button
            onClick={handleAdd}
            className="absolute left-0 right-0 bottom-0 bg-[#059669] text-white py-3 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#047857]"
          >
            <ShoppingBag className="w-4 h-4" /> Add to cart
          </button>
        </div>

        <div className="px-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5 font-semibold">
            {product.vendor}
          </p>
          <h3 className="text-sm font-medium text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {format(originalPrice)}
              </span>
            )}
            <span className={`text-sm font-semibold ${displayDiscount ? 'text-[#D4AF37]' : 'text-gray-900'}`}>
              {format(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

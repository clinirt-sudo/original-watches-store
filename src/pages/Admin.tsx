import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { LogOut, LayoutDashboard, Package, ShoppingCart, MessageSquare, Users, Settings, Menu, X } from 'lucide-react';

const ADMIN_KEY_STORAGE = 'ows_admin_session';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple gate; in production, use Supabase Auth + admin role
    if (password === 'admin123' || password === 'luxury2024') {
      localStorage.setItem(ADMIN_KEY_STORAGE, 'true');
      navigate('/admin/dashboard');
      toast.success('Welcome, Admin');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6">
      <div className="bg-white p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <h1 className="font-serif text-2xl text-center mb-6">Admin Login</h1>
        <form onSubmit={onLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] mb-4"
            required
          />
          <button className="w-full bg-[#059669] hover:bg-[#047857] text-white py-3 text-sm uppercase tracking-wider font-semibold">
            Sign in
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            Demo password: admin123
          </p>
        </form>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY_STORAGE) !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const nav = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { to: '/admin/admins', label: 'Admins', icon: Users },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const logout = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    navigate('/admin');
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="bg-[#0A0A0A] text-white flex flex-col h-full">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Logo variant="light" showTagline={false} />
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white p-2 rounded-md hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 py-4">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => onNavigate && onNavigate()}
            className={`flex items-center gap-3 px-5 py-3 text-sm hover:bg-white/5 transition-colors ${
              location.pathname === n.to ? 'bg-[#D4AF37]/10 border-r-2 border-[#D4AF37] text-[#D4AF37]' : ''
            }`}
          >
            <n.icon className="w-4 h-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 px-5 py-4 text-sm border-t border-white/10 hover:bg-white/5">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FAFAF8]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white/0 border-b border-gray-100 p-3 flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md mr-3">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            {/* small header area, could show current section */}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, messages: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('ecom_orders').select('total'),
      supabase.from('ecom_products').select('id', { count: 'exact', head: true }),
      supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
      supabase.from('ecom_orders').select('*').order('created_at', { ascending: false }).limit(5),
    ]).then(([orderRes, prodRes, msgRes, recentRes]) => {
      const revenue = (orderRes.data || []).reduce((s: number, o: any) => s + o.total, 0);
      setStats({
        orders: orderRes.data?.length || 0,
        revenue,
        products: prodRes.count || 0,
        messages: msgRes.count || 0,
      });
      setRecent(recentRes.data || []);
    });
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Total Orders', value: stats.orders },
          { label: 'Total Revenue', value: `$${(stats.revenue / 100).toLocaleString()}` },
          { label: 'Products', value: stats.products },
          { label: 'Messages', value: stats.messages },
        ].map((s) => (
          <div key={s.label} className="bg-white p-6 border border-gray-100">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{s.label}</p>
            <p className="font-serif text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 border border-gray-100">
        <h2 className="font-serif text-xl mb-5">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-gray-500 border-b">
            <tr><th className="py-2">Order ID</th><th>Date</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="font-semibold">${(o.total / 100).toFixed(2)}</td>
                <td><span className="uppercase text-xs">{o.status}</span></td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-gray-500">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [detailsOrder, setDetailsOrder] = useState<any | null>(null);
  const [detailsItems, setDetailsItems] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const load = () => {
    supabase.from('ecom_orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []));
  };
  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('ecom_orders').update({ status }).eq('id', id);
    toast.success('Order updated');
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    await supabase.from('ecom_order_items').delete().eq('order_id', id);
    await supabase.from('ecom_orders').delete().eq('id', id);
    load();
    toast.success('Order deleted');
  };

  const viewDetails = async (id: string) => {
    setDetailsLoading(true);
    const { data: order } = await supabase.from('ecom_orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('ecom_order_items').select('*').eq('order_id', id);
    setDetailsOrder(order || null);
    setDetailsItems(items || []);
    setDetailsLoading(false);
  };

  const closeDetails = () => {
    setDetailsOrder(null);
    setDetailsItems([]);
  };

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-8">Orders</h1>
      <div className="bg-white border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-gray-500 border-b">
            <tr><th className="p-4">ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td>{o.shipping_address?.email || '—'}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="font-semibold">${(o.total / 100).toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="border border-gray-200 px-2 py-1 text-xs">
                    {['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="space-x-2">
                  <button onClick={() => viewDetails(o.id)} className="text-blue-600 text-xs hover:underline">View details</button>
                  <button onClick={() => remove(o.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders</td></tr>}
          </tbody>
        </table>
      </div>
      {detailsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-serif text-2xl">Order details</h2>
                <p className="text-sm text-gray-500">Order #{detailsOrder.id.slice(0, 8)}</p>
              </div>
              <button onClick={closeDetails} className="text-gray-500 hover:text-[#D4AF37] text-sm">Close</button>
            </div>
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {detailsLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Customer</p>
                      <p className="font-semibold">{detailsOrder.shipping_address?.name || 'N/A'}</p>
                      <p>{detailsOrder.shipping_address?.email}</p>
                      <p>{detailsOrder.shipping_address?.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Shipping</p>
                      <p>{detailsOrder.shipping_address?.line1}</p>
                      <p>{detailsOrder.shipping_address?.city}, {detailsOrder.shipping_address?.state} {detailsOrder.shipping_address?.postal_code}</p>
                      <p>{detailsOrder.shipping_address?.country}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-sm">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Payment / Notes</p>
                    <p className="font-medium">Status: <span className="uppercase">{detailsOrder.status}</span></p>
                    <p className="mt-2 whitespace-pre-wrap">{detailsOrder.notes || 'No notes provided.'}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">Items</p>
                    <div className="space-y-3">
                      {detailsItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-[1fr_80px_80px] gap-4 text-sm">
                          <div>
                            <p className="font-semibold">{item.product_name}</p>
                            {item.variant_title && <p className="text-gray-500 text-xs">{item.variant_title}</p>}
                          </div>
                          <p className="text-right">×{item.quantity}</p>
                          <p className="text-right font-semibold">${(item.total / 100).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    supabase.from('ecom_products').select('*').order('created_at', { ascending: false }).then(({ data }) => setProducts(data || []));
  };
  useEffect(load, []);

  const remove = async (id: string) => {
    if (!confirm('Delete product?')) return;
    await supabase.from('ecom_products').delete().eq('id', id);
    load();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = { ...editing };
    if (typeof p.images === 'string') p.images = p.images.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (typeof p.tags === 'string') p.tags = p.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
    p.price = Math.round(Number(p.price) * 100);
    p.inventory_qty = Number(p.inventory_qty) || 0;
    if (p.new_arrival === undefined) p.new_arrival = false;
    p.new_arrival = Boolean(p.new_arrival);

    const saveProduct = async () => {
      if (p.id) {
        return await supabase.from('ecom_products').update(p).eq('id', p.id);
      }
      return await supabase.from('ecom_products').insert(p);
    };

    let result = await saveProduct();
    if (result.error && result.error.message?.includes('new_arrival')) {
      delete p.new_arrival;
      result = await saveProduct();
    }

    if (result.error) {
      toast.error('Failed to save product', { description: result.error.message });
    } else {
      setShowForm(false);
      setEditing(null);
      load();
      toast.success('Product saved');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Products</h1>
        <button onClick={() => { setEditing({ name: '', handle: '', price: 0, vendor: '', status: 'active', images: '', tags: '', new_arrival: false, description: '' }); setShowForm(true); }} className="bg-[#059669] text-white px-5 py-2 text-sm">+ Add Product</button>
      </div>

      {showForm && editing && (
        <form onSubmit={save} className="bg-white border p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="product-name" className="block text-sm font-semibold mb-1">Name</label>
            <input id="product-name" required placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="border px-3 py-2 w-full" />
          </div>

          <div>
            <label htmlFor="product-handle" className="block text-sm font-semibold mb-1">Handle (URL slug)</label>
            <input id="product-handle" required placeholder="Handle (url slug)" value={editing.handle} onChange={(e) => setEditing({ ...editing, handle: e.target.value })} className="border px-3 py-2 w-full" />
          </div>

          <div>
            <label htmlFor="product-vendor" className="block text-sm font-semibold mb-1">Brand / Vendor</label>
            <input id="product-vendor" required placeholder="Brand/Vendor" value={editing.vendor} onChange={(e) => setEditing({ ...editing, vendor: e.target.value })} className="border px-3 py-2 w-full" />
          </div>

          <div>
            <label htmlFor="product-price" className="block text-sm font-semibold mb-1">Price (USD)</label>
            <input id="product-price" required type="number" step="0.01" placeholder="Price (USD)" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="border px-3 py-2 w-full" />
          </div>

          <div>
            <label htmlFor="product-inventory" className="block text-sm font-semibold mb-1">Inventory</label>
            <input id="product-inventory" type="number" placeholder="Inventory" value={editing.inventory_qty || 0} onChange={(e) => setEditing({ ...editing, inventory_qty: e.target.value })} className="border px-3 py-2 w-full" />
          </div>

          <div className="col-span-2">
            <label htmlFor="product-images" className="block text-sm font-semibold mb-1">Images (comma separated URLs)</label>
            <input id="product-images" placeholder="Images (comma separated URLs)" value={Array.isArray(editing.images) ? editing.images.join(', ') : editing.images} onChange={(e) => setEditing({ ...editing, images: e.target.value })} className="border px-3 py-2 w-full" />
          </div>

          <div className="col-span-2">
            <label htmlFor="product-tags" className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
            <input id="product-tags" placeholder="Tags (comma separated)" value={Array.isArray(editing.tags) ? editing.tags.join(', ') : editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="border px-3 py-2 w-full" />
          </div>

          <div className="col-span-2">
            <label htmlFor="product-new-arrival" className="flex items-center gap-3 text-sm">
              <input
                id="product-new-arrival"
                type="checkbox"
                checked={Boolean(editing.new_arrival)}
                onChange={(e) => setEditing({ ...editing, new_arrival: e.target.checked })}
                className="accent-[#D4AF37]"
              />
              <span>Mark as New Arrival</span>
            </label>
          </div>

          <div className="col-span-2">
            <label htmlFor="product-description" className="block text-sm font-semibold mb-1">Description</label>
            <textarea id="product-description" placeholder="Description" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="border px-3 py-2 w-full" rows={3} />
          </div>

          <div className="col-span-2 flex gap-3">
            <button className="bg-[#059669] text-white px-5 py-2 text-sm">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="border px-5 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-gray-500 border-b">
            <tr><th className="p-4">Image</th><th>Name</th><th>Brand</th><th>Price</th><th>Stock</th><th>New</th><th /></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-2"><img src={p.images?.[0]} className="w-12 h-12 object-cover" /></td>
                <td>{p.name}</td>
                <td>{p.vendor}</td>
                <td>${(p.price / 100).toFixed(2)}</td>
                <td>{p.inventory_qty}</td>
                <td>{p.new_arrival ? '✅' : '—'}</td>
                <td>
                  <button onClick={() => { setEditing({ ...p, new_arrival: Boolean(p.new_arrival) }); setShowForm(true); }} className="text-blue-600 text-xs mr-3 hover:underline">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export const AdminMessages: React.FC = () => {
  const [sessions, setSessions] = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');

  useEffect(() => {
    supabase.from('chat_messages').select('session_id').then(({ data }) => {
      const unique = Array.from(new Set((data || []).map((d: any) => d.session_id)));
      setSessions(unique);
    });

    const ch = supabase
      .channel('admin-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const sid = (payload.new as any).session_id;
        setSessions((prev) => prev.includes(sid) ? prev : [...prev, sid]);
        if (sid === activeSession) {
          setMessages((m) => [...m, payload.new as any]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) return;
    supabase.from('chat_messages').select('*').eq('session_id', activeSession).order('created_at').then(({ data }) => setMessages(data || []));
  }, [activeSession]);

  const send = async () => {
    if (!reply.trim() || !activeSession) return;
    await supabase.from('chat_messages').insert({ session_id: activeSession, sender: 'admin', message: reply.trim() });
    setReply('');
  };

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-8">Messages</h1>
      <div className="grid grid-cols-[260px_1fr] gap-5 h-[600px]">
        <div className="bg-white border border-gray-100 overflow-y-auto">
          {sessions.map((s) => (
            <button key={s} onClick={() => setActiveSession(s)} className={`block w-full text-left p-4 border-b text-sm font-mono ${activeSession === s ? 'bg-[#D4AF37]/10' : ''}`}>
              {s.slice(0, 20)}...
            </button>
          ))}
          {sessions.length === 0 && <p className="p-4 text-gray-500 text-sm">No conversations yet</p>}
        </div>
        <div className="bg-white border border-gray-100 flex flex-col">
          {activeSession ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${m.sender === 'admin' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100'}`}>{m.message}</div>
                  </div>
                ))}
              </div>
              <div className="border-t p-3 flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type your reply..." className="flex-1 border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37]" />
                <button onClick={send} className="bg-[#059669] text-white px-5 text-sm">Send</button>
              </div>
            </>
          ) : <p className="m-auto text-gray-500">Select a conversation</p>}
        </div>
      </div>
    </AdminLayout>
  );
};

export const AdminAdmins: React.FC = () => (
  <AdminLayout>
    <h1 className="font-serif text-3xl mb-8">Admins</h1>
    <div className="bg-white border p-8">
      <p className="text-gray-600 mb-4">Admin user management. In production, this would integrate with Supabase Auth roles.</p>
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <p className="font-semibold">Super Admin</p>
            <p className="text-xs text-gray-500">admin@originalwatches.shop</p>
          </div>
          <span className="text-xs uppercase bg-[#D4AF37] text-white px-3 py-1">Owner</span>
        </div>
      </div>
    </div>
  </AdminLayout>
);

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    supabase.from('shop_settings').select('*').eq('id', 1).single().then(({ data }) => setSettings(data));
  }, []);

  const save = async () => {
    await supabase.from('shop_settings').update(settings).eq('id', 1);
    toast.success('Settings saved');
  };

  if (!settings) return <AdminLayout><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl mb-8">Settings</h1>
      <div className="bg-white border p-8 max-w-2xl space-y-5">
        <Setting label="Shop name" value={settings.shop_name} onChange={(v) => setSettings({ ...settings, shop_name: v })} />
        <Setting label="WhatsApp number" value={settings.whatsapp} onChange={(v) => setSettings({ ...settings, whatsapp: v })} />
        <Setting label="Email" value={settings.email} onChange={(v) => setSettings({ ...settings, email: v })} />
        <Setting label="Telegram URL" value={settings.telegram_url} onChange={(v) => setSettings({ ...settings, telegram_url: v })} />
        <Setting label="Shipping fee (cents)" value={settings.shipping_fee} onChange={(v) => setSettings({ ...settings, shipping_fee: Number(v) })} type="number" />
        <Setting label="Promo bar text" value={settings.promo_text} onChange={(v) => setSettings({ ...settings, promo_text: v })} />
        <button onClick={save} className="bg-[#059669] text-white px-6 py-3 text-sm uppercase tracking-wider">Save Settings</button>
      </div>
    </AdminLayout>
  );
};

const Setting: React.FC<any> = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">{label}</label>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]" />
  </div>
);

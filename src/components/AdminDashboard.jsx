import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import AdminTopNav from './AdminTopNav'
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign,
  AlertTriangle, CheckCircle, Clock, Zap, Plus, Trash2, ArrowUpRight,
  Edit2, X, Save, Eye, RefreshCw, Tag, Layers, BarChart2
} from 'lucide-react'

// ─── API helper ───────────────────────────────────────────────────────────
function useApi() {
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token')
    const isFormData = options.body instanceof FormData
    const headers = {
      Authorization: `Token ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    }
    const res = await fetch(url, { ...options, headers })
    if (res.status === 204) return null
    const data = await res.json()
    if (!res.ok) throw data
    return data
  }, [])
  return authFetch
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub, trend, trendUp }) {
  const colors = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
  }
  const c = colors[color] || colors.amber
  return (
    <div className={`bg-white border border-gray-100 rounded-3xl p-7 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              {trendUp ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-500" />}
              <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</span>
              <span className="text-xs text-gray-400"> vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <div className="h-0.5 w-6 mt-1 rounded-full" style={{ background: 'linear-gradient(90deg,#A9823F,#D8B86A)' }} />
      </div>
      {action}
    </div>
  )
}

function Badge({ value }) {
  const map = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    ADMIN: 'bg-amber-50 text-amber-700 border-amber-200',
    CUSTOMER: 'bg-gray-50 text-gray-600 border-gray-200',
    SELLER: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  const cls = map[value?.toUpperCase?.()] || 'bg-gray-50 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {value || '—'}
    </span>
  )
}

function Table({ columns, data, emptyText = 'No records found' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map(c => (
                <th key={c.key} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0
              ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400">{emptyText}</td></tr>
              : data.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-gray-50/60 transition-colors">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-3 text-sm text-gray-700">
                        {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Input({ label, type = 'text', value, onChange, placeholder, required, min, max, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</label>}
      <input
        type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
        required={required} min={min} max={max}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all placeholder-gray-300"
      />
    </div>
  )
}

function Select({ label, value, onChange, children, required, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</label>}
      <select
        value={value ?? ''} onChange={onChange} required={required}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
      >
        {children}
      </select>
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</label>}
      <textarea
        value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all resize-none placeholder-gray-300"
      />
    </div>
  )
}

function Btn({ children, onClick, type = 'button', disabled, variant = 'primary', size = 'md' }) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-150 disabled:opacity-40'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
    outline: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900',
    danger: 'bg-white border border-rose-200 text-rose-500 hover:bg-rose-50',
    ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {children}
    </button>
  )
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fade-in ${type === 'success' ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-rose-200 text-rose-700'}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      {message}
      <button onClick={onClose} className="ml-1 text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth()
  const authFetch = useApi()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [flashSales, setFlashSales] = useState([])
  const [productSections, setProductSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    if (user?.role !== 'ADMIN') return
    setLoading(true)
    try {
      const [dash, u, p, o, c, fs, ps] = await Promise.all([
        authFetch('/api/admin/'),
        authFetch('/api/admin/users/'),
        authFetch('/api/admin/products/'),
        authFetch('/api/admin/orders/'),
        authFetch('/api/admin/categories/'),
        authFetch('/api/admin/flash-sales/'),
        authFetch('/api/admin/product-sections/'),
      ])
      if (dash?.stats) setStats(dash.stats)
      if (u) setUsers(u)
      if (p) setProducts(p)
      if (o) setOrders(o)
      if (c) setCategories(c)
      if (fs) setFlashSales(fs)
      if (ps) setProductSections(ps)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [user, authFetch])

  useEffect(() => { load() }, [load])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <AlertTriangle size={32} className="text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Access Denied</h2>
          <p className="text-sm text-gray-400">This page is restricted to administrators.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="text-amber-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  // ── OVERVIEW ─────────────────────────────────────────────────────────────
  const OverviewPage = () => (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`Rs ${Number(stats?.total_revenue||0).toLocaleString()}`} icon={DollarSign} color="amber" trend="+12.5%" trendUp sub="All time" />
        <StatCard label="Total Orders" value={stats?.total_orders||0} icon={ShoppingCart} color="blue" trend="+8.2%" trendUp sub={`${stats?.pending_orders||0} pending`} />
        <StatCard label="Customers" value={stats?.total_users||0} icon={Users} color="purple" trend="+5.1%" trendUp sub="Registered" />
        <StatCard label="Products" value={stats?.total_products||0} icon={Package} color="green" sub={`${stats?.low_stock_count||0} low stock`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Pending Orders', value: stats?.pending_orders||0, icon: Clock, cls: 'text-amber-600 bg-amber-50' },
          { label: 'Paid Orders', value: stats?.paid_orders||0, icon: CheckCircle, cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'Categories', value: stats?.total_categories||0, icon: Tag, cls: 'text-blue-600 bg-blue-50' },
          { label: 'Low Stock', value: stats?.low_stock_count||0, icon: AlertTriangle, cls: 'text-rose-600 bg-rose-50' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.cls}`}>
              <m.icon size={16} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{m.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <SectionTitle title="Recent Orders" action={
            <button onClick={() => setActiveTab('orders')} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors">
              View all <ArrowUpRight size={12} />
            </button>
          } />
          <Table
            columns={[
              { key: 'id', label: '#' },
              { key: 'email', label: 'Customer', render: (_, r) => r.email || '—' },
              { key: 'total', label: 'Amount', render: v => `Rs ${Number(v||0).toLocaleString()}` },
              { key: 'status', label: 'Status', render: v => <Badge value={v} /> },
            ]}
            data={orders.slice(0, 5)}
          />
        </div>
        <div>
          <SectionTitle title="Products" action={
            <button onClick={() => setActiveTab('products')} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors">
              View all <ArrowUpRight size={12} />
            </button>
          } />
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price', render: v => `Rs ${Number(v||0).toLocaleString()}` },
              { key: 'stock', label: 'Stock', render: v => <span className={v < 5 ? 'text-rose-600 font-semibold' : v < 10 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>{v}</span> },
            ]}
            data={products.slice(0, 5)}
          />
        </div>
      </div>
    </div>
  )

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  const ProductsPage = () => {
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '', image: null })
    const [saving, setSaving] = useState(false)

    const openCreate = () => { setEditing(null); setForm({ name: '', description: '', price: '', stock: '', category: '', image: null }); setShowModal(true) }
    const openEdit = (p) => {
      setEditing(p)
      setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category?.id || '', image: null })
      setShowModal(true)
    }

    const handleSubmit = async (e) => {
      e.preventDefault(); setSaving(true)
      try {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k === 'category' ? 'category' : k, v) })
        const url = editing ? `/api/admin/products/${editing.id}/` : '/api/admin/products/'
        const method = editing ? 'PATCH' : 'POST'
        const result = await authFetch(url, { method, body: fd })
        if (editing) setProducts(prev => prev.map(p => p.id === editing.id ? result : p))
        else setProducts(prev => [result, ...prev])
        if (result && !editing) setStats(s => s ? { ...s, total_products: (s.total_products || 0) + 1 } : s)
        setShowModal(false)
        showToast(editing ? 'Product updated!' : 'Product created!')
      } catch (err) { showToast(JSON.stringify(err), 'error') }
      setSaving(false)
    }

    const handleDelete = async (id) => {
      if (!confirm('Delete this product?')) return
      try {
        await authFetch(`/api/admin/products/${id}/`, { method: 'DELETE' })
        setProducts(prev => prev.filter(p => p.id !== id))
        setStats(s => s ? { ...s, total_products: Math.max(0, (s.total_products || 0) - 1) } : s)
        showToast('Product deleted.')
      } catch { showToast('Delete failed.', 'error') }
    }

    return (
      <div className="animate-fade-up">
        <SectionTitle title={`Products (${products.length})`} action={
          <Btn onClick={openCreate}><Plus size={14} /> Add Product</Btn>
        } />

        <Table
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'category', label: 'Category', render: v => typeof v === 'object' ? v?.name || '—' : v || '—' },
            { key: 'price', label: 'Price', render: v => `Rs ${Number(v||0).toLocaleString()}` },
            { key: 'stock', label: 'Stock', render: v => <span className={v < 5 ? 'text-rose-600 font-bold' : v < 10 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>{v}</span> },
            { key: 'is_low_stock', label: 'Status', render: (_, r) => r.stock <= 5 ? <Badge value="LOW STOCK" /> : <Badge value="IN STOCK" /> },
            { key: 'id', label: 'Actions', render: (_, r) => (
              <div className="flex items-center gap-1">
                <Btn variant="outline" size="sm" onClick={() => openEdit(r)}><Edit2 size={12} /></Btn>
                <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}><Trash2 size={12} /></Btn>
              </div>
            )},
          ]}
          data={products}
        />

        {showModal && (
          <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (Rs)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                <Input label="Stock" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
              </div>
              <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] || null }))}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-200 file:text-sm file:font-medium file:text-gray-600 hover:file:bg-gray-50" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}><Save size={14} />{saving ? 'Saving…' : 'Save'}</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  // ── CATEGORIES ────────────────────────────────────────────────────────────
  const CategoriesPage = () => {
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', description: '', is_active: true, image: null })
    const [saving, setSaving] = useState(false)

    const openCreate = () => { setEditing(null); setForm({ name: '', description: '', is_active: true, image: null }); setShowModal(true) }
    const openEdit = c => { setEditing(c); setForm({ name: c.name, description: c.description, is_active: c.is_active, image: null }); setShowModal(true) }

    const handleSubmit = async (e) => {
      e.preventDefault(); setSaving(true)
      try {
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('description', form.description)
        fd.append('is_active', form.is_active)
        if (form.image) fd.append('image', form.image)
        const url = editing ? `/api/admin/categories/${editing.id}/` : '/api/admin/categories/'
        const method = editing ? 'PATCH' : 'POST'
        const result = await authFetch(url, { method, body: fd })
        if (editing) setCategories(prev => prev.map(c => c.id === editing.id ? result : c))
        else setCategories(prev => [result, ...prev])
        setShowModal(false)
        showToast(editing ? 'Category updated!' : 'Category created!')
      } catch (err) { showToast('Failed to save.', 'error') }
      setSaving(false)
    }

    const handleDelete = async (id) => {
      if (!confirm('Delete this category?')) return
      try {
        await authFetch(`/api/admin/categories/${id}/`, { method: 'DELETE' })
        setCategories(prev => prev.filter(c => c.id !== id))
        showToast('Category deleted.')
      } catch { showToast('Delete failed.', 'error') }
    }

    return (
      <div className="animate-fade-up">
        <SectionTitle title={`Categories (${categories.length})`} action={
          <Btn onClick={openCreate}><Plus size={14} /> Add Category</Btn>
        } />
        <Table
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'slug', label: 'Slug' },
            { key: 'is_active', label: 'Status', render: v => <Badge value={v ? 'ACTIVE' : 'INACTIVE'} /> },
            { key: 'id', label: 'Actions', render: (_, r) => (
              <div className="flex items-center gap-1">
                <Btn variant="outline" size="sm" onClick={() => openEdit(r)}><Edit2 size={12} /></Btn>
                <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}><Trash2 size={12} /></Btn>
              </div>
            )},
          ]}
          data={categories}
        />
        {showModal && (
          <Modal title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <Select label="Status" value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Image</label>
                <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] || null }))}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-200 file:text-sm file:font-medium file:text-gray-600 hover:file:bg-gray-50" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}><Save size={14} />{saving ? 'Saving…' : 'Save'}</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  // ── ORDERS ────────────────────────────────────────────────────────────────
  const OrdersPage = () => {
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orderDetail, setOrderDetail] = useState(null)
    const [showDetail, setShowDetail] = useState(false)
    const [updatingId, setUpdatingId] = useState(null)
    const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

    const viewOrder = async (o) => {
      setSelectedOrder(o); setShowDetail(true)
      try {
        const detail = await authFetch(`/api/admin/orders/${o.id}/`)
        setOrderDetail(detail)
      } catch { setOrderDetail(null) }
    }

    const updateStatus = async (id, newStatus) => {
      setUpdatingId(id)
      try {
        const result = await authFetch(`/api/admin/orders/${id}/`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) })
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
        if (orderDetail?.id === id) setOrderDetail(d => d ? { ...d, status: newStatus } : d)
        showToast('Order status updated!')
      } catch { showToast('Update failed.', 'error') }
      setUpdatingId(null)
    }

    return (
      <div className="animate-fade-up">
        <SectionTitle title={`Orders (${orders.length})`} />
        <Table
          columns={[
            { key: 'id', label: '#', render: v => `#${v}` },
            { key: 'email', label: 'Customer', render: (_, r) => r.email || '—' },
            { key: 'total', label: 'Total', render: v => `Rs ${Number(v||0).toLocaleString()}` },
            { key: 'status', label: 'Status', render: (v, r) => (
              <select
                value={v}
                onChange={e => updateStatus(r.id, e.target.value)}
                disabled={updatingId === r.id}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-300 disabled:opacity-50"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )},
            { key: 'is_paid', label: 'Paid', render: v => <Badge value={v ? 'YES' : 'NO'} /> },
            { key: 'created_at', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
            { key: 'id', label: '', render: (_, r) => (
              <Btn variant="ghost" size="sm" onClick={() => viewOrder(r)}><Eye size={13} /></Btn>
            )},
          ]}
          data={orders}
        />
        {showDetail && (
          <Modal title={`Order #${selectedOrder?.id}`} onClose={() => { setShowDetail(false); setOrderDetail(null) }}>
            {!orderDetail ? (
              <div className="flex items-center justify-center py-8"><RefreshCw size={20} className="animate-spin text-amber-500" /></div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1"><p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Customer</p><p className="text-gray-700">{orderDetail.first_name} {orderDetail.last_name}</p><p className="text-gray-500">{orderDetail.email}</p></div>
                  <div className="space-y-1"><p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Shipping</p><p className="text-gray-700">{orderDetail.city}, {orderDetail.country}</p><p className="text-gray-500">{orderDetail.postal_code}</p></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Items</p>
                  {orderDetail.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                      <span className="text-gray-900 font-semibold">Rs {Number(item.total||0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                  <span className="text-gray-700">Total</span>
                  <span className="text-gray-900">Rs {Number(orderDetail.total||0).toLocaleString()}</span>
                </div>
                <div className="flex items-center  gap-2">
                  <Select value={orderDetail.status} onChange={e => updateStatus(orderDetail.id, e.target.value)} className="flex-1">
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    )
  }

  // ── USERS ─────────────────────────────────────────────────────────────────
  const UsersPage = ({ roleFilter }) => {
    const [updatingId, setUpdatingId] = useState(null)
    const filtered = roleFilter ? users.filter(u => u.role === roleFilter) : users

    const updateRole = async (id, newRole) => {
      setUpdatingId(id)
      try {
        await authFetch(`/api/admin/users/${id}/`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) })
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
        showToast('Role updated!')
      } catch { showToast('Update failed.', 'error') }
      setUpdatingId(null)
    }

    const handleDelete = async (id) => {
      if (!confirm('Delete this user?')) return
      try {
        await authFetch(`/api/admin/users/${id}/`, { method: 'DELETE' })
        setUsers(prev => prev.filter(u => u.id !== id))
        showToast('User deleted.')
      } catch (e) { showToast(e?.detail || 'Delete failed.', 'error') }
    }

    return (
      <div className="animate-fade-up">
        <SectionTitle title={`${roleFilter || 'All'} Users (${filtered.length})`} />
        <Table
          columns={[
            { key: 'full_name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (v, r) => (
              <select
                value={v}
                onChange={e => updateRole(r.id, e.target.value)}
                disabled={updatingId === r.id || r.id === user?.id}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-300 disabled:opacity-50"
              >
                {['CUSTOMER', 'SELLER', 'ADMIN'].map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            )},
            { key: 'is_verified', label: 'Verified', render: v => <Badge value={v ? 'YES' : 'NO'} /> },
            { key: 'created_at', label: 'Joined', render: v => v ? new Date(v).toLocaleDateString() : '—' },
            { key: 'id', label: '', render: (_, r) => r.id !== user?.id ? (
              <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}><Trash2 size={12} /></Btn>
            ) : <span className="text-xs text-gray-300">You</span> },
          ]}
          data={filtered}
        />
      </div>
    )
  }

  // ── INVENTORY ─────────────────────────────────────────────────────────────
  const InventoryPage = () => {
    const [editingId, setEditingId] = useState(null)
    const [stockVal, setStockVal] = useState('')
    const [saving, setSaving] = useState(false)

    const update = async (id) => {
      setSaving(true)
      try {
        const result = await authFetch(`/api/admin/products/${id}/`, { method: 'PATCH', body: JSON.stringify({ stock: Number(stockVal) }) })
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: result.stock } : p))
        setEditingId(null)
        showToast('Stock updated!')
      } catch { showToast('Update failed.', 'error') }
      setSaving(false)
    }

    const sorted = [...products].sort((a, b) => a.stock - b.stock)

    return (
      <div className="animate-fade-up">
        <SectionTitle title="Inventory Management" action={
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg">
            <AlertTriangle size={12} />
            {products.filter(p => p.stock <= 5).length} items low stock
          </div>
        } />
        <Table
          columns={[
            { key: 'name', label: 'Product' },
            { key: 'category', label: 'Category', render: v => typeof v === 'object' ? v?.name || '—' : v || '—' },
            { key: 'stock', label: 'Current Stock', render: (v, r) => (
              editingId === r.id
                ? <div className="flex items-center gap-1">
                    <input type="number" min="0" value={stockVal} onChange={e => setStockVal(e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-300" autoFocus />
                    <Btn size="sm" disabled={saving} onClick={() => update(r.id)}><Save size={11} /></Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setEditingId(null)}><X size={11} /></Btn>
                  </div>
                : <span className={`font-semibold ${v <= 5 ? 'text-rose-600' : v <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{v}</span>
            )},
            { key: 'stock', label: 'Health', render: v => (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${v <= 5 ? 'bg-rose-500' : v <= 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(v / 50 * 100, 100)}%` }} />
                </div>
                <Badge value={v <= 5 ? 'CRITICAL' : v <= 10 ? 'LOW' : 'OK'} />
              </div>
            )},
            { key: 'id', label: '', render: (_, r) => (
              editingId !== r.id && <Btn variant="outline" size="sm" onClick={() => { setEditingId(r.id); setStockVal(r.stock) }}><Edit2 size={12} /> Update</Btn>
            )},
          ]}
          data={sorted}
        />
      </div>
    )
  }

  // ── REVENUE ───────────────────────────────────────────────────────────────
  const RevenuePage = () => {
    const paidOrders = orders.filter(o => o.is_paid)
    const totalRev = paidOrders.reduce((s, o) => s + Number(o.total || 0), 0)
    const avgOrder = paidOrders.length ? totalRev / paidOrders.length : 0

    const statusBreakdown = Object.entries(
      orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})
    )

    return (
      <div className="animate-fade-up space-y-6">
        <SectionTitle title="Revenue & Analytics" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={`Rs ${totalRev.toLocaleString()}`} icon={DollarSign} color="amber" sub="From paid orders" />
          <StatCard label="Paid Orders" value={paidOrders.length} icon={CheckCircle} color="green" sub={`out of ${orders.length} total`} />
          <StatCard label="Avg. Order Value" value={`Rs ${avgOrder.toFixed(0)}`} icon={BarChart2} color="blue" sub="Per paid order" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">Order Status Breakdown</p>
            <div className="space-y-2">
              {statusBreakdown.map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 font-medium">{status}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(count / orders.length) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">Recent Paid Orders</p>
            <Table
              columns={[
                { key: 'id', label: '#', render: v => `#${v}` },
                { key: 'email', label: 'Customer', render: (_, r) => r.email || '—' },
                { key: 'total', label: 'Amount', render: v => `Rs ${Number(v||0).toLocaleString()}` },
              ]}
              data={paidOrders.slice(0, 6)}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── FLASH SALES ───────────────────────────────────────────────────────────
  const FlashSalesPage = () => {
    const [form, setForm] = useState({ product: '', discount_percentage: '', start_time: '', end_time: '', is_active: true })
    const [saving, setSaving] = useState(false)

    const handleCreate = async (e) => {
      e.preventDefault(); setSaving(true)
      try {
        const data = await authFetch('/api/admin/flash-sales/', {
          method: 'POST',
          body: JSON.stringify({
            product: Number(form.product),
            discount_percentage: Number(form.discount_percentage),
            start_time: new Date(form.start_time).toISOString(),
            end_time: new Date(form.end_time).toISOString(),
            is_active: form.is_active,
          }),
        })
        setFlashSales(prev => [data, ...prev])
        setForm({ product: '', discount_percentage: '', start_time: '', end_time: '', is_active: true })
        showToast('Flash sale created!')
      } catch { showToast('Create failed.', 'error') }
      setSaving(false)
    }

    const handleDelete = async (id) => {
      if (!confirm('Delete this flash sale?')) return
      try {
        await authFetch(`/api/admin/flash-sales/${id}/`, { method: 'DELETE' })
        setFlashSales(prev => prev.filter(f => f.id !== id))
        showToast('Flash sale deleted.')
      } catch { showToast('Delete failed.', 'error') }
    }

    return (
      <div className="animate-fade-up space-y-5">
        <SectionTitle title="Flash Sales" />
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Create Flash Sale</p>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select label="Product" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} required>
              <option value="">Select product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input label="Discount %" type="number" min="1" max="99" value={form.discount_percentage} onChange={e => setForm(f => ({ ...f, discount_percentage: e.target.value }))} required />
            <Input label="Start Time" type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
            <Input label="End Time" type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
            <div className="flex items-end">
              <Btn type="submit" disabled={saving} className="w-full"><Zap size={14} />{saving ? 'Creating…' : 'Create Sale'}</Btn>
            </div>
          </form>
        </div>
        <Table
          columns={[
            { key: 'product_name', label: 'Product' },
            { key: 'discount_percentage', label: 'Discount', render: v => <span className="font-bold text-amber-600">{v}% OFF</span> },
            { key: 'start_time', label: 'Start', render: v => v ? new Date(v).toLocaleString() : '—' },
            { key: 'end_time', label: 'End', render: v => v ? new Date(v).toLocaleString() : '—' },
            { key: 'is_active', label: 'Active', render: v => <Badge value={v ? 'YES' : 'NO'} /> },
            { key: 'id', label: '', render: id => <Btn variant="danger" size="sm" onClick={() => handleDelete(id)}><Trash2 size={12} /></Btn> },
          ]}
          data={flashSales}
        />
      </div>
    )
  }

  // ── PRODUCT SECTIONS ──────────────────────────────────────────────────────
  const ProductSectionPage = ({ sectionType, title }) => {
    const [form, setForm] = useState({ product: '', order: 0 })
    const [saving, setSaving] = useState(false)
    const filtered = productSections.filter(ps => ps.section_type === sectionType).sort((a, b) => a.order - b.order)

    const handleAdd = async (e) => {
      e.preventDefault(); setSaving(true)
      try {
        const data = await authFetch('/api/admin/product-sections/', {
          method: 'POST',
          body: JSON.stringify({ section_type: sectionType, product: Number(form.product), order: Number(form.order), is_active: true }),
        })
        setProductSections(prev => [...prev, data])
        setForm({ product: '', order: 0 })
        showToast('Product added to section!')
      } catch { showToast('Add failed.', 'error') }
      setSaving(false)
    }

    const handleDelete = async (id) => {
      if (!confirm('Remove this product?')) return
      try {
        await authFetch(`/api/admin/product-sections/${id}/`, { method: 'DELETE' })
        setProductSections(prev => prev.filter(ps => ps.id !== id))
        showToast('Removed.')
      } catch { showToast('Remove failed.', 'error') }
    }

    const handleReorder = async (ps, newOrder) => {
      try {
        await authFetch(`/api/admin/product-sections/${ps.id}/`, { method: 'PATCH', body: JSON.stringify({ order: Number(newOrder) }) })
        setProductSections(prev => prev.map(item => item.id === ps.id ? { ...item, order: Number(newOrder) } : item))
      } catch { showToast('Reorder failed.', 'error') }
    }

    return (
      <div className="animate-fade-up space-y-5">
        <SectionTitle title={title} />
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Add Product to {title}</p>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="Product" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} className="sm:col-span-1" required>
              <option value="">Select product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input label="Order" type="number" min="0" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} required />
            <div className="flex items-end">
              <Btn type="submit" disabled={saving}><Plus size={14} />{saving ? 'Adding…' : 'Add'}</Btn>
            </div>
          </form>
        </div>
        <Table
          columns={[
            { key: 'product_name', label: 'Product' },
            { key: 'product_price', label: 'Price', render: v => `Rs ${Number(v||0).toLocaleString()}` },
            { key: 'order', label: 'Order', render: (v, row) => (
              <input type="number" min="0" value={v} onChange={e => handleReorder(row, e.target.value)}
                className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-300" />
            )},
            { key: 'is_active', label: 'Active', render: v => <Badge value={v ? 'YES' : 'NO'} /> },
            { key: 'id', label: '', render: id => <Btn variant="danger" size="sm" onClick={() => handleDelete(id)}><Trash2 size={12} /></Btn> },
          ]}
          data={filtered}
        />
      </div>
    )
  }

  // ── PLACEHOLDER ───────────────────────────────────────────────────────────
  const PlaceholderPage = ({ label }) => (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-up">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
        <Layers size={24} className="text-amber-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900">{label}</h3>
      <p className="text-sm text-gray-400 mt-1">This section is under development.</p>
    </div>
  )

  // ── ROUTER ────────────────────────────────────────────────────────────────
  const renderPanel = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewPage />
      case 'products':    return <ProductsPage />
      case 'categories':  return <CategoriesPage />
      case 'orders':      return <OrdersPage />
      case 'users':       return <UsersPage />
      case 'admins':      return <UsersPage roleFilter="ADMIN" />
      case 'inventory':   return <InventoryPage />
      case 'revenue':     return <RevenuePage />
      case 'flash-sales': return <FlashSalesPage />
      case 'trending':    return <ProductSectionPage sectionType="trending" title="Trending Now" />
      case 'new-arrivals':return <ProductSectionPage sectionType="new_arrival" title="New Arrivals" />
      case 'best-sellers':return <ProductSectionPage sectionType="best_seller" title="Best Sellers" />
      default:            return <PlaceholderPage label={activeTab.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} />
    }
  }

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/' }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav onToggleSidebar={() => setSidebarCollapsed(c => !c)} sidebarCollapsed={sidebarCollapsed} user={user} onLogout={handleLogout} />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-auto pb-10 lg:pb-12">
          <div className="max-w-7xl mx-auto">{renderPanel()}</div>
        </main>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

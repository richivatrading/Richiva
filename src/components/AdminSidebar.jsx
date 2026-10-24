import {
  LayoutDashboard, Users, Shield, Package, Tag, Layers,
  ShoppingCart, DollarSign, Bot, Ticket, Megaphone, Image, Bell,
  MessageSquare, Cog, LogOut, ChevronLeft, ChevronRight, Zap,
  Flame, Star, Trophy
} from 'lucide-react'

const NAV_GROUPS = [
  { title: 'Main', items: [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { title: 'User Management', items: [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'admins', label: 'Admins', icon: Shield },
  ]},
  { title: 'Catalogue', items: [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'inventory', label: 'Inventory', icon: Layers },
  ]},
  { title: 'Commerce', items: [
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ]},
  { title: 'AI', items: [
    { id: 'ai-requests', label: 'Try-On Requests', icon: Bot },
  ]},
  { title: 'Marketing', items: [
    { id: 'flash-sales', label: 'Flash Sales', icon: Zap },
    { id: 'trending', label: 'Trending Now', icon: Flame },
    { id: 'new-arrivals', label: 'New Arrivals', icon: Star },
    { id: 'best-sellers', label: 'Best Sellers', icon: Trophy },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'promotions', label: 'Promotions', icon: Megaphone },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]},
  { title: 'Content', items: [
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  ]},
  { title: 'System', items: [
    { id: 'settings', label: 'Settings', icon: Cog },
  ]},
]

export default function AdminSidebar({ activeTab, onTabChange, collapsed, onToggleCollapse, onLogout }) {
  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
        onClick={onToggleCollapse} 
      />
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col
          ${collapsed 
            ? '-translate-x-full lg:translate-x-0 lg:w-[68px]' 
            : 'translate-x-0 w-[230px]'}`}
      >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 h-14 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#A9823F,#D8B86A)' }}
            >
              F
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 font-bold text-sm leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>Fiora</p>
              <p className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#A9823F' }}>Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 shrink-0"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">
        {NAV_GROUPS.map(group => (
          <div key={group.title} className="mb-0.5">
            {!collapsed && (
              <p className="px-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 mt-3">
                {group.title}
              </p>
            )}
            {group.items.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-lg text-[12.5px] font-medium transition-all duration-150 mb-0.5 ${
                    collapsed ? 'justify-center px-2 py-2' : 'px-2.5 py-1.5'
                  } ${
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={isActive ? { boxShadow: 'inset 2px 0 0 #A9823F' } : {}}
                >
                  <Icon size={15} className={isActive ? 'text-amber-600' : 'text-gray-400'} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-2.5 rounded-lg py-2 text-sm font-medium transition-colors text-rose-500 hover:bg-rose-50 hover:text-rose-600 ${collapsed ? 'justify-center px-2' : 'px-2.5'}`}
        >
          <LogOut size={15} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  )
}

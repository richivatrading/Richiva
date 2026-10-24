import { useState, useRef, useEffect } from 'react'
import { Search, Bell, Moon, Sun, Globe, ChevronDown, Menu, X, LogOut, User, Settings } from 'lucide-react'

export default function AdminTopNav({ onToggleSidebar, sidebarCollapsed, user, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [lang, setLang] = useState('EN')
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = [
    { id: 1, text: 'New order #1042 placed', time: '2 min ago', read: false, color: 'bg-amber-500' },
    { id: 2, text: 'AI Try-On job completed', time: '15 min ago', read: false, color: 'bg-emerald-500' },
    { id: 3, text: 'Low stock: Silk Kurta (3 left)', time: '1 hour ago', read: true, color: 'bg-rose-500' },
    { id: 4, text: 'New customer registered', time: '3 hours ago', read: true, color: 'bg-blue-500' },
  ]
  const unreadCount = notifications.filter(n => !n.read).length
  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors lg:hidden">
          {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-52 lg:w-64 pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Language */}
        <button
          onClick={() => setLang(l => l === 'EN' ? 'NE' : 'EN')}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Globe size={13} />
          {lang}
        </button>

        <div className="hidden md:block w-px h-5 mx-1 bg-gray-200" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-76 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in" style={{ width: '310px' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{unreadCount} new</span>
                  )}
                </div>
                <button className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors">Mark all read</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.read ? 'bg-amber-50/40' : ''}`}>
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.color}`} />
                  <div className="min-w-0">
                    <p className={`text-sm ${!n.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{n.text}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5">
                <button className="text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors">View all →</button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 mx-1 bg-gray-200" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2 px-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 leading-tight">Super Admin</p>
            </div>
            <ChevronDown size={13} className="hidden lg:block text-gray-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || 'Admin User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-1">
                {[{ icon: User, label: 'Profile' }, { icon: Settings, label: 'Settings' }].map(item => (
                  <button key={item.label} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <item.icon size={14} className="text-gray-400" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 py-1">
                <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

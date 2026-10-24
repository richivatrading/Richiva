import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react'

const LINKS = {
  Shop:    [{ label:'Women', to:'/shop?cat=women' }, { label:'Men', to:'/shop?cat=men' }, { label:'Beauty', to:'/shop?cat=beauty' }, { label:'Accessories', to:'/shop?cat=accessories' }, { label:'New Arrivals', to:'/shop?sort=newest' }, { label:'Flash Deals', to:'/shop?discount=true' }],
  Account: [{ label:'My Account', to:'/account' }, { label:'My Orders', to:'/orders' }, { label:'Wishlist', to:'/wishlist' }, { label:'Cart', to:'/cart' }, { label:'Try-On History', to:'/tryon' }],
  Help:    [{ label:'FAQ', to:'#' }, { label:'Shipping Policy', to:'#' }, { label:'Return Policy', to:'#' }, { label:'Privacy Policy', to:'#' }, { label:'Terms of Service', to:'#' }],
}

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-white">
      {/* Try-On Banner */}
      <div style={{ background:'linear-gradient(135deg,#A9823F 0%,#D8B86A 50%,#B88A42 100%)' }} className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={22} />
            <span className="text-sm font-semibold uppercase tracking-widest opacity-90">Fiora Feature</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black mb-3">AI Virtual Try-On</h3>
          <p className="text-white/80 max-w-md mx-auto mb-6 text-sm leading-relaxed">
            See how any product looks on you before you buy. Upload your photo and try on any item instantly.
          </p>
          <Link to="/tryon" className="inline-flex items-center gap-2 bg-white text-[#A9823F] font-bold px-8 py-3 rounded-full hover:bg-[#FAF9F6] transition-colors text-sm">
            <Sparkles size={16} />
            Try It Now — It's Free
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-black tracking-widest" style={{ background:'linear-gradient(135deg,#C9A45C,#E8D29A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>FIORA</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Your premium fashion marketplace. Discover the latest trends, try before you buy, and shop with confidence.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <a href="mailto:hello@fiora.com" className="flex items-center gap-2 hover:text-[#D8B86A] transition-colors">
                <Mail size={14} /> hello@fiora.com
              </a>
              <a href="tel:+9779800000000" className="flex items-center gap-2 hover:text-[#D8B86A] transition-colors">
                <Phone size={14} /> +977 9800-000-000
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={14} /> Kathmandu, Nepal
              </span>
            </div>
            <div className="flex items-center gap-3 mt-6">
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-white/55 hover:text-[#D8B86A] transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 Fiora. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy Policy','Terms','Sitemap'].map(t => <a key={t} href="#" className="hover:text-white/70 transition-colors">{t}</a>)}
          </div>
          <p className="flex items-center gap-1">
            Made with <span className="text-[#D8B86A]">♥</span> in Nepal
          </p>
        </div>
      </div>
    </footer>
  )
}

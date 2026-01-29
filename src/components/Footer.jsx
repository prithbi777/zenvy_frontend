import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0a0a] text-white pt-16 md:pt-24 pb-12 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

        {/* Top Section: Newsletter & Brand */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 md:pb-20 border-b border-white/5">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <span className="text-2xl font-black tracking-tight text-white">
                Zenvy<span className="text-indigo-500 text-3xl leading-[0]">.</span>
              </span>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed max-w-sm mb-10">
              Redefining the modern shopping experience with curated luxury and exceptional quality. Join our global community of conscious consumers.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Instagram, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Facebook, href: '#' },
                { Icon: Linkedin, href: '#' }
              ].map((social, i) => (
                <a key={i} href={social.href} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300">
                  <social.Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-12">
            <div className="relative p-6 md:p-8 rounded-[28px] md:rounded-[32px] bg-indigo-600 overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2">Join the Inner Circle</h3>
                  <p className="text-indigo-100/80 text-sm font-medium">Get exclusive access to new drops & secret deals.</p>
                </div>
                <div className="w-full md:w-auto flex-1 max-w-md">
                  <div className="relative flex flex-col sm:flex-row p-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl gap-2 sm:gap-0">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-white placeholder:text-indigo-200/50 outline-none"
                    />
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors active:scale-95 whitespace-nowrap">
                      Join <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-8 gap-y-12 py-16 md:py-20 border-b border-white/5">
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-8">Shop</h4>
            <ul className="space-y-4">
              {['New Arrivals', 'Featured', 'Categories', 'Collections', 'Sale'].map(link => (
                <li key={link}><a href="#" className="text-slate-400 text-sm font-bold hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-8">Support</h4>
            <ul className="space-y-4">
              {['Order Status', 'Shipping info', 'Returns', 'Contact Us', 'FAQs'].map(link => (
                <li key={link}><a href="#" className="text-slate-400 text-sm font-bold hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-8">Company</h4>
            <ul className="space-y-4">
              {['Our Story', 'Careers', 'Sustainability', 'Press', 'Stores'].map(link => (
                <li key={link}><a href="#" className="text-slate-400 text-sm font-bold hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-8">Location</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <MapPin className="h-5 w-5 text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-slate-400 leading-relaxed">
                  123 Fashion District, <br /> Manhattan, NY 10001
                </p>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <Mail className="h-5 w-5 text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-slate-400 break-all">concierge@zenvy.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Legal & Copyright */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-12 text-center lg:text-left">
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500">
            © 2026 Zenvy Luxury Goods Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(legal => (
              <a key={legal} href="#" className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">{legal}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LogOut, Package, ReceiptText, LayoutDashboard, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../store';
import { toggleDark } from '../store';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/labels', label: 'Labels', icon: Package },
  { to: '/invoices', label: 'Invoices', icon: ReceiptText },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(clearCredentials());
    navigate('/auth');
  };

  const darkMode = useSelector((s) => s.ui?.darkMode);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', !!darkMode);
  }, [darkMode]);

  function SidebarInner() {
    return (
      <>
        <div>
          <div className="text-[11px] tracking-wide text-brand-700 dark:text-cyan-300">Courier Studio</div>
          <h1 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">Simple tools for shipping</h1>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm sm:leading-6">Labels, invoices, exports, and printing in one place.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleDark())}
            className="shine-on-hover btn-lift rounded-lg border border-slate-700 bg-white/70 p-2 text-slate-700 backdrop-blur-md hover:bg-white dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `btn-lift flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm transition lg:flex-none lg:justify-start lg:gap-3 lg:px-4 lg:py-3 ${isActive ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-soft' : 'text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'}`
              }
            >
              <Icon size={16} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-3xl border border-slate-200/80 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs tracking-wide text-slate-400 dark:text-slate-500">Signed in as</div>
          <div className="mt-1 text-sm font-medium text-slate-950 dark:text-white">{user?.name || 'User'}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'user'}</div>
        </div>
        <button onClick={() => { setMobileOpen(false); logout(); }} className="shine-on-hover btn-lift inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <LogOut size={16} /> Logout
        </button>
      </>
    );
  }

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden glass panel-glow card-pop soft-pulse relative z-10 lg:flex max-h-[38dvh] min-h-0 flex-col gap-3 overflow-y-auto border-b border-slate-800 p-3 sm:max-h-none lg:h-full lg:max-h-none lg:border-b-0 lg:border-r lg:p-4">
        <SidebarInner />
      </aside>

      {/* Mobile header */}
      <header className="flex items-center justify-between gap-3 p-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/80 p-2 text-slate-700 shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 6H20M4 12H20M4 18H20" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <div className="text-[11px] tracking-wide text-brand-700 dark:text-cyan-300">Courier Studio</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Simple tools for shipping</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleDark())}
            className="shine-on-hover btn-lift rounded-lg border border-slate-700 bg-white/70 p-2 text-slate-700 backdrop-blur-md hover:bg-white dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" aria-hidden onClick={() => setMobileOpen(false)} />
          <aside className="glass panel-glow card-pop relative z-10 flex w-80 min-h-0 flex-col gap-3 overflow-y-auto border-r border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] tracking-wide text-brand-700 dark:text-cyan-300">Courier Studio</div>
                <h1 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Menu</h1>
              </div>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6L18 18M6 18L18 6" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <SidebarInner />
          </aside>
        </div>
      )}
      
      <main className="relative z-10 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-3 pb-20 md:p-5 md:pb-12 lg:p-6 lg:pb-10">
        <Outlet />
        <footer className="mt-6 border-t border-slate-200/70 pt-4 text-center text-[10px] tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
          Developed By Lunar Fox AI
        </footer>
      </main>
    </div>
  );
}
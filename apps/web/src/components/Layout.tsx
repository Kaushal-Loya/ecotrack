import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/activities', label: 'Activities', icon: '📋' },
  { to: '/insights', label: 'Insights', icon: '💡' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col">
        {/* ── Header ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 font-display text-xl font-bold text-forest-400 hover:text-forest-300 transition-colors"
              aria-label="EcoTrack home"
            >
              <span aria-hidden="true">🌿</span>
              EcoTrack
            </Link>

            <nav aria-label="Main navigation">
              <ul className="hidden sm:flex items-center gap-1" role="list">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-forest-900/60 text-forest-400'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                        }`
                      }
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden sm:block text-sm text-gray-400">
                  {user.name ?? user.email}
                </span>
              )}
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="btn-secondary text-xs"
                aria-label="Sign out of your account"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <nav
            aria-label="Mobile navigation"
            className="sm:hidden border-t border-gray-800 bg-gray-950"
          >
            <ul className="flex" role="list">
              {NAV_ITEMS.map((item) => (
                <li key={item.to} className="flex-1">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs font-medium transition-colors ${
                        isActive ? 'text-forest-400' : 'text-gray-500 hover:text-gray-300'
                      }`
                    }
                  >
                    <span aria-hidden="true" className="text-lg">
                      {item.icon}
                    </span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* ── Main content ─────────────────────────────────────────── */}
        <main
          id="main-content"
          className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 animate-fade-in"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
          <p>
            Emission factors sourced from{' '}
            <a
              href="https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references"
              className="underline hover:text-gray-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              EPA
            </a>
            ,{' '}
            <a
              href="https://www.ipcc.ch/report/ar6/"
              className="underline hover:text-gray-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              IPCC AR6
            </a>{' '}
            &amp;{' '}
            <a
              href="https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023"
              className="underline hover:text-gray-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              DEFRA 2023
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}

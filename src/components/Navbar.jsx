import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import './navbar.css';

const LINKS = [
  { to: '/', label: 'Acasa', end: true },
  { to: '/flota', label: 'Flota' },
  { to: '/rezervare', label: 'Rezervare' },
  { to: '/echipa', label: 'Echipa' },
];

export function Navbar() {
  // Read once during the initial render so a page loaded mid-scroll (a
  // refresh, or a link to an anchor) starts with the header already solid.
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Only the home page puts a photograph behind the header. Once the page
  // scrolls -- or the mobile panel opens over an opaque background -- the
  // header goes back to the normal palette.
  const overHero = pathname === '/' && !scrolled && !menuOpen;

  // The original attached a scroll listener on every single render and never
  // removed it, so the handler count grew without bound as you browsed.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/');
  };

  return (
    <header
      className={['nav', scrolled && 'nav--scrolled', overHero && 'nav--over-hero']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="nav__inner shell shell--wide">
        <Link to="/" className="nav__brand">
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__brand-text">
            MPDB<span className="nav__brand-sub"> Rent a Car</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav__burger"
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="visually-hidden">
            {menuOpen ? 'Inchide meniul' : 'Deschide meniul'}
          </span>
          <span className={`nav__burger-icon ${menuOpen ? 'is-open' : ''}`} aria-hidden="true" />
        </button>

        <nav
          id="nav-menu"
          className={`nav__menu ${menuOpen ? 'is-open' : ''}`.trim()}
          aria-label="Navigare principala"
        >
          <ul className="nav__list">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `nav__link ${isActive ? 'nav__link--active' : ''}`.trim()
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <button
              type="button"
              className="nav__icon-btn"
              onClick={toggle}
              aria-pressed={theme === 'light'}
            >
              <span className="visually-hidden">
                Comuta pe tema {theme === 'dark' ? 'deschisa' : 'intunecata'}
              </span>
              <span aria-hidden="true" className="mono">
                {theme === 'dark' ? 'LUM' : 'INT'}
              </span>
            </button>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/contul-meu"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `nav__link nav__link--account ${isActive ? 'nav__link--active' : ''}`.trim()
                  }
                >
                  {user.username}
                </NavLink>
                <button type="button" className="btn btn--ghost nav__cta" onClick={handleLogout}>
                  Iesire
                </button>
              </>
            ) : (
              <>
                <NavLink to="/autentificare" onClick={closeMenu} className="nav__link">
                  Autentificare
                </NavLink>
                <Link to="/cont-nou" onClick={closeMenu} className="btn btn--primary nav__cta">
                  Cont nou
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

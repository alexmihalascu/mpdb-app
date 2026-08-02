import { Link } from 'react-router-dom';

import './footer.css';

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__inner shell shell--wide">
        <div className="foot__brand">
          <p className="foot__word">MPDB</p>
          <p className="foot__tagline">
            Inchirieri auto premium in Bucuresti. Livrare in oras si la Otopeni, 24 h din 24.
          </p>
        </div>

        <nav className="foot__nav" aria-label="Navigare subsol">
          <div className="foot__group">
            <h2 className="eyebrow">Navigare</h2>
            <ul className="foot__list">
              <li>
                <Link to="/flota">Flota</Link>
              </li>
              <li>
                <Link to="/rezervare">Rezervare</Link>
              </li>
              <li>
                <Link to="/echipa">Echipa</Link>
              </li>
            </ul>
          </div>

          <div className="foot__group">
            <h2 className="eyebrow">Cont</h2>
            <ul className="foot__list">
              <li>
                <Link to="/autentificare">Autentificare</Link>
              </li>
              <li>
                <Link to="/cont-nou">Cont nou</Link>
              </li>
              <li>
                <Link to="/contul-meu">Rezervarile mele</Link>
              </li>
            </ul>
          </div>

          <div className="foot__group">
            <h2 className="eyebrow">Contact</h2>
            <ul className="foot__list mono">
              <li>
                <a href="tel:+40721000000">+40 721 000 000</a>
              </li>
              <li>
                <a href="mailto:rezervari@mpdb.ro">rezervari@mpdb.ro</a>
              </li>
              <li>Sos. Bucuresti-Ploiesti 42</li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="foot__bar shell shell--wide">
        <p className="mono">© {YEAR} MPDB Rent a Car</p>
        <p className="mono foot__note">Proiect de facultate — flota si preturile sunt fictive.</p>
      </div>
    </footer>
  );
}

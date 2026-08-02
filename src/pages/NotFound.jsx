import { Button } from '../components/ui/Button';
import './auth.css';

export default function NotFound() {
  return (
    <div className="shell auth">
      <div className="auth__card" style={{ textAlign: 'center' }}>
        <p className="eyebrow eyebrow--signal">Eroare 404</p>
        <h1 className="auth__title">Pagina nu exista</h1>
        <p className="auth__lede">
          Linkul e gresit sau pagina a fost mutata. Flota, in schimb, e la locul ei.
        </p>
        <div style={{ marginBlockStart: 'var(--space-l)' }}>
          <Button variant="primary" to="/">
            Inapoi acasa
          </Button>
        </div>
      </div>
    </div>
  );
}

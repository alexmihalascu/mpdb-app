import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useAuth } from '../hooks/useAuth';
import './auth.css';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from ?? '/flota';

  useEffect(() => {
    if (isAuthenticated) navigate(destination, { replace: true });
  }, [isAuthenticated, destination, navigate]);

  const update = (name) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // The original version ignored the response entirely and redirected to
      // the booking page whether or not the credentials were correct.
      await login(form.username.trim(), form.password);
      navigate(destination, { replace: true });
    } catch (cause) {
      setError(cause.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="shell auth">
      <div className="auth__card">
        <p className="eyebrow eyebrow--signal">Autentificare</p>
        <h1 className="auth__title">Bine ai revenit</h1>
        <p className="auth__lede">Intra in cont ca sa iti vezi rezervarile si sa le gestionezi.</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {error && <Alert variant="error">{error}</Alert>}

          <Field
            label="Utilizator"
            required
            autoComplete="username"
            autoFocus
            value={form.username}
            onChange={update('username')}
          />
          <Field
            label="Parola"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={update('password')}
          />

          <Button type="submit" variant="primary" size="lg" block loading={submitting}>
            {submitting ? 'Se verifica' : 'Intra in cont'}
          </Button>
        </form>

        <p className="auth__switch">
          Nu ai cont? <Link to="/cont-nou">Creeaza unul in 30 de secunde</Link>
        </p>
      </div>
    </div>
  );
}

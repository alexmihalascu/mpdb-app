import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useAuth } from '../hooks/useAuth';
import './auth.css';

const USERNAME_RULE = /^[A-Za-z0-9._-]{3,32}$/;
const MIN_PASSWORD = 8;

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/contul-meu', { replace: true });
  }, [isAuthenticated, navigate]);

  const update = (name) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = {};
    if (!USERNAME_RULE.test(form.username.trim())) {
      found.username = 'Intre 3 si 32 de caractere: litere, cifre, punct, minus sau underscore.';
    }
    if (form.password.length < MIN_PASSWORD) {
      found.password = `Parola trebuie sa aiba cel putin ${MIN_PASSWORD} caractere.`;
    }
    if (form.confirm !== form.password) {
      found.confirm = 'Cele doua parole nu coincid.';
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register(form.username.trim(), form.password);
      navigate('/contul-meu', { replace: true });
    } catch (cause) {
      setFormError(cause.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="shell auth">
      <div className="auth__card">
        <p className="eyebrow eyebrow--signal">Cont nou</p>
        <h1 className="auth__title">Creeaza-ti contul</h1>
        <p className="auth__lede">
          Ai nevoie de un cont doar ca sa iti urmaresti rezervarile. Rezerva poti si fara.
        </p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {formError && <Alert variant="error">{formError}</Alert>}

          <Field
            label="Utilizator"
            required
            autoComplete="username"
            autoFocus
            value={form.username}
            onChange={update('username')}
            error={errors.username}
            hint="Litere, cifre, punct, minus sau underscore."
          />
          <Field
            label="Parola"
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            hint={`Minimum ${MIN_PASSWORD} caractere.`}
          />
          <Field
            label="Confirma parola"
            type="password"
            required
            autoComplete="new-password"
            value={form.confirm}
            onChange={update('confirm')}
            error={errors.confirm}
          />

          <Button type="submit" variant="primary" size="lg" block loading={submitting}>
            {submitting ? 'Se creeaza contul' : 'Creeaza contul'}
          </Button>
        </form>

        <p className="auth__switch">
          Ai deja cont? <Link to="/autentificare">Autentifica-te</Link>
        </p>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { formatDate } from '../lib/dates';
import './account.css';

const STATUS_LABEL = {
  pending: 'In asteptare',
  confirmed: 'Confirmata',
  cancelled: 'Anulata',
  completed: 'Finalizata',
};

const MIN_PASSWORD = 8;

export default function Account() {
  const { user, logout } = useAuth();

  const [rentals, setRentals] = useState([]);
  const [rentalsError, setRentalsError] = useState(null);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [passwordError, setPasswordError] = useState(null);
  const [passwordDone, setPasswordDone] = useState(false);
  const [saving, setSaving] = useState(false);

  // `loadingRentals` already starts true, so this does not flip it on the way
  // in -- that would be a synchronous setState inside the mount effect.
  const loadRentals = useCallback((signal) => {
    return api
      .myRentals(signal)
      .then((data) => setRentals(data.rentals))
      .catch((cause) => {
        if (cause.name !== 'AbortError') setRentalsError(cause.message);
      })
      .finally(() => {
        if (!signal?.aborted) setLoadingRentals(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRentals(controller.signal);
    return () => controller.abort();
  }, [loadRentals]);

  const handleCancel = async (rental) => {
    setCancellingId(rental.id);
    setRentalsError(null);
    try {
      const data = await api.cancelRental(rental.id);
      setRentals((current) =>
        current.map((item) => (item.id === rental.id ? data.rental : item)),
      );
    } catch (cause) {
      setRentalsError(cause.message);
    } finally {
      setCancellingId(null);
    }
  };

  const update = (name) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setPasswordError(null);
    setPasswordDone(false);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const found = {};
    if (!form.currentPassword) found.currentPassword = 'Scrie parola actuala.';
    if (form.newPassword.length < MIN_PASSWORD)
      found.newPassword = `Parola noua trebuie sa aiba cel putin ${MIN_PASSWORD} caractere.`;
    if (form.newPassword && form.newPassword === form.currentPassword)
      found.newPassword = 'Parola noua trebuie sa fie diferita de cea actuala.';
    if (form.confirm !== form.newPassword) found.confirm = 'Cele doua parole nu coincid.';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      // The old page had a password field whose submit handler did nothing
      // but call preventDefault -- it never reached the server.
      await api.changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPasswordDone(true);
    } catch (cause) {
      setPasswordError(cause.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shell shell--wide">
      <header className="page-head account__head">
        <div>
          <p className="eyebrow eyebrow--signal">Contul meu</p>
          <h1 className="page-head__title">{user.username}</h1>
          <p className="account__meta mono">
            Cont creat pe {formatDate(user.createdAt?.slice(0, 10))}
            {user.isAdmin && <span className="badge account__badge">Administrator</span>}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={logout}>
          Iesi din cont
        </Button>
      </header>

      <div className="account">
        <section className="account__col" aria-labelledby="rentals-title">
          <h2 className="account__title" id="rentals-title">
            Rezervarile mele
          </h2>

          {rentalsError && <Alert variant="error">{rentalsError}</Alert>}

          {loadingRentals ? (
            <div className="skeleton-card account__skeleton" aria-busy="true" />
          ) : rentals.length === 0 ? (
            <div className="empty">
              <h3 className="empty__title">Nicio rezervare inca</h3>
              <p className="empty__body">
                Cand rezervi o masina cat esti autentificat, apare aici cu tot cu total si status.
              </p>
              <Button variant="primary" to="/flota">
                Vezi flota
              </Button>
            </div>
          ) : (
            <ul className="rentals">
              {rentals.map((rental) => (
                <li className="rental" key={rental.id}>
                  <div className="rental__head">
                    <div>
                      <p className="rental__id mono">#{String(rental.id).padStart(5, '0')}</p>
                      <h3 className="rental__car">{rental.carName}</h3>
                    </div>
                    <span className={`badge badge--${rental.status}`}>
                      {STATUS_LABEL[rental.status] ?? rental.status}
                    </span>
                  </div>

                  <dl className="spec">
                    <dt className="spec__key">Perioada</dt>
                    <dd className="spec__val">
                      {formatDate(rental.pickupDate)} → {formatDate(rental.returnDate)}
                    </dd>
                    <dt className="spec__key">Livrare</dt>
                    <dd className="spec__val">{rental.location}</dd>
                    <dt className="spec__key">Total</dt>
                    <dd className="spec__val">{rental.totalPrice} EUR</dd>
                  </dl>

                  {rental.status !== 'cancelled' && (
                    <Button
                      type="button"
                      variant="quiet"
                      loading={cancellingId === rental.id}
                      onClick={() => handleCancel(rental)}
                    >
                      Anuleaza rezervarea
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="account__col" aria-labelledby="password-title">
          <h2 className="account__title" id="password-title">
            Schimba parola
          </h2>

          <form className="panel account__form" onSubmit={handlePasswordSubmit} noValidate>
            {passwordError && <Alert variant="error">{passwordError}</Alert>}
            {passwordDone && <Alert variant="success">Parola a fost schimbata.</Alert>}

            <Field
              label="Parola actuala"
              type="password"
              required
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={update('currentPassword')}
              error={errors.currentPassword}
            />
            <Field
              label="Parola noua"
              type="password"
              required
              autoComplete="new-password"
              value={form.newPassword}
              onChange={update('newPassword')}
              error={errors.newPassword}
              hint={`Minimum ${MIN_PASSWORD} caractere.`}
            />
            <Field
              label="Confirma parola noua"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={update('confirm')}
              error={errors.confirm}
            />

            <Button type="submit" variant="primary" block loading={saving}>
              {saving ? 'Se salveaza' : 'Salveaza parola'}
            </Button>
          </form>
        </section>
      </div>

      <div className="section" />
    </div>
  );
}

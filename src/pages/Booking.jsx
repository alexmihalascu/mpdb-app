import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PowerMeter } from '../components/PowerMeter';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { carImages } from '../data/fleet';
import { useAuth } from '../hooks/useAuth';
import { useFleet } from '../hooks/useFleet';
import { api } from '../lib/api';
import { addDays, daysBetween, formatDate, today } from '../lib/dates';
import './booking.css';

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  carSlug: '',
  pickupDate: '',
  returnDate: '',
  location: '',
  coverageLevel: 'standard',
  deliveryMode: 'bucharest',
};

const COVERAGE_LEVELS = {
  standard: {
    label: 'Standard',
    fee: 0,
    note: 'Asigurare inclusa si asistenta telefonica.',
  },
  plus: {
    label: 'Plus',
    fee: 45,
    note: 'Prioritate la predare si limita redusa de raspundere.',
  },
  executive: {
    label: 'Executive',
    fee: 95,
    note: 'Concierge, masina de inlocuire si suport extins.',
  },
};

const DELIVERY_MODES = {
  bucharest: { label: 'Bucuresti', fee: 0, note: 'Livrare in oras inclusa.' },
  otopeni: { label: 'Otopeni', fee: 35, note: 'Predare la aeroport.' },
  custom: { label: 'Dedicata', fee: 120, note: 'Coordonare speciala in afara orasului.' },
};

/* Mirrors the server's rules so mistakes are caught before a round trip. The
   server still re-validates everything -- this is convenience, not security. */
function validate(form) {
  const errors = {};
  const minDate = today();

  if (form.fullName.trim().length < 3) errors.fullName = 'Scrie numele complet.';
  if (!/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/.test(form.email.trim()))
    errors.email = 'Adresa de email nu pare valida.';
  if (!/^\+?[0-9 ().-]{7,20}$/.test(form.phone.trim()))
    errors.phone = 'Numarul de telefon nu pare valid.';
  if (!form.carSlug) errors.carSlug = 'Alege o masina din flota.';
  if (form.location.trim().length < 2) errors.location = 'Spune-ne unde livram masina.';
  if (!COVERAGE_LEVELS[form.coverageLevel])
    errors.coverageLevel = 'Alege un nivel de protectie.';
  if (!DELIVERY_MODES[form.deliveryMode]) errors.deliveryMode = 'Alege tipul de livrare.';

  if (!form.pickupDate) errors.pickupDate = 'Alege data ridicarii.';
  else if (form.pickupDate < minDate) errors.pickupDate = 'Data ridicarii nu poate fi in trecut.';

  if (!form.returnDate) errors.returnDate = 'Alege data returnarii.';
  else if (form.pickupDate && form.returnDate <= form.pickupDate)
    errors.returnDate = 'Returnarea trebuie sa fie dupa ridicare.';

  return errors;
}

export default function Booking() {
  const { cars, isLoading: fleetLoading, error: fleetError } = useFleet();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Arriving from a car card (/rezervare?masina=urus) preselects that model.
  // Read during the initial render rather than in an effect, so the select
  // never flashes empty first.
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    carSlug: searchParams.get('masina') ?? '',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const selectedCar = useMemo(
    () => cars.find((car) => car.slug === form.carSlug) ?? null,
    [cars, form.carSlug],
  );

  const days = daysBetween(form.pickupDate, form.returnDate);
  const baseTotal = selectedCar ? days * selectedCar.pricePerDay : 0;
  const coverageTotal = days * COVERAGE_LEVELS[form.coverageLevel].fee;
  const deliveryFee = selectedCar && days ? DELIVERY_MODES[form.deliveryMode].fee : 0;
  const total = baseTotal + coverageTotal + deliveryFee;

  const update = (name) => (event) => {
    const { value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      // Keep the range coherent: moving pickup past the return date pushes
      // the return along instead of leaving an impossible booking on screen.
      if (name === 'pickupDate' && next.returnDate && next.returnDate <= value) {
        next.returnDate = addDays(value, 1);
      }
      return next;
    });
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    // The original form had no preventDefault and called its handler from
    // both onSubmit and onClick, so every booking fired twice and then the
    // browser navigated away mid-request.
    event.preventDefault();
    setFormError(null);

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.createRental({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        carSlug: form.carSlug,
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        location: form.location.trim(),
        coverageLevel: form.coverageLevel,
        deliveryMode: form.deliveryMode,
      });
      setConfirmed(data.rental);
      setForm(EMPTY);
      // The route does not change, so nothing else would scroll the new
      // confirmation into view -- it would render above the current position.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (cause) {
      setErrors(cause.fields ?? {});
      setFormError(cause.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="shell">
        <div className="confirm">
          <p className="eyebrow eyebrow--signal">Rezervare inregistrata</p>
          <h1 className="confirm__title">Ne vedem pe {formatDate(confirmed.pickupDate)}.</h1>
          <p className="prose">
            Te sunam in cel mult o ora ca sa confirmam detaliile si ora exacta de livrare.
          </p>

          <dl className="spec confirm__spec">
            <dt className="spec__key">Numar rezervare</dt>
            <dd className="spec__val">#{String(confirmed.id).padStart(5, '0')}</dd>
            <dt className="spec__key">Masina</dt>
            <dd className="spec__val">{confirmed.carName}</dd>
            <dt className="spec__key">Perioada</dt>
            <dd className="spec__val">
              {formatDate(confirmed.pickupDate)} → {formatDate(confirmed.returnDate)}
            </dd>
            <dt className="spec__key">Livrare</dt>
            <dd className="spec__val">{confirmed.location}</dd>
            <dt className="spec__key">Protectie</dt>
            <dd className="spec__val">{confirmed.coverageLabel}</dd>
            <dt className="spec__key">Tip livrare</dt>
            <dd className="spec__val">{confirmed.deliveryLabel}</dd>
            <dt className="spec__key">Total</dt>
            <dd className="spec__val">{confirmed.totalPrice} EUR</dd>
          </dl>

          <div className="confirm__actions">
            <Button variant="primary" to={user ? '/contul-meu' : '/flota'}>
              {user ? 'Vezi rezervarile mele' : 'Inapoi la flota'}
            </Button>
            <Button variant="quiet" type="button" onClick={() => setConfirmed(null)}>
              Fa alta rezervare
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell shell--wide">
      <header className="page-head">
        <p className="eyebrow eyebrow--signal">Rezervare</p>
        <h1 className="page-head__title">Spune-ne ce si cand</h1>
        <p className="page-head__lede">
          Completezi o data, iar totalul se calculeaza pe masura ce alegi. Plata se face la
          predarea masinii.
        </p>
      </header>

      {fleetError && <Alert variant="error">{fleetError}</Alert>}

      <div className="booking">
        <form className="booking__form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <Alert variant="error" className="booking__alert">
              {formError}
            </Alert>
          )}

          <fieldset className="fieldset">
            <legend className="eyebrow">Date de contact</legend>
            <div className="fieldset__grid">
              <Field
                label="Nume complet"
                required
                autoComplete="name"
                value={form.fullName}
                onChange={update('fullName')}
                error={errors.fullName}
                className="fieldset__wide"
              />
              <Field
                label="Email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
              />
              <Field
                label="Telefon"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="+40 7.. ... ..."
                value={form.phone}
                onChange={update('phone')}
                error={errors.phone}
              />
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="eyebrow">Masina si perioada</legend>
            <div className="fieldset__grid">
              <Field
                as="select"
                label="Masina"
                required
                value={form.carSlug}
                onChange={update('carSlug')}
                error={errors.carSlug}
                disabled={fleetLoading}
                className="fieldset__wide"
              >
                <option value="">
                  {fleetLoading ? 'Se incarca flota...' : 'Alege din flota'}
                </option>
                {cars.map((car) => (
                  <option key={car.slug} value={car.slug}>
                    {car.name} — {car.pricePerDay} EUR / zi
                  </option>
                ))}
              </Field>

              <Field
                label="Ridicare"
                type="date"
                required
                min={today()}
                value={form.pickupDate}
                onChange={update('pickupDate')}
                error={errors.pickupDate}
              />
              <Field
                label="Returnare"
                type="date"
                required
                min={form.pickupDate ? addDays(form.pickupDate, 1) : addDays(today(), 1)}
                value={form.returnDate}
                onChange={update('returnDate')}
                error={errors.returnDate}
              />

              <Field
                label="Loc de livrare"
                required
                placeholder="Aeroport Otopeni, Terminal Plecari"
                value={form.location}
                onChange={update('location')}
                error={errors.location}
                className="fieldset__wide"
              />
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="eyebrow">Pachet si livrare</legend>
            <div className="option-grid">
              {Object.entries(COVERAGE_LEVELS).map(([key, option]) => (
                <label
                  className={`option-card ${form.coverageLevel === key ? 'is-active' : ''}`.trim()}
                  key={key}
                >
                  <input
                    type="radio"
                    name="coverageLevel"
                    value={key}
                    checked={form.coverageLevel === key}
                    onChange={update('coverageLevel')}
                  />
                  <span className="option-card__top">
                    <span className="option-card__label">{option.label}</span>
                    <span className="option-card__price mono">
                      {option.fee ? `+${option.fee} EUR / zi` : 'Inclus'}
                    </span>
                  </span>
                  <span className="option-card__note">{option.note}</span>
                </label>
              ))}
            </div>
            {errors.coverageLevel && <p className="field__error">{errors.coverageLevel}</p>}

            <div className="option-grid option-grid--delivery">
              {Object.entries(DELIVERY_MODES).map(([key, option]) => (
                <label
                  className={`option-card ${form.deliveryMode === key ? 'is-active' : ''}`.trim()}
                  key={key}
                >
                  <input
                    type="radio"
                    name="deliveryMode"
                    value={key}
                    checked={form.deliveryMode === key}
                    onChange={update('deliveryMode')}
                  />
                  <span className="option-card__top">
                    <span className="option-card__label">{option.label}</span>
                    <span className="option-card__price mono">
                      {option.fee ? `+${option.fee} EUR` : 'Inclus'}
                    </span>
                  </span>
                  <span className="option-card__note">{option.note}</span>
                </label>
              ))}
            </div>
            {errors.deliveryMode && <p className="field__error">{errors.deliveryMode}</p>}
          </fieldset>

          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            {submitting ? 'Se trimite' : 'Trimite rezervarea'}
          </Button>

          {!user && (
            <p className="booking__hint">
              Poti rezerva si fara cont. <Link to="/cont-nou">Creeaza-ti unul</Link> daca vrei sa
              iti vezi rezervarile mai tarziu.
            </p>
          )}
        </form>

        {/* Live summary: the same arithmetic the server does, shown as it happens. */}
        <aside className="summary" aria-live="polite">
          <div className="summary__inner">
            <p className="eyebrow">Sumar</p>

            {selectedCar ? (
              <>
                <img
                  className="summary__photo"
                  src={carImages[selectedCar.slug]}
                  alt={selectedCar.name}
                  loading="lazy"
                />
                <h2 className="summary__car">{selectedCar.name}</h2>
                <PowerMeter horsepower={selectedCar.horsepower} />
              </>
            ) : (
              <p className="summary__placeholder">
                Alege o masina si iti aratam aici totalul, defalcat pe zile.
              </p>
            )}

            <dl className="spec summary__spec">
              <dt className="spec__key">Ridicare</dt>
              <dd className="spec__val">{formatDate(form.pickupDate)}</dd>
              <dt className="spec__key">Returnare</dt>
              <dd className="spec__val">{formatDate(form.returnDate)}</dd>
              <dt className="spec__key">Zile</dt>
              <dd className="spec__val">{days || '—'}</dd>
              <dt className="spec__key">Tarif</dt>
              <dd className="spec__val">
                {selectedCar ? `${selectedCar.pricePerDay} EUR / zi` : '—'}
              </dd>
              <dt className="spec__key">Protectie</dt>
              <dd className="spec__val">{coverageTotal ? `${coverageTotal} EUR` : 'Inclus'}</dd>
              <dt className="spec__key">Livrare</dt>
              <dd className="spec__val">{deliveryFee ? `${deliveryFee} EUR` : 'Inclusa'}</dd>
            </dl>

            <div className="summary__total">
              <span className="eyebrow">Total estimat</span>
              <p className="summary__amount mono">
                {total ? total.toLocaleString('ro-RO') : '0'}
                <span className="summary__currency"> EUR</span>
              </p>
            </div>

            <p className="summary__note">
              Tariful include asigurare, kilometraj nelimitat in tara si livrarea in Bucuresti.
            </p>
          </div>
        </aside>
      </div>

      <div className="section" />
    </div>
  );
}

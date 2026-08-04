import { Link, useParams } from 'react-router-dom';

import { CarCard } from '../components/CarCard';
import { PowerMeter } from '../components/PowerMeter';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { carImages } from '../data/fleet';
import { useFleet } from '../hooks/useFleet';
import './car-details.css';

const RENTAL_PRESETS = [
  { days: 1, label: '24 ore' },
  { days: 3, label: 'Weekend lung' },
  { days: 7, label: 'Saptamana' },
];

function formatNumber(value) {
  return Number(value).toLocaleString('ro-RO');
}

export default function CarDetails() {
  const { slug } = useParams();
  const { cars, error, isLoading } = useFleet();
  const car = cars.find((item) => item.slug === slug);

  if (isLoading) {
    return (
      <div className="shell shell--wide">
        <div className="car-detail-loading skeleton-card" aria-busy="true" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shell">
        <div className="section">
          <Alert variant="error">{error}</Alert>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="shell">
        <div className="empty car-detail-empty">
          <p className="eyebrow eyebrow--signal">Model indisponibil</p>
          <h1 className="empty__title">Masina cautata nu exista in flota.</h1>
          <p className="empty__body">Alege un model disponibil din catalogul actual.</p>
          <Button variant="primary" to="/flota">
            Inapoi la flota
          </Button>
        </div>
      </div>
    );
  }

  const related = cars
    .filter((item) => item.slug !== car.slug && item.category === car.category)
    .slice(0, 3);
  const alternatives =
    related.length > 0
      ? related
      : cars.filter((item) => item.slug !== car.slug).slice(0, 3);
  const compareHref = `/comparatie?masini=${[car, ...alternatives]
    .slice(0, 3)
    .map((item) => item.slug)
    .join(',')}`;

  return (
    <>
      <section className="car-hero">
        <img className="car-hero__image" src={carImages[car.slug]} alt="" decoding="async" />
        <div className="car-hero__scrim" />
        <div className="car-hero__content shell shell--wide">
          <Link className="car-hero__back mono" to="/flota">
            Inapoi la flota
          </Link>
          <p className="eyebrow eyebrow--signal">{car.brand}</p>
          <h1 className="car-hero__title">{car.name}</h1>
          <p className="car-hero__lede">
            {car.category} cu {car.horsepower} CP, {car.drivetrain} si tarif de{' '}
            {car.pricePerDay} EUR / zi. Pagina aceasta strange cifrele care conteaza inainte de
            rezervare.
          </p>
          <div className="car-hero__actions">
            <Button variant="primary" size="lg" to={`/rezervare?masina=${car.slug}`}>
              Rezerva modelul
            </Button>
            <a className="btn btn--ghost btn--lg" href="#specs">
              Vezi fisa
            </a>
            <Button variant="ghost" size="lg" to={compareHref}>
              Compara
            </Button>
          </div>
        </div>
      </section>

      <section className="section shell shell--wide car-detail" id="specs">
        <div className="car-detail__main">
          <div className="car-detail__intro">
            <p className="eyebrow">Profil masina</p>
            <h2 className="car-detail__title">Construita pentru comparatie rapida</h2>
            <p className="prose">
              Foloseste pagina ca fisa de produs: performanta, cost, garantie si scenarii de
              inchiriere sunt puse langa actiunea de rezervare.
            </p>
          </div>

          <div className="detail-metrics">
            <div className="detail-metric">
              <span className="eyebrow">Putere</span>
              <strong className="mono">{car.horsepower} CP</strong>
            </div>
            <div className="detail-metric">
              <span className="eyebrow">Acceleratie</span>
              <strong className="mono">{car.acceleration}</strong>
            </div>
            <div className="detail-metric">
              <span className="eyebrow">Autonomie</span>
              <strong className="mono">{car.rangeKm} km</strong>
            </div>
          </div>

          <PowerMeter horsepower={car.horsepower} />

          <div className="feature-strip" aria-label="Dotari principale">
            {(car.highlights ?? []).map((item) => (
              <span className="feature-pill" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="product-panel">
          <p className="eyebrow">Fisa tehnica</p>
          <dl className="spec product-panel__spec">
            <dt className="spec__key">An</dt>
            <dd className="spec__val">{car.year}</dd>
            <dt className="spec__key">Cutie</dt>
            <dd className="spec__val">{car.transmission}</dd>
            <dt className="spec__key">Tractiune</dt>
            <dd className="spec__val">{car.drivetrain}</dd>
            <dt className="spec__key">Locuri</dt>
            <dd className="spec__val">{car.seats}</dd>
            <dt className="spec__key">Bagaj</dt>
            <dd className="spec__val">{car.luggage}</dd>
            <dt className="spec__key">Garantie</dt>
            <dd className="spec__val">{formatNumber(car.deposit)} EUR</dd>
          </dl>

          <div className="price-table">
            <p className="eyebrow">Scenarii</p>
            {RENTAL_PRESETS.map((preset) => (
              <div className="price-row" key={preset.days}>
                <span>{preset.label}</span>
                <strong className="mono">{formatNumber(preset.days * car.pricePerDay)} EUR</strong>
              </div>
            ))}
          </div>

          <Button variant="primary" block to={`/rezervare?masina=${car.slug}`}>
            Rezerva acum
          </Button>
        </aside>
      </section>

      <section className="section shell shell--wide">
        <header className="head">
          <p className="eyebrow">Alternative</p>
          <h2 className="head__title">Modele apropiate</h2>
        </header>
        <div className="grid grid--cars">
          {alternatives.map((item) => (
            <CarCard key={item.slug} car={item} />
          ))}
        </div>
      </section>
    </>
  );
}

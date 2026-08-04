import { Link } from 'react-router-dom';

import { CarCard } from '../components/CarCard';
import { FLEET_MAX_HP } from '../components/PowerMeter';
import { Alert } from '../components/ui/Alert';
import { scenes } from '../data/fleet';
import { useFleet } from '../hooks/useFleet';
import { useReveal } from '../hooks/useReveal';
import './home.css';

const STEPS = [
  {
    title: 'Alegi masina',
    body: 'Compari flota dupa putere, an si pret pe zi. Fiecare fisa arata exact ce primesti.',
  },
  {
    title: 'Completezi rezervarea',
    body: 'Datele de contact, perioada si locul de ridicare. Totalul se calculeaza pe loc.',
  },
  {
    title: 'Primesti cheile',
    body: 'Livram masina unde ai cerut, in Bucuresti sau la Otopeni, la ora stabilita.',
  },
];

export default function Home() {
  const { cars, error, isLoading } = useFleet();
  const featured = cars.slice(0, 3);
  const startPrice = cars.length ? Math.min(...cars.map((car) => car.pricePerDay)) : 100;
  const readout = [
    { value: String(cars.length || 18), unit: 'masini', note: 'in flota' },
    { value: String(FLEET_MAX_HP), unit: 'CP', note: 'varf de putere' },
    { value: String(startPrice), unit: 'EUR / zi', note: 'pret de pornire' },
    { value: '24', unit: 'ore', note: 'livrare in Bucuresti' },
  ];

  const editorialRef = useReveal();
  const stepsRef = useReveal();

  return (
    <>
      <section className="hero">
        <img
          className="hero__bg"
          src={scenes.hero}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero__scrim" />

        <div className="hero__content shell shell--wide">
          <p className="eyebrow eyebrow--signal hero__eyebrow">Bucuresti · Inchirieri premium</p>
          <h1 className="hero__title">
            Flota se citeste
            <br />
            in cai putere.
          </h1>
          <p className="hero__lede">
            Optsprezece masini de performanta, de la un Mustang de weekend la un Model X Plaid de
            1020 CP. Alegi dupa cifre, nu dupa adjective.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to="/flota">
              Vezi flota
            </Link>
            <Link className="btn btn--ghost btn--lg hero__ghost" to="/rezervare">
              Rezerva acum
            </Link>
          </div>
        </div>

        {/* The telemetry rail: the four numbers that decide the booking. */}
        <dl className="readout">
          <div className="readout__inner shell shell--wide">
            {readout.map((item) => (
              <div className="readout__cell" key={item.note}>
                <dt className="readout__note">{item.note}</dt>
                <dd className="readout__figure mono">
                  <span className="readout__value">{item.value}</span>
                  <span className="readout__unit">{item.unit}</span>
                </dd>
              </div>
            ))}
          </div>
        </dl>
      </section>

      <section className="section shell shell--wide">
        <header className="head">
          <p className="eyebrow">Flota</p>
          <h2 className="head__title">Trei dintre cele mai cerute</h2>
          <Link className="head__more mono" to="/flota">
            Toate masinile →
          </Link>
        </header>

        {error && <Alert variant="error">{error}</Alert>}

        {isLoading ? (
          <div className="grid grid--cars" aria-hidden="true">
            {[0, 1, 2].map((key) => (
              <div className="skeleton-card" key={key} />
            ))}
          </div>
        ) : (
          <div className="grid grid--cars">
            {featured.map((car) => (
              <CarCard key={car.slug} car={car} eager />
            ))}
          </div>
        )}
      </section>

      <section className="section shell shell--wide reveal editorial" ref={editorialRef}>
        <div className="editorial__row">
          <figure className="editorial__figure">
            <img src={scenes.garage} alt="Masini din flota MPDB parcate in garaj" loading="lazy" />
          </figure>
          <div className="editorial__text">
            <p className="eyebrow">Cine suntem</p>
            <h2 className="editorial__title">Un garaj, nu un call center</h2>
            <p className="prose">
              Tinem o flota mica pentru ca fiecare masina sa fie pregatita cum trebuie: revizie la
              zi, plinul facut, interiorul curat. Cand suni, raspunde cineva care a condus masina
              despre care intrebi.
            </p>
          </div>
        </div>

        <div className="editorial__row editorial__row--flip">
          <figure className="editorial__figure">
            <img src={scenes.handover} alt="Predarea cheilor unui client MPDB" loading="lazy" />
          </figure>
          <div className="editorial__text">
            <p className="eyebrow">Cum lucram</p>
            <h2 className="editorial__title">Pretul pe care il vezi</h2>
            <p className="prose">
              Tariful pe zi include asigurare, kilometraj nelimitat in tara si livrarea in
              Bucuresti. Nu adaugam taxe la predare si nu blocam garantii surpriza pe card.
            </p>
          </div>
        </div>
      </section>

      {/* Numbered because this genuinely is a sequence: the order is the
          information. */}
      <section className="section shell shell--wide reveal" ref={stepsRef}>
        <header className="head">
          <p className="eyebrow">Rezervare</p>
          <h2 className="head__title">Trei pasi, doua minute</h2>
        </header>

        <ol className="steps">
          {STEPS.map((step, index) => (
            <li className="step" key={step.title}>
              <span className="step__index mono" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta">
        <img className="cta__bg" src={scenes.road} alt="" loading="lazy" decoding="async" />
        <div className="cta__scrim" />
        <div className="cta__content shell">
          <h2 className="cta__title">Masina te asteapta in garaj.</h2>
          <p className="cta__body">
            Spune-ne ce model vrei si cand, iar noi ti-o aducem unde ai nevoie.
          </p>
          <Link className="btn btn--primary btn--lg" to="/rezervare">
            Incepe rezervarea
          </Link>
        </div>
      </section>
    </>
  );
}

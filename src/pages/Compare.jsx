import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PowerMeter } from '../components/PowerMeter';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { carImages } from '../data/fleet';
import { useFleet } from '../hooks/useFleet';
import './compare.css';

const SPECS = [
  { key: 'pricePerDay', label: 'Tarif', render: (car) => `${car.pricePerDay} EUR / zi` },
  { key: 'horsepower', label: 'Putere', render: (car) => `${car.horsepower} CP` },
  { key: 'acceleration', label: 'Acceleratie', render: (car) => car.acceleration },
  { key: 'drivetrain', label: 'Tractiune', render: (car) => car.drivetrain },
  { key: 'transmission', label: 'Cutie', render: (car) => car.transmission },
  { key: 'seats', label: 'Locuri', render: (car) => car.seats },
  { key: 'rangeKm', label: 'Autonomie', render: (car) => `${car.rangeKm} km` },
  { key: 'deposit', label: 'Garantie', render: (car) => `${car.deposit.toLocaleString('ro-RO')} EUR` },
  { key: 'luggage', label: 'Bagaj', render: (car) => car.luggage },
];

function uniqueSlugs(value) {
  return [...new Set(value.split(',').map((slug) => slug.trim()).filter(Boolean))].slice(0, 3);
}

export default function Compare() {
  const [searchParams] = useSearchParams();
  const { cars, error, isLoading } = useFleet();
  const initial = searchParams.get('masini') ?? '';
  const [selected, setSelected] = useState(() => uniqueSlugs(initial));

  const compared = useMemo(() => {
    const requested = selected
      .map((slug) => cars.find((car) => car.slug === slug))
      .filter(Boolean);
    if (requested.length > 0) return requested;
    return [...cars].sort((a, b) => b.horsepower - a.horsepower).slice(0, 3);
  }, [cars, selected]);

  const updateSlot = (index) => (event) => {
    const next = [...compared.map((car) => car.slug)];
    next[index] = event.target.value;
    setSelected([...new Set(next.filter(Boolean))].slice(0, 3));
  };

  const resetToPower = () => {
    setSelected([...cars].sort((a, b) => b.horsepower - a.horsepower).slice(0, 3).map((car) => car.slug));
  };

  if (isLoading) {
    return (
      <div className="shell shell--wide">
        <div className="compare-loading skeleton-card" aria-busy="true" />
      </div>
    );
  }

  return (
    <div className="shell shell--wide">
      <header className="page-head compare-head">
        <div>
          <p className="eyebrow eyebrow--signal">Comparatie</p>
          <h1 className="page-head__title">Alege masina dupa cifre, nu dupa memorie</h1>
          <p className="page-head__lede">
            Pune doua sau trei modele unul langa altul si vezi imediat diferenta la cost,
            performanta, locuri si garantie.
          </p>
        </div>
        <Button variant="ghost" to="/flota">
          Inapoi la flota
        </Button>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="compare-picker" aria-label="Alege masini pentru comparatie">
        {[0, 1, 2].map((slot) => (
          <label className="compare-picker__field" key={slot}>
            <span className="eyebrow">Slot {slot + 1}</span>
            <select
              className="compare-picker__select"
              value={compared[slot]?.slug ?? ''}
              onChange={updateSlot(slot)}
            >
              <option value="">Alege masina</option>
              {cars.map((car) => (
                <option key={car.slug} value={car.slug}>
                  {car.name}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button className="compare-picker__reset" type="button" onClick={resetToPower}>
          Top putere
        </button>
      </div>

      <div className="compare-grid" style={{ '--compare-cols': compared.length }}>
        {compared.map((car) => (
          <article className="compare-card" key={car.slug}>
            <img className="compare-card__image" src={carImages[car.slug]} alt={car.name} />
            <div className="compare-card__body">
              <p className="eyebrow">{car.category}</p>
              <h2 className="compare-card__title">{car.name}</h2>
              <PowerMeter horsepower={car.horsepower} />
              <div className="compare-card__actions">
                <Link className="btn btn--quiet" to={`/flota/${car.slug}`}>
                  Detalii
                </Link>
                <Link className="btn btn--primary" to={`/rezervare?masina=${car.slug}`}>
                  Rezerva
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="compare-table-wrap" aria-labelledby="compare-table-title">
        <h2 className="visually-hidden" id="compare-table-title">
          Tabel comparativ
        </h2>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Spec</th>
              {compared.map((car) => (
                <th key={car.slug}>{car.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPECS.map((spec) => (
              <tr key={spec.key}>
                <th>{spec.label}</th>
                {compared.map((car) => (
                  <td className="mono" key={car.slug}>
                    {spec.render(car)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="section" />
    </div>
  );
}

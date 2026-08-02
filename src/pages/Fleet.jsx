import { useMemo, useState } from 'react';

import { CarCard } from '../components/CarCard';
import { Alert } from '../components/ui/Alert';
import { useFleet } from '../hooks/useFleet';
import './fleet.css';

/* Sorting is the point of the page: the fleet exists to be compared. */
const SORTS = {
  putere: { label: 'Putere', compare: (a, b) => b.horsepower - a.horsepower },
  pret: { label: 'Pret', compare: (a, b) => a.pricePerDay - b.pricePerDay },
  an: { label: 'An', compare: (a, b) => b.year - a.year },
};

export default function Fleet() {
  const { cars, error, isLoading } = useFleet();
  const [sort, setSort] = useState('putere');

  const sorted = useMemo(() => [...cars].sort(SORTS[sort].compare), [cars, sort]);

  return (
    <div className="shell shell--wide">
      <header className="page-head">
        <p className="eyebrow eyebrow--signal">Flota</p>
        <h1 className="page-head__title">Opt masini, toate cifrele la vedere</h1>
        <p className="page-head__lede">
          Fiecare fisa arata puterea raportata la cel mai puternic model din flota, anul, cutia si
          pretul pe zi. Sorteaza dupa ce conteaza pentru tine.
        </p>
      </header>

      <div className="sorter" role="group" aria-label="Sorteaza flota">
        <span className="eyebrow sorter__label">Sorteaza dupa</span>
        {Object.entries(SORTS).map(([key, option]) => (
          <button
            key={key}
            type="button"
            className={`sorter__btn ${sort === key ? 'is-active' : ''}`.trim()}
            aria-pressed={sort === key}
            onClick={() => setSort(key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading ? (
        <div className="grid grid--cars" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <div className="skeleton-card" key={key} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid--cars">
            {sorted.map((car, index) => (
              <CarCard key={car.slug} car={car} eager={index < 3} />
            ))}
          </div>
          <p className="visually-hidden" role="status">
            {sorted.length} masini, sortate dupa {SORTS[sort].label.toLowerCase()}.
          </p>
        </>
      )}

      <div className="section" />
    </div>
  );
}

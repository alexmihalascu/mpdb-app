import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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

const BUDGETS = {
  toate: { label: 'Toate bugetele', test: () => true },
  sub500: { label: 'Sub 500 EUR', test: (car) => car.pricePerDay < 500 },
  intre500si800: {
    label: '500-800 EUR',
    test: (car) => car.pricePerDay >= 500 && car.pricePerDay <= 800,
  },
  peste800: { label: 'Peste 800 EUR', test: (car) => car.pricePerDay > 800 },
};

export default function Fleet() {
  const { cars, error, isLoading } = useFleet();
  const [sort, setSort] = useState('putere');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('toate');
  const [budget, setBudget] = useState('toate');

  const categories = useMemo(
    () => ['toate', ...new Set(cars.map((car) => car.category))],
    [cars],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cars
      .filter((car) => {
        const matchesSearch =
          !normalized ||
          [car.name, car.brand, car.category, car.transmission]
            .join(' ')
            .toLowerCase()
            .includes(normalized);
        const matchesCategory = category === 'toate' || car.category === category;
        const matchesBudget = BUDGETS[budget].test(car);
        return matchesSearch && matchesCategory && matchesBudget;
      })
      .sort(SORTS[sort].compare);
  }, [budget, cars, category, query, sort]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const totalPrice = filtered.reduce((sum, car) => sum + car.pricePerDay, 0);
    const strongest = filtered.reduce((leader, car) =>
      car.horsepower > leader.horsepower ? car : leader,
    );
    const bestValue = filtered.reduce((leader, car) =>
      car.horsepower / car.pricePerDay > leader.horsepower / leader.pricePerDay ? car : leader,
    );

    return {
      averagePrice: Math.round(totalPrice / filtered.length),
      strongest,
      bestValue,
    };
  }, [filtered]);

  const compareHref = `/comparatie?masini=${filtered
    .slice(0, 3)
    .map((car) => car.slug)
    .join(',')}`;

  const clearFilters = () => {
    setQuery('');
    setCategory('toate');
    setBudget('toate');
    setSort('putere');
  };

  return (
    <div className="shell shell--wide">
      <header className="page-head">
        <p className="eyebrow eyebrow--signal">Flota</p>
        <h1 className="page-head__title">Catalog extins, toate cifrele la vedere</h1>
        <p className="page-head__lede">
          Fiecare fisa arata puterea raportata la cel mai puternic model din flota, anul, cutia si
          pretul pe zi. Sorteaza dupa ce conteaza pentru tine.
        </p>
      </header>

      <div className="fleet-console">
        <div className="fleet-console__field">
          <label className="eyebrow" htmlFor="fleet-search">
            Cauta
          </label>
          <input
            id="fleet-search"
            className="fleet-console__input"
            type="search"
            placeholder="Model, brand, categorie..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="fleet-console__field">
          <label className="eyebrow" htmlFor="fleet-category">
            Categorie
          </label>
          <select
            id="fleet-category"
            className="fleet-console__input"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === 'toate' ? 'Toate categoriile' : item}
              </option>
            ))}
          </select>
        </div>

        <div className="fleet-console__field">
          <label className="eyebrow" htmlFor="fleet-budget">
            Buget
          </label>
          <select
            id="fleet-budget"
            className="fleet-console__input"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          >
            {Object.entries(BUDGETS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sorter">
        <div className="sorter__group" role="group" aria-label="Sorteaza flota">
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

        <button className="sorter__reset" type="button" onClick={clearFilters}>
          Reseteaza filtrele
        </button>
      </div>

      {stats && (
        <div className="fleet-overview">
          <dl className="fleet-insights" aria-label="Rezumat flota filtrata">
            <div>
              <dt className="eyebrow">Rezultate</dt>
              <dd className="fleet-insights__value mono">{filtered.length}</dd>
            </div>
            <div>
              <dt className="eyebrow">Pret mediu</dt>
              <dd className="fleet-insights__value mono">{stats.averagePrice} EUR / zi</dd>
            </div>
            <div>
              <dt className="eyebrow">Cea mai puternica</dt>
              <dd className="fleet-insights__value">{stats.strongest.name}</dd>
            </div>
            <div>
              <dt className="eyebrow">CP / EUR</dt>
              <dd className="fleet-insights__value">{stats.bestValue.name}</dd>
            </div>
          </dl>

          {filtered.length >= 2 && (
            <Link className="btn btn--ghost fleet-overview__compare" to={compareHref}>
              Compara primele {Math.min(filtered.length, 3)}
            </Link>
          )}
        </div>
      )}

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
            {filtered.map((car, index) => (
              <CarCard key={car.slug} car={car} eager={index < 3} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty">
              <h2 className="empty__title">Nu exista masini pentru filtrele alese.</h2>
              <p className="empty__body">
                Incearca o categorie mai larga sau elimina limita de buget.
              </p>
              <button className="btn btn--primary" type="button" onClick={clearFilters}>
                Reseteaza filtrele
              </button>
            </div>
          )}
          <p className="visually-hidden" role="status">
            {filtered.length} masini, sortate dupa {SORTS[sort].label.toLowerCase()}.
          </p>
        </>
      )}

      <div className="section" />
    </div>
  );
}

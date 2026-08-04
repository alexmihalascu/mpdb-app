import { Link } from 'react-router-dom';

import { carImages } from '../data/fleet';
import { PowerMeter } from './PowerMeter';
import './car-card.css';

/**
 * A car rendered as a manufacturer spec plate: photograph, aligned data
 * column, power measure, then the price as the largest number on the card.
 */
export function CarCard({ car, eager = false }) {
  return (
    <article className="car">
      <div className="car__frame">
        <img
          className="car__photo"
          src={carImages[car.slug]}
          alt={car.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width="854"
          height="480"
        />
        <span className="car__tag mono">{car.category}</span>
      </div>

      <div className="car__body">
        <h3 className="car__name">{car.name}</h3>

        <dl className="spec car__spec">
          <dt className="spec__key">An</dt>
          <dd className="spec__val">{car.year}</dd>
          <dt className="spec__key">Cutie</dt>
          <dd className="spec__val">{car.transmission}</dd>
          <dt className="spec__key">Locuri</dt>
          <dd className="spec__val">{car.seats}</dd>
        </dl>

        <PowerMeter horsepower={car.horsepower} />

        <div className="car__foot">
          <p className="car__price mono">
            <span className="car__price-value">{car.pricePerDay}</span>
            <span className="car__price-unit"> EUR / zi</span>
          </p>
          <div className="car__actions">
            <Link className="btn btn--quiet car__details" to={`/flota/${car.slug}`}>
              Detalii
              <span className="visually-hidden"> {car.name}</span>
            </Link>
            <Link className="btn btn--primary car__cta" to={`/rezervare?masina=${car.slug}`}>
              Rezerva
              <span className="visually-hidden"> {car.name}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

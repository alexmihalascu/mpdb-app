import { useInView } from '../hooks/useInView';

/** Highest output in the fleet; every meter is drawn relative to it. */
export const FLEET_MAX_HP = 1020;

/**
 * The signature device: a car's power drawn against the fleet maximum.
 *
 * Horsepower is the number customers actually compare, so it gets a measure
 * rather than another line of text. The bar fills when it scrolls into view,
 * which makes scanning the fleet a visual comparison instead of eight
 * paragraphs of identical prose.
 */
export function PowerMeter({ horsepower, max = FLEET_MAX_HP, label = 'Putere' }) {
  const [ref, inView] = useInView();
  const ratio = Math.min(horsepower / max, 1);

  return (
    <div className="meter" ref={ref}>
      <div className="meter__head">
        <span>{label}</span>
        <span className="meter__value">
          <b>{horsepower}</b> CP
        </span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-valuenow={horsepower}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${horsepower} cai putere din maximul flotei de ${max}`}
      >
        <div className="meter__fill" style={{ '--meter-scale': inView ? ratio : 0 }} />
      </div>
    </div>
  );
}

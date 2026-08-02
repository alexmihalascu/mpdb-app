import { founders } from '../data/fleet';
import { useReveal } from '../hooks/useReveal';
import './team.css';

export default function Team() {
  const gridRef = useReveal();

  return (
    <div className="shell shell--wide">
      <header className="page-head">
        <p className="eyebrow eyebrow--signal">Echipa</p>
        <h1 className="page-head__title">Cei patru din garaj</h1>
        <p className="page-head__lede">
          MPDB e un proiect de facultate construit de patru studenti: frontend, API, baza de date
          si tot ce e intre ele.
        </p>
      </header>

      <ul className="team reveal" ref={gridRef}>
        {founders.map((person) => (
          <li className="member" key={person.github}>
            <div className="member__frame">
              <img
                className="member__photo"
                src={person.photo}
                alt={person.name}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h2 className="member__name">{person.name}</h2>
            <a
              className="member__link mono"
              href={`https://github.com/${person.github}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              @{person.github}
            </a>
          </li>
        ))}
      </ul>

      <div className="section" />
    </div>
  );
}

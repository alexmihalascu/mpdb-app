<br/>
<p align="center">
  <h3 align="center">MPDB-APP</h3>
</p>

**MPDB-APP** este o aplicație full-stack de închirieri auto premium: frontend **React 19 + Vite**, API **Python / Flask**, bază de date **SQLite**. Utilizatorii pot naviga flota, rezerva o mașină și își pot gestiona rezervările dintr-un cont propriu.

## 🔧 Stack

| Strat        | Tehnologie                                                        |
| ------------ | ----------------------------------------------------------------- |
| Frontend     | React 19, Vite 7, React Router 7, CSS cu design tokens             |
| Backend      | Flask 3, blueprint-uri, JWT în cookie httpOnly, Flask-Limiter      |
| Bază de date | SQLite cu migrații versionate (`PRAGMA user_version`)              |
| Testare      | Vitest + Testing Library (frontend), pytest (backend)              |

## 📋 Instalare

```bash
git clone https://github.com/alexmihalascu/mpdb-app.git
cd mpdb-app
```

**1. Frontend**

```bash
npm install
```

**2. Backend** (Python 3.11+)

```bash
cd API
python -m venv .venv

# Windows
.venv\Scripts\python -m pip install -r requirements.txt
# macOS / Linux
.venv/bin/python -m pip install -r requirements.txt

cp .env.example .env      # opțional în development
cd ..
```

## 🚀 Pornire

Cu un singur terminal — pornește și frontendul, și API-ul:

```bash
npm run dev:all
```

Sau separat, în două terminale:

```bash
npm start          # frontend → http://localhost:5173
npm run dev:api    # API      → http://127.0.0.1:5000
```

Deschide [http://localhost:5173](http://localhost:5173).

Vite trimite prin proxy tot ce începe cu `/api` către Flask, deci browserul vede o singură origine și cookie-ul de sesiune rămâne first-party. Nu există URL-uri absolute în cod.

Baza de date se creează și se migrează automat la prima pornire a API-ului.

## 📜 Comenzi

| Comandă             | Ce face                                            |
| ------------------- | -------------------------------------------------- |
| `npm start`         | Server de development (Vite)                       |
| `npm run dev:all`   | Frontend + API în paralel                          |
| `npm run dev:api`   | Doar API-ul Flask                                  |
| `npm run build`     | Build de producție în `dist/`                      |
| `npm run preview`   | Servește build-ul de producție local               |
| `npm test`          | Teste frontend (Vitest)                            |
| `npm run test:api`  | Teste backend (pytest)                             |
| `npm run lint`      | ESLint                                             |

## 🔌 API

Toate rutele sunt sub `/api`. Sesiunea circulă printr-un cookie `httpOnly`, deci nu poate fi citită din JavaScript.

| Metodă   | Rută                    | Acces        | Descriere                                  |
| -------- | ----------------------- | ------------ | ------------------------------------------ |
| `POST`   | `/api/auth/register`    | public       | Creează cont (max. 10/oră)                 |
| `POST`   | `/api/auth/login`       | public       | Autentificare (max. 5/minut)               |
| `POST`   | `/api/auth/logout`      | public       | Șterge sesiunea                            |
| `GET`    | `/api/auth/me`          | public       | Utilizatorul curent sau `null`             |
| `POST`   | `/api/auth/password`    | autentificat | Schimbă parola                             |
| `GET`    | `/api/cars`             | public       | Flota, cu prețuri și specificații          |
| `POST`   | `/api/rentals`          | public       | Creează rezervare                          |
| `GET`    | `/api/rentals`          | autentificat | Rezervările proprii                        |
| `DELETE` | `/api/rentals/<id>`     | proprietar   | Anulează o rezervare                       |
| `GET`    | `/api/admin/rentals`    | administrator| Toate rezervările                          |
| `GET`    | `/api/health`           | public       | Verificare stare                           |

## 🔐 Securitate

- **Parole**: hashing **argon2id** (64 MiB, 3 treceri). Conturile create de versiunea veche aveau parole SHA-256 fără salt; acestea sunt acceptate o singură dată la următoarea autentificare și rescrise imediat în argon2id.
- **Sesiuni**: JWT semnat, transportat în cookie `HttpOnly` + `SameSite=Lax`, marcat `Secure` în producție. Rolul de administrator se recitește din baza de date la fiecare cerere, deci revocarea are efect imediat.
- **Rate limiting** pe autentificare și înregistrare, împotriva atacurilor prin forță brută.
- **Fără enumerare de conturi**: parolă greșită și utilizator inexistent întorc același mesaj și același timp de răspuns.
- **CORS** restrâns la originile configurate, nu `*`.
- **Prețuri calculate pe server** — totalul unei rezervări nu poate fi modificat din browser.
- **`SECRET_KEY`** este obligatorie în producție; aplicația refuză să pornească fără ea.
- Modul debug este **oprit** implicit (consola Werkzeug înseamnă execuție de cod la distanță).

Notă: `API/database.db` conține date de utilizatori și este ignorat de git.

## 🗄️ Baza de date

Migrațiile rulează automat la pornire și sunt idempotente, urmărite prin `PRAGMA user_version`.

```
users     id, username (UNIQUE, case-insensitive), password_hash,
          is_admin, created_at, updated_at

rentals   id, user_id → users(id) ON DELETE CASCADE,
          full_name, email, phone, car_slug,
          pickup_date, return_date, location,
          total_price, status, created_at
```

Migrația `v1` păstrează utilizatorii și rezervările existente din schema veche.

Poți rula migrațiile și manual:

```bash
cd API && .venv/Scripts/python -m flask --app app init-db
```

## 🧪 Testare

```bash
npm test           # 15 teste frontend
npm run test:api   # 42 teste backend
```

Testele de backend acoperă migrația schemei, upgrade-ul hash-urilor vechi, izolarea între utilizatori, autorizarea de administrator, rate limiting și validarea rezervărilor.

## 🎨 Design

Interfața pornește de la o idee simplă: flota se compară în cifre. Fiecare fișă de mașină arată puterea raportată la cel mai puternic model din flotă, iar toate valorile numerice folosesc un strat tipografic monospaced cu cifre tabulare, ca să se alinieze în coloană.

- Tokens de design în `src/styles/tokens.css` (culoare, scară tipografică, spațiere, mișcare)
- Temă întunecată și deschisă, cu comutator manual care respectă setarea sistemului
- Mobile-first, fără scroll orizontal
- Focus vizibil, etichete asociate corect, `prefers-reduced-motion` respectat

Fotografiile din `src/assets/images/` sunt WebP, redimensionate pentru rolul pe care îl au în pagină (hero, figuri editoriale, carduri, portrete). Dacă adaugi imagini noi, comprimă-le înainte — sursele originale aveau până la 5.500 px lățime pentru un chenar de 400 px.

## 👥 Echipa

- Mihalașcu Alexandru — [@alexmihalascu](https://github.com/alexmihalascu)
- Pencea Alexandru — [@Lezinn](https://github.com/Lezinn)
- Dinu Silviu-Ion — [@FindTheCookie](https://github.com/FindTheCookie)
- Beznea Mihai-Gabriel — [@BezneaMihai](https://github.com/BezneaMihai)

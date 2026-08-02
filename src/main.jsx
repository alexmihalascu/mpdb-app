import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Styles are imported before App on purpose. ES imports run in order, so
// pulling App in first would inject every page's stylesheet ahead of the base
// layer -- and a page rule could no longer override a component default at
// equal specificity.
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import App from './App';

// Arms the scroll-reveal styles. Without this class the `.reveal` sections
// stay fully visible, so a script failure degrades to a static page instead
// of a blank one.
document.documentElement.classList.add('js');

// React 18 replaced ReactDOM.render with createRoot; the old entry point was
// still on the legacy API, which disabled concurrent rendering entirely.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

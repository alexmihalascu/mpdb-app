/**
 * Maps the catalogue slugs served by the API onto the bundled photography.
 *
 * Specs (power, price, year) deliberately live on the server only -- the
 * client renders whatever the API says, so a price can never be edited in the
 * browser and then submitted.
 */

import mustang from '../assets/images/car1.webp';
import urus from '../assets/images/car2.webp';
import s63 from '../assets/images/car3.webp';
import models from '../assets/images/car4.webp';
import gt63s from '../assets/images/car5.webp';
import a45s from '../assets/images/car6.webp';
import c63s from '../assets/images/car7.webp';
import modelx from '../assets/images/car8.webp';

import hero from '../assets/images/myhdr.webp';
import garage from '../assets/images/popular1.webp';
import handover from '../assets/images/popular2.webp';
import road from '../assets/images/footer.webp';

import founder1 from '../assets/images/founder1.webp';
import founder2 from '../assets/images/founder2.webp';
import founder3 from '../assets/images/founder3.webp';
import founder4 from '../assets/images/founder4.webp';

export const carImages = {
  mustang,
  urus,
  s63,
  models,
  gt63s,
  a45s,
  c63s,
  modelx,
  m5cs: c63s,
  rs6: s63,
  defender: urus,
  taycan: models,
  '911turbo': gt63s,
  panamera: s63,
  g63: urus,
  bentayga: s63,
  roma: gt63s,
  huracan: a45s,
};

export const scenes = { hero, garage, handover, road };

export const founders = [
  { name: 'Mihalașcu Alexandru', github: 'alexmihalascu', photo: founder1 },
  { name: 'Pencea Alexandru', github: 'Lezinn', photo: founder2 },
  { name: 'Dinu Silviu-Ion', github: 'FindTheCookie', photo: founder3 },
  { name: 'Beznea Mihai-Gabriel', github: 'BezneaMihai', photo: founder4 },
];

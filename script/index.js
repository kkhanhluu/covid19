import Globe from 'globe.gl';
import * as d3 from 'd3';
import { CountUp } from 'countup.js';

import { request, isMobile } from './utils';
import {
  GLOBAL_IMAGE_URL,
  BACKGROUND_IMAGE_URL,
  GEOJSON_URL,
  CASES_API,
} from './constants';
import { initForm } from './form';

const colorScale = d3.scaleSequentialPow(d3.interpolateOrRd).exponent(1 / 4);
const getCase = (item) => item.covid.cases;

let world;

const showTotalCount = (cases) => {
  const totalActive = cases.reduce(
    (total, currentCase) => total + currentCase.covid.cases,
    0
  );
  const active = new CountUp('infected', totalActive);
  active.start();

  const totalDeaths = cases.reduce(
    (total, currentCase) => total + currentCase.covid.deaths,
    0
  );
  const deaths = new CountUp('deaths', totalDeaths);
  deaths.start();

  const totalRecovered = cases.reduce(
    (total, currentCase) => total + currentCase.covid.recovered,
    0
  );
  const recovered = new CountUp('recovered', totalRecovered);
  recovered.start();
};

const initData = async () => {
  const countries = await request(GEOJSON_URL);
  const cases = await request(CASES_API);

  const countriesWithCases = [];

  cases.forEach((c) => {
    const indexOfCountryByISO = countries.features.findIndex(
      (country) =>
        country.properties.ISO_A2 === c.countryInfo.iso2 ||
        country.properties.ISO_A3 === c.countryInfo.iso3
    );

    if (indexOfCountryByISO >= 0) {
      countriesWithCases.push({
        ...countries.features[indexOfCountryByISO],
        covid: c,
      });
    } else {
      const indexOfContryByName = countries.features.findIndex(
        (country) =>
          country.properties.ADMIN.toLowerCase() === c.country.toLowerCase()
      );
      if (indexOfContryByName >= 0) {
        countriesWithCases.push({
          ...countries.features[indexOfContryByName],
          covid: c,
        });
      }
    }

    const maxCases = Math.max(...countriesWithCases.map(getCase));
    colorScale.domain([0, maxCases]);
  });

  world.polygonsData(countriesWithCases);
  console.log(countriesWithCases);

  document.querySelector('.title-desc').innerHTML =
    'Hover on a country or territory to see information. Made by <a style="color: #1ae021; text-decoration:none;" target="_blank" href="https://kkhanhluu.github.io">Khanh Luu</a>';

  // get current IP Address
  const { longtitude, latitude } = await request(
    'https://geolocation-db.com/json/'
  );
  world.pointOfView(
    {
      lat: latitude,
      lng: longtitude,
    },
    2000
  );

  showTotalCount(countriesWithCases);

  initForm(countriesWithCases);
};

const init = () => {
  world = Globe();
  initData();
  world(document.getElementById('covid19-data-visualization'))
    .globeImageUrl(GLOBAL_IMAGE_URL)
    .backgroundImageUrl(BACKGROUND_IMAGE_URL)
    .polygonAltitude(0.06)
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .showGraticules(false)
    .polygonCapColor((i) => colorScale(getCase(i)))
    .polygonLabel(
      ({ properties, covid }) => `<div class="card">
    <div class="card--body-left">
        <div class="card--body__name">${covid.country}</div>
        <div class="card--body__flag">
            <img src="${covid.countryInfo.flag}" alt=""
                class="card--body__flag-image">
        </div>
        <div class="card--body__total-case">${covid.cases} total cases</div>
    </div>
    <div class="card--body-right">
        <h4 class="card--body-date">${
          new Date().toLocaleString().split(',')[0]
        }</h4>
        <h4>Today's count</h4>
        <div class="card--body__today">
            <p class="card--body__todday-cases">${covid.todayCases} cases</p>
            <p class="card--body__todday-deaths">${covid.todayDeaths} deaths</p>
        </div>
        <div class="card--body__total">
            <div class="card--body__total-active"> <span>${
              covid.active
            }</span> active</div>
            <div class="card--body__total-dead"><span>${
              covid.deaths
            }</span> dead</div>
            <div class="card--body__total-recovered"><span>${
              covid.recovered
            }</span> recovered</div>
        </div>
    </div>
</div>`
    )
    .onPolygonHover((hoverD) => {
      world
        .polygonAltitude((d) => (d === hoverD ? 0.12 : 0.06))
        .polygonCapColor((d) =>
          d === hoverD ? 'steelblue' : colorScale(getCase(d))
        );
      if (document.getElementById('card-information')) {
        document
          .getElementById('card-information')
          .parentNode.removeChild(document.getElementById('card-information'));
      }
    })

    .polygonsTransitionDuration(300);
  const controls = world.controls();
  if (isMobile()) {
    controls.enableZoom = false;
    controls.object.fov = 70;
  } else {
    controls.object.fov = 60;
    world.onPolygonClick((p) => {
      world.pointOfView(
        { lat: p.covid.countryInfo.lat, lng: p.covid.countryInfo.long },
        2500
      );
    });
  }
};

init();

// Responsive globe
window.addEventListener('resize', (event) => {
  world.width([event.target.innerWidth]);
  world.height([event.target.innerHeight]);
});

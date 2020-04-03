import { request } from './utils';
import { GEOJSON_URL, CASES_API } from './constants';

const initData = async () => {
  const countries = await request(GEOJSON_URL);
  const cases = await request(CASES_API);

  const countriesWithCases = [];

  cases.forEach(c => {
    const indexOfCountryByISO = countries.features.findIndex(
      country =>
        country.properties.ISO_A2 === c.countryInfo.iso2 ||
        country.properties.ISO_A3 === c.countryInfo.iso3
    );

    let indexOfContryByName = -100;
    if (indexOfCountryByISO < 0) {
      indexOfContryByName = countries.features.findIndex(
        country => country.properties.ADMIN.toLowerCase() === c.country
      );
    }

    if (indexOfCountryByISO >= 0) {
      countriesWithCases.push({
        ...countries.features[indexOfCountryByISO],
        covid: c
      });
    }

    if (indexOfContryByName >= 0) {
      countriesWithCases.push({
        ...countries.features[indexOfCountryByISO],
        covid: c
      });
    }
  });

  console.log(countriesWithCases);

  const tableBodyHTML = countriesWithCases.map(
    item => ` <tr>
  <td>${item.covid.country} <img class="flag" src="${item.covid.countryInfo.flag}" /></td>
  <td>${item.covid.cases}</td>
  <td>${item.covid.deaths}</td>
  <td>${item.covid.recovered}</td>
  <td>${item.covid.todayCases}</td>
  <td>${item.covid.todayDeaths}</td>
</tr>`
  );

  document.getElementById('table-body').innerHTML = tableBodyHTML.join('');
  $('#example').DataTable({
    responsive: true
  });
};

const init = () => {
  $(document).ready(function() {
    initData();
  });
};

init();

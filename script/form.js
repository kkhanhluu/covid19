const showTable = data => {
  // reset
  document.getElementById('country').value = '';
  if (document.getElementById('suggestion-container')) {
    document
      .getElementById('suggestion-container')
      .parentNode.removeChild(document.getElementById('suggestion-container'));
  }

  const card = document.createElement('div');
  card.classList.add('card-information', 'card');
  card.id = 'card-information';
  card.innerHTML = `<div class="card--body-left">
        <div class="card--body__name">${data.covid.country}</div>
        <div class="card--body__flag">
            <img src="${data.covid.countryInfo.flag}" alt=""
                class="card--body__flag-image">
        </div>
        <div class="card--body__total-case">${
          data.covid.cases
        } total cases</div>
    </div>
    <div class="card--body-right">
        <h4 class="card--body-date">${
          new Date().toLocaleString().split(',')[0]
        }</h4>
        <div class="card--body__today">
            <p class="card--body__todday-cases">${
              data.covid.todayCases
            } cases</p>
            <p class="card--body__todday-deaths">${
              data.covid.todayDeaths
            } deaths</p>
        </div>
        <div class="card--body__total">
            <div class="card--body__total-active"> <span>${
              data.covid.active
            }</span> active</div>
            <div class="card--body__total-dead"><span>${
              data.covid.deaths
            }</span> dead</div>
            <div class="card--body__total-recovered"><span>${
              data.covid.recovered
            }</span> recovered</div>
        </div>
    </div>`;

  document.querySelector('.right-container').appendChild(card);
};
export const initForm = data => {
  const countryInput = document.getElementById('country');
  countryInput.addEventListener('input', e => {
    e.preventDefault();
    const text = e.target.value.trim().toLowerCase();

    if (text.trim().length <= 0) {
      if (document.getElementById('suggestion-container')) {
        document
          .getElementById('suggestion-container')
          .parentNode.removeChild(
            document.getElementById('suggestion-container')
          );
      }
      return;
    }

    if (document.getElementById('card-information')) {
      document
        .getElementById('card-information')
        .parentNode.removeChild(document.getElementById('card-information'));
    }

    const filteredData = data.filter(item =>
      item.covid.country.toLowerCase().includes(text)
    );

    if (filteredData.length === 0) {
      return;
    }

    let suggestionContainer = document.getElementById('suggestion-container');
    if (suggestionContainer) {
      suggestionContainer.parentNode.removeChild(suggestionContainer);
    }
    suggestionContainer = document.createElement('ul');
    suggestionContainer.id = 'suggestion-container';
    suggestionContainer.className = 'suggestion-container';
    const listSuggestions = filteredData.map(item => {
      const countryName = item.covid.country.trim().toLowerCase();
      const textInput = text.trim().toLowerCase();

      let spanText = '';
      if (countryName.indexOf(textInput) === 0) {
        spanText =
          '<span>' +
          textInput +
          '</span>' +
          countryName.substring(
            countryName.indexOf(textInput) + textInput.length
          );
      } else {
        spanText =
          countryName.substring(0, countryName.indexOf(textInput)) +
          '<span>' +
          textInput +
          '</span>' +
          countryName.substring(
            countryName.indexOf(textInput) + textInput.length
          );
      }
      return `<li data-country="${item.covid.country}" class="suggestion">${spanText}</li>`;
    });
    suggestionContainer.innerHTML = listSuggestions.join('');
    document.getElementById('country-form').appendChild(suggestionContainer);
    Array.from(document.getElementsByClassName('suggestion')).forEach(elem => {
      elem.addEventListener('mouseover', e => {
        e.target.classList.add('suggestion-selected');
      });

      elem.addEventListener('mouseout', e => {
        e.target.classList.remove('suggestion-selected');
      });

      elem.addEventListener('click', e => {
        console.log(e.target.getAttribute('data-country'));
        const country = data.find(
          item => item.covid.country === e.target.getAttribute('data-country')
        );
        console.log(country);
        showTable(country);
      });
    });
  });

  document
    .getElementById('country-form')
    .addEventListener('submit', e => e.preventDefault());
};

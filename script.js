let clickCount = 0;
let countries = [];

const countryInput = document.getElementById('country');
const countrySearch = document.getElementById('countrySearch');
const countryResults = document.getElementById('countryResults');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');

function handleClick() {
    clickCount++;
    if (clicksInfo) clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        countries = data.map(country => ({
            name: country.name.common,
            code: country.cca2
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        // Fill the select for accessibility
        if (countryInput) {
            countryInput.innerHTML = '<option value="" selected disabled>Wybierz kraj</option>' + 
                countries.map(country => 
                    `<option value="${country.code}">${country.name}</option>`
                ).join('');
        }
        
        getCountryByIP();
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            if (country && countrySearch) {
                countrySearch.value = country;
                
                const countryObj = countries.find(c => c.name === country);
                if (countryObj && countryInput) {
                    countryInput.value = countryObj.code;
                }
                
                getCountryCode(country);
            }
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Błąd pobierania danych');
            }
            return response.json();
        })
        .then(data => {        
            const countryCode = data[0].idd.root + (data[0].idd.suffixes ? data[0].idd.suffixes[0] : '');
            const countrySelect = document.getElementById('countryCode');
            
            if (countrySelect) {
                for (let option of countrySelect.options) {
                    if (option.value === countryCode) {
                        option.selected = true;
                        break;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    // Click counter
    document.addEventListener('click', handleClick);
    
    // Country search functionality
    if (countrySearch) {
        countrySearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length < 2) {
                if (countryResults) countryResults.style.display = 'none';
                return;
            }

            const filtered = countries.filter(country => 
                country.name.toLowerCase().includes(searchTerm)
            ).slice(0, 10);

            if (filtered.length > 0 && countryResults) {
                countryResults.innerHTML = filtered.map(country => 
                    `<div class="search-result-item" data-value="${country.code}">${country.name} (${country.code})</div>`
                ).join('');
                countryResults.style.display = 'block';
            } else if (countryResults) {
                countryResults.style.display = 'none';
            }
        });
    }

    if (countryResults) {
        countryResults.addEventListener('click', function(e) {
            if (e.target.classList.contains('search-result-item')) {
                const selectedCountry = countries.find(c => c.code === e.target.dataset.value);
                if (countrySearch) countrySearch.value = selectedCountry.name;
                if (countryInput) countryInput.value = selectedCountry.code;
                countryResults.style.display = 'none';
            }
        });
    }

    // Form validation
    if (myForm) {
        myForm.addEventListener('submit', function(event) {
            if (!myForm.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            myForm.classList.add('was-validated');
        });

        // Keyboard handling
        myForm.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (myForm.checkValidity()) {
                    myForm.submit();
                }
            }
        });
    }

    // Invoice fields toggle
    const invoiceCheckbox = document.getElementById('invoiceNeeded');
    if (invoiceCheckbox) {
        invoiceCheckbox.addEventListener('change', function() {
            const invoiceFields = document.getElementById('invoiceFields');
            if (invoiceFields) {
                invoiceFields.style.display = this.checked ? 'block' : 'none';
                if (this.checked) {
                    document.getElementById('companyName').removeAttribute('required');
                    document.getElementById('nip').removeAttribute('required');
                }
            }
        });
    }

    // Load countries
    fetchAndFillCountries();
});
const breeds = [
    ['Abyssinian', 'Playful and endlessly curious.'],
    ['American Shorthair', 'Easygoing, clever, and adaptable.'],
    ['Bengal', 'Athletic, vocal, and full of energy.'],
    ['Birman', 'Gentle, social, and quietly affectionate.'],
    ['British Shorthair', 'Calm, loyal, and wonderfully plush.'],
    ['Burmese', 'People-focused with a bright personality.'],
    ['Cornish Rex', 'Warm, mischievous, and very active.'],
    ['Devon Rex', 'A curious climber with a soft heart.'],
    ['Egyptian Mau', 'Fast, observant, and naturally spotted.'],
    ['Exotic Shorthair', 'Sweet-natured with a relaxed charm.'],
    ['Maine Coon', 'Gentle giant with a friendly spirit.'],
    ['Manx', 'Agile, intelligent, and often tailless.'],
    ['Norwegian Forest Cat', 'An outdoorsy explorer with a calm nature.'],
    ['Oriental Shorthair', 'Expressive, elegant, and highly social.'],
    ['Persian', 'Quiet, affectionate, and beautifully composed.'],
    ['Ragdoll', 'Relaxed, trusting, and devoted to people.'],
    ['Russian Blue', 'Reserved at first, loyal for life.'],
    ['Scottish Fold', 'Sweet, observant, and softly playful.'],
    ['Siamese', 'Talkative, clever, and deeply connected.'],
    ['Sphynx', 'Warm to the touch and bold in spirit.']
];

const catApiUrl = 'https://api.api-ninjas.com/v1/cats';
const breedGrid = document.getElementById('breed-grid');
const breedInput = document.getElementById('breed-input');
const apiKeyInput = document.getElementById('api-key');
const searchButton = document.getElementById('search-button');
const clearButton = document.getElementById('clear-button');
const saveKeyButton = document.getElementById('save-key-button');
const resultCount = document.getElementById('result-count');
const apiStatus = document.getElementById('api-status');

function getApiKey() {
    return sessionStorage.getItem('catLoreApiKey') || '';
}

function renderLocalBreeds(query = '') {
    const normalizedQuery = query.toLowerCase();
    const matches = breeds.filter(([name]) => name.toLowerCase().includes(normalizedQuery));
    resultCount.textContent = `${matches.length} ${matches.length === 1 ? 'breed' : 'breeds'} found`;
    breedGrid.innerHTML = matches.length ? matches.map(([name, lore], index) => `
        <article class="breed-card">
            <span class="breed-number">${String(index + 1).padStart(2, '0')}</span>
            <h2>${name}</h2>
            <p>${lore}</p>
        </article>`).join('') : '<p class="empty-state">No breeds match that search. Try another name.</p>';
}

function renderApiBreeds(apiBreeds) {
    resultCount.textContent = `${apiBreeds.length} ${apiBreeds.length === 1 ? 'breed' : 'breeds'} found`;
    breedGrid.innerHTML = apiBreeds.map((cat, index) => `
        <article class="breed-card api-card">
            <span class="breed-number">${String(index + 1).padStart(2, '0')} / API</span>
            <h2>${cat.name}</h2>
            <p>${cat.origin || 'Origin unavailable'} · ${cat.lifespan || 'Lifespan unavailable'} years</p>
            <p class="api-detail">Family friendly: ${cat.family_friendly ?? 'N/A'} / 5</p>
        </article>`).join('');
}

async function searchCatApi() {
    const query = breedInput.value.trim();
    const apiKey = getApiKey();

    if (!query) {
        apiStatus.textContent = 'Enter a breed name to search the API.';
        breedInput.focus();
        return;
    }

    if (!apiKey) {
        apiStatus.textContent = 'Add your API Ninjas key above to fetch live details.';
        renderLocalBreeds(query);
        return;
    }

    searchButton.disabled = true;
    apiStatus.textContent = 'Fetching live breed details...';

    try {
        const response = await fetch(`${catApiUrl}?name=${encodeURIComponent(query)}`, {
            headers: { 'X-Api-Key': apiKey }
        });
        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }
        const data = await response.json();
        if (!data.length) {
            breedGrid.innerHTML = '<p class="empty-state">The API found no matching breed. Try a different name.</p>';
            resultCount.textContent = '0 breeds found';
        } else {
            renderApiBreeds(data);
        }
        apiStatus.textContent = 'Live details loaded from API Ninjas.';
    } catch (error) {
        apiStatus.textContent = `${error.message}. Showing local results instead.`;
        renderLocalBreeds(query);
    } finally {
        searchButton.disabled = false;
    }
}

saveKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        sessionStorage.setItem('catLoreApiKey', apiKey);
        apiStatus.textContent = 'API key saved for this browser session.';
    }
});
searchButton.addEventListener('click', searchCatApi);
breedInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') searchCatApi();
});
clearButton.addEventListener('click', () => {
    breedInput.value = '';
    apiStatus.textContent = 'Local index ready. Add an API key to fetch live details.';
    renderLocalBreeds();
    breedInput.focus();
});

renderLocalBreeds();

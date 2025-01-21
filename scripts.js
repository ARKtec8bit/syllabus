document.addEventListener('DOMContentLoaded', () => {
    fetch('data.xml')
        .then(response => response.text())
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
            const karateData = parseKarateData(xmlDoc);
            initializeApp(karateData);
        })
        .catch(error => console.error('Error fetching XML:', error));
});

function parseKarateData(xmlDoc) {
    const data = {};
    const categories = xmlDoc.getElementsByTagName('category');
    for (const category of categories) {
        const categoryName = category.getAttribute('name');
        data[categoryName] = [];
        const items = category.getElementsByTagName('item');
        for (const item of items) {
            const name = item.getElementsByTagName('name')[0].textContent;
            const level = item.getElementsByTagName('level')[0].textContent;
            const description = item.getElementsByTagName('description')[0].textContent;
            const videoLink = item.getElementsByTagName('video_link')[0]?.textContent || ''; // Check if video_link exists
            data[categoryName].push({
                name,
                level,
                description,
                video_link: videoLink
            });
        }
    }
    return data;
}

function initializeApp(karateData) {
    populateCategoryCombo(karateData);
    populateLevelCombo(karateData);

    document.getElementById('category').addEventListener('change', () => updateNameCombo(karateData));
    document.getElementById('level').addEventListener('change', () => updateNameCombo(karateData));
    document.getElementById('name').addEventListener('change', () => showDetails(karateData));

    // Ensure initial population of name combo and details view
    updateNameCombo(karateData); 
}

function populateCategoryCombo(karateData) {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = ''; // Clear existing options
    for (const category in karateData) {
        const option = document.createElement('option');
        option.textContent = category;
        option.value = category;
        categorySelect.appendChild(option);
    }
    categorySelect.dispatchEvent(new Event('change')); 
}

function populateLevelCombo(karateData) {
    const levelSelect = document.getElementById('level');
    levelSelect.innerHTML = ''; // Clear existing options
    const levels = new Set(['All']);
    for (const category in karateData) {
        karateData[category].forEach(item => levels.add(item.level));
    }
    const orderedLevels = Array.from(levels).sort((a, b) => {
        if (a === 'All') return -1; // Ensure 'All' is the first option
        if (b === 'All') return 1; 
        return a.localeCompare(b, undefined, { numeric: true });
    });
    orderedLevels.forEach(level => {
        const option = document.createElement('option');
        option.textContent = level;
        option.value = level;
        levelSelect.appendChild(option);
    });
    levelSelect.dispatchEvent(new Event('change')); 
}

function updateNameCombo(karateData) {
    const category = document.getElementById('category').value;
    const levelFilter = document.getElementById('level').value;
    const nameSelect = document.getElementById('name');
    nameSelect.innerHTML = '';

    if (category) {
        const items = karateData[category].filter(item => levelFilter === 'All' || item.level === levelFilter);
        items.forEach(item => {
            const option = document.createElement('option');
            option.textContent = item.name;
            option.value = item.name;
            nameSelect.appendChild(option);
        });
        if (items.length) showDetails(karateData);
    }
}

function showDetails(karateData) {
    const category = document.getElementById('category').value;
    const name = document.getElementById('name').value;
    const item = karateData[category].find(item => item.name === name);
    const detailsDiv = document.getElementById('details');
    
    if (item) {
        detailsDiv.innerHTML = `
            <h2>${item.name} (${item.level})</h2>
            <p>${item.description}</p>
            ${item.video_link ? `<iframe width="560" height="315" src="${item.video_link}" frameborder="0" allowfullscreen></iframe>` : ''}
        `;
    }
}

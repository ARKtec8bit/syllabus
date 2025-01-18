document.addEventListener('DOMContentLoaded', () => {
    fetch('data.xml')
        .then(response => response.text())
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
            const karateData = parseKarateData(xmlDoc);
            initializeApp(karateData);
        });
});

function parseKarateData(xmlDoc) {
    const data = {};
    const categories = xmlDoc.getElementsByTagName('category');
    for (let category of categories) {
        const categoryName = category.getAttribute('name');
        data[categoryName] = [];
        const items = category.getElementsByTagName('item');
        for (let item of items) {
            const name = item.getElementsByTagName('name')[0].textContent;
            const level = item.getElementsByTagName('level')[0].textContent;
            const description = item.getElementsByTagName('description')[0].textContent;
            const videoLink = item.getElementsByTagName('video_link')[0].textContent;
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
}

function populateCategoryCombo(karateData) {
    const categorySelect = document.getElementById('category');
    for (const category in karateData) {
        const option = document.createElement('option');
        option.textContent = category;
        option.value = category;
        categorySelect.appendChild(option);
    }
}

function populateLevelCombo(karateData) {
    const levelSelect = document.getElementById('level');
    const levels = new Set();
    for (const category in karateData) {
        karateData[category].forEach(item => levels.add(item.level));
    }

    const orderedLevels = Array.from(levels).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    orderedLevels.forEach(level => {
        const option = document.createElement('option');
        option.textContent = level;
        option.value = level;
        levelSelect.appendChild(option);
    });
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
        <iframe width="560" height="315" src="${item.video_link}" frameborder="0" allowfullscreen></iframe>
        `;
    }
}

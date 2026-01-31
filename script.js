const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQmWAbCEmVk0AX9sygBAEPLHnZBprQLuV_XZL1e7BbUqE7BNbRbWbUnhpvJW8fCIStR6VvuCHiAR_e4/pub?output=csv";
let dictionaryData = []; // Local storage for the words

async function fetchData() {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        
        // Parse CSV into objects
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        dictionaryData = lines.slice(1).map(line => {
            const values = line.split(',');
            if (values.length < 5) return null;
            return {
                latin: values[1],
                native: values[2],
                ipa: values[3],
                pos: values[4],
                meaning: values[5],
                audio: values[10],
                dialect: values[11]
            };
        }).filter(item => item !== null);

        renderCards(dictionaryData);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function renderCards(data) {
    const grid = document.getElementById('dictionaryGrid');
    grid.innerHTML = data.map(word => `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:start">
                <div>
                    <h2 style="margin:0; color:var(--primary)">${word.latin}</h2>
                    <p class="shina-native" dir="rtl">${word.native}</p>
                </div>
                <span class="pos-tag">${word.pos}</span>
            </div>
            <p style="font-style:italic; color:#666">${word.ipa}</p>
            <p style="font-size:1.1rem; font-weight:600">${word.meaning}</p>
            <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center">
                <button class="audio-btn" onclick="${word.audio ? `new Audio('${word.audio}').play()` : `speakWord('${word.latin}')`}">
                    ${word.audio ? '▶ Play Recording' : '🔊 Auto-Pronounce'}
                </button>
                <small style="color:#94a3b8">${word.dialect}</small>
            </div>
        </div>
    `).join('');
}

// Function to speak the transliterated word
function speakWord(wordText) {
    // Check if the browser supports speech
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(wordText);
        
        // Find a suitable voice (Italian/Spanish usually sounds better for Shina vowels)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('it') || v.lang.startsWith('es')) || voices[0];
        
        utterance.voice = preferredVoice;
        utterance.rate = 0.8; // Slightly slower so the user can hear the syllables
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser does not support text-to-speech.");
    }
}

// Search Filtering Logic
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = dictionaryData.filter(item => 
        item.latin.toLowerCase().includes(searchTerm) || 
        item.native.toLowerCase().includes(searchTerm) || 
        item.meaning.toLowerCase().includes(searchTerm)
    );
    renderCards(filtered);
});

// Run on load
fetchData();

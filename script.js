/**
 * ========================================================================
 * CONTROLADOR CENTRAL E BOOT (MAIN SCRIPT)
 * ========================================================================
 */

function updateUI() {
    if (typeof stopPlayback === 'function') stopPlayback(); 

    const scaleData = typeof getScaleData === 'function' ? getScaleData() : null; 
    if (!scaleData) return; 

    const exercicioId = document.getElementById('exercicio').value;
    const filtroCordas = document.getElementById('filtro-cordas').value; 
    if (typeof playbackState !== 'undefined') playbackState.sequences = {};

    const windows = getPositionWindows(scaleData.rootIdx, scaleData.cagedOffset);

    let mainFullSequence = [];
    let mainActiveIds = new Set();

    windows.forEach((win, index) => {
        let data = generateExerciseData('main', win[0], win[1], scaleData, exercicioId, filtroCordas);
        mainFullSequence = mainFullSequence.concat(data.sequence); 
        data.activeNoteIds.forEach(id => mainActiveIds.add(id));
    });

    if (typeof playbackState !== 'undefined') playbackState.sequences['main'] = mainFullSequence;

    const mainFretboard = document.getElementById('main-fretboard');
    if (mainFretboard) mainFretboard.innerHTML = renderGuitarFretboard('main', 0, 15, scaleData, false, 'bottom', mainActiveIds);

    const positionsContainer = document.getElementById('positions-container');
    if (positionsContainer) positionsContainer.innerHTML = ''; 

    windows.forEach((win, index) => {
        let [start, end] = win; 
        let diagId = `pos-${index}`; 

        let data = generateExerciseData(diagId, start, end, scaleData, exercicioId, filtroCordas);
        if (typeof playbackState !== 'undefined') playbackState.sequences[diagId] = data.sequence;

        let positionWrapper = document.createElement('div');
        positionWrapper.className = 'flex flex-col';

        let headerDiv = document.createElement('div');
        headerDiv.className = 'flex items-center justify-center gap-2 mb-2';
        
        // Pílulas e botões com as novas cores cinza metálicas (gray-100)
        headerDiv.innerHTML = `
            <button id="btn-play-${diagId}" onclick="togglePlay('${diagId}', ${start}, ${end})" class="flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors flex-shrink-0" style="width: 22px; height: 22px;" title="${typeof t === 'function' ? t('btn_play') : 'Tocar'}">
                <svg class="icon-play" style="width: 11px; height: 11px; margin-left: 1.5px;" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                <svg class="icon-stop hidden" style="width: 11px; height: 11px;" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5h10v10H5z"></path></svg>
            </button>
            <span class="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">${typeof t === 'function' ? t('position') : 'Posição'} ${index + 1} (${typeof t === 'function' ? t('frets') : 'Trastes'} ${start}-${end})</span>
        `;

        let fretboardDiv = document.createElement('div');
        fretboardDiv.innerHTML = renderGuitarFretboard(diagId, start, end, scaleData, false, 'bottom', data.activeNoteIds);

        positionWrapper.appendChild(headerDiv);
        positionWrapper.appendChild(fretboardDiv);

        if (positionsContainer) positionsContainer.appendChild(positionWrapper);
    });

    if (typeof updateBackingTrackButton === 'function') {
        updateBackingTrackButton();
    }
}

// Escuta de alteração nas seleções musicais
document.getElementById('tom').addEventListener('change', function() {
    document.getElementById('tom-display').innerText = this.options[this.selectedIndex].text;
    updateUI();
});

document.getElementById('escala').addEventListener('change', function() {
    document.getElementById('escala-display').innerText = this.options[this.selectedIndex].text;
    if (typeof atualizarModos === 'function') atualizarModos(true); 
});

document.getElementById('modo').addEventListener('change', function() {
    document.getElementById('modo-display').innerText = this.options[this.selectedIndex].text;
    updateUI();
});

document.getElementById('exercicio').addEventListener('change', function() {
    document.getElementById('exercicio-display').innerText = this.options[this.selectedIndex].dataset.short;
    updateUI();
});

document.getElementById('filtro-cordas').addEventListener('change', function() {
    document.getElementById('cordas-display').innerText = this.options[this.selectedIndex].text;
    updateUI();
});

// Boot Inicial Modular
async function initApp() { 
    const userLang = (navigator.language || navigator.userLanguage).split('-')[0].toLowerCase();
    
    if (typeof i18n !== 'undefined' && i18n[userLang] && typeof langMetadata !== 'undefined' && langMetadata[userLang]) {
        if (typeof currentLang !== 'undefined') currentLang = userLang;
    }

    try {
        const response = await fetch('help.html');
        if (response.ok) {
            const htmlText = await response.text();
            const helpContainer = document.getElementById('help-container');
            if (helpContainer) helpContainer.innerHTML = htmlText;
            
            const closeHelpBtn = document.getElementById('close-help-btn');
            if (closeHelpBtn && typeof closeHelp !== 'undefined') closeHelpBtn.addEventListener('click', closeHelp);
        }
    } catch (error) {
        console.warn("Ficheiro help.html não carregado.");
    }

    try {
        const responseBt = await fetch('backingtrack.html');
        if (responseBt.ok) {
            const htmlTextBt = await responseBt.text();
            const btContainer = document.getElementById('bt-container');
            if (btContainer) btContainer.innerHTML = htmlTextBt;
            
            const closeBtBtn = document.getElementById('close-bt-btn');
            if (closeBtBtn) closeBtBtn.addEventListener('click', () => {
                const modal = document.getElementById('bt-modal');
                if (modal) modal.classList.add('hidden');
            });
        }
    } catch (error) {
        console.warn("Ficheiro backingtrack.html não carregado.");
    }

    const langListEl = document.getElementById('lang-menu-list');
    if (langListEl) {
        langListEl.innerHTML = '';
        if (typeof langMetadata !== 'undefined') {
            Object.keys(langMetadata).forEach(code => {
                const btn = document.createElement('a');
                btn.href = '#';
                btn.className = 'text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors';
                btn.innerHTML = `${langMetadata[code].svg} <span>${langMetadata[code].name}</span>`;
                btn.onclick = (e) => { e.preventDefault(); if(typeof setLang === 'function') setLang(code, langMetadata[code].name); };
                langListEl.appendChild(btn);
            });
    
            if (typeof currentLang !== 'undefined') {
                document.getElementById('current-flag').innerHTML = langMetadata[currentLang].svg;
                document.getElementById('current-lang-name').innerText = langMetadata[currentLang].name;
            }
        }
    }

    if (typeof applyLanguage === 'function') applyLanguage(); 
    if (typeof updateBackingTrackButton === 'function') updateBackingTrackButton();
}

initApp();
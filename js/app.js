/**
 * ========================================================================
 * NÚCLEO DA APLICAÇÃO (CORE & BOOT) - app.js
 * ========================================================================
 * Orquestra a renderização principal (updateUI) e o boot do app.
 */

function updateUI() {
    if (typeof stopPlayback === 'function') stopPlayback(); 
    let scaleData = typeof getScaleData === 'function' ? getScaleData() : null; 
    if (!scaleData) return; 

    let exEl = document.getElementById('exercicio');
    let exercicioId = exEl ? exEl.value : '1';
    
    let filtroCordasEl = document.getElementById('filtro-cordas');
    let filtroCordas = filtroCordasEl ? filtroCordasEl.value : 'all'; 

    let sugerirDigitacao = document.getElementById('sugerir-digitacao')?.checked || false;
    // NOVO: Captura o estado do botão "Padrão Invertido"
    let inverterCordas = document.getElementById('inverter-cordas')?.checked || false;
    
    if (typeof playbackState !== 'undefined') playbackState.sequences = {};

    let windows = typeof getPositionWindows === 'function' ? getPositionWindows(scaleData.rootIdx, scaleData.cagedOffset) : [];
    let mainFullSequence = [];
    let mainActiveIds = new Set();
    let allPositionsData = [];

    if (typeof generateExerciseData === 'function') {
        windows.forEach((win, index) => {
            let data = generateExerciseData('main', win[0], win[1], scaleData, exercicioId, filtroCordas);
            if (data && data.sequence) mainFullSequence = mainFullSequence.concat(data.sequence); 
            if (data && data.activeNoteIds) data.activeNoteIds.forEach(id => mainActiveIds.add(id));

            let posData = generateExerciseData(`pos-${index}`, win[0], win[1], scaleData, exercicioId, filtroCordas);
            let activeFrets = new Set();
            let activeNotes = new Set();
            if (posData && posData.activeNoteIds) {
                posData.activeNoteIds.forEach(id => {
                    let parts = id.split('-');
                    let s = parseInt(parts[parts.length-2]);
                    let f = parseInt(parts[parts.length-1]);
                    activeFrets.add(f);
                    activeNotes.add(`${s}-${f}`);
                });
            }
            allPositionsData.push({ start: win[0], end: win[1], activeFrets, activeNotes });
        });
    }

    if (typeof playbackState !== 'undefined') playbackState.sequences['main'] = mainFullSequence;

    let mainFretboard = document.getElementById('main-fretboard');
    if (mainFretboard && typeof renderGuitarFretboard === 'function') {
        // Passa o inverterCordas para a renderização da escala completa
        mainFretboard.innerHTML = renderGuitarFretboard('main', 0, 15, scaleData, false, 'bottom', mainActiveIds, sugerirDigitacao, allPositionsData, inverterCordas);
        if (typeof applyFretboardMagic === 'function') applyFretboardMagic('main', 0, 15);
    }

    let positionsContainer = document.getElementById('positions-container');
    if (positionsContainer) positionsContainer.innerHTML = ''; 

    if (typeof generateExerciseData === 'function' && typeof renderGuitarFretboard === 'function') {
        windows.forEach((win, index) => {
            let [start, end] = win; 
            let diagId = `pos-${index}`; 

            let data = generateExerciseData(diagId, start, end, scaleData, exercicioId, filtroCordas);
            if (typeof playbackState !== 'undefined' && data) playbackState.sequences[diagId] = data.sequence;

            let positionWrapper = document.createElement('div');
            positionWrapper.className = 'flex flex-col relative';

            let btnTitle = typeof t === 'function' ? t('btn_play') : 'Tocar';
            let posText = typeof t === 'function' ? t('position') : 'Posição';
            let fretsText = typeof t === 'function' ? t('frets') : 'Trastes';

            // Passa o inverterCordas para a renderização das posições pequenas
            let fretboardHtml = renderGuitarFretboard(diagId, start, end, scaleData, false, 'bottom', data ? data.activeNoteIds : new Set(), sugerirDigitacao, null, inverterCordas);

            positionWrapper.innerHTML = `
                <button id="btn-play-${diagId}" onclick="if(typeof togglePlay === 'function') togglePlay('${diagId}', ${start}, ${end})" class="floating-play-btn flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-full shadow-sm" title="${btnTitle}">
                    <svg class="icon-play" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                    <svg class="icon-stop hidden" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5h10v10H5z"></path></svg>
                    <span class="text-xs md:text-sm font-semibold whitespace-nowrap">${posText} ${index + 1} (${fretsText} ${start}-${end})</span>
                </button>
                <div>${fretboardHtml}</div>
            `;

            if (positionsContainer) positionsContainer.appendChild(positionWrapper);

            if (typeof applyFretboardMagic === 'function') applyFretboardMagic(diagId, start, end);
        });
    }

    if (typeof updateBackingTrackButton === 'function') updateBackingTrackButton();

    if (typeof setupMainPlaybackObserver === 'function') {
        setupMainPlaybackObserver(windows);
    }
}

async function initApp() { 
    let userLang = (navigator.language || navigator.userLanguage).split('-')[0].toLowerCase();
    if (typeof i18n !== 'undefined' && i18n[userLang] && typeof langMetadata !== 'undefined' && langMetadata[userLang]) {
        if (typeof currentLang !== 'undefined') currentLang = userLang;
    }

    try {
        let response = await fetch('help.html');
        if (response.ok) {
            let htmlText = await response.text();
            let helpContainer = document.getElementById('help-container');
            if (helpContainer) helpContainer.innerHTML = htmlText;
            let closeHelpBtn = document.getElementById('close-help-btn');
            if (closeHelpBtn && typeof closeHelp === 'function') closeHelpBtn.addEventListener('click', closeHelp);
        }
    } catch (error) {}

    try {
        let responseBt = await fetch('backingtrack.html');
        if (responseBt.ok) {
            let htmlTextBt = await responseBt.text();
            let btContainer = document.getElementById('bt-container');
            if (btContainer) btContainer.innerHTML = htmlTextBt;
            let closeBtBtn = document.getElementById('close-bt-btn');
            if (closeBtBtn) closeBtBtn.addEventListener('click', () => {
                let modal = document.getElementById('bt-modal');
                if (modal) modal.classList.add('hidden');
            });
        }
    } catch (error) {}

    let langListEl = document.getElementById('lang-menu-list');
    if (langListEl && typeof langMetadata !== 'undefined') {
        langListEl.innerHTML = '';
        Object.keys(langMetadata).forEach(code => {
            let btn = document.createElement('a');
            btn.href = '#';
            btn.className = 'text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors';
            btn.innerHTML = `${langMetadata[code].svg} <span>${langMetadata[code].name}</span>`;
            btn.onclick = (e) => { e.preventDefault(); if(typeof setLang === 'function') setLang(code, langMetadata[code].name); };
            langListEl.appendChild(btn);
        });
        let currentFlagEl = document.getElementById('current-flag');
        let currentLangNameEl = document.getElementById('current-lang-name');
        let langToUse = typeof currentLang !== 'undefined' ? currentLang : 'pt';
        if (currentFlagEl && langMetadata[langToUse]) currentFlagEl.innerHTML = langMetadata[langToUse].svg;
        if (currentLangNameEl && langMetadata[langToUse]) currentLangNameEl.innerText = langMetadata[langToUse].name;
    }

    if (typeof applyLanguage === 'function') applyLanguage(); 
    if (typeof updateBackingTrackButton === 'function') updateBackingTrackButton();
}

initApp();
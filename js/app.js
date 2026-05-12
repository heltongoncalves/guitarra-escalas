/**
 * ========================================================================
 * NÚCLEO DA APLICAÇÃO (CORE & BOOT) - app.js
 * ========================================================================
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
    let inverterCordas = document.getElementById('inverter-cordas')?.checked || false;
    
    if (typeof playbackState !== 'undefined') playbackState.sequences = {};

    let windows = typeof getPositionWindows === 'function' ? getPositionWindows(scaleData.rootIdx, scaleData.cagedOffset) : [];
    
    let mainFullSequence = [];
    let mainActiveIds = new Set();
    let allPositionsData = [];
    let processedPositions = []; 

    if (typeof generateExerciseData === 'function') {
        let mainData = generateExerciseData('main', 0, 15, scaleData, exercicioId, filtroCordas);
        if (mainData && mainData.sequence) mainFullSequence = mainFullSequence.concat(mainData.sequence); 
        if (mainData && mainData.activeNoteIds) mainData.activeNoteIds.forEach(id => mainActiveIds.add(id));

        windows.forEach((win, index) => {
            let [start, end] = win;
            let diagId = `pos-${index}`;

            // Gera os dados primeiro para descobrir o que realmente sobreviveu ao filtro
            let posData = generateExerciseData(diagId, start, end, scaleData, exercicioId, filtroCordas);
            
            let activeFrets = new Set();
            let activeNotes = new Set();
            let minFret = 99;
            let maxFret = -1;

            if (posData && posData.activeNoteIds) {
                posData.activeNoteIds.forEach(id => {
                    let parts = id.split('-');
                    let s = parseInt(parts[parts.length-2]);
                    let f = parseInt(parts[parts.length-1]);
                    activeFrets.add(f);
                    activeNotes.add(`${s}-${f}`);
                    
                    if (f > 0 && f < minFret) minFret = f; 
                    if (f > maxFret) maxFret = f;
                });
            }

            // NOVO: Algoritmo "Shrink-to-Fit" Real
            // Ajusta o tamanho da escala exata e perfeitamente ao redor das notas renderizadas
            let newStart = start;
            let newEnd = end;

            if (activeFrets.size > 0) {
                newEnd = maxFret; 
                if (activeFrets.has(0) || start === 0) {
                    newStart = 0;
                } else if (minFret !== 99) {
                    newStart = minFret; 
                }
            }

            // Proteção visual para não achatar demais a UI em escalas muito pequenas
            if (newEnd - newStart < 2) newEnd = newStart + 2;

            processedPositions.push({ id: diagId, start: newStart, end: newEnd, data: posData, activeFrets, activeNotes });
            allPositionsData.push({ start: newStart, end: newEnd, activeFrets, activeNotes });
        });
    }

    if (typeof playbackState !== 'undefined') playbackState.sequences['main'] = mainFullSequence;

    let mainFretboard = document.getElementById('main-fretboard');
    if (mainFretboard && typeof renderGuitarFretboard === 'function') {
        mainFretboard.innerHTML = renderGuitarFretboard('main', 0, 15, scaleData, false, 'bottom', mainActiveIds, sugerirDigitacao, allPositionsData, inverterCordas);
        if (typeof applyFretboardMagic === 'function') applyFretboardMagic('main', 0, 15);
    }

    let positionsContainer = document.getElementById('positions-container');
    if (positionsContainer) positionsContainer.innerHTML = ''; 

    if (typeof generateExerciseData === 'function' && typeof renderGuitarFretboard === 'function') {
        processedPositions.forEach((pos, index) => {
            if (typeof playbackState !== 'undefined' && pos.data) playbackState.sequences[pos.id] = pos.data.sequence;

            let positionWrapper = document.createElement('div');
            positionWrapper.className = 'flex flex-col relative';

            let btnTitle = typeof t === 'function' ? t('btn_play') : 'Tocar';
            let posText = typeof t === 'function' ? t('position') : 'Posição';
            let fretsText = typeof t === 'function' ? t('frets') : 'Trastes';

            let fretboardHtml = renderGuitarFretboard(pos.id, pos.start, pos.end, scaleData, false, 'bottom', pos.data ? pos.data.activeNoteIds : new Set(), sugerirDigitacao, null, inverterCordas);

            positionWrapper.innerHTML = `
                <button id="btn-play-${pos.id}" onclick="if(typeof togglePlay === 'function') togglePlay('${pos.id}', ${pos.start}, ${pos.end})" class="floating-play-btn flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-full shadow-sm" title="${btnTitle}">
                    <svg class="icon-play" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                    <svg class="icon-stop hidden" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5h10v10H5z"></path></svg>
                    <span class="text-xs md:text-sm font-semibold whitespace-nowrap">${posText} ${index + 1} (${fretsText} ${pos.start}-${pos.end})</span>
                </button>
                <div>${fretboardHtml}</div>
            `;

            if (positionsContainer) positionsContainer.appendChild(positionWrapper);
            if (typeof applyFretboardMagic === 'function') applyFretboardMagic(pos.id, pos.start, pos.end);
        });
    }

    if (typeof updateBackingTrackButton === 'function') updateBackingTrackButton();

    if (typeof setupMainPlaybackObserver === 'function') {
        setupMainPlaybackObserver(windows); // Usa o original windows bounds para o tracking da escala inteira
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
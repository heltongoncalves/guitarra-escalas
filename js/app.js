/**
 * ========================================================================
 * NÚCLEO DA APLICAÇÃO (CORE & BOOT) - app.js
 * ========================================================================
 */

// 1. CARREGAMENTO IMEDIATO DO TEMA (Evita "piscar" a tela em branco)
(function loadEarlyTheme() {
    try {
        const saved = localStorage.getItem('guitar_tutor_app_state');
        if (saved) {
            const state = JSON.parse(saved);
            if (state.skin) document.body.setAttribute('data-skin', state.skin);
        }
    } catch(e) {}
})();

// FUNÇÃO PARA SALVAR O ESTADO ATUAL
function saveAppState() {
    const state = {
        tom: document.getElementById('tom')?.value,
        escala: document.getElementById('escala')?.value,
        modo: document.getElementById('modo')?.value,
        exercicio: document.getElementById('exercicio')?.value,
        filtroCordas: document.getElementById('filtro-cordas')?.value,
        bpm: document.getElementById('bpm')?.value,
        sugerirDigitacao: document.getElementById('sugerir-digitacao')?.checked,
        inverterCordas: document.getElementById('inverter-cordas')?.checked,
        desafio: document.getElementById('desafio')?.checked,
        autoBpm: document.getElementById('auto-bpm-toggle')?.checked,
        lang: typeof currentLang !== 'undefined' ? currentLang : 'pt',
        skin: document.body.getAttribute('data-skin'),
        skinIcon: document.getElementById('current-skin-icon')?.innerText
    };
    localStorage.setItem('guitar_tutor_app_state', JSON.stringify(state));
}

// FUNÇÃO PARA CARREGAR O ESTADO SALVO
function loadAppState() {
    const saved = localStorage.getItem('guitar_tutor_app_state');
    if (!saved) return;
    
    try {
        const state = JSON.parse(saved);
        if (state.skinIcon) {
            const iconEl = document.getElementById('current-skin-icon');
            if (iconEl) iconEl.innerText = state.skinIcon;
        }

        if (state.tom) {
            const el = document.getElementById('tom');
            if (el && el.options.length > 0) { 
                el.value = state.tom; 
                document.getElementById('tom-display').innerText = el.options[el.selectedIndex]?.text || state.tom; 
            }
        }
        if (state.escala) {
            const el = document.getElementById('escala');
            if (el && el.options.length > 0) { 
                el.value = state.escala; 
                document.getElementById('escala-display').innerText = el.options[el.selectedIndex]?.text || state.escala; 
            }
        }
        
        if (typeof atualizarModos === 'function') atualizarModos(false);

        if (state.modo) {
            const el = document.getElementById('modo');
            if (el && el.options.length > 0) { 
                el.value = state.modo;
                if (el.selectedIndex >= 0) {
                    document.getElementById('modo-display').innerText = el.options[el.selectedIndex].text;
                } else {
                    el.selectedIndex = 0;
                    document.getElementById('modo-display').innerText = el.options[0]?.text || state.modo;
                }
            }
        }

        if (state.exercicio) {
            const el = document.getElementById('exercicio');
            if (el && el.options.length > 0) { 
                el.value = state.exercicio; 
                document.getElementById('exercicio-display').innerText = el.options[el.selectedIndex]?.dataset?.short || state.exercicio; 
            }
        }
        if (state.filtroCordas) {
            const el = document.getElementById('filtro-cordas');
            if (el && el.options.length > 0) { 
                el.value = state.filtroCordas; 
                document.getElementById('cordas-display').innerText = el.options[el.selectedIndex]?.text || state.filtroCordas; 
            }
        }
        if (state.bpm) {
            const el = document.getElementById('bpm');
            if (el) el.value = state.bpm;
        }
        if (state.sugerirDigitacao !== undefined) {
            const el = document.getElementById('sugerir-digitacao');
            if (el) el.checked = state.sugerirDigitacao;
        }
        if (state.inverterCordas !== undefined) {
            const el = document.getElementById('inverter-cordas');
            if (el) el.checked = state.inverterCordas;
        }
        if (state.desafio !== undefined) {
            const el = document.getElementById('desafio');
            if (el) el.checked = state.desafio;
        }
        if (state.autoBpm !== undefined) {
            const el = document.getElementById('auto-bpm-toggle');
            if (el) {
                el.checked = state.autoBpm;
                el.dispatchEvent(new Event('change'));
            }
        }
    } catch (e) {
        console.error("Erro ao carregar o estado anterior:", e);
    }
}

function updateUI() {
    if (typeof stopPlayback === 'function') stopPlayback(); 
    let scaleData = typeof getScaleData === 'function' ? getScaleData() : null; 
    
    // PROTEÇÃO CONTRA TELA VAZIA: Se falhar ao ler os Selects, força restauração de valores
    if (!scaleData) {
        console.warn("Aviso: Dados da escala não encontrados. Tentando restaurar valores padrão...");
        const tomEl = document.getElementById('tom');
        const escalaEl = document.getElementById('escala');
        if (tomEl && tomEl.options.length > 0) tomEl.selectedIndex = 0;
        if (escalaEl && escalaEl.options.length > 0) escalaEl.selectedIndex = 0;
        if (typeof atualizarModos === 'function') atualizarModos(false);
        scaleData = typeof getScaleData === 'function' ? getScaleData() : null;
        if (!scaleData) {
            console.error("Falha crítica: O banco de dados de escalas não está acessível.");
            return; 
        }
    }

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
        if (mainData && mainData.activeNoteIds) mainData.activeNoteIds.forEach(id => mainActiveIds.add(id));

        windows.forEach((win, index) => {
            let [start, end] = win;
            let diagId = `pos-${index}`;

            let posDataRaw = generateExerciseData(diagId, start, end, scaleData, exercicioId, filtroCordas);
            
            let activeFrets = new Set();
            let minFret = 99;
            let maxFret = -1;

            if (posDataRaw && posDataRaw.activeNoteIds) {
                posDataRaw.activeNoteIds.forEach(id => {
                    let parts = id.split('-');
                    let f = parseInt(parts[parts.length-1]);
                    activeFrets.add(f);
                    if (f > 0 && f < minFret) minFret = f; 
                    if (f > maxFret) maxFret = f;
                });
            }

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

            if (newEnd - newStart < 2) newEnd = newStart + 2;
            let posData = generateExerciseData(diagId, newStart, newEnd, scaleData, exercicioId, filtroCordas);
            
            let finalActiveFrets = new Set();
            let finalActiveNotes = new Set();

            if (posData && posData.activeNoteIds) {
                posData.activeNoteIds.forEach(id => {
                    let parts = id.split('-');
                    let s = parseInt(parts[parts.length-2]);
                    let f = parseInt(parts[parts.length-1]);
                    finalActiveFrets.add(f);
                    finalActiveNotes.add(`${s}-${f}`);
                });
            }

            processedPositions.push({ id: diagId, start: newStart, end: newEnd, data: posData, activeFrets: finalActiveFrets, activeNotes: finalActiveNotes });
            allPositionsData.push({ start: newStart, end: newEnd, activeFrets: finalActiveFrets, activeNotes: finalActiveNotes });

            if (posData && posData.sequence) {
                let mainSeqChunk = posData.sequence.map(n => ({
                    ...n, 
                    id: `note-main-${n.string}-${n.fret}`
                }));
                mainFullSequence = mainFullSequence.concat(mainSeqChunk);
            }
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
        setupMainPlaybackObserver(windows); 
    }
}

async function initApp() { 
    let savedLang = null;
    try {
        const saved = localStorage.getItem('guitar_tutor_app_state');
        if (saved) savedLang = JSON.parse(saved).lang;
    } catch(e) {}
    
    let userLang = (navigator.language || navigator.userLanguage).split('-')[0].toLowerCase();

    if (savedLang && typeof langMetadata !== 'undefined' && langMetadata[savedLang]) {
        if (typeof currentLang !== 'undefined') currentLang = savedLang;
    } else if (typeof i18n !== 'undefined' && i18n[userLang] && typeof langMetadata !== 'undefined' && langMetadata[userLang]) {
        if (typeof currentLang !== 'undefined') currentLang = userLang;
    }

    if (typeof window.setSkin === 'function' && !window.setSkin.isIntercepted) {
        const originalSetSkin = window.setSkin;
        window.setSkin = function(skin, icon) {
            originalSetSkin(skin, icon);
            saveAppState();
        };
        window.setSkin.isIntercepted = true;
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
            btn.onclick = (e) => { 
                e.preventDefault(); 
                if(typeof setLang === 'function') setLang(code, langMetadata[code].name); 
                saveAppState(); 
            };
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

    loadAppState();
    updateUI();
}

// ========================================================================
// MOTOR DE BOOT SEGURO
// ========================================================================
// Aguarda o HTML completo (incluindo as views injetadas via Javascript) antes de iniciar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initApp();
    }, 50); // Delay cirúrgico para garantir que o DOM estabilizou
});
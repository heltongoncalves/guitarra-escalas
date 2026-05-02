let currentLang = 'pt';

function t(key) {
    if (i18n[currentLang] && i18n[currentLang][key]) return i18n[currentLang][key];
    if (i18n['en'] && i18n['en'][key]) return i18n['en'][key];
    if (i18n['pt'] && i18n['pt'][key]) return i18n['pt'][key];
    return key;
}

function getShortExText(fullText) {
    let short = fullText.split(' (')[0];
    const removals = [' a escala toda', ' the whole scale', ' toda la escala', ' toute la gamme', ' по всей гамме', ' cada nota', ' each note', ' chaque note', ' каждую ноту'];
    removals.forEach(r => { short = short.replace(new RegExp(r, 'gi'), ''); });
    return short.trim();
}

let audioCtx; 
let globalVolume = 0.8; 

let playbackState = {
    diagramId: null,      
    timeoutId: null,      
    countdownIntervalId: null, 
    currentIndex: 0,      
    cycleCount: 0,        
    sequence: [],         
    sequences: {},        
    playing: false,       
    lastHighlightedNote: null 
};

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playPluck(stringIdx, fret) {
    if (globalVolume <= 0) return; 

    initAudio(); 
    const freq = openStringFreqs[stringIdx] * Math.pow(2, fret / 12);

    const osc = audioCtx.createOscillator();     
    const gainNode = audioCtx.createGain();      
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 1500 + (fret * 100);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(globalVolume, now + 0.02); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5); 

    osc.start(now);
    osc.stop(now + 2.5);
}

const langMenuBtn = document.getElementById('lang-menu-btn');
const langMenuDropdown = document.getElementById('lang-menu-dropdown');
const skinMenuBtn = document.getElementById('skin-menu-btn');
const skinMenuDropdown = document.getElementById('skin-menu-dropdown');
const volMenuBtn = document.getElementById('volume-menu-btn');
const volMenuDropdown = document.getElementById('volume-menu-dropdown');
const helpBtn = document.getElementById('help-btn');

langMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    langMenuDropdown.classList.toggle('hidden');
    skinMenuDropdown.classList.add('hidden'); 
    volMenuDropdown.classList.add('hidden'); 
});

skinMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    skinMenuDropdown.classList.toggle('hidden');
    langMenuDropdown.classList.add('hidden'); 
    volMenuDropdown.classList.add('hidden'); 
});

volMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    volMenuDropdown.classList.toggle('hidden');
    langMenuDropdown.classList.add('hidden'); 
    skinMenuDropdown.classList.add('hidden'); 
});

helpBtn.addEventListener('click', () => {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.classList.remove('hidden');
});

const closeHelp = () => {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    if (!langMenuBtn.contains(e.target) && !langMenuDropdown.contains(e.target)) langMenuDropdown.classList.add('hidden');
    if (!skinMenuBtn.contains(e.target) && !skinMenuDropdown.contains(e.target)) skinMenuDropdown.classList.add('hidden');
    if (!volMenuBtn.contains(e.target) && !volMenuDropdown.contains(e.target)) volMenuDropdown.classList.add('hidden');
    
    const helpModal = document.getElementById('help-modal');
    if (helpModal && e.target === helpModal) closeHelp();
});

function setLang(code, langName) {
    document.getElementById('current-flag').innerHTML = langMetadata[code].svg;
    document.getElementById('current-lang-name').innerText = langName;
    langMenuDropdown.classList.add('hidden');
    currentLang = code;
    applyLanguage();
}

function setSkin(skinName, icon) {
    document.body.setAttribute('data-skin', skinName);
    document.getElementById('current-skin-icon').innerText = icon;
    skinMenuDropdown.classList.add('hidden');
}

function applyLanguage() {
    const selCat = document.getElementById('escala').value || 'Pentatônica';
    const selModo = document.getElementById('modo').value || 'Maior';
    const selEx = document.getElementById('exercicio').value || '1';

    document.documentElement.lang = currentLang;

    if (currentLang === 'ar' || currentLang === 'ur') document.body.dir = 'rtl';
    else document.body.dir = 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);
    });

    const exSelect = document.getElementById('exercicio');
    exSelect.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        let opt = document.createElement('option');
        opt.value = i.toString();
        opt.text = t(`ex_${i}`);
        opt.dataset.short = getShortExText(t(`ex_${i}`));
        exSelect.add(opt);
    }
    exSelect.value = selEx;
    document.getElementById('exercicio-display').innerText = exSelect.options[exSelect.selectedIndex].dataset.short;

    const catSelect = document.getElementById('escala');
    catSelect.innerHTML = '';
    for (const cat in bancoDeEscalas) {
        catSelect.add(new Option(t(cat), cat)); 
    }
    catSelect.value = bancoDeEscalas[selCat] ? selCat : 'Pentatônica';
    document.getElementById('escala-display').innerText = catSelect.options[catSelect.selectedIndex].text;

    atualizarModos(false);
    const modoSelect = document.getElementById('modo');
    if ([...modoSelect.options].some(o => o.value === selModo)) {
        modoSelect.value = selModo;
    }
    document.getElementById('modo-display').innerText = modoSelect.options[modoSelect.selectedIndex].text;

    const cordasSelect = document.getElementById('filtro-cordas');
    cordasSelect.options[0].text = t('str_all');
    document.getElementById('cordas-display').innerText = cordasSelect.options[cordasSelect.selectedIndex].text;

    const tomSelect = document.getElementById('tom');
    const selTom = tomSelect.value || 'C';
    tomSelect.innerHTML = '';
    const rootsArr = (i18n[currentLang] && i18n[currentLang].roots) ? i18n[currentLang].roots : i18n['en'].roots;
    
    notasCromaticas.forEach((nota, idx) => {
        let opt = document.createElement('option');
        opt.value = nota; 
        opt.text = rootsArr[idx]; 
        tomSelect.add(opt);
    });
    
    tomSelect.value = selTom;
    document.getElementById('tom-display').innerText = tomSelect.options[tomSelect.selectedIndex].text;

    updateUI();
}

function atualizarModos(triggerUpdateUI = true) {
    const cat = document.getElementById('escala').value;
    const modos = bancoDeEscalas[cat];
    const selectModo = document.getElementById('modo');
    const oldModo = selectModo.value;

    selectModo.innerHTML = ''; 
    for (const modo in modos) {
        selectModo.add(new Option(t(modo), modo));
    }
    
    if (oldModo && [...selectModo.options].some(o => o.value === oldModo)) {
        selectModo.value = oldModo;
    }
    
    document.getElementById('modo-display').innerText = selectModo.options[selectModo.selectedIndex].text;

    if (triggerUpdateUI) updateUI();
}

function getScaleData() {
    const tom = document.getElementById('tom').value;
    const categoria = document.getElementById('escala').value;
    const modo = document.getElementById('modo').value;

    const rootIdx = notasCromaticas.indexOf(tom); 
    if (!bancoDeEscalas[categoria] || !bancoDeEscalas[categoria][modo]) return null; 

    const dadosModo = bancoDeEscalas[categoria][modo];
    const notasDaEscala = new Set(dadosModo.i.map(i => notasCromaticas[(rootIdx + i) % 12]));

    return { root: tom, rootIdx: rootIdx, notes: notasDaEscala, cagedOffset: dadosModo.c };
}

function getPositionWindows(rootIdx, cagedOffset) {
    let relMajorIdx = (rootIdx + cagedOffset + 12) % 12;
    let r = (relMajorIdx - 4 + 12) % 12;

    let rawWindows = [
        [r - 1, r + 2],  
        [r + 1, r + 5],  
        [r + 4, r + 7],  
        [r + 6, r + 9],  
        [r + 9, r + 12]  
    ];

    let normalized = rawWindows.map(w => {
        let [s, e] = w;
        if (s >= 12) { s -= 12; e -= 12; }
        if (s < 0) {
            if (e >= 1) s = 0; 
            else { s += 12; e += 12; } 
        }
        if (s < 0) s = 0;
        return [s, e];
    });

    let uniqueMap = new Map();
    normalized.forEach(w => uniqueMap.set(`${w[0]}-${w[1]}`, w));
    let finalWindows = Array.from(uniqueMap.values()).sort((a, b) => a[0] - b[0]);

    if (finalWindows.length < 5) finalWindows = [ [0,3], [2,5], [5,8], [7,10], [9,12] ];
    
    return finalWindows.slice(0, 5); 
}

function generateExerciseData(diagramId, startFret, endFret, scaleData, exercicio, filtroCordas) {
    let baseNotes = [];
    for (let s = 5; s >= 0; s--) { 
        for (let f = startFret; f <= endFret; f++) {
            let noteIdx = (afinacaoIndices[s] + f) % 12;
            let note = notasCromaticas[noteIdx];
            
            if (scaleData.notes.has(note)) { 
                let pitch = openStringFreqs[s] * Math.pow(2, f / 12); 
                baseNotes.push({ string: s, fret: f, id: `note-${diagramId}-${s}-${f}`, noteIdx: noteIdx, pitch: pitch });
            }
        }
    }

    if (filtroCordas === '1-3') {
        baseNotes = baseNotes.filter(n => n.string <= 2);
    } else if (filtroCordas === '1-4') {
        baseNotes = baseNotes.filter(n => n.string <= 3);
    } else if (filtroCordas === '3-6') {
        baseNotes = baseNotes.filter(n => n.string >= 2);
    } else if (filtroCordas === '4-6') {
        baseNotes = baseNotes.filter(n => n.string >= 3);
    }

    baseNotes.sort((a, b) => a.pitch - b.pitch);
    let exSeq = [];

    if (exercicio === "1") {
        exSeq = [...baseNotes, ...[...baseNotes].reverse().slice(1)];
    }
    else if (exercicio === "2") {
        let upDown = [...baseNotes, ...[...baseNotes].reverse().slice(1)];
        upDown.forEach(n => { exSeq.push(n, n); });
    }
    else if (exercicio === "3") {
        let upDown = [...baseNotes, ...[...baseNotes].reverse().slice(1)];
        upDown.forEach(n => { exSeq.push(n, n, n); });
    }
    else if (exercicio === "4") {
        for (let i = 0; i < baseNotes.length - 2; i++) exSeq.push(baseNotes[i], baseNotes[i+1], baseNotes[i+2]);
        let rev = [...baseNotes].reverse();
        for (let i = 0; i < rev.length - 2; i++) exSeq.push(rev[i], rev[i+1], rev[i+2]);
    }
    else if (exercicio === "5") {
        for (let i = 0; i < baseNotes.length - 3; i++) exSeq.push(baseNotes[i], baseNotes[i+1], baseNotes[i+2], baseNotes[i+3]);
        let rev = [...baseNotes].reverse();
        for (let i = 0; i < rev.length - 3; i++) exSeq.push(rev[i], rev[i+1], rev[i+2], rev[i+3]);
    }
    else if (exercicio === "6") {
        for (let i = 0; i < baseNotes.length - 2; i++) exSeq.push(baseNotes[i], baseNotes[i+2]);
        let rev = [...baseNotes].reverse();
        for (let i = 0; i < rev.length - 2; i++) exSeq.push(rev[i], rev[i+2]);
    }
    else if (exercicio === "7") {
        let filtered = baseNotes.filter(n => { return [0, 3, 4, 6, 7, 8].includes((n.noteIdx - scaleData.rootIdx + 12) % 12); });
        exSeq = [...filtered, ...[...filtered].reverse().slice(1)];
    }
    else if (exercicio === "8") {
        let filtered = baseNotes.filter(n => { return [0, 3, 4, 6, 7, 8, 9, 10, 11].includes((n.noteIdx - scaleData.rootIdx + 12) % 12); });
        exSeq = [...filtered, ...[...filtered].reverse().slice(1)];
    }
    else if (exercicio === "9") {
        let stringPattern = [5, 3, 4, 2, 3, 1, 2, 0];
        stringPattern.forEach(sIndex => { exSeq.push(...baseNotes.filter(n => n.string === sIndex)); });
        let revPattern = [0, 2, 1, 3, 2, 4, 3, 5];
        revPattern.forEach(sIndex => { exSeq.push(...baseNotes.filter(n => n.string === sIndex).reverse()); });
    }

    if (exSeq.length === 0) exSeq = [...baseNotes, ...[...baseNotes].reverse().slice(1)];

    let activeNoteIds = new Set(exSeq.map(n => n.id));
    
    return { sequence: exSeq, activeNoteIds: activeNoteIds };
}

function renderGuitarFretboard(diagramId, startFret, endFret, scaleData, showTuningLabels, numberPos, activeNoteIds) {
    
    let html = `<div id="diagram-${diagramId}" class="flex flex-col transition-opacity duration-300">`;

    let gridCols = startFret === 0 ? '40px ' : ''; 
    let colWidth = diagramId === 'main' ? 'minmax(0, 1fr)' : '3.5rem';
    for(let f = (startFret === 0 ? 1 : startFret); f <= endFret; f++) gridCols += `${colWidth} `;

    if (numberPos === 'top') {
        html += `<div class="flex mb-1">`;
        if (showTuningLabels) html += `<div class="w-[35px] flex-shrink-0"></div>`; 
        html += `<div class="flex-1 grid" style="grid-template-columns: ${gridCols};" dir="ltr">`;
        for (let f = startFret; f <= endFret; f++) {
            let isTarget = f === 5 || f === 12; 
            let textCls = isTarget ? 'font-bold text-[1.1rem] text-black' : 'text-sm text-gray-500';
            html += `<div class="text-center flex items-center justify-center ${textCls}">${f}</div>`;
        }
        html += `</div></div>`;
    }

    html += `<div class="flex">`;

    if (showTuningLabels) {
        html += `<div class="w-[35px] flex-shrink-0 grid" style="grid-template-rows: repeat(6, 1fr);" dir="ltr">`;
        for (let s = 0; s < 6; s++) {
            let openNote = notasCromaticas[afinacaoIndices[s]];
            html += `<div class="flex items-center justify-center"><div class="tuning-dot">${openNote}</div></div>`;
        }
        html += `</div>`;
    }

    html += `<div class="flex-1 grid border-t border-b border-gray-600 bg-white shadow-sm" style="grid-template-columns: ${gridCols}; grid-template-rows: repeat(6, 1fr);" dir="ltr">`;

    for (let s = 0; s < 6; s++) {
        for (let f = startFret; f <= endFret; f++) {
            let noteIdx = (afinacaoIndices[s] + f) % 12;
            let note = notasCromaticas[noteIdx];
            let isScale = scaleData.notes.has(note); 
            let isRoot = note === scaleData.root;    

            let bgCls = (f === 0 || f === 12) ? 'bg-gray-200' : '';
            let borderCls = 'border-l border-gray-400'; 

            if (f === 0) borderCls = 'border-l-8 border-gray-500';
            if (f === startFret && f !== 0) borderCls = 'border-l-2 border-gray-500';
            if (f === endFret) borderCls += ' border-r border-gray-600';

            html += `<div class="fret-cell ${bgCls} ${borderCls} flex items-center justify-center min-h-[38px]"><div class="string-line"></div>`;

            if (isScale) {
                let noteId = `note-${diagramId}-${s}-${f}`;
                let isActive = activeNoteIds && activeNoteIds.has(noteId);
                let bgDot = 'bg-gray-300 text-gray-500 border border-gray-400';
                if (isActive) bgDot = isRoot ? 'bg-red-600' : 'bg-black'; 

                html += `<div id="${noteId}" class="note-dot ${bgDot}">${note}</div>`;
            }
            html += `</div>`; 
        }
    }
    html += `</div></div>`; 

    if (numberPos === 'bottom') {
        html += `<div class="flex mt-1">`;
        if (showTuningLabels) html += `<div class="w-[35px] flex-shrink-0"></div>`;
        html += `<div class="flex-1 grid" style="grid-template-columns: ${gridCols};" dir="ltr">`;
        for (let f = startFret; f <= endFret; f++) {
            let isTarget = f === 5 || f === 12;
            let textCls = isTarget ? 'font-bold text-sm text-black' : 'text-xs text-gray-500';
            html += `<div class="text-center flex items-center justify-center ${textCls}">${f}</div>`;
        }
        html += `</div></div>`;
    }

    html += `</div>`;
    return html; 
}

function clearPlaybackHighlight() {
    if (playbackState.lastHighlightedNote) {
        let el = document.getElementById(playbackState.lastHighlightedNote);
        if (el) el.classList.remove('playing-note');
        playbackState.lastHighlightedNote = null;
    }
}

function stopPlayback() {
    if (playbackState.timeoutId) clearTimeout(playbackState.timeoutId);
    
    if (playbackState.countdownIntervalId) {
        clearInterval(playbackState.countdownIntervalId);
        playbackState.countdownIntervalId = null;
    }
    
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) overlay.classList.add('hidden');
    
    clearPlaybackHighlight();

    document.querySelectorAll('[id^="diagram-"]').forEach(el => el.classList.remove('challenge-hide-notes'));

    document.querySelectorAll('[id^="btn-play-"]').forEach(btn => {
        btn.querySelector('.icon-play').classList.remove('hidden');
        btn.querySelector('.icon-stop').classList.add('hidden');
        let textEl = btn.querySelector('.btn-text');
        if (textEl) {
            let isMain = btn.id === 'btn-play-main';
            textEl.innerText = isMain ? t('btn_play_full') : t('btn_play');
            textEl.dataset.originalText = textEl.innerText;
        }
        btn.classList.replace('bg-red-50', 'bg-blue-50');
        btn.classList.replace('text-red-700', 'text-blue-700');
        btn.classList.replace('border-red-200', 'border-blue-200');
    });

    playbackState.playing = false;
    playbackState.diagramId = null;
}

function playNextNote() {
    if (!playbackState.playing) return; 

    let seq = playbackState.sequence;
    
    if (!seq || seq.length === 0) {
        stopPlayback();
        return;
    }

    if (playbackState.currentIndex >= seq.length) {
        playbackState.currentIndex = 0;
        playbackState.cycleCount++;

        const autoBpmToggle = document.getElementById('auto-bpm-toggle');
        if (autoBpmToggle && autoBpmToggle.checked) {
            const cyclesTarget = parseInt(document.getElementById('auto-bpm-cycles').value) || 1;
            if (playbackState.cycleCount % cyclesTarget === 0) {
                const currentBpm = parseInt(document.getElementById('bpm').value) || 120;
                if (currentBpm < 300) changeBPM(10); 
            }
        }
    }

    clearPlaybackHighlight();

    let isChallengeOn = document.getElementById('desafio').checked;
    let isPositionDiagram = playbackState.diagramId && playbackState.diagramId.startsWith('pos-');

    let cyclePhase = isChallengeOn && isPositionDiagram ? (playbackState.cycleCount % 12) : 0;
    
    let hideHighlight = cyclePhase >= 8;
    let hideNotes = cyclePhase >= 10;

    let diagramEl = document.getElementById(`diagram-${playbackState.diagramId}`);
    if (diagramEl) {
        if (hideNotes) diagramEl.classList.add('challenge-hide-notes'); 
        else diagramEl.classList.remove('challenge-hide-notes');
    }

    let currentNote = seq[playbackState.currentIndex];
    let noteEl = document.getElementById(currentNote.id);
    
    if (noteEl && !hideHighlight && !hideNotes) {
        noteEl.classList.add('playing-note');
        playbackState.lastHighlightedNote = currentNote.id; 
    }

    playPluck(currentNote.string, currentNote.fret);
    playbackState.currentIndex++; 

    let bpm = parseInt(document.getElementById('bpm').value) || 120;
    let msPerBeat = 60000 / bpm; 

    playbackState.timeoutId = setTimeout(playNextNote, msPerBeat);
}

function startCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const numberEl = document.getElementById('countdown-number');
    let count = 3; 
    
    numberEl.innerText = count + '..'; 
    overlay.classList.remove('hidden'); 

    playbackState.countdownIntervalId = setInterval(() => {
        count--; 
        
        if (count > 0) {
            numberEl.innerText = count + '..';
        } else {
            clearInterval(playbackState.countdownIntervalId);
            playbackState.countdownIntervalId = null;
            overlay.classList.add('hidden'); 
            
            if (playbackState.playing) {
                callback();
            }
        }
    }, 1000); 
}

function togglePlay(diagramId, startFret, endFret) {
    let scaleData = getScaleData();
    if (!scaleData) return; 

    if (playbackState.playing && playbackState.diagramId === diagramId) {
        stopPlayback();
    } else {
        stopPlayback();
        
        playbackState.diagramId = diagramId;
        playbackState.sequence = playbackState.sequences[diagramId] || [];
        playbackState.currentIndex = 0;
        playbackState.cycleCount = 0; 
        playbackState.playing = true; 

        let diagramEl = document.getElementById(`diagram-${diagramId}`);
        if (diagramEl) diagramEl.classList.remove('challenge-hide-notes');

        let btn = document.getElementById(`btn-play-${diagramId}`);
        btn.querySelector('.icon-play').classList.add('hidden');
        btn.querySelector('.icon-stop').classList.remove('hidden');
        let textEl = btn.querySelector('.btn-text');
        if (textEl) {
            textEl.dataset.originalText = textEl.innerText;
            textEl.innerText = t('btn_stop');
        }
        btn.classList.replace('bg-blue-50', 'bg-red-50');
        btn.classList.replace('text-blue-700', 'text-red-700');
        btn.classList.replace('border-blue-200', 'border-red-200');

        initAudio();    
        
        startCountdown(() => {
            playNextNote(); 
        });
    }
}

function updateUI() {
    stopPlayback(); 

    const scaleData = getScaleData(); 
    if (!scaleData) return; 

    const exercicioId = document.getElementById('exercicio').value;
    const filtroCordas = document.getElementById('filtro-cordas').value; 
    playbackState.sequences = {};

    const windows = getPositionWindows(scaleData.rootIdx, scaleData.cagedOffset);

    let mainFullSequence = [];
    let mainActiveIds = new Set();

    windows.forEach((win, index) => {
        let data = generateExerciseData('main', win[0], win[1], scaleData, exercicioId, filtroCordas);
        mainFullSequence = mainFullSequence.concat(data.sequence); 
        data.activeNoteIds.forEach(id => mainActiveIds.add(id));
    });

    playbackState.sequences['main'] = mainFullSequence;

    const mainFretboard = document.getElementById('main-fretboard');
    mainFretboard.innerHTML = renderGuitarFretboard('main', 0, 15, scaleData, false, 'bottom', mainActiveIds);

    const positionsContainer = document.getElementById('positions-container');
    positionsContainer.innerHTML = ''; 

    windows.forEach((win, index) => {
        let [start, end] = win; 
        let diagId = `pos-${index}`; 

        let data = generateExerciseData(diagId, start, end, scaleData, exercicioId, filtroCordas);
        playbackState.sequences[diagId] = data.sequence;

        let positionWrapper = document.createElement('div');
        positionWrapper.className = 'flex flex-col';

        let headerDiv = document.createElement('div');
        headerDiv.className = 'flex items-center justify-center gap-2 mb-2';
        headerDiv.innerHTML = `
            <button id="btn-play-${diagId}" onclick="togglePlay('${diagId}', ${start}, ${end})" class="flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors flex-shrink-0" style="width: 22px; height: 22px;" title="${t('btn_play')}">
                <svg class="icon-play" style="width: 11px; height: 11px; margin-left: 1.5px;" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                <svg class="icon-stop hidden" style="width: 11px; height: 11px;" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5h10v10H5z"></path></svg>
            </button>
            <span class="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">${t('position')} ${index + 1} (${t('frets')} ${start}-${end})</span>
        `;

        let fretboardDiv = document.createElement('div');
        fretboardDiv.innerHTML = renderGuitarFretboard(diagId, start, end, scaleData, false, 'bottom', data.activeNoteIds);

        positionWrapper.appendChild(headerDiv);
        positionWrapper.appendChild(fretboardDiv);

        positionsContainer.appendChild(positionWrapper);
    });
}

document.getElementById('tom').addEventListener('change', function() {
    document.getElementById('tom-display').innerText = this.options[this.selectedIndex].text;
    updateUI();
});

document.getElementById('escala').addEventListener('change', function() {
    document.getElementById('escala-display').innerText = this.options[this.selectedIndex].text;
    atualizarModos(true); 
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

document.getElementById('bpm').addEventListener('input', function() {
    if (this.value < 40) this.value = 40;
    if (this.value > 300) this.value = 300;
});

document.getElementById('volume-slider').addEventListener('input', function(e) {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 80; 
    globalVolume = val / 100;
});

function changeBPM(amount) {
    const bpmInput = document.getElementById('bpm');
    let currentVal = parseInt(bpmInput.value) || 120;
    let newVal = currentVal + amount;
    if (newVal < 40) newVal = 40;
    if (newVal > 300) newVal = 300;
    bpmInput.value = newVal; 
}
document.getElementById('btn-bpm-minus').addEventListener('click', () => changeBPM(-10));
document.getElementById('btn-bpm-plus').addEventListener('click', () => changeBPM(10));

document.getElementById('auto-bpm-toggle').addEventListener('change', function() {
    const selectEl = document.getElementById('auto-bpm-cycles');
    const arrowEl = document.getElementById('auto-bpm-arrow');
    if (this.checked) {
        selectEl.disabled = false;
        selectEl.classList.remove('opacity-50', 'cursor-not-allowed');
        arrowEl.classList.remove('opacity-30');
        arrowEl.classList.add('opacity-100');
    } else {
        selectEl.disabled = true;
        selectEl.classList.add('opacity-50', 'cursor-not-allowed');
        arrowEl.classList.remove('opacity-100');
        arrowEl.classList.add('opacity-30');
    }
});

async function initApp() { 
    const userLang = (navigator.language || navigator.userLanguage).split('-')[0].toLowerCase();
    
    if (i18n[userLang] && langMetadata[userLang]) {
        currentLang = userLang;
    }

    try {
        const response = await fetch('help.html');
        if (response.ok) {
            const htmlText = await response.text();
            document.getElementById('help-container').innerHTML = htmlText;
            
            const closeHelpBtn = document.getElementById('close-help-btn');
            if (closeHelpBtn) closeHelpBtn.addEventListener('click', closeHelp);
        }
    } catch (error) {
        console.warn("⚠️ O ficheiro help.html não foi carregado. Provavelmente abriu via duplo-clique (file://). Use um servidor local (ex: Live Server) para suportar múltiplos ficheiros.");
    }

    const langListEl = document.getElementById('lang-menu-list');
    langListEl.innerHTML = '';
    Object.keys(langMetadata).forEach(code => {
        const btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors';
        btn.innerHTML = `${langMetadata[code].svg} <span>${langMetadata[code].name}</span>`;
        btn.onclick = (e) => { e.preventDefault(); setLang(code, langMetadata[code].name); };
        langListEl.appendChild(btn);
    });

    document.getElementById('current-flag').innerHTML = langMetadata[currentLang].svg;
    document.getElementById('current-lang-name').innerText = langMetadata[currentLang].name;

    applyLanguage(); 
}

initApp(); 
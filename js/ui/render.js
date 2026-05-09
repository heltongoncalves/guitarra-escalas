/**
 * ========================================================================
 * MOTOR DE RENDERIZAÇÃO DOM
 * ========================================================================
 */

function calcularDedo(fret, start, end, activeFretsInWindow) {
    if (fret === 0) return "0"; 

    const trastesComNotas = Array.from(activeFretsInWindow).filter(f => f > 0).sort((a,b) => a-b);
    if (trastesComNotas.length === 0) return "";

    const minFret = Math.min(...trastesComNotas);
    const maxFret = Math.max(...trastesComNotas);
    const amplitude = maxFret - minFret + 1;

    if (amplitude <= 4) {
        return (fret - minFret + 1).toString();
    } else {
        if (fret === minFret || fret === minFret + 1) return "1";
        if (fret === minFret + 2) return "2";
        if (fret === minFret + 3) return "3";
        if (fret === minFret + 4) return "4";
    }
    return "";
}

// NOVO PARÂMETRO: inverterCordas = false (valor padrão)
function renderGuitarFretboard(diagramId, startFret, endFret, scaleData, showTuningLabels, numberPos, activeNoteIds, mostrarDigitacao, allPositionsData, inverterCordas = false) {
    
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

    // Ajusta a barra lateral de afinação caso ativada
    if (showTuningLabels) {
        html += `<div class="w-[35px] flex-shrink-0 grid" style="grid-template-rows: repeat(6, 1fr);" dir="ltr">`;
        for (let visual_s = 0; visual_s < 6; visual_s++) {
            let s = inverterCordas ? 5 - visual_s : visual_s;
            let openNote = notasCromaticas[afinacaoIndices[s]];
            html += `<div class="flex items-center justify-center"><div class="tuning-dot">${openNote}</div></div>`;
        }
        html += `</div>`;
    }

    const trastesAtivosNestaJanela = new Set();
    if (activeNoteIds) {
        activeNoteIds.forEach(id => {
            let parts = id.split('-');
            let f = parseInt(parts[parts.length - 1]);
            if (!isNaN(f) && f >= startFret && f <= endFret) {
                trastesAtivosNestaJanela.add(f);
            }
        });
    }

    let mainFingers = {};
    if (diagramId === 'main' && allPositionsData) {
        allPositionsData.forEach((pos, pIndex) => {
            pos.activeNotes.forEach(noteSF => {
                let f = parseInt(noteSF.split('-')[1]);
                let finger = calcularDedo(f, pos.start, pos.end, pos.activeFrets);
                if (!mainFingers[noteSF]) mainFingers[noteSF] = {};
                mainFingers[noteSF][pIndex] = finger;
            });
        });
    }

    html += `<div class="flex-1 grid border-t border-b border-gray-600 bg-white shadow-sm" style="grid-template-columns: ${gridCols}; grid-template-rows: repeat(6, 1fr);" dir="ltr">`;

    // LOOP PRINCIPAL DE RENDERIZAÇÃO
    for (let visual_s = 0; visual_s < 6; visual_s++) {
        
        // Define qual corda matemática (0 a 5) será desenhada nesta linha visual
        let s = inverterCordas ? 5 - visual_s : visual_s;
        
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

            // NOVO: Adicionado 'string-${s+1}' para garantir que a grossura da linha CSS acompanhe a corda real!
            html += `<div class="fret-cell string-${s+1} ${bgCls} ${borderCls} flex items-center justify-center min-h-[38px]"><div class="string-line"></div>`;

            if (isScale) {
                // A nota continua guardando o ID musical exato, o que protege a integridade do sequenciador de áudio
                let noteId = `note-${diagramId}-${s}-${f}`;
                let isActive = activeNoteIds && activeNoteIds.has(noteId);
                let bgDot = 'bg-gray-300 text-gray-500 border border-gray-400';
                if (isActive) bgDot = isRoot ? 'bg-red-600' : 'bg-black'; 

                let labelNota = note; 
                let labelDedo = ""; 
                let fingerDataAttr = "";

                if (mostrarDigitacao && isActive) {
                    if (diagramId === 'main' && mainFingers[`${s}-${f}`]) {
                        let fingersForNote = mainFingers[`${s}-${f}`];
                        let firstPos = Object.keys(fingersForNote).sort((a,b) => parseInt(a)-parseInt(b))[0];
                        labelDedo = fingersForNote[firstPos];
                        Object.keys(fingersForNote).forEach(pIdx => {
                            fingerDataAttr += ` data-pos-${pIdx}="${fingersForNote[pIdx]}"`;
                        });
                    } else {
                        labelDedo = calcularDedo(f, startFret, endFret, trastesAtivosNestaJanela);
                    }
                }

                html += `<div id="${noteId}" class="note-dot ${bgDot}">
                    <span class="note-label">${labelNota}</span>
                    ${mostrarDigitacao && isActive && labelDedo !== "" ? `<span class="finger-hint ${diagramId === 'main' ? 'dynamic-finger' : ''}"${fingerDataAttr}>${labelDedo}</span>` : ''}
                </div>`;
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
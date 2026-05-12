/**
 * ========================================================================
 * MOTOR DE RENDERIZAÇÃO DOM
 * ========================================================================
 */

// NOVO ALGORITMO: Calcula a digitação olhando corda por corda para evitar repetições
function calcularDedoPorCorda(fret, string, activeNoteIds) {
    if (fret === 0) return "0";

    let todosTrastes = [];
    let trastesNaCorda = [];
    
    // Coleta todos os trastes ativos na caixa para achar o dedo âncora (minFret global)
    if (activeNoteIds) {
        activeNoteIds.forEach(id => {
            let parts = id.split('-'); // ex: note-pos-0-5-3 (diagram-s-f)
            let s = parseInt(parts[parts.length - 2]);
            let f = parseInt(parts[parts.length - 1]);
            if (f > 0) {
                todosTrastes.push(f);
                if (s === string) trastesNaCorda.push(f);
            }
        });
    }

    trastesNaCorda.sort((a, b) => a - b);
    if (trastesNaCorda.length === 0) return "";

    let minFretGeral = Math.min(...todosTrastes);

    // Lógica para 3 notas na mesma corda (Padrões de escala diatônica)
    if (trastesNaCorda.length === 3) {
        if (fret === trastesNaCorda[0]) return "1";
        if (fret === trastesNaCorda[2]) return "4";
        
        // O dedo do meio depende de onde está o maior "salto" (gap) de trastes
        let gap1 = trastesNaCorda[1] - trastesNaCorda[0];
        let gap2 = trastesNaCorda[2] - trastesNaCorda[1];
        if (gap1 === 1 && gap2 === 2) return "2"; // Ex: casas 2, 3, 5 -> usa dedos 1, 2, 4
        if (gap1 === 2 && gap2 === 1) return "3"; // Ex: casas 2, 4, 5 -> usa dedos 1, 3, 4
        return "2"; // Fallback
    }

    // Lógica para 2 notas na mesma corda (Padrões de Pentatônica ou extremidades)
    if (trastesNaCorda.length === 2) {
        let rel1 = trastesNaCorda[0] - minFretGeral;
        // Se a nota cai na "casa âncora", usa o dedo 1. Se cai uma frente, dedo 2...
        let f1 = (rel1 === 0) ? 1 : (rel1 === 1 ? 2 : (rel1 === 2 ? 3 : 1));
        
        if (fret === trastesNaCorda[0]) return f1.toString();
        if (fret === trastesNaCorda[1]) {
            let gap = trastesNaCorda[1] - trastesNaCorda[0];
            let f2 = f1 + gap;
            if (f2 > 4) f2 = 4; // Limita ao dedo mindinho
            return f2.toString();
        }
    }

    // Lógica para 1 nota solitária na corda
    if (trastesNaCorda.length === 1) {
        let rel = fret - minFretGeral;
        let f1 = rel + 1;
        if (f1 > 4) f1 = 4;
        return f1.toString();
    }

    // Proteção para escalas cromáticas (mais de 3 notas por corda)
    if (trastesNaCorda.length > 3) {
        let idx = trastesNaCorda.indexOf(fret);
        let f1 = idx + 1;
        if (f1 > 4) f1 = 4;
        return f1.toString();
    }

    return "";
}

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

    if (showTuningLabels) {
        html += `<div class="w-[35px] flex-shrink-0 grid" style="grid-template-rows: repeat(6, 1fr);" dir="ltr">`;
        for (let visual_s = 0; visual_s < 6; visual_s++) {
            let s = inverterCordas ? 5 - visual_s : visual_s;
            let openNote = notasCromaticas[afinacaoIndices[s]];
            html += `<div class="flex items-center justify-center"><div class="tuning-dot">${openNote}</div></div>`;
        }
        html += `</div>`;
    }

    let mainFingers = {};
    if (diagramId === 'main' && allPositionsData) {
        allPositionsData.forEach((pos, pIndex) => {
            // Cria um Set falso apenas para a função de cálculo não falhar no parser de string
            let fakeIds = new Set(Array.from(pos.activeNotes).map(sf => `note-fake-${sf}`));
            pos.activeNotes.forEach(noteSF => {
                let s = parseInt(noteSF.split('-')[0]);
                let f = parseInt(noteSF.split('-')[1]);
                let finger = calcularDedoPorCorda(f, s, fakeIds);
                if (!mainFingers[noteSF]) mainFingers[noteSF] = {};
                mainFingers[noteSF][pIndex] = finger;
            });
        });
    }

    html += `<div class="flex-1 grid border-t border-b border-gray-600 bg-white shadow-sm" style="grid-template-columns: ${gridCols}; grid-template-rows: repeat(6, 1fr);" dir="ltr">`;

    for (let visual_s = 0; visual_s < 6; visual_s++) {
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

            html += `<div class="fret-cell string-${s+1} ${bgCls} ${borderCls} flex items-center justify-center min-h-[38px]"><div class="string-line"></div>`;

            if (isScale) {
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
                        // Chama o novo algoritmo
                        labelDedo = calcularDedoPorCorda(f, s, activeNoteIds);
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
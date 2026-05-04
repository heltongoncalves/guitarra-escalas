/**
 * ========================================================================
 * MOTOR DE RENDERIZAÇÃO DOM
 * ========================================================================
 * Responsabilidade: Receber dados matemáticos e injetar código HTML
 * desenhando fisicamente as cordas, trastes e bolinhas de notas.
 */

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
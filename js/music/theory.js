/**
 * ========================================================================
 * TEORIA MUSICAL E ALGORITMOS (CAGED E COREOGRAFIAS)
 * ========================================================================
 */

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
    const baseWindows = [
        [0, 4],   
        [2, 6],   
        [4, 8],   
        [7, 11],  
        [9, 13]   
    ];

    let windows = [];
    for (let i = 0; i < 5; i++) {
        let start = baseWindows[i][0] + rootIdx + cagedOffset;
        let end = baseWindows[i][1] + rootIdx + cagedOffset;
        
        while (start >= 12) {
            start -= 12;
            end -= 12;
        }
        while (start < 0) {
            start += 12;
            end += 12;
        }
        windows.push([start, end]);
    }

    windows.sort((a, b) => a[0] - b[0]);

    let uniqueWindows = [];
    let seenStarts = new Set();
    windows.forEach(w => {
        if (!seenStarts.has(w[0])) {
            seenStarts.add(w[0]);
            uniqueWindows.push(w);
        }
    });

    if (uniqueWindows.length < 5) uniqueWindows = [ [0,4], [2,6], [4,8], [7,11], [9,13] ];

    return uniqueWindows.slice(0, 5); 
}

function generateExerciseData(diagramId, startFret, endFret, scaleData, exercicio, filtroCordas) {
    let baseNotes = [];
    // Matriz de semitons absolutos da afinação padrão para detectar uníssonos
    const stringSemitones = [24, 19, 15, 10, 5, 0]; 
    let tempNotes = [];

    for (let s = 5; s >= 0; s--) { 
        for (let f = startFret; f <= endFret; f++) {
            let noteIdx = (afinacaoIndices[s] + f) % 12;
            let note = notasCromaticas[noteIdx];
            
            if (scaleData.notes.has(note)) { 
                let pitch = openStringFreqs[s] * Math.pow(2, f / 12); 
                let absPitch = stringSemitones[s] + f; // Identidade exata da nota e oitava
                tempNotes.push({ string: s, fret: f, id: `note-${diagramId}-${s}-${f}`, noteIdx: noteIdx, pitch: pitch, absPitch: absPitch });
            }
        }
    }

    // --- NOVO: FILTRO DE UNÍSSONOS (Notas Repetidas) ---
    // Aplica a regra de não repetição apenas nos blocos CAGED, mantendo a Escala Completa intacta
    if (diagramId !== 'main') {
        let pitchMap = new Map();
        tempNotes.forEach(n => {
            if (!pitchMap.has(n.absPitch)) {
                pitchMap.set(n.absPitch, n);
            } else {
                let existing = pitchMap.get(n.absPitch);
                // Dá preferência ao menor traste (o que elege a corda solta 0 como vencedora absoluta)
                if (n.fret < existing.fret) {
                    pitchMap.set(n.absPitch, n);
                }
            }
        });
        baseNotes = Array.from(pitchMap.values());
    } else {
        baseNotes = tempNotes;
    }
    // ---------------------------------------------------

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
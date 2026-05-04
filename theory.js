/**
 * ========================================================================
 * TEORIA MUSICAL E ALGORITMOS (CAGED E COREOGRAFIAS)
 * ========================================================================
 * Responsabilidade: Ler as escolhas do utilizador e calcular quais notas
 * pertencem à escala e onde estão fisicamente no braço da guitarra.
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
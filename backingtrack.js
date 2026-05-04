/**
 * ========================================================================
 * LÓGICA DE HARMONIA E BACKING TRACK
 * ========================================================================
 */

// Função matemática que calcula a progressão de acordes
function getBackingTrackInfo() {
    const tom = document.getElementById('tom').value; 
    const categoria = document.getElementById('escala').value; 
    const modo = document.getElementById('modo').value; 

    const notasBase = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIdx = notasBase.indexOf(tom);
    
    const getNote = (interval) => notasBase[(rootIdx + interval) % 12];

    let chords = "";
    let descKey = "";
    let defaultDesc = "";
    let suffix = "";

    if (categoria === 'Modos Gregos' || categoria === 'Pentatônica') {
        if (modo.includes('Jônio') || modo === 'Maior') {
            chords = `${getNote(0)} | ${getNote(9)}m | ${getNote(5)} | ${getNote(7)}`; 
            descKey = 'bt_desc_1'; defaultDesc = 'Progressão Pop/Rock Clássica'; suffix = " (I - vi - IV - V)";
        } else if (modo.includes('Dórico')) {
            chords = `${getNote(0)}m7 | ${getNote(5)}7`; 
            descKey = 'bt_desc_2'; defaultDesc = 'Vamp Groove Dórico'; suffix = " (im7 - IV7)";
        } else if (modo.includes('Frígio')) {
            chords = `${getNote(0)}m | ${getNote(1)}`; 
            descKey = 'bt_desc_3'; defaultDesc = 'Vamp Frígio / Metal'; suffix = " (im - bII)";
        } else if (modo.includes('Lídio')) {
            chords = `${getNote(0)} | ${getNote(2)}`; 
            descKey = 'bt_desc_4'; defaultDesc = 'Vamp Lídio / Sonhador'; suffix = " (I - II)";
        } else if (modo.includes('Mixolídio')) {
            chords = `${getNote(0)}7 | ${getNote(10)} | ${getNote(5)}`; 
            descKey = 'bt_desc_5'; defaultDesc = 'Clássico Rock do Sul'; suffix = " (I7 - bVII - IV)";
        } else if (modo.includes('Eólio') || modo === 'Menor') {
            chords = `${getNote(0)}m | ${getNote(8)} | ${getNote(10)}`; 
            descKey = 'bt_desc_6'; defaultDesc = 'Rock Menor Épico'; suffix = " (im - VI - VII)";
        } else if (modo.includes('Lócrio')) {
            chords = `${getNote(0)}m7b5 | ${getNote(1)}m`; 
            descKey = 'bt_desc_7'; defaultDesc = 'Tensão Sombria'; suffix = " (im7b5 - bIIm)";
        }
    } else if (categoria === 'Escala Blues') {
        if (modo === 'Maior') {
            chords = `${getNote(0)}7 | ${getNote(5)}7 | ${getNote(7)}7`; 
            descKey = 'bt_desc_8'; defaultDesc = 'Blues Texas / Country'; suffix = " (I7 - IV7 - V7)";
        } else {
            chords = `${getNote(0)}m7 | ${getNote(5)}m7 | ${getNote(7)}m7`; 
            descKey = 'bt_desc_9'; defaultDesc = 'Blues Menor Tradicional'; suffix = " (im7 - iv7 - vm7)";
        }
    } else if (categoria === 'Menor Harmônica') {
        chords = `${getNote(0)}m | ${getNote(7)}7`; 
        descKey = 'bt_desc_10'; defaultDesc = 'Tensão Neoclássica / Flamenco'; suffix = " (im - V7)";
    } else if (categoria === 'Menor Melódica') {
        chords = `${getNote(0)}m(maj7) | ${getNote(5)}7`; 
        descKey = 'bt_desc_11'; defaultDesc = 'Jazz Menor / Fusion'; suffix = " (im(maj7) - IV7)";
    } else if (categoria === 'Escalas Simétricas') {
        if (modo.includes('Diminuta')) {
            chords = `${getNote(0)}dim7`;
            descKey = 'bt_desc_12'; defaultDesc = 'Tensão Contínua (Acorde Diminuto Estático)'; suffix = "";
        } else {
            chords = `${getNote(0)}aug`;
            descKey = 'bt_desc_13'; defaultDesc = 'Atmosfera Hexafônica (Acorde Aumentado Estático)'; suffix = "";
        }
    } else {
        chords = `${getNote(0)}`;
        descKey = 'bt_desc_14'; defaultDesc = 'Vamp Estático / Drone'; suffix = "";
    }

    // Tenta traduzir usando a chave, mas se falhar (retorna a própria chave), utiliza o Fallback Padrão
    let stylePrefix = "Estilo:";
    if (typeof t === 'function') {
        const transPrefix = t('bt_style');
        if (transPrefix && transPrefix !== 'bt_style') stylePrefix = transPrefix;
    }

    let descriptionText = defaultDesc;
    if (typeof t === 'function') {
        const transDesc = t(descKey);
        if (transDesc && transDesc !== descKey) descriptionText = transDesc;
    }

    const description = `${stylePrefix} ${descriptionText}${suffix}`;

    return { chords, description };
}

// Atualiza dinamicamente o texto do botão de backing track
function updateBackingTrackButton() {
    const info = getBackingTrackInfo();
    const btnTextEl = document.getElementById('bt-button-text');
    if (btnTextEl) {
        const formattedChords = info.chords.replace(/\|/g, '  |  ');
        
        // Garante que a etiqueta só altera se a tradução for bem sucedida
        let lbl = 'Backing Track';
        if (typeof t === 'function') {
            const transLbl = t('lbl_backing_track');
            if (transLbl && transLbl !== 'lbl_backing_track') lbl = transLbl;
        }
        
        btnTextEl.innerText = `${lbl}: ${formattedChords}`;
    }
    
    // Atualiza o modal caso esteja aberto
    const chordsEl = document.getElementById('bt-chords');
    const descEl = document.getElementById('bt-desc');
    if (chordsEl) chordsEl.innerText = info.chords.replace(/\|/g, '  |  ');
    if (descEl) descEl.innerText = info.description;
}

function showBackingTrack() {
    updateBackingTrackButton(); 
    document.getElementById('bt-modal').classList.remove('hidden');
}

document.addEventListener('click', (e) => {
    const btModal = document.getElementById('bt-modal');
    if (btModal && e.target === btModal) btModal.classList.add('hidden');
});

document.getElementById('tom').addEventListener('change', updateBackingTrackButton);
document.getElementById('escala').addEventListener('change', updateBackingTrackButton);
document.getElementById('modo').addEventListener('change', updateBackingTrackButton);

setTimeout(updateBackingTrackButton, 200);
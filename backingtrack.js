/**
 * ========================================================================
 * LÓGICA DE HARMONIA E BACKING TRACK
 * ========================================================================
 */

function getBackingTrackInfo() {
    const tomEl = document.getElementById('tom');
    const categoriaEl = document.getElementById('escala');
    const modoEl = document.getElementById('modo');

    if (!tomEl || !categoriaEl || !modoEl) return { chords: "", description: "" };

    const tom = tomEl.value; 
    const categoria = categoriaEl.value; 
    const modo = modoEl.value; 

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

function generateHarmonicField(tom, categoria, modo) {
    const notasBase = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIdx = notasBase.indexOf(tom);
    
    if (typeof bancoDeEscalas === 'undefined' || !bancoDeEscalas[categoria] || !bancoDeEscalas[categoria][modo]) return "";

    const intervals = bancoDeEscalas[categoria][modo].i;
    
    // CORREÇÃO: Em vez de devolver vazio para ocultar o bloco, envia um aviso visual e intuitivo!
    if (intervals.length !== 7) {
        const warning = typeof t === 'function' ? t('hf_not_applicable') : 'Campo harmônico diatônico não aplicável para esta escala.';
        return `<p class="text-gray-500 italic mt-2">${warning}</p>`;
    }

    const scaleNotes = intervals.map(interval => notasBase[(rootIdx + interval) % 12]);
    const romanUpper = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const romanLower = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
    
    const noteNamesPt = {'C':'Dó', 'C#':'Dó#', 'D':'Ré', 'D#':'Ré#', 'E':'Mi', 'F':'Fá', 'F#':'Fá#', 'G':'Sol', 'G#':'Sol#', 'A':'Lá', 'A#':'Lá#' , 'B':'Si'};
    
    const getDesc = (note, type) => {
        if (typeof currentLang !== 'undefined' && currentLang !== 'pt') return "";
        let name = noteNamesPt[note];
        if (type === "") return `(${name} maior)`;
        if (type === "m") return `(${name} menor)`;
        if (type === "°") return `(${name} diminuto)`;
        if (type === "+") return `(${name} aumentado)`;
        return "";
    };

    let html = '<ul class="space-y-3 mt-2 pl-2">';
    
    for (let d = 0; d < 7; d++) {
        let rootNote = scaleNotes[d];
        let thirdNote = scaleNotes[(d + 2) % 7];
        let fifthNote = scaleNotes[(d + 4) % 7];
        
        let rIdx = notasBase.indexOf(rootNote);
        let tIdx = notasBase.indexOf(thirdNote);
        let fIdx = notasBase.indexOf(fifthNote);
        
        let dist3 = (tIdx - rIdx + 12) % 12; 
        let dist5 = (fIdx - rIdx + 12) % 12; 
        
        let chordType = "";
        let roman = "";
        
        if (dist3 === 4 && dist5 === 7) {
            chordType = ""; roman = romanUpper[d]; 
        } else if (dist3 === 3 && dist5 === 7) {
            chordType = "m"; roman = romanLower[d]; 
        } else if (dist3 === 3 && dist5 === 6) {
            chordType = "°"; roman = romanLower[d] + "°"; 
        } else if (dist3 === 4 && dist5 === 8) {
            chordType = "+"; roman = romanUpper[d] + "+"; 
        } else {
            chordType = "?"; roman = romanUpper[d]; 
        }
        
        const degreeLbl = typeof t === 'function' ? t('lbl_degree') : 'Grau';
        const desc = getDesc(rootNote, chordType);
        const descHtml = desc ? ` <span class="text-gray-600 font-normal italic text-xs ml-1">${desc}</span>` : '';
        
        html += `<li class="flex items-center py-1 border-b border-gray-100 last:border-0">
                    <span class="w-24 flex-shrink-0 text-gray-800 font-bold">• ${roman} (${d+1}º ${degreeLbl}):</span> 
                    <span class="font-bold text-blue-700 text-base ml-2">${rootNote}${chordType}</span>
                    ${descHtml}
                    <span class="text-xs text-gray-500 ml-auto">- ${rootNote}, ${thirdNote}, ${fifthNote}</span>
                 </li>`;
    }
    
    html += '</ul>';
    return html;
}

function updateBackingTrackButton() {
    const info = getBackingTrackInfo();
    const btnTextEl = document.getElementById('bt-button-text');
    
    if (btnTextEl) {
        const formattedChords = info.chords.replace(/\|/g, '  |  ');
        let lbl = 'Backing Track';
        if (typeof t === 'function') {
            const transLbl = t('lbl_backing_track');
            if (transLbl && transLbl !== 'lbl_backing_track') lbl = transLbl;
        }
        btnTextEl.innerText = `${lbl}: ${formattedChords}`;
    }
    
    const chordsEl = document.getElementById('bt-chords');
    const descEl = document.getElementById('bt-desc');
    const hfEl = document.getElementById('bt-harmonic-field');
    const hfSection = document.getElementById('bt-harmonic-section');
    
    if (chordsEl) chordsEl.innerText = info.chords.replace(/\|/g, '  |  ');
    if (descEl) descEl.innerText = info.description;
    
    if (hfEl && hfSection) {
        const tomEl = document.getElementById('tom');
        const categoriaEl = document.getElementById('escala');
        const modoEl = document.getElementById('modo');
        
        if(tomEl && categoriaEl && modoEl) {
            const hfContent = generateHarmonicField(tomEl.value, categoriaEl.value, modoEl.value);
            
            // Agora garantimos que NUNCA adiciona a classe 'hidden'. Assim você verá sempre o título da área!
            hfEl.innerHTML = hfContent;
            hfSection.classList.remove('hidden');
        }
    }
}

function showBackingTrack() {
    updateBackingTrackButton(); 
    const modal = document.getElementById('bt-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

document.addEventListener('click', (e) => {
    const btModal = document.getElementById('bt-modal');
    if (btModal && e.target === btModal) btModal.classList.add('hidden');
});

const tomEl = document.getElementById('tom');
const escalaEl = document.getElementById('escala');
const modoEl = document.getElementById('modo');

if (tomEl) tomEl.addEventListener('change', updateBackingTrackButton);
if (escalaEl) escalaEl.addEventListener('change', updateBackingTrackButton);
if (modoEl) modoEl.addEventListener('change', updateBackingTrackButton);

setTimeout(updateBackingTrackButton, 200);
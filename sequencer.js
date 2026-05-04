/**
 * ========================================================================
 * SEQUENCIADOR E ANIMAÇÕES MUSICAIS (PLAYBACK)
 * ========================================================================
 * Responsabilidade: Manter o estado da música (a tocar/parada),
 * gerir a árvore temporal (`setTimeout`) e a animação neon nas notas.
 */

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

    // Chama o módulo de audio.js
    if (typeof playPluck === 'function') {
        playPluck(currentNote.string, currentNote.fret);
    }
    
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
            textEl.innerText = t('btn_stop');
        }
        btn.classList.replace('bg-blue-50', 'bg-red-50');
        btn.classList.replace('text-blue-700', 'text-red-700');
        btn.classList.replace('border-blue-200', 'border-red-200');

        if (typeof initAudio === 'function') initAudio();    
        
        startCountdown(() => {
            playNextNote(); 
        });
    }
}
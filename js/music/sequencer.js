/**
 * ========================================================================
 * SEQUENCIADOR E CONTROLO DE RITMO (sequencer.js)
 * ========================================================================
 */

window.playbackState = {
    isPlaying: false,
    currentSequence: null,
    currentIndex: 0,
    timeoutId: null,
    sequences: {},
    currentDiagramId: null,
    loopCount: 0 
};

function updatePlayButtons(activeDiagramId, isPlaying) {
    document.querySelectorAll('.floating-play-btn').forEach(btn => {
        const iconPlay = btn.querySelector('.icon-play');
        const iconStop = btn.querySelector('.icon-stop');
        
        if (btn.id === `btn-play-${activeDiagramId}` && isPlaying) {
            btn.classList.replace('bg-gray-800', 'bg-red-600');
            btn.classList.replace('bg-gray-100', 'bg-red-100');
            btn.classList.replace('text-gray-800', 'text-red-600');
        
            if (iconPlay) iconPlay.classList.add('hidden');
            if (iconStop) iconStop.classList.remove('hidden');
        } else {
            btn.classList.replace('bg-red-600', 'bg-gray-800');
            btn.classList.replace('bg-red-100', 'bg-gray-100');
            btn.classList.replace('text-red-600', 'text-gray-800');
            if (iconPlay) iconPlay.classList.remove('hidden');
            if (iconStop) iconStop.classList.add('hidden');
        }
    });
}

function clearVisuals() {
    document.querySelectorAll('.note-dot.playing').forEach(el => {
        el.classList.remove('playing');
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.borderColor = '';
    });
}

window.stopPlayback = function() {
    window.playbackState.isPlaying = false;
    if (window.playbackState.timeoutId) {
        clearTimeout(window.playbackState.timeoutId);
        window.playbackState.timeoutId = null;
    }
    clearVisuals();
    updatePlayButtons(null, false);
    
    if (typeof MicGame !== 'undefined') MicGame.stopEngine();
};

function playNextNote() {
    if (!window.playbackState.isPlaying) return;

    let seq = window.playbackState.sequences[window.playbackState.currentDiagramId];

    if (!seq || window.playbackState.currentIndex >= seq.length) {
        window.playbackState.loopCount++;
        window.playbackState.currentIndex = 0; 
        
        let autoBpmToggle = document.getElementById('auto-bpm-toggle');
        let cyclesSelect = document.getElementById('auto-bpm-cycles');

        if (autoBpmToggle && autoBpmToggle.checked && cyclesSelect) {
            let maxCycles = parseInt(cyclesSelect.value) || 2;
            if (window.playbackState.loopCount >= maxCycles) {
                window.playbackState.loopCount = 0; 
                let bpmInput = document.getElementById('bpm');
                if (bpmInput) {
                    let currentBpm = parseInt(bpmInput.value) || 120;
                    let newBpm = currentBpm + 10;
                    if (newBpm <= 300) {
                        bpmInput.value = newBpm;
                        if (typeof saveAppState === 'function') saveAppState();
                    }
                }
            }
        }
    }

    let noteObj = seq[window.playbackState.currentIndex];

    let bpmInput = document.getElementById('bpm');
    let bpm = bpmInput ? parseInt(bpmInput.value) : 120;
    if (isNaN(bpm) || bpm < 40) bpm = 120;
    let msPerBeat = Math.round(60000 / bpm);
    clearVisuals();

    let el = document.getElementById(noteObj.id);
    if (el) {
        el.classList.add('playing');
        el.style.transform = 'scale(1.3)';
        el.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
        el.style.borderColor = '#fbbf24';
    }

    if (typeof MicGame !== 'undefined' && MicGame.isToggledOn) {
        if (!MicGame.forceMute && typeof playTone === 'function') {
            playTone(noteObj.pitch, msPerBeat);
        }
        MicGame.notifyNewNote(noteObj.pitch, noteObj.id);
    } else {
        if (typeof playTone === 'function') playTone(noteObj.pitch, msPerBeat);
    }

    window.playbackState.currentIndex++;
    window.playbackState.timeoutId = setTimeout(playNextNote, msPerBeat);
}

window.togglePlay = function(diagramId, startFret, endFret) {
    if (typeof initAudio === 'function') initAudio();
    if (window.playbackState.isPlaying && window.playbackState.currentDiagramId === diagramId) {
        window.stopPlayback();
        if (typeof MicGame !== 'undefined' && MicGame.isToggledOn) MicGame.notifyGameEnd();
        return;
    }
    
    window.stopPlayback();
    let seq = window.playbackState.sequences[diagramId];
    if (!seq || seq.length === 0) return;

    updatePlayButtons(diagramId, true);

    window.playbackState.isPlaying = true;
    window.playbackState.currentDiagramId = diagramId;
    window.playbackState.currentIndex = 0;
    window.playbackState.loopCount = 0; 
    
    let overlay = document.getElementById('countdown-overlay');
    let numberEl = document.getElementById('countdown-number');
    let micMsgEl = document.getElementById('mic-calibrating-msg');
    
    if (overlay && numberEl) {
        overlay.classList.remove('hidden');
        let count = 3;
        numberEl.innerText = count;
        
        if (typeof MicGame !== 'undefined' && MicGame.isToggledOn) {
            if (micMsgEl) micMsgEl.classList.remove('hidden');
            MicGame.startCalibrationAndEngine();
        } else {
            if (micMsgEl) micMsgEl.classList.add('hidden');
        }
        
        let countInterval = setInterval(() => {
            count--;
            if (count > 0) {
                numberEl.innerText = count;
            } else {
                clearInterval(countInterval);
                overlay.classList.add('hidden');
                if (micMsgEl) micMsgEl.classList.add('hidden');
                
                // NOVO: Inicia a contagem de tempo da sessão!
                if (typeof UserStats !== 'undefined') UserStats.startSession();
                
                playNextNote();
            }
        }, 1000);
    } else {
        // NOVO: Inicia a contagem de tempo da sessão!
        if (typeof UserStats !== 'undefined') UserStats.startSession();
        playNextNote();
    }
};
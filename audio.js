/**
 * ========================================================================
 * ENGINE DE ÁUDIO (SINTETIZADOR WEB)
 * ========================================================================
 * Responsabilidade: Gerar as ondas sonoras puras através da física acústica.
 */

let audioCtx; 
let globalVolume = 0.8; 

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
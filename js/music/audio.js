/**
 * ========================================================================
 * MOTOR DE ÁUDIO - SÍNTESE PURA (audio.js)
 * ========================================================================
 */

let audioCtx = null;
window.globalVolume = 0.8; 

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// O Som da Guitarra Restaurado (Estilo Pluck Original)
function playTone(pitch, durationMs) {
    if (window.globalVolume <= 0 || !pitch) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();

    // 1. ONDA: Dente de serra (sawtooth) - rica em harmônicos metálicos da corda
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    const now = audioCtx.currentTime;
    
    // 2. FILTRO: Passa-baixa restaurado
    // Simula a lógica antiga "1500 + fret * 100", deixando as notas agudas com mais brilho
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3500, pitch + 1500), now);
    
    // Conexões físicas
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // 3. ENVELOPE (A mágica do dedilhado):
    gainNode.gain.setValueAtTime(0, now);
    // Ataque rápido de palheta/dedo (0.02s)
    gainNode.gain.linearRampToValueAtTime(window.globalVolume, now + 0.02);
    // Decaimento natural e longo da corda vibrando (2.5s) independente da velocidade do BPM
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    
    // Dá o play e respeita a cauda de 2.5s para o som morrer naturalmente
    osc.start(now);
    osc.stop(now + 2.5);
}
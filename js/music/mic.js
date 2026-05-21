/**
 * ========================================================================
 * CONTROLADOR CENTRAL DE GAMIFICAÇÃO (MIC ENGINE)
 * ========================================================================
 */
const MicGame = {
    isToggledOn: false,   
    isEngineRunning: false, 
    forceMute: false, 
    
    audioContext: null,
    analyser: null,
    microphone: null,
    noiseFloor: 0.02, 
    
    toleranceCents: 60, 
    baseToleranceMs: 450, // Limite máximo absoluto de tolerância (para BPMs baixos)
    
    stats: { hits: 0, misses: 0, total: 0 },
    currentExpectedPitch: null,
    currentNoteDeadline: 0,
    noteScored: false,
    animationFrameId: null,
    currentTargetId: null,

    init: function() {
        MicUI.init(
            (forceMute) => { 
                this.isToggledOn = true; 
                this.forceMute = forceMute; 
            },
            () => { 
                this.isToggledOn = false; 
                this.stopEngine(); 
            }
        );
    },

    startCalibrationAndEngine: async function() {
        if (!this.isToggledOn) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            let maxNoise = 0;
            let calibFrames = 0;
            const buffer = new Float32Array(this.analyser.fftSize);

            const calibrate = () => {
                if (!this.isToggledOn) return;
                this.analyser.getFloatTimeDomainData(buffer);
                let rms = 0;
                for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
                rms = Math.sqrt(rms / buffer.length);
                
                if (rms > maxNoise) maxNoise = rms;
                
                calibFrames++;
                if (calibFrames < 150) { 
                    requestAnimationFrame(calibrate);
                } else {
                    this.noiseFloor = Math.max(maxNoise * 1.5, 0.01); 
                    this.isEngineRunning = true;
                    this.runEngine();
                }
            };
            calibrate();
        } catch (err) {
            console.error("Microfone inacessível: ", err);
            this.isToggledOn = false;
            MicUI.setButtonActive(false);
        }
    },

    stopEngine: function() {
        this.isEngineRunning = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
    },

    runEngine: function() {
        if (!this.isEngineRunning) return;
        const buffer = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(buffer);
        
        let detectedPitch = PitchMath.autoCorrelate(buffer, this.audioContext.sampleRate, this.noiseFloor);
        
        if (this.currentExpectedPitch && !this.noteScored) {
            let now = performance.now();
            if (detectedPitch !== -1) {
                let centsDiff = 1200 * Math.log2(detectedPitch / this.currentExpectedPitch);
                if (Math.abs(centsDiff) <= this.toleranceCents) {
                    this.registerHit();
                }
            }
            
            if (now > this.currentNoteDeadline && !this.noteScored) {
                this.registerMiss();
            }
        }

        this.animationFrameId = requestAnimationFrame(this.runEngine.bind(this));
    },

    notifyNewNote: function(pitchInHz, domElementId) {
        if (!this.isEngineRunning) return;
        
        // =========================================================
        // LÓGICA DE REGRESSÃO PROPORCIONAL DE TEMPO
        // =========================================================
        let bpmInput = document.getElementById('bpm');
        let bpm = bpmInput ? parseInt(bpmInput.value) : 120;
        if (isNaN(bpm) || bpm < 40) bpm = 120;
        
        // Calcula a duração total da nota baseada na velocidade
        let msPerBeat = Math.round(60000 / bpm);
        
        // A tolerância é o menor valor entre a Base (450ms) e 90% do tempo da nota.
        // Ex: 100 BPM (600ms a nota) -> 90% = 540ms. Usa 450ms (limite seguro).
        // Ex: 200 BPM (300ms a nota) -> 90% = 270ms. Usa 270ms (evita encavalar a próxima nota).
        let dynamicTolerance = Math.min(this.baseToleranceMs, msPerBeat * 0.9);
        
        this.currentExpectedPitch = pitchInHz;
        this.currentNoteDeadline = performance.now() + dynamicTolerance;
        this.noteScored = false;
        this.stats.total++;
        this.currentTargetId = domElementId;
    },
    
    notifyGameEnd: function() {
        if (!this.isToggledOn || this.stats.total === 0) return;
        MicUI.showScore(this.stats);
        this.stats = { hits: 0, misses: 0, total: 0 };
    },

    registerHit: function() {
        this.noteScored = true;
        this.stats.hits++;
        MicUI.showFeedback("PERFEITO!", "#4ade80", this.currentTargetId);
    },

    registerMiss: function() {
        this.noteScored = true;
        this.stats.misses++;
        MicUI.showFeedback("ERROU", "#ef4444", this.currentTargetId);
    }
};

document.addEventListener('DOMContentLoaded', () => MicGame.init());
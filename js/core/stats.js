/**
 * ========================================================================
 * MOTOR DE ESTATÍSTICAS E ANÁLISE DE TREINO (stats.js)
 * ========================================================================
 * Responsabilidade: Gravar histórico no localStorage, calcular tempo
 * gasto, taxas de acerto/erro, rastrear notas fracas e sugerir treinos.
 */

const UserStats = {
    key: 'tutor_escalas_stats',
    sessionStart: null,
    currentMissedNotes: [], 

    startSession: function() {
        this.sessionStart = Date.now();
        this.currentMissedNotes = [];
    },

    logMiss: function(noteId) {
        this.currentMissedNotes.push(noteId);
    },

    load: function() {
        let data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : { history: [], scaleStats: {} };
    },

    save: function(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    },

    // NOVO: Função para zerar o armazenamento do navegador
    clear: function() {
        localStorage.removeItem(this.key);
        this.currentMissedNotes = [];
    },

    recordAndAnalyze: function(scaleName, hits, misses) {
        let durationSeconds = this.sessionStart ? Math.round((Date.now() - this.sessionStart) / 1000) : 0;
        this.sessionStart = null; 
        
        let data = this.load();
        let id = scaleName || "Escala Livre";

        if (!data.scaleStats[id]) {
            data.scaleStats[id] = { timeSpent: 0, hits: 0, misses: 0, weakNotes: {} };
        }

        let st = data.scaleStats[id];
        st.timeSpent += durationSeconds;
        st.hits += hits;
        st.misses += misses;

        this.currentMissedNotes.forEach(note => {
            st.weakNotes[note] = (st.weakNotes[note] || 0) + 1;
        });

        data.history.unshift({
            id: id, duration: durationSeconds, hits: hits, misses: misses, date: new Date().toISOString()
        });
        if (data.history.length > 50) data.history.pop();

        this.save(data);
        return this.getAnalysis(data);
    },

    getAnalysis: function(data) {
        let keys = Object.keys(data.scaleStats);
        if (keys.length === 0) return null;

        let mostPlayed = keys.reduce((a, b) => data.scaleStats[a].timeSpent > data.scaleStats[b].timeSpent ? a : b);
        
        let mostMissed = keys.reduce((a, b) => {
            let rateA = data.scaleStats[a].misses / (data.scaleStats[a].hits || 1);
            let rateB = data.scaleStats[b].misses / (data.scaleStats[b].hits || 1);
            return rateA > rateB ? a : b;
        });

        let topWeakNotes = [];
        if (data.scaleStats[mostMissed]) {
            let wNotes = data.scaleStats[mostMissed].weakNotes;
            topWeakNotes = Object.keys(wNotes).sort((a,b) => wNotes[b] - wNotes[a]).slice(0, 3);
        }

        let totalTimePlayed = keys.reduce((acc, k) => acc + data.scaleStats[k].timeSpent, 0);

        return {
            mostPlayed: mostPlayed,
            recommendation: mostMissed,
            recommendationReason: topWeakNotes.length > 0 
                ? `Taxa de erro alta. Dedique mais atenção aos trastes/notas: ${topWeakNotes.join(', ')}` 
                : `Sua taxa de acerto pode melhorar aqui se comparada às outras escalas.`,
            totalTimePlayed: totalTimePlayed
        };
    }
};
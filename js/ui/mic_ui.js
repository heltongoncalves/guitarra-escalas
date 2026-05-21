/**
 * ========================================================================
 * INTERFACE VISUAL DO MICROFONE PRINCIPAL (mic_ui.js)
 * ========================================================================
 */
const MicUI = {
    init: function(onStart, onStop) {
        const micBtn = document.getElementById('mic-btn');

        if (micBtn && !micBtn.hasAttribute('data-initialized')) {
            micBtn.setAttribute('data-initialized', 'true');
            
            micBtn.addEventListener('click', function() {
                this.classList.toggle('bg-blue-100');
                this.classList.toggle('text-blue-600');
                this.classList.toggle('animate-pulse');

                let isToggledOn = this.classList.contains('bg-blue-100');
                
                const modal = document.getElementById('mic-modal');
                const cancelBtn = document.getElementById('btn-cancel-mic');
                const startBtn = document.getElementById('btn-start-mic');
                const calibStep = document.getElementById('mic-calibration-step');

                if (isToggledOn) {
                    let forceMute = MicUI.checkDeviceAlerts();
                    
                    if (calibStep) calibStep.classList.add('hidden');
                    if (startBtn) startBtn.classList.remove('hidden');
                    if (cancelBtn) cancelBtn.classList.remove('hidden');
                    if (modal) modal.classList.remove('hidden');
                    
                    onStart(forceMute);
                } else {
                    onStop();
                }
            });
        }

        const cancelBtn = document.getElementById('btn-cancel-mic');
        if (cancelBtn && !cancelBtn.hasAttribute('data-initialized')) {
            cancelBtn.setAttribute('data-initialized', 'true');
            cancelBtn.addEventListener('click', () => {
                const modal = document.getElementById('mic-modal');
                if (modal) modal.classList.add('hidden');
                MicUI.setButtonActive(false);
                onStop();
            });
        }

        const startBtn = document.getElementById('btn-start-mic');
        if (startBtn && !startBtn.hasAttribute('data-initialized')) {
            startBtn.setAttribute('data-initialized', 'true');
            startBtn.addEventListener('click', () => {
                const modal = document.getElementById('mic-modal');
                if (modal) modal.classList.add('hidden');
            });
        }
    },

    setButtonActive: function(isActive) {
        const micBtn = document.getElementById('mic-btn');
        if (!micBtn) return;
        if (isActive) {
            micBtn.classList.add('bg-blue-100', 'text-blue-600', 'animate-pulse');
        } else {
            micBtn.classList.remove('bg-blue-100', 'text-blue-600', 'animate-pulse');
        }
    },

    checkDeviceAlerts: function() {
        let isAndroid = (window.AndroidBridge && typeof window.AndroidBridge.isHeadsetConnected === 'function');
        const alertEl = document.getElementById('headset-alert');
        if (!alertEl) return false;
        
        if (isAndroid) {
            let hasHeadset = window.AndroidBridge.isHeadsetConnected();
            if (!hasHeadset) {
                alertEl.innerHTML = `🎧 <strong class="text-red-600">Atenção:</strong> Sem fones! O som da escala será <b>silenciado</b> para não interferir na captação das suas notas.`;
                return true; 
            } else {
                alertEl.innerHTML = `🎧 <strong class="text-green-600">Fones Detectados!</strong> Você ouvirá a escala perfeitamente sem interferir na captação.`;
                return false; 
            }
        } else {
            alertEl.innerHTML = `🎧 <strong class="text-blue-700">Dica Importante:</strong> Sugerimos que você use um fone de ouvido para escutar a escala. Desse modo, o som do aplicativo não interferirá na escuta em relação à nota tocada por você!`;
            return false; 
        }
    },

    // PADRÃO FACADE: Redireciona as requisições para os novos módulos caso existam,
    // garantindo que os motores base não quebrem ao procurar por MicUI.showScore()
    showFeedback: function(text, color, targetId) {
        if (typeof MicFeedback !== 'undefined') MicFeedback.show(text, color, targetId);
    },

    showScore: function(stats) {
        if (typeof MicScore !== 'undefined') MicScore.show(stats);
    }
};
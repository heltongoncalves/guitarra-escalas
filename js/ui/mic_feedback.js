/**
 * ========================================================================
 * FEEDBACK VISUAL DO MICROFONE (mic_feedback.js)
 * ========================================================================
 */
const MicFeedback = {
    show: function(text, color, targetId) {
        if (!targetId) return;
        
        // Intercepta erros para o analisador de estatística
        if ((text.toUpperCase() === 'ERROU' || color === 'red') && typeof UserStats !== 'undefined') {
            UserStats.logMiss(targetId);
        }

        let el = document.getElementById(targetId);
        if (!el) return;

        let rect = el.getBoundingClientRect();
        let feedback = document.createElement('div');
        feedback.innerText = text;
        feedback.style.position = 'absolute';
        feedback.style.left = rect.left + (rect.width/2) + 'px';
        feedback.style.top = rect.top + 'px';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.color = color;
        feedback.style.fontWeight = '900';
        feedback.style.textShadow = '0 2px 10px rgba(0,0,0,0.8)';
        feedback.style.fontSize = '1.5rem';
        feedback.style.transition = 'all 0.5s ease-out';
        feedback.style.zIndex = '9999';
        
        let container = document.getElementById('floating-feedback-container');
        if (container) container.appendChild(feedback);
        
        requestAnimationFrame(() => {
            feedback.style.top = (rect.top - 50) + 'px';
            feedback.style.opacity = '0';
            setTimeout(() => feedback.remove(), 500);
        });
    }
};
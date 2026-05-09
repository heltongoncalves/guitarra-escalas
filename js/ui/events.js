/**
 * ========================================================================
 * GERENCIADOR DE EVENTOS DA INTERFACE (LISTENERS)
 * ========================================================================
 */

window.changeBPM = function(amount) {
    let bpmInput = document.getElementById('bpm');
    if (!bpmInput) return;
    let currentVal = parseInt(bpmInput.value) || 120;
    let newVal = currentVal + amount;
    if (newVal < 40) newVal = 40;
    if (newVal > 300) newVal = 300;
    bpmInput.value = newVal; 
};

// Filtros Principais
document.getElementById('tom')?.addEventListener('change', function() {
    let display = document.getElementById('tom-display');
    if(display) display.innerText = this.options[this.selectedIndex].text;
    if (typeof updateUI === 'function') updateUI();
});

document.getElementById('escala')?.addEventListener('change', function() {
    let display = document.getElementById('escala-display');
    if(display) display.innerText = this.options[this.selectedIndex].text;
    if (typeof atualizarModos === 'function') atualizarModos(true); 
});

document.getElementById('modo')?.addEventListener('change', function() {
    let display = document.getElementById('modo-display');
    if(display) display.innerText = this.options[this.selectedIndex].text;
    if (typeof updateUI === 'function') updateUI();
});

document.getElementById('exercicio')?.addEventListener('change', function() {
    let display = document.getElementById('exercicio-display');
    if(display) display.innerText = this.options[this.selectedIndex].dataset.short;
    if (typeof updateUI === 'function') updateUI();
});

// Controles Secundários
document.getElementById('filtro-cordas')?.addEventListener('change', function() {
    let display = document.getElementById('cordas-display');
    if(display) display.innerText = this.options[this.selectedIndex].text;
    if (typeof updateUI === 'function') updateUI();
});

document.getElementById('bpm')?.addEventListener('input', function() {
    if (this.value < 40) this.value = 40;
    if (this.value > 300) this.value = 300;
});

document.getElementById('volume-slider')?.addEventListener('input', function(e) {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 80; 
    if (typeof globalVolume !== 'undefined') globalVolume = val / 100;
});

document.getElementById('btn-bpm-minus')?.addEventListener('click', () => changeBPM(-10));
document.getElementById('btn-bpm-plus')?.addEventListener('click', () => changeBPM(10));

document.getElementById('auto-bpm-toggle')?.addEventListener('change', function() {
    let selectEl = document.getElementById('auto-bpm-cycles');
    let arrowEl = document.getElementById('auto-bpm-arrow');
    if (!selectEl || !arrowEl) return;
    if (this.checked) {
        selectEl.disabled = false;
        selectEl.classList.remove('opacity-50', 'cursor-not-allowed');
        arrowEl.classList.remove('opacity-30');
        arrowEl.classList.add('opacity-100');
    } else {
        selectEl.disabled = true;
        selectEl.classList.add('opacity-50', 'cursor-not-allowed');
        arrowEl.classList.remove('opacity-100');
        arrowEl.classList.add('opacity-30');
    }
});

document.getElementById('sugerir-digitacao')?.addEventListener('change', () => {
    if (typeof updateUI === 'function') updateUI();
});

// NOVO LISTENER: Padrão Invertido
document.getElementById('inverter-cordas')?.addEventListener('change', () => {
    if (typeof updateUI === 'function') updateUI();
});

// Toggle do Menu de Configurações Secundárias
document.getElementById('settings-btn')?.addEventListener('click', function() {
    const secondaryControls = document.getElementById('secondary-controls');
    if (secondaryControls) {
        secondaryControls.classList.toggle('hidden');
        this.classList.toggle('bg-blue-100');
        this.classList.toggle('text-blue-600');
    }
});
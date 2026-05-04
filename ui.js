/**
 * ========================================================================
 * LÓGICA DE INTERFACE DO UTILIZADOR (UI)
 * ========================================================================
 * Responsabilidade: Lidar com a abertura e fechamento de menus dropdown, 
 * modais de ajuda, sliders de volume, alterações de temas e controlos BPM.
 */

const langMenuBtn = document.getElementById('lang-menu-btn');
const langMenuDropdown = document.getElementById('lang-menu-dropdown');
const skinMenuBtn = document.getElementById('skin-menu-btn');
const skinMenuDropdown = document.getElementById('skin-menu-dropdown');
const volMenuBtn = document.getElementById('volume-menu-btn');
const volMenuDropdown = document.getElementById('volume-menu-dropdown');
const helpBtn = document.getElementById('help-btn');

langMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    langMenuDropdown.classList.toggle('hidden');
    skinMenuDropdown.classList.add('hidden'); 
    volMenuDropdown.classList.add('hidden'); 
});

skinMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    skinMenuDropdown.classList.toggle('hidden');
    langMenuDropdown.classList.add('hidden'); 
    volMenuDropdown.classList.add('hidden'); 
});

volMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    volMenuDropdown.classList.toggle('hidden');
    langMenuDropdown.classList.add('hidden'); 
    skinMenuDropdown.classList.add('hidden'); 
});

helpBtn.addEventListener('click', () => {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.classList.remove('hidden');
});

const closeHelp = () => {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    if (!langMenuBtn.contains(e.target) && !langMenuDropdown.contains(e.target)) langMenuDropdown.classList.add('hidden');
    if (!skinMenuBtn.contains(e.target) && !skinMenuDropdown.contains(e.target)) skinMenuDropdown.classList.add('hidden');
    if (!volMenuBtn.contains(e.target) && !volMenuDropdown.contains(e.target)) volMenuDropdown.classList.add('hidden');
    
    const helpModal = document.getElementById('help-modal');
    if (helpModal && e.target === helpModal) closeHelp();
});

// Temas (Skins)
function setSkin(skinName, icon) {
    document.body.setAttribute('data-skin', skinName);
    document.getElementById('current-skin-icon').innerText = icon;
    skinMenuDropdown.classList.add('hidden');
}

// Volume
document.getElementById('volume-slider').addEventListener('input', function(e) {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 80; 
    globalVolume = val / 100;
});

// Velocidade (BPM) e Auto-Treinador
document.getElementById('bpm').addEventListener('input', function() {
    if (this.value < 40) this.value = 40;
    if (this.value > 300) this.value = 300;
});

function changeBPM(amount) {
    const bpmInput = document.getElementById('bpm');
    let currentVal = parseInt(bpmInput.value) || 120;
    let newVal = currentVal + amount;
    if (newVal < 40) newVal = 40;
    if (newVal > 300) newVal = 300;
    bpmInput.value = newVal; 
}

document.getElementById('btn-bpm-minus').addEventListener('click', () => changeBPM(-10));
document.getElementById('btn-bpm-plus').addEventListener('click', () => changeBPM(10));

document.getElementById('auto-bpm-toggle').addEventListener('change', function() {
    const selectEl = document.getElementById('auto-bpm-cycles');
    const arrowEl = document.getElementById('auto-bpm-arrow');
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
document.getElementById('view-modals').innerHTML = `
<div id="countdown-overlay" class="hidden transition-opacity duration-300" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(5px); z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
    <span id="countdown-text" data-i18n="starting_in" style="color: #fff; font-size: 1.5rem; margin-bottom: 0.5rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.1em;">Iniciando em</span>
    <span id="countdown-number" style="color: #60a5fa; font-size: 8rem; font-weight: bold; line-height: 1; text-shadow: 0 0 20px rgba(59,130,246,0.6);">3</span>
    
    <div id="mic-calibrating-msg" class="hidden text-white mt-8 text-center animate-pulse">
        <p class="text-xl font-bold tracking-widest text-red-400 uppercase">Calibrando Ruído...</p>
        <p class="text-sm font-medium text-gray-300 mt-2">Fique em silêncio absoluto!</p>
    </div>
</div>

<div id="bt-modal" class="hidden transition-opacity duration-300" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(2px); z-index: 1000;" dir="ltr">
    <div class="bg-white rounded-lg shadow-xl max-w-[95%] md:max-w-xl w-full max-h-[90vh] overflow-y-auto relative p-6 border border-gray-200">
        <button type="button" onclick="document.getElementById('bt-modal').classList.add('hidden')" class="absolute text-gray-500 hover:text-gray-800 focus:outline-none transition-colors cursor-pointer" style="top: 1rem; right: 1rem; width: 24px; height: 24px;">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <h2 class="text-xl font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2" data-i18n="bt_modal_title">Ideia de Harmonia</h2>
        <p class="text-gray-600 text-sm mb-4" data-i18n="bt_modal_text">Grave ou procure por uma Backing Track (Trilha de Fundo) com os seguintes acordes para improvisar perfeitamente em cima desta escala:</p>
        <div class="bg-gray-100 border border-gray-300 rounded-md p-4 text-center mb-2">
            <p id="bt-chords" class="text-2xl font-bold tracking-widest text-gray-800">C | F | G</p>
        </div>
        <p id="bt-desc" class="text-center text-sm font-medium text-gray-700 bg-gray-200 py-2 rounded shadow-sm mb-6">Estilo: Pop / Rock</p>
        <div id="bt-harmonic-section" class="mt-6 hidden">
             <h3 class="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1" data-i18n="lbl_harmonic_field">Campo Harmônico</h3>
            <div id="bt-harmonic-field" class="text-sm text-gray-700"></div>
        </div>
    </div>
</div>

<div id="mic-modal" class="hidden transition-opacity duration-300" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(2px); z-index: 1000;" dir="ltr">
    <div class="bg-white rounded-lg shadow-xl max-w-[90%] md:max-w-md w-full relative p-6 border border-gray-200 text-center">
        <h2 class="text-xl font-bold text-blue-700 mb-4 border-b border-gray-200 pb-2">Modo Desafio (Microfone)</h2>
        <div id="mic-calibration-step" class="hidden"></div>
        <div class="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md text-left">
            <p id="headset-alert" class="text-sm text-blue-800 leading-relaxed"></p>
        </div>
        <p class="text-sm text-gray-600 mb-6">Ao clicar em Play, o aplicativo ouvirá o seu instrumento para validar os acertos na escala.</p>
        <div class="flex justify-center gap-4">
            <button type="button" id="btn-cancel-mic" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm">Cancelar</button>
            <button type="button" id="btn-start-mic" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm">Entendi!</button>
        </div>
    </div>
</div>

<div id="score-modal" class="hidden transition-opacity duration-300" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.9); z-index: 2000;">
    <div class="text-center transform scale-100 transition-transform duration-500" id="score-card">
        <h2 class="text-5xl font-black text-white mb-2 tracking-widest uppercase drop-shadow-lg" id="score-title">Rockstar!</h2>
        <div class="text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-600 drop-shadow-2xl leading-none" id="score-percentage">0%</div>
        <p class="text-2xl text-gray-300 mt-4 font-medium"><span id="score-hits" class="text-green-400">0</span> Acertos | <span id="score-misses" class="text-red-400">0</span> Erros</p>
        <button onclick="document.getElementById('score-modal').classList.add('hidden')" class="mt-10 bg-white text-gray-900 hover:bg-gray-200 font-bold py-3 px-10 rounded-full transition-colors text-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            Continuar Treinando
        </button>
    </div>
</div>

<div id="floating-feedback-container" style="position: fixed; inset: 0; pointer-events: none; z-index: 1500; overflow: hidden;"></div>
`;
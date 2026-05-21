document.getElementById('secondary-controls').innerHTML = `
<div class="pill-group flex flex-wrap justify-center items-center gap-4">
    <div class="relative bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus-within:ring-2 focus-within:ring-gray-400 shadow-sm">
        <span id="cordas-display" class="block px-4 py-1.5 pointer-events-none text-sm font-medium pr-8">6 cordas</span>
        <select id="filtro-cordas" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer appearance-none">
            <option value="all" selected>6 cordas</option>
            <option value="1-3">1 - 3</option>
            <option value="1-4">1 - 4</option>
            <option value="3-6">3 - 6</option>
            <option value="4-6">4 - 6</option>
         </select>
        <svg class="absolute w-4 h-4 pointer-events-none text-gray-500" style="top: 50%; right: 0.75rem; transform: translateY(-50%);" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 8 4 4 4-4"/></svg>
    </div>

    <div class="flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-full transition-colors text-sm font-medium shadow-sm">
        <span data-i18n="lbl_bpm" style="margin-right: 0.5rem;">Velocidade</span>
        <button id="btn-bpm-minus" class="bg-white border border-gray-300 hover:bg-gray-200 shadow-sm rounded-full transition-colors flex items-center justify-center text-gray-600" style="width: 22px; height: 22px;" dir="ltr" title="-10 BPM">
            <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path>
            </svg>
        </button>
        <input type="number" id="bpm" value="160" min="40" max="300" class="w-8 text-center bg-transparent border-none focus:outline-none cursor-default p-0 font-bold mx-1" dir="ltr" readonly style="background-color: transparent !important; border-color: transparent !important; color: inherit !important; pointer-events: none;">
        <button id="btn-bpm-plus" class="bg-white border border-gray-300 hover:bg-gray-200 shadow-sm rounded-full transition-colors flex items-center justify-center text-gray-600" style="width: 22px; height: 22px;" dir="ltr" title="+10 BPM">
            <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
            </svg>
        </button>
        <div class="border-l border-gray-300 h-4" style="margin-left: 0.5rem; margin-right: 0.5rem;"></div>
        <label class="flex items-center cursor-pointer" title="Aumenta a velocidade automaticamente a cada X repetições">
            <span data-i18n="lbl_auto" class="font-medium text-sm" style="margin-left: 0.35rem; margin-right: 0.25rem;">auto</span>
            <div class="relative flex items-center" style="transform: scale(0.85); transform-origin: left center;">
                <input type="checkbox" id="auto-bpm-toggle" class="sr-only">
                <div class="toggle-bg"></div>
            </div>
        </label>
        <div class="relative flex items-center" style="margin-left: -0.1rem;">
             <select id="auto-bpm-cycles" class="bg-gray-200/50 text-gray-700 border border-gray-300 rounded-full py-0.5 text-xs font-bold focus:outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity opacity-50 text-center" style="padding-left: 0.4rem; padding-right: 1.1rem; background-image: none;" disabled>
                <option value="1">1x</option>
                <option value="2" selected>2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                 <option value="5">5x</option>
            </select>
            <svg id="auto-bpm-arrow" class="absolute pointer-events-none text-gray-500 opacity-30 transition-opacity" style="width: 11px; height: 11px; right: 0.35rem;" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 8 4 4 4-4"/></svg>
        </div>
    </div>

    <label class="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors text-sm font-medium cursor-pointer shadow-sm mb-0">
        <span data-i18n="lbl_fingering">Sugerir digitação</span>
        <div class="relative flex items-center">
             <input type="checkbox" id="sugerir-digitacao" class="sr-only">
            <div class="toggle-bg"></div>
        </div>
    </label>
    
    <label class="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors text-sm font-medium cursor-pointer shadow-sm mb-0">
        <span data-i18n="lbl_inverted">Padrão Invertido</span>
         <div class="relative flex items-center">
            <input type="checkbox" id="inverter-cordas" class="sr-only">
            <div class="toggle-bg"></div>
        </div>
    </label>

    <label class="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors text-sm font-medium cursor-pointer shadow-sm mb-0">
        <span data-i18n="lbl_challenge">Desafio</span>
        <div class="relative flex items-center">
            <input type="checkbox" id="desafio" class="sr-only">
            <div class="toggle-bg"></div>
        </div>
    </label>
</div>
`;
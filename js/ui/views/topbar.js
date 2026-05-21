document.getElementById('view-topbar').innerHTML = `
<div class="flex-none order-1">
    <div class="relative inline-block text-left">
        <div>
            <button type="button" id="skin-menu-btn" class="inline-flex justify-between items-center gap-1 md:gap-2 rounded-md border border-gray-300 shadow-sm px-2 py-1 md:px-3 md:py-1.5 bg-gray-50 text-xs md:text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors" aria-expanded="true" aria-haspopup="true">
                <span id="current-skin-icon" class="text-sm md:text-base">☀️</span>
                <svg class="h-3 w-3 md:h-4 md:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <div id="skin-menu-dropdown" class="origin-top-left absolute left-0 mt-2 w-36 rounded-md shadow-lg bg-white border border-gray-200 focus:outline-none hidden z-[100]" role="menu" aria-orientation="vertical" tabindex="-1">
            <div class="py-1" role="none">
                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 transition-colors" role="menuitem" onclick="event.preventDefault(); setSkin('light', '☀️')"><span data-i18n="skin_light">☀️ Claro</span></a>
                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 transition-colors" role="menuitem" onclick="event.preventDefault(); setSkin('dark', '🌙')"><span data-i18n="skin_dark">🌙 Escuro</span></a>
                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 transition-colors" role="menuitem" onclick="event.preventDefault(); setSkin('vintage', '🎸')"><span data-i18n="skin_vintage">🎸 Vintage</span></a>
            </div>
        </div>
    </div>
</div>

<div class="flex-1 flex flex-wrap justify-center items-center order-3 lg:order-2 w-full lg:w-auto mt-2 lg:mt-0">
    <div class="pill-group flex flex-wrap justify-center items-center gap-2">
        
        <div class="relative bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus-within:ring-2 focus-within:ring-gray-400 shadow-sm">
            <span id="tom-display" class="block px-4 py-1.5 pointer-events-none text-sm font-medium pr-8">C-dó</span>
            <select id="tom" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer appearance-none"></select>
            <svg class="absolute w-4 h-4 pointer-events-none text-gray-500" style="top: 50%; right: 0.75rem; transform: translateY(-50%);" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 8 4 4 4-4"/></svg>
        </div>

        <div class="relative bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus-within:ring-2 focus-within:ring-gray-400 shadow-sm">
            <span id="escala-display" class="block px-4 py-1.5 pointer-events-none text-sm font-medium pr-8">Pentatônica</span>
            <select id="escala" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer appearance-none"></select>
            <svg class="absolute w-4 h-4 pointer-events-none text-gray-500" style="top: 50%; right: 0.75rem; transform: translateY(-50%);" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 8 4 4 4-4"/></svg>
        </div>

        <div class="relative bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus-within:ring-2 focus-within:ring-gray-400 shadow-sm">
            <span id="modo-display" class="block px-4 py-1.5 pointer-events-none text-sm font-medium pr-8">Maior</span>
            <select id="modo" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer appearance-none"></select>
            <svg class="absolute w-4 h-4 pointer-events-none text-gray-500" style="top: 50%; right: 0.75rem; transform: translateY(-50%);" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 8 4 4 4-4"/></svg>
        </div>

        <div class="relative bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus-within:ring-2 focus-within:ring-gray-400 shadow-sm">
            <span id="exercicio-display" class="block px-4 py-1.5 pointer-events-none text-sm font-medium truncate pr-8 max-w-[200px] md:max-w-none">1. Subir e descer</span>
            <select id="exercicio" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer appearance-none"></select>
            <svg class="absolute w-4 h-4 pointer-events-none text-gray-500" style="top: 50%; right: 0.75rem; transform: translateY(-50%);" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 8 4 4 4-4"/></svg>
        </div>

        <div class="relative inline-block text-left ml-1">
            <button type="button" id="volume-menu-btn" class="flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm" style="width: 32px; height: 32px;" title="Volume">
                <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"/></svg>
            </button>
            <div id="volume-menu-dropdown" class="origin-top absolute mt-2 p-3 rounded-md shadow-lg bg-white border border-gray-200 focus:outline-none hidden z-[100]" style="top: 100%; left: 50%; transform: translateX(-50%); width: 140px;">
                <div class="flex items-center gap-2">
                    <svg style="width: 14px; height: 14px;" class="text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                    <input type="range" id="volume-slider" min="0" max="100" value="80" class="w-full cursor-pointer" style="accent-color: #4b5563;">
                </div>
            </div>
        </div>

        <div class="relative inline-block text-left ml-1">
            <button type="button" id="mic-btn" class="flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm" style="width: 32px; height: 32px;" title="Modo Desafio">
                <svg style="width: 14px; height: 14px;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
            </button>
        </div>

        <div class="relative inline-block text-left ml-1">
            <button type="button" id="settings-btn" class="flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm" style="width: 32px; height: 32px;" title="Configurações">
                <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
            </button>
        </div>

        <div class="relative inline-block text-left ml-1">
            <button type="button" id="help-btn" class="flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-sm" style="width: 32px; height: 32px;" title="Ajuda">
                <svg style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
        </div>
    </div>
</div>

<div class="flex-none order-2 lg:order-3">
    <div class="relative inline-block text-left">
        <div>
            <button type="button" id="lang-menu-btn" class="inline-flex justify-between items-center gap-1 md:gap-2 rounded-md border border-gray-300 shadow-sm px-2 py-1 md:px-3 md:py-1.5 bg-gray-50 text-xs md:text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors" aria-expanded="true" aria-haspopup="true">
                <span id="current-flag" class="flex items-center justify-center"></span>
                <span id="current-lang-name" class="hidden">Português</span>
                <svg class="h-3 w-3 md:h-4 md:w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <div id="lang-menu-dropdown" class="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white border border-gray-200 focus:outline-none hidden z-[100]" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
            <div class="py-1" id="lang-menu-list" role="none"></div>
        </div>
    </div>
</div>
`;
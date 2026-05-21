document.getElementById('view-floating-play').innerHTML = `
<button id="btn-play-main" onclick="togglePlay('main', 0, 15)" class="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors text-sm font-medium shadow-sm">
    <svg class="w-4 h-4 icon-play" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
    <svg class="w-4 h-4 icon-stop hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5h10v10H5z"></path></svg>
    <span class="btn-text" data-i18n="btn_play_full">Tocar Escala Completa</span>
</button>

<button id="btn-backing-track" onclick="showBackingTrack()" class="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors text-sm font-medium shadow-sm">
    <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
    <span id="bt-button-text" class="whitespace-nowrap" data-i18n="lbl_backing_track">Backing Track</span>
</button>
`;
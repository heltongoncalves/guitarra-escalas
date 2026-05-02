// SVGs das Bandeiras
const baseSvg = '<svg class="w-5 h-3.5 rounded-[2px] shadow-[0_0_1px_rgba(0,0,0,0.5)] flex-shrink-0" preserveAspectRatio="none" viewBox="0 0 64 48">';
const langMetadata = {
    'pt': { name: 'Português', svg: `${baseSvg}<rect width="64" height="48" fill="#009b3a"/><polygon points="32,4 60,24 32,44 4,24" fill="#fedf00"/><circle cx="32" cy="24" r="10" fill="#002776"/></svg>` },
    'ru': { name: 'Русский',   svg: `${baseSvg}<rect width="64" height="16" fill="#fff"/><rect y="16" width="64" height="16" fill="#0039a6"/><rect y="32" width="64" height="16" fill="#d52b1e"/></svg>` },
    'hi': { name: 'हिन्दी',     svg: `${baseSvg}<rect width="64" height="16" fill="#f93"/><rect y="16" width="64" height="16" fill="#fff"/><rect y="32" width="64" height="16" fill="#138808"/><circle cx="32" cy="24" r="6" fill="#000080"/></svg>` },
    'zh': { name: '中文',      svg: `${baseSvg}<rect width="64" height="48" fill="#ee1c25"/><polygon points="12,8 14,14 20,14 15,18 17,24 12,20 7,24 9,18 4,14 10,14" fill="#ff0"/></svg>` },
    'de': { name: 'Deutsch',   svg: `${baseSvg}<rect width="64" height="16" fill="#000"/><rect y="16" width="64" height="16" fill="#d00"/><rect y="32" width="64" height="16" fill="#ffce00"/></svg>` },
    'en': { name: 'English',   svg: `${baseSvg}<rect width="64" height="48" fill="#bf0a30"/><rect y="6.8" width="64" height="6.8" fill="#fff"/><rect y="20.4" width="64" height="6.8" fill="#fff"/><rect y="34" width="64" height="6.8" fill="#fff"/><rect width="26" height="26" fill="#002868"/></svg>` },
    'es': { name: 'Español',   svg: `${baseSvg}<rect width="64" height="12" fill="#aa151b"/><rect y="12" width="64" height="24" fill="#f1bf00"/><rect y="36" width="64" height="12" fill="#aa151b"/></svg>` },
    'fr': { name: 'Français',  svg: `${baseSvg}<rect width="21.3" height="48" fill="#002395"/><rect x="21.3" width="21.3" height="48" fill="#fff"/><rect x="42.6" width="21.3" height="48" fill="#ed2939"/></svg>` },
    'ar': { name: 'العربية',  svg: `${baseSvg}<rect width="64" height="48" fill="#006c35"/><rect x="16" y="22" width="32" height="4" fill="#fff"/></svg>` },
    'bn': { name: 'বাংলা',     svg: `${baseSvg}<rect width="64" height="48" fill="#006a4e"/><circle cx="28" cy="24" r="14" fill="#f42a41"/></svg>` },
    'ur': { name: 'اردو',      svg: `${baseSvg}<rect width="64" height="48" fill="#115740"/><rect width="16" height="48" fill="#fff"/><circle cx="40" cy="24" r="12" fill="#fff"/><circle cx="44" cy="20" r="10" fill="#115740"/></svg>` }
};
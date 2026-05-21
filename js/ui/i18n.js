/**
 * ========================================================================
 * INTERNACIONALIZAÇÃO (i18n)
 * ========================================================================
 * Responsabilidade: Gerir o idioma atual, aplicar traduções aos textos
 * HTML e recriar os elementos dropdown quando o idioma muda.
 */

let currentLang = 'pt';

function t(key) {
    if (typeof i18n !== 'undefined') {
        if (i18n[currentLang] && i18n[currentLang][key]) return i18n[currentLang][key];
        if (i18n['en'] && i18n['en'][key]) return i18n['en'][key];
        if (i18n['pt'] && i18n['pt'][key]) return i18n['pt'][key];
    }
    return key;
}

function getShortExText(fullText) {
    let short = fullText.split(' (')[0];
    const removals = [' a escala toda', ' the whole scale', ' toda la escala', ' toute la gamme', ' по всей гамме', ' cada nota', ' each note', ' chaque note', ' каждую ноту'];
    removals.forEach(r => { short = short.replace(new RegExp(r, 'gi'), ''); });
    return short.trim();
}

function setLang(code, langName) {
    const flagEl = document.getElementById('current-flag');
    const nameEl = document.getElementById('current-lang-name');
    const dropdownEl = document.getElementById('lang-menu-dropdown');
    
    if (flagEl && typeof langMetadata !== 'undefined' && langMetadata[code]) {
        flagEl.innerHTML = langMetadata[code].svg;
    }
    if (nameEl) nameEl.innerText = langName;
    if (dropdownEl) dropdownEl.classList.add('hidden');
    
    currentLang = code;
    applyLanguage();
}

function applyLanguage() {
    // Busca os elementos de forma segura
    const escalaEl = document.getElementById('escala');
    const modoEl = document.getElementById('modo');
    const exSelect = document.getElementById('exercicio');
    
    // Captura os valores atuais ou usa os padrões se os selects ainda não existirem
    const selCat = escalaEl?.value || 'Pentatônica';
    const selModo = modoEl?.value || 'Maior';
    const selEx = exSelect?.value || '1';

    document.documentElement.lang = currentLang;

    if (currentLang === 'ar' || currentLang === 'ur') document.body.dir = 'rtl';
    else document.body.dir = 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);
    });

    // Só atualiza os Exercícios se o Select existir no DOM
    if (exSelect) {
        exSelect.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            let opt = document.createElement('option');
            opt.value = i.toString();
            opt.text = t(`ex_${i}`);
            opt.dataset.short = getShortExText(t(`ex_${i}`));
            exSelect.add(opt);
        }
        exSelect.value = selEx;
        const exDisplay = document.getElementById('exercicio-display');
        if (exDisplay && exSelect.selectedIndex >= 0) {
            exDisplay.innerText = exSelect.options[exSelect.selectedIndex].dataset.short;
        }
    }

    // Só atualiza as Escalas se o Select existir no DOM
    if (escalaEl && typeof bancoDeEscalas !== 'undefined') {
        escalaEl.innerHTML = '';
        for (const cat in bancoDeEscalas) {
            escalaEl.add(new Option(t(cat), cat));
        }
        escalaEl.value = bancoDeEscalas[selCat] ? selCat : 'Pentatônica';
        const escalaDisplay = document.getElementById('escala-display');
        if (escalaDisplay && escalaEl.selectedIndex >= 0) {
            escalaDisplay.innerText = escalaEl.options[escalaEl.selectedIndex].text;
        }
    }

    atualizarModos(false);
    
    // Só atualiza os Modos se o Select existir no DOM
    if (modoEl) {
        if ([...modoEl.options].some(o => o.value === selModo)) {
            modoEl.value = selModo;
        }
        const modoDisplay = document.getElementById('modo-display');
        if (modoDisplay && modoEl.selectedIndex >= 0) {
            modoDisplay.innerText = modoEl.options[modoEl.selectedIndex].text;
        }
    }

    // Só atualiza as Cordas se o Select existir no DOM
    const cordasSelect = document.getElementById('filtro-cordas');
    if (cordasSelect && cordasSelect.options.length > 0) {
        cordasSelect.options[0].text = t('str_all');
        const cordasDisplay = document.getElementById('cordas-display');
        if (cordasDisplay && cordasSelect.selectedIndex >= 0) {
            cordasDisplay.innerText = cordasSelect.options[cordasSelect.selectedIndex].text;
        }
    }

    // Só atualiza os Tons se o Select existir no DOM
    const tomSelect = document.getElementById('tom');
    if (tomSelect && typeof notasCromaticas !== 'undefined') {
        const selTom = tomSelect.value || 'C';
        tomSelect.innerHTML = '';
        const rootsArr = (typeof i18n !== 'undefined' && i18n[currentLang] && i18n[currentLang].roots) ? i18n[currentLang].roots : i18n['en'].roots;
        
        notasCromaticas.forEach((nota, idx) => {
            let opt = document.createElement('option');
            opt.value = nota; 
            opt.text = rootsArr[idx]; 
            tomSelect.add(opt);
        });
        tomSelect.value = selTom;
        const tomDisplay = document.getElementById('tom-display');
        if (tomDisplay && tomSelect.selectedIndex >= 0) {
            tomDisplay.innerText = tomSelect.options[tomSelect.selectedIndex].text;
        }
    }

    if (typeof updateUI === 'function') updateUI();
    
    if (typeof updateBackingTrackButton === 'function') {
        updateBackingTrackButton();
    }
}

function atualizarModos(triggerUpdateUI = true) {
    const selectModo = document.getElementById('modo');
    const escalaEl = document.getElementById('escala');
    
    // Se faltar algum elemento ou o banco de dados da música, aborta silenciosamente
    if (!selectModo || !escalaEl || typeof bancoDeEscalas === 'undefined') return;

    const cat = escalaEl.value;
    const modos = bancoDeEscalas[cat];
    if (!modos) return;

    const oldModo = selectModo.value;

    selectModo.innerHTML = ''; 
    for (const modo in modos) {
        selectModo.add(new Option(t(modo), modo));
    }
    
    if (oldModo && [...selectModo.options].some(o => o.value === oldModo)) {
        selectModo.value = oldModo;
    }
    
    const modoDisplay = document.getElementById('modo-display');
    if (modoDisplay && selectModo.selectedIndex >= 0) {
        modoDisplay.innerText = selectModo.options[selectModo.selectedIndex].text;
    }

    if (triggerUpdateUI && typeof updateUI === 'function') updateUI();
}
/**
 * ========================================================================
 * INTERNACIONALIZAÇÃO (i18n)
 * ========================================================================
 * Responsabilidade: Gerir o idioma atual, aplicar traduções aos textos
 * HTML e recriar os elementos dropdown quando o idioma muda.
 */

let currentLang = 'pt';

function t(key) {
    if (i18n[currentLang] && i18n[currentLang][key]) return i18n[currentLang][key];
    if (i18n['en'] && i18n['en'][key]) return i18n['en'][key];
    if (i18n['pt'] && i18n['pt'][key]) return i18n['pt'][key];
    return key;
}

function getShortExText(fullText) {
    let short = fullText.split(' (')[0];
    const removals = [' a escala toda', ' the whole scale', ' toda la escala', ' toute la gamme', ' по всей гамме', ' cada nota', ' each note', ' chaque note', ' каждую ноту'];
    removals.forEach(r => { short = short.replace(new RegExp(r, 'gi'), ''); });
    return short.trim();
}

function setLang(code, langName) {
    document.getElementById('current-flag').innerHTML = langMetadata[code].svg;
    document.getElementById('current-lang-name').innerText = langName;
    document.getElementById('lang-menu-dropdown').classList.add('hidden');
    currentLang = code;
    applyLanguage();
}

function applyLanguage() {
    const selCat = document.getElementById('escala').value || 'Pentatônica';
    const selModo = document.getElementById('modo').value || 'Maior';
    const selEx = document.getElementById('exercicio').value || '1';

    document.documentElement.lang = currentLang;

    if (currentLang === 'ar' || currentLang === 'ur') document.body.dir = 'rtl';
    else document.body.dir = 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);
    });

    const exSelect = document.getElementById('exercicio');
    exSelect.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        let opt = document.createElement('option');
        opt.value = i.toString();
        opt.text = t(`ex_${i}`);
        opt.dataset.short = getShortExText(t(`ex_${i}`));
        exSelect.add(opt);
    }
    exSelect.value = selEx;
    document.getElementById('exercicio-display').innerText = exSelect.options[exSelect.selectedIndex].dataset.short;

    const catSelect = document.getElementById('escala');
    catSelect.innerHTML = '';
    for (const cat in bancoDeEscalas) {
        catSelect.add(new Option(t(cat), cat)); 
    }
    catSelect.value = bancoDeEscalas[selCat] ? selCat : 'Pentatônica';
    document.getElementById('escala-display').innerText = catSelect.options[catSelect.selectedIndex].text;

    atualizarModos(false);
    const modoSelect = document.getElementById('modo');
    if ([...modoSelect.options].some(o => o.value === selModo)) {
        modoSelect.value = selModo;
    }
    document.getElementById('modo-display').innerText = modoSelect.options[modoSelect.selectedIndex].text;

    const cordasSelect = document.getElementById('filtro-cordas');
    cordasSelect.options[0].text = t('str_all');
    document.getElementById('cordas-display').innerText = cordasSelect.options[cordasSelect.selectedIndex].text;

    const tomSelect = document.getElementById('tom');
    const selTom = tomSelect.value || 'C';
    tomSelect.innerHTML = '';
    const rootsArr = (i18n[currentLang] && i18n[currentLang].roots) ? i18n[currentLang].roots : i18n['en'].roots;
    
    notasCromaticas.forEach((nota, idx) => {
        let opt = document.createElement('option');
        opt.value = nota; 
        opt.text = rootsArr[idx]; 
        tomSelect.add(opt);
    });
    
    tomSelect.value = selTom;
    document.getElementById('tom-display').innerText = tomSelect.options[tomSelect.selectedIndex].text;

    updateUI();
    
    // Força a atualização do botão Backing Track se o módulo estiver carregado
    if (typeof updateBackingTrackButton === 'function') {
        updateBackingTrackButton();
    }
}

function atualizarModos(triggerUpdateUI = true) {
    const cat = document.getElementById('escala').value;
    const modos = bancoDeEscalas[cat];
    const selectModo = document.getElementById('modo');
    const oldModo = selectModo.value;

    selectModo.innerHTML = ''; 
    for (const modo in modos) {
        selectModo.add(new Option(t(modo), modo));
    }
    
    if (oldModo && [...selectModo.options].some(o => o.value === oldModo)) {
        selectModo.value = oldModo;
    }
    
    document.getElementById('modo-display').innerText = selectModo.options[selectModo.selectedIndex].text;

    if (triggerUpdateUI) updateUI();
}
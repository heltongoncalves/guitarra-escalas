/**
 * ========================================================================
 * OBSERVADOR DE REPRODUÇÃO (TROCA DINÂMICA DE DEDOS)
 * ========================================================================
 */
let mainPlaybackObserver = null;
let currentMainPosIndex = 0;

function setupMainPlaybackObserver(windows) {
    let mainFretboard = document.getElementById('diagram-main');
    if (!mainFretboard) return;
    
    if (mainPlaybackObserver) {
        mainPlaybackObserver.disconnect();
    }
    
    currentMainPosIndex = 0; 
    
    mainPlaybackObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                let el = mutation.target;
                if (el.classList.contains('playing-note')) {
                    let idParts = el.id.split('-'); 
                    if (idParts.length >= 4) {
                        let f = parseInt(idParts[idParts.length - 1]);
                        
                        let currentWin = windows[currentMainPosIndex];
                        if (!currentWin || f < currentWin[0] || f > currentWin[1]) {
                            
                            let nextIdx = currentMainPosIndex + 1;
                            if (windows[nextIdx] && f >= windows[nextIdx][0] && f <= windows[nextIdx][1]) {
                                currentMainPosIndex = nextIdx;
                            } else {
                                for(let i = 0; i < windows.length; i++) {
                                    if (f >= windows[i][0] && f <= windows[i][1]) {
                                        currentMainPosIndex = i;
                                        break;
                                    }
                                }
                            }
                            
                            let hints = mainFretboard.querySelectorAll('.dynamic-finger');
                            hints.forEach(hint => {
                                let fingerForPos = hint.getAttribute(`data-pos-${currentMainPosIndex}`);
                                if (fingerForPos) {
                                    hint.innerText = fingerForPos;
                                }
                            });
                        }
                    }
                }
            }
        });
    });
    
    let notes = mainFretboard.querySelectorAll('.note-dot');
    notes.forEach(note => {
        mainPlaybackObserver.observe(note, { attributes: true, attributeFilter: ['class'] });
    });
}
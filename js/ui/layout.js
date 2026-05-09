/**
 * ========================================================================
 * CÁLCULOS DE LAYOUT E RESPONSIVIDADE DO BRAÇO (CSS GRID)
 * ========================================================================
 */

var fretsMath = [0, 8.68, 16.88, 24.61, 31.91, 38.80, 45.31, 51.44, 57.23, 62.69, 67.85, 72.71, 77.34, 81.68, 85.78, 89.65, 93.30, 96.75, 100.00];

function applyFretboardMagic(diagId, start, end) {
    let imgStart = start === 0 ? 0 : fretsMath[start - 1];
    let imgEnd = fretsMath[end] || 100;
    let imgWidth = imgEnd - imgStart;
    if (imgWidth <= 0) imgWidth = 100;

    let styleId = `magic-style-${diagId}`;
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }

    let css = `
        #diagram-${diagId} .string, #diagram-${diagId} .fret-numbers {
            display: flex !important;
            width: 100% !important;
        }
    `;

    let childIndex = 1;
    for (let i = start; i <= end; i++) {
        let fw = i === 0 ? 2.5 : (fretsMath[i] - fretsMath[i - 1]);
        let relW = (fw / imgWidth) * 100;
        
        css += `
            #diagram-${diagId} .string > div:nth-child(${childIndex}),
            #diagram-${diagId} .fret-numbers > div:nth-child(${childIndex}) {
                flex: 0 0 ${relW}% !important;
                width: ${relW}% !important;
                min-width: ${relW}% !important;
                max-width: ${relW}% !important;
            }
        `;
        childIndex++;
    }
    styleTag.innerHTML = css;
}
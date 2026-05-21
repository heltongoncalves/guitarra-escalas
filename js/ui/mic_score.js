/**
 * ========================================================================
 * PONTUAÇÃO E ESTATÍSTICA - STYLE APPLE PREMIUM (mic_score.js)
 * ========================================================================
 */
const MicScore = {
    show: function(stats) {
        let total = stats.total || 0;
        let pct = total > 0 ? Math.round((stats.hits / total) * 100) : 0;
        
        let title = "Tente Novamente";
        if (pct >= 50) title = "Bom Trabalho";
        if (pct >= 80) title = "Excelente";
        if (pct >= 95) title = "Incrível";
        
        let modal = document.getElementById('score-modal');
        if (!modal) return;

        let contentBox = modal.querySelector('.bg-white') || modal.firstElementChild;
        if (!contentBox) return;

        contentBox.innerHTML = '';
        contentBox.className = 'bg-white rounded-3xl shadow-2xl max-w-sm w-full relative p-8 text-center mx-4 animate-fade-in-up border border-gray-50';

        // 1. Botão X Superior Direito
        let closeBtn = document.createElement('button');
        closeBtn.innerHTML = `
            <svg class="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        `;
        closeBtn.className = 'absolute top-5 right-5 p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-all focus:outline-none active:scale-90';
        closeBtn.onclick = () => { modal.classList.add('hidden'); };
        contentBox.appendChild(closeBtn);

        // 2. Processamento das Estatísticas Históricas e Recomendações
        let analysisHTML = '';
        if (typeof UserStats !== 'undefined') {
            let scaleSelect = document.getElementById('escala') || document.getElementById('scale-select');
            let modeSelect = document.getElementById('modo') || document.getElementById('mode-select');
            let scaleName = "Escala Livre";
            if (scaleSelect && modeSelect) {
                scaleName = `${scaleSelect.options[scaleSelect.selectedIndex].text} ${modeSelect.options[modeSelect.selectedIndex].text}`;
            }

            let analysis = UserStats.recordAndAnalyze(scaleName, stats.hits || 0, stats.misses || 0);
            
            if (analysis) {
                let minutes = Math.floor(analysis.totalTimePlayed / 60);
                let seconds = analysis.totalTimePlayed % 60;
                
                // NOVO: Adicionado layout Flexbox no cabeçalho com o Botão de Limpar
                analysisHTML = `
                    <div class="mt-6 pt-5 border-t border-gray-100 text-left relative">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>📊</span> Tendências
                            </h3>
                            <button id="btn-clear-stats" class="text-[9px] font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none active:scale-95">
                                LIMPAR
                            </button>
                        </div>
                        
                        <div id="stats-analysis-content">
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <span class="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Praticado</span>
                                    <span class="text-base font-bold text-gray-800 tracking-tight">${minutes}m ${seconds}s</span>
                                </div>
                                <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100 overflow-hidden">
                                    <span class="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Favorita</span>
                                    <span class="text-xs font-bold text-gray-800 truncate block mt-0.5" title="${analysis.mostPlayed}">${analysis.mostPlayed}</span>
                                </div>
                            </div>
                            
                            <div class="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 shadow-sm flex gap-3">
                                <div class="text-lg mt-0.5">🎯</div>
                                <div>
                                    <p class="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">Sugestão de Foco</p>
                                    <p class="font-bold text-gray-900 text-sm leading-tight mb-1">${analysis.recommendation}</p>
                                    <p class="text-xs text-gray-600 leading-normal">${analysis.recommendationReason}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        let colorClass = pct >= 80 ? 'text-emerald-500' : (pct >= 50 ? 'text-blue-500' : 'text-amber-500');

        // 3. Montagem da Estrutura Visual Unificada com Grid de Informações
        let summaryContainer = document.createElement('div');
        summaryContainer.className = 'flex flex-col';
        summaryContainer.innerHTML = `
            <div class="text-3xl mb-1">🎸</div>
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">${title}</h2>
            <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5 mb-5">Resumo da Rodada</p>
            
            <div class="flex flex-col items-center justify-center mb-5 bg-gradient-to-b from-gray-50/50 to-gray-50 p-5 rounded-3xl border border-gray-100/50">
                <span class="text-5xl font-extrabold tracking-tighter ${colorClass}">${pct}%</span>
                <span class="text-xs font-medium text-gray-400 mt-1">Taxa de Acerto</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3 bg-gray-50/30 rounded-2xl p-1 border border-gray-100">
                <div class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <span class="font-bold text-emerald-500 text-xl leading-none mb-1">${stats.hits || 0}</span>
                    <span class="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Certas</span>
                </div>
                <div class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <span class="font-bold text-red-400 text-xl leading-none mb-1">${stats.misses || 0}</span>
                    <span class="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Erradas</span>
                </div>
            </div>
            
            ${analysisHTML}
            
            <button id="btn-play-again" class="mt-6 w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-2xl transition-all shadow-md focus:outline-none active:scale-[0.98]">
                Continuar Praticando
            </button>
        `;

        contentBox.appendChild(summaryContainer);

        // LÓGICA DE LIMPEZA DE DADOS
        let btnClearStats = document.getElementById('btn-clear-stats');
        if (btnClearStats) {
            btnClearStats.addEventListener('click', () => {
                // Pede confirmação via navegador
                if (confirm("Você tem certeza que deseja zerar todo o seu histórico de treino e recomeçar do zero?")) {
                    if (typeof UserStats !== 'undefined') {
                        UserStats.clear();
                    }
                    
                    // Atualiza a tela discretamente, sem fechar a janela
                    let block = document.getElementById('stats-analysis-content');
                    if (block) {
                        block.innerHTML = `
                            <div class="text-center py-6 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in-up">
                                <span class="text-2xl mb-1 block">🗑️</span>
                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Histórico Reiniciado</p>
                            </div>
                        `;
                    }
                    
                    // Esconde o botão de limpar, pois não há mais o que limpar
                    btnClearStats.style.display = 'none';
                }
            });
        }

        document.getElementById('btn-play-again').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        modal.classList.remove('hidden');
    }
};
# DIRETRIZES DE DESENVOLVIMENTO E REGRAS DO SISTEMA - TUTOR DE ESCALAS (V2)

Este documento contém as regras absolutas, decisões arquiteturais e o mapeamento completo do projeto "Tutor de Escalas" (Vanilla JS). **Qualquer IA ou desenvolvedor que manipular este código DEVE ler, compreender e respeitar estritamente estas diretrizes e a topologia descrita abaixo.**

---

## 1. Arquitetura, Modularização e Práticas "AI-Friendly"
O projeto segue uma estrutura modular estrita baseada em Vanilla JS puro, maximizando o desempenho e a legibilidade sem dependências de frameworks pesados. Para garantir que o ecossistema permaneça sustentável e facilmente interpretável por humanos e LLMs (Inteligências Artificiais), siga estas diretivas:

* **Tamanho Máximo e Refatoração (Regra das 100 Linhas):** Arquivos devem ser focados e concisos. Se um arquivo ultrapassar ~100 a 150 linhas de código estrutural, ele deve ser imediatamente refatorado e dividido logicamente. Como demonstrado na refatoração da interface do microfone, deve-se adotar o **Padrão Facade (Fachada)** para expor uma API simples e delegar responsabilidades complexas a submódulos especializados.
* **Injeção Dinâmica de Componentes (HTML Modular):** O arquivo `index.html` atua estritamente como um esqueleto estrutural (contendo apenas contêineres e âncoras vazias). Pedaços significativos de marcação (Modais, Menus, Barras de Ferramentas, Dashboards) devem ser injetados programaticamente via JavaScript através da pasta `js/ui/views/`.
* **Programação Defensiva e Controle de Eventos (Null-Safety):** Devido à renderização e injeção assíncrona/dinâmica do DOM, nunca presuma a existência imediata de um elemento HTML. Utilize sempre *Optional Chaining* (`elemento?.addEventListener`) e verificações explícitas de nulidade (`if (elemento)`). Para evitar o problema de **Dupla Inicialização (Double Bind)**, adicione atributos de controle de estado (ex: `elemento.setAttribute('data-initialized', 'true')`) antes de vincular novos escutas de eventos.
* **Separação Estrita de Camadas (Layers):** Cada diretório possui uma responsabilidade única e isolada:
  * **`js/app.js`**: Ponto de entrada (Entry Point), inicialização segura e coordenação do ciclo de atualização global (`updateUI()`).
  * **`js/core/`**: Regras de negócio analíticas, inteligência estatística e persistência de dados.
  * **`js/data/`**: Dados estáticos, tabelas de internacionalização (i18n) e definições matemáticas fixas de escalas.
  * **`js/music/`**: Motores de síntese de áudio, algoritmos de detecção de frequência (autocorrelação) e sequenciadores de ritmo. Esta camada é puramente lógica e musical; nunca deve manipular o DOM ou ditar estilos visuais.
  * **`js/ui/`**: Controladores gráficos, gerenciamento de modais, escutas de eventos de interação e manipulação direta do layout.

---

## 2. Regras de Ouro da Teoria Musical e Metodologia CAGED
* **Janelas Estritas de 5 Trastes:** O cálculo e mapeamento visual das posições do sistema CAGED devem respeitar janelas móveis de 5 trastes (ex: trastes 0 a 4, 2 a 6). Esta amplitude é mandatória para abarcar escalas diatônicas completas sem amputar notas periféricas que exijam extensão (*stretch*) biomecânica.
* **Filtro de Uníssonos e Oitavas Equivalentes:** Na construção geométrica de posições estáticas (Posições 1 a 5 do CAGED), notas idênticas na mesma oitava absoluta (mesmo *pitch*) que ocorram em cordas distintas dentro della mesma janela de trastes **não podem coexistir de forma duplicada**. O algoritmo de mapeamento deve identificar a equivalência de frequência e priorizar a nota de menor traste ou corda solta, eliminando redundâncias no diagrama.
* **Encadeamento Tático da Escala Completa:** A reprodução sequencial no modo de "Escala Completa" não segue uma ordenação cega por frequência linear. Ela consiste na concatenação inteligente e fluida das 5 posições do CAGED, mimetizando a movimentação tática e a biomecânica de transição de um guitarrista real ao longo do braço do instrumento.
* **Algoritmo de Digitação Inteligente (`calcularDedoPorCorda`):** A atribuição de dedos sugeridos avalia os intervalos (*gaps*) relativos de trastes entre as notas dispostas em uma mesma corda. Um mesmo dedo nunca deve ser sugerido sequencialmente para notas diferentes na mesma corda dentro de uma posição fixa.

---

## 3. Mecânicas de Gamificação e Captura de Áudio (Modo Microfone)
* **Loop Infinito no Modo Desafio:** Ao ativar o modo de captura de microfone, a escala entra em modo de reprodução perpétua (loop contínuo). O usuário pratica as sequências indefinidamente sem interrupções abruptas. A contabilização de acertos e erros ocorre silenciosamente em segundo plano e a pontuação consolidada só é exibida ao clicar em parar.
* **Regressão Proporcional Dinâmica de Tempo (Hit Window):** Para garantir uma experiência justa e fluida, a janela de tolerância de tempo (tempo máximo para o usuário palhetar a nota correta antes de registrar um erro) é recalculada dinamicamente com base no andamento atual (BPM). 
  * A tolerância máxima absoluta para andamentos lentos é de **450ms** (`baseToleranceMs`).
  * Em andamentos rápidos, a tolerância é comprimida automaticamente para corresponder a no máximo **90% da duração real da nota** (`msPerBeat * 0.9`), deixando uma margem de segurança de 10% para o buffer de captura processar o silêncio e evitar falsos positivos acumulados.
* **Síntese de Áudio Confortável (Timbre Pluck Restaurado):** O motor de síntese gera um sinal metálico rico, emulando uma corda de guitarra real através de uma onda dente de serra (`sawtooth`). O sinal passa por um filtro passa-baixa dinâmico (`lowpass`) cujo corte expande com a altura da nota (`Math.min(3500, pitch + 1500)`) para preservar o brilho dos agudos sem estridência digital. O envelope de ganho possui ataque imediato (0.02s) e decaimento longo e natural com cauda exponencial de **2.5 segundos**, mantendo o som orgânico e fluido mesmo sob andamentos acelerados. O som do metrônomo foi completamente removido do fluxo para focar exclusivamente na referência harmônica das notas.
* **Proteção contra Microfonia (Force Mute):** Em ambientes Android WebView, o sistema consulta a ponte nativa (`AndroidBridge.isHeadsetConnected()`). Caso nenhum fone de ouvido seja detectado, o som de referência da escala sintetizada é mutado compulsoriamente (`forceMute = true`) para evitar realimentação acústica (microfonia) no microfone do dispositivo, mantendo a captura limpa.

---

## 4. O Sistema Analítico e Módulo de Estatísticas (Evolução Avançada)
O ecossistema possui um subsistema estatístico robusto voltado ao rastreamento detalhado da evolução do músico, focado em apontar lacunas técnicas e direcionar o estudo eficiente.
* **Persistência de Longo Prazo:** Os dados de estudo são armazenados localmente e de forma permanente no navegador através da chave `tutor_escalas_stats` no `localStorage`. Os dados persistem entre sessões, recarregamentos de página e fechamentos de aba, agindo como um banco persistente enquanto o usuário não comandar a limpeza.
* **Rastreamento de Pontos Fracos:** Sempre que o motor de gamificação emite um feedback de erro ("ERROU"), o ID exato da nota/traste no DOM é capturado e incrementado em um mapa de calor de falhas estrutural.
* **Cálculo de Métricas e Análise de Sessão:** O sistema computa o tempo exato ativo em segundos por exercício (`Date.now() - sessionStart`), acumula o volume total de notas certas/erradas e compila um histórico móvel contendo as últimas 50 rodadas para fins de modelagem de desempenho.
* **Motor de Recomendação Inteligente:** Com base no histórico de dados consolidados, o sistema roda uma análise heurística para:
  1. Determinar o exercício/escala mais praticado (maior tempo acumulado).
  2. Identificar a escala com a pior taxa proporcional de acertos.
  3. Extrair os 3 trastes/notas mais problemáticos da escala deficitária, gerando uma recomendação textual automatizada de foco técnico no painel visual.

---

## 5. Diretrizes de Design de Interface (Apple/Cupertino Style)
A interface de exibição de relatórios e painéis analíticos segue estritamente a filosofia estética minimalista e premium da Apple:
* **Geometria e Cantos:** Uso de bordas com arredondamento generoso (`rounded-3xl` ou `24px` a `32px`) e cartões flutuantes compactos que simulam widgets nativos do iOS/macOS.
* **Tipografia e Cores:** Ênfase em fontes de peso extremo para títulos principais (`font-bold` ou `font-black` com rastreamento compacto `tracking-tight`), acompanhadas de rótulos secundários em caixa alta minúscula com espaçamento expandido (`text-[10px] uppercase tracking-widest text-gray-400`). Paleta cromática baseada em tons pastéis desaturados, cinzas suaves (`bg-gray-50`) e fundos brancos puros que criam contrastes sutis de profundidade e sombras etéreas (`shadow-2xl`).
* **Prevenção de Colisões Visuais (Grid Simétrico):** Métricas comparativas de dados (como Acertos vs Erros ou Tempo vs Escala Ativa) devem ser enclausuradas em sistemas de grade explícita (`grid grid-cols-2 gap-4`). É expressamente proibido o uso de alinhamentos flexíveis sem largura definida que causem o esmagamento ou a justaposição de textos adjacentes (evitando termos colados como "CertasErradas").
* **Elementos de Controle Integrados:** Todo painel analítico deve apresentar um botão de fechamento minimalista em formato de "X" no canto superior direito, isolado em um círculo suave, e um botão de ação primária proeminente na base. Botões de destruição de dados ("LIMPAR") são estilizados de forma discreta em vermelho pastel e exigem confirmação nativa em duas etapas (`confirm()`) antes de limpar o escopo de memória do navegador.

---

## 6. MAPEAMENTO COMPLETO DE ARQUIVOS (DICIONÁRIO DO PROJETO)

### Raiz (Estrutura Base / HTML)
* **`index.html`**: Esqueleto limpo da página. Gerencia o carregamento ordenado dos scripts e folhas de estilo, atuando como o viewport principal.
* **`help.html` & `backingtrack.html`**: Fragmentos estáticos de documentação auxiliar e estruturas de modais de acordes.
* **`app.md`**: Este arquivo (Especificação oficial e memória técnica do projeto).

### Pasta: `css/` (Estilização e Temas)
* **`base.css`**: Resets globais, variáveis de cor do Tailwind CSS e classes utilitárias fundamentais.
* **`fretboard.css`**: Renderização visual do braço do instrumento, texturas de madeira, marcações de trastes e posicionamento absoluto das notas.
* **`themes.css`**: Motor visual de skins (Glassmorphic, Dark, Light) baseado no atributo dinâmico `data-skin`.
* **`ui.css`**: Estilização fina de modais premium, botões deslizantes (*switches*), dropdowns e overrides com `!important` para estados de ativação de botões como `#mic-btn.bg-blue-100`.

### Pasta: `js/core/` (Regras Analíticas e Estado)
* **`stats.js`**: Core estatístico. Registra carimbos de data/hora, calcula durações de treino, monitora notas erradas, mantém o histórico de 50 sessões no `localStorage` e gera as sugestões analíticas de estudo.

### Pasta: `js/data/` (Estruturas de Dados Estáticos)
* **`consts.js`**: Dicionário multilíngue estruturado para i18n, banco de fórmulas de escalas musicais e frequências em Hz de afinações de referência.
* **`flags.js`**: Vetores SVG e metadados geográficos para renderização das bandeiras de seleção de idioma.

### Pasta: `js/music/` (Lógica Musical, Síntese e Captura)
* **`audio.js`**: Motor sintetizador puro da Web Audio API. Constrói timbres do tipo *pluck* via dente de serra, filtros passa-baixa d'água e envelopes exponenciais duradouros de 2.5s. O metrônomo foi removido deste arquivo.
* **`backingtrack.js`**: Mecanismo matemático de harmonização musical. Calcula o campo harmônico correspondente e sugere progressões de acordes de acompanhamento.
* **`pitch.js`**: Biblioteca de processamento de sinais digitais (DSP). Executa exclusivamente o algoritmo matemático de autocorrelação no domínio do tempo para extrair a frequência fundamental de captação.
* **`mic.js`**: Motor de gamificação em tempo real. Abre os buffers de captura do microfone, gerencia a calibração do ruído ambiente (`noiseFloor`), coordena prazos de notas via Regressão Proporcional e notifica acertos/erros.
* **`sequencer.js`**: Controlador de tempo rítmico. Dispara as notas em loop contínuo, incrementa a velocidade automaticamente através do sistema Auto-BPM por ciclos e sinaliza os marcos temporais ao `UserStats`.

### Pasta: `js/ui/` (Renderização Gráfica e Fachadas)
* **`events.js`**: Orquestrador central de escutas de eventos. Captura alterações nos seletores principais de tom, tipo de escala e modo de visualização.
* **`i18n.js`**: Motor de tradução. Varre os atributos `data-i18n` do DOM e reconstrói as opções internas de seletores dinamicamente.
* **`layout.js`**: Utilitário geométrico. Aplica transformações profissionais no braço da guitarra (`applyFretboardMagic`) para estreitar os trastes à medida que se aproximam do corpo do instrumento.
* **`mic_ui.js`**: Fachada principal do microfone. Concentra as APIs de controle visual de ativação de botões, checa conectividade de fones, evita a dupla vinculação de eventos utilizando travas `data-initialized` e distribui tarefas para submódulos de UI especializados.
* **`mic_feedback.js`**: Submódulo gráfico dedicado a renderizar e animar balões flutuantes temporários ("PERFEITO!" ou "ERROU") nos nós geométricos das notas, alimentando dados de erro para o módulo `stats.js`.
* **`mic_score.js`**: Renderizador do dashboard analítico unificado em estilo Apple. Monta a marcação do modal de score do zero, exibe gráficos textuais de acertos, tempo e renderiza os blocos de recomendação e limpeza de dados.
* **`observer.js`**: Monitor dinâmico de digitação. Analisa as notas selecionadas e atualiza em tempo real as marcações numéricas de sugestão de dedos no diagrama ativo.
* **`render.js`**: Construtor estrutural do braço do instrumento. Desenha a matriz geométrica de trastes/cordas por CSS Grid e calcula as digitações ideais via biomecânica preditiva.
* **`ui.js`**: Gerenciador secundário de interações de interface, controlando a abertura e o fechamento de modais auxiliares e comportamentos de clique externo.

### Pasta: `js/ui/views/` (Componentes Injetáveis de Marcação)
* **`floating.js`**: Modelos de template strings para os controles flutuantes sobrepostos ao instrumento (Play/Stop/Backing Track).
* **`modals.js`**: Fragmentos de interface para sobreposições de contagem regressiva, calibração inicial e diálogos informativos.
* **`secondary.js`**: Componentes da barra de ferramentas inferior (Inversões de escala, visualização de notas/intervalos, seletores de cordas e inputs de velocidade BPM).
* **`topbar.js`**: Componentes do menu superior de controle (Seletores de tons, modos de escalas, alteração de temas estéticos e chaves de idiomas).

### Arquivo Core: `js/app.js`
* Maestro e coordenador do ciclo de vida da aplicação. Inicia o boot assíncrono seguro, gerencia a montagem sequencial das views injetadas, resgata o estado salvo no `localStorage` e executa o gatilho centralizador de renderização gráfica (`updateUI()`).
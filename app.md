# DIRETRIZES DE DESENVOLVIMENTO E REGRAS DO SISTEMA - TUTOR DE ESCALAS

Este documento contém as regras absolutas e decisões arquiteturais do projeto "Tutor de Escalas". **Qualquer IA ou desenvolvedor que manipular este código no futuro DEVE ler e respeitar estritamente estas regras.**

## 1. Arquitetura e Modularização
O projeto segue uma estrutura modular estrita baseada em Vanilla JS (sem frameworks pesados). A responsabilidade de cada diretório não deve ser misturada:
* **`js/app.js`**: Maestro (Entry Point). Orquestra a renderização, faz a ponte entre a lógica musical e a UI, e gerencia o boot da aplicação.
* **`js/data/`**: Contém dados estáticos, constantes, dicionários de tradução (i18n) e SVGs (flags).
* **`js/music/`**: Motor musical. Lógica de cálculo de escalas, CAGED, frequências (pitch), áudio e sequenciador. *A interface gráfica não deve ditar as regras musicais.*
* **`js/ui/`**: Motor de renderização. Lida com eventos do DOM, layout, CSS Grid do braço da guitarra e atualizações visuais.
* **Ambiente de Execução**: O app roda em navegadores padrão e embarcado via **WebView no Android Studio**. 

## 2. Regras de Ouro da Teoria Musical e CAGED
* **Janelas de 5 Trastes (Não suprima notas!):** As posições do sistema CAGED são calculadas com janelas básicas de 5 trastes (ex: 0 a 4, 2 a 6). Isso é obrigatório para suportar escalas diatônicas (como o Modo Jônio) sem amputar notas que exigem *stretch* (esticamento dos dedos).
* **Filtro de Uníssonos nas Posições:** Dentro dos blocos do CAGED (Pos 1 a 5), notas idênticas na mesma oitava (ex: Mizinha solta e Si na 5ª casa) **não podem se repetir**. O algoritmo deve identificar o *pitch* absoluto e priorizar o menor traste (dando sempre vitória à corda solta).
* **Áudio da Escala Completa (Coreografia Tática):** A sequência de reprodução da "Escala Completa" (braço inteiro) **NÃO DEVE** ser gerada apenas ordenando todas as notas do braço pelo *pitch* (o que causa saltos irreais de cordas). Ela **DEVE** ser a concatenação linear das 5 posições do CAGED tocadas em sequência, respeitando a biomecânica da guitarra.
* **Digitação Inteligente (`calcularDedoPorCorda`):** O cálculo dos dedos sugeridos para a mão esquerda deve ser avaliado **corda por corda** analisando os *gaps* (saltos de trastes) entre as notas daquela corda. Um mesmo dedo (ex: dedo 1) nunca deve ser sugerido duas vezes na mesma corda na mesma posição estática.

## 3. Renderização Visual e UI
* **Algoritmo Shrink-to-Fit:** Como as janelas base têm 5 trastes, escalas com poucas notas (como a Pentatônica) podem gerar colunas inteiramente vazias nas extremidades. Antes de renderizar, o `app.js` **DEVE** cortar as colunas vazias da esquerda e da direita para economizar espaço em tela.
* **Padrão Invertido (Corda Grave no Topo):** A funcionalidade de inverter o braço da guitarra é puramente visual e afeta apenas a ordem de renderização no CSS Grid (no `render.js`). Os IDs numéricos das notas (ex: `note-main-5-3`) e a estrutura de dados do sequenciador de áudio **NÃO DEVEM** ser alterados, garantindo que o áudio continue reproduzindo as cordas corretas.
* **Geração por CSS Grid:** O braço do instrumento é desenhado inteiramente por CSS Grid de forma dinâmica. Elementos HTML nunca devem ter tamanhos fixos em pixels mágicos que quebrem em telas menores.

## 4. Persistência de Dados (`localStorage`)
* O estado das escolhas do usuário (Tom, Escala, Modo, Velocidade, Filtros, Idioma, Tema, etc.) deve ser salvo a cada alteração usando o `localStorage`.
* **Regra Anti-FOUC (Flash of Unstyled Content):** O tema (Skin: Claro/Escuro/Vintage) deve ser lido e aplicado ao `document.body` **imediatamente** (usando uma IIFE no topo do script principal), antes de qualquer outra renderização, para evitar que a tela pisque em branco antes de ficar escura.
* **Ordem de Boot do Idioma:** O idioma salvo deve ser recuperado **antes** da renderização dos menus *dropdown* e antes da tradução dos textos estáticos (`applyLanguage`), garantindo que o DOM nasça na língua correta e os selects populados façam sentido.

## 5. Integração com Android WebView
* A persistência local só funciona se o Android Studio estiver configurado com `webSettings.domStorageEnabled = true`. Isso já foi feito na `MainActivity.kt`.
* O "Modo Tela Cheia" (Immersive Mode, ocultando a barra de bateria/relógio) **NÃO DEVE** ser tentado via HTML/JS API de Fullscreen. Ele é forçado de forma nativa no Android via `WindowCompat.setDecorFitsSystemWindows(window, false)` e `WindowInsetsControllerCompat`. Botões de tela cheia no HTML são desnecessários e indesejados neste contexto.

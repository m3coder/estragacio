<p align="center">
  <img src="icons/cat_dancing.gif" width="120" alt="Mascote Anime Dançante" style="border-radius: 50%; box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);" />
</p>

<h1 align="center">⚡ Estácio Suite AI (Extension & Userscript)</h1>

<p align="center">
  <b>A suíte definitiva de IA & automação para estudantes da Estácio: Solver com Multi-Provedores, Gabarito Persistente com Revisão de 1-Clique e Auto-Conclusão de Matérias</b>
</p>

<p align="center">
  <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript"><img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/"><img src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3"></a>
  <a href="https://www.tampermonkey.net/"><img src="https://img.shields.io/badge/Userscript-Tampermonkey-00485B?logo=tampermonkey&logoColor=white" alt="Tampermonkey"></a>
  <a href="https://esbuild.github.io/"><img src="https://img.shields.io/badge/Bundler-esbuild-FFCF00?logo=esbuild&logoColor=black" alt="esbuild"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT"></a>
</p>

<p align="center">
  <img src="icons/banner.png" width="100%" alt="Estácio Suite AI Dashboard Banner" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);" />
</p>

---

## 🌟 Funcionalidades Principais

### 1. 🎯 Resolução Inteligente de Provas & Simulados (`saladeavaliacoes.com.br`)
- 🤖 **Seleção Dinâmica de Provedor & Modelo**: Alterne na hora entre **Groq** (`llama-3.3-70b-versatile`, `deepseek-r1-distill`), **Mistral AI** (`mistral-large-latest`, `codestral-latest`), **Google Gemini** (`gemini-flash-latest`), **OpenAI** (`gpt-4o`, `o3-mini`) e **DeepSeek** (`deepseek-chat`, `deepseek-reasoner`).
- ⚡ **Auto-Fallback Inteligente**: Se a IA principal atingir limite de cota ou instabilidade, o sistema recorre em milissegundos a outra IA salva sem interromper sua prova.
- 📝 **Gabarito Visual Persistente**: Exibe badges com o gabarito completo na interface (`[Q1: B 🔍] [Q2: D 🔍]...`). Persiste contra `F5` / recarregamento de página.
- 📋 **Cópia Instantânea de Gabarito**: Botão de 1-clique para copiar o gabarito formatado e detalhado para a área de transferência.
- 🔍 **Revisão com 1-Clique Direto no Gabarito (Segunda Opinião)**: Dê 1 clique em qualquer badge do gabarito para reavaliar a questão instantaneamente com uma segunda IA (ex: reavaliar questão de cálculo com *Mistral Large PhD*).
- 🖱️ **Clique Nativo React Fiber**: Dispara o `setState` real do React para registrar as marcações de forma 100% persistente no banco da Estácio.

---

### 2. 📚 Conclusão Automática de Temas & Matérias (`estudante.estacio.br`)
- 🚀 **Ciclo Completo com State Machine**: Abre tema $\rightarrow$ extrai IDs de conteúdo $\rightarrow$ envia requisição de conclusão $\rightarrow$ retorna à grade $\rightarrow$ avança para o próximo tema pendente.
- ⏱️ **Delays Humanizados**: Intervalos randômicos de 3.0s a 5.0s entre ações para segurança e simulação de uso real.
- 🔑 **Captura Automática de Sessão**: Intercepta o `Bearer token` ativo diretamente das requisições do portal, sem necessidade de login manual.
- 🚫 **Zero Dependência Externa**: Roda 100% no navegador (sem necessidade de instalar Python, Node ou Playwright).

---

### 3. 🎨 Widget Flutuante com Mascote Chibi Animado
- 🐱 **Mascote Anime Dançante**: Mascote chibi de anime dançando no header do widget e na bolha minimizada (`@keyframes catDance`).
- 🖱️ **100% Arrastável (Draggable)**: Arraste a janela ou a bolha minimizada para qualquer canto da tela.
- 💾 **Memória de Posição**: As coordenadas da interface são salvas no `localStorage`, mantendo a posição exata após navegações.
- 🪟 **Modo Minimizável & Ocultável**: Minimize em bolha flutuante (`_`) ou oculte completamente (`✕`).
- 📋 **Logs Interativos**: Acompanhamento detalhado em tempo real com botão de cópia de logs com timestamps.

---

## 📊 Diagramas de Fluxo & Arquitetura (Mermaid)

### 🔄 1. Pipeline de Resolução de Provas & Auto-Fallback

```mermaid
flowchart TD
    A([🎯 Início: Resolver Prova]) --> B[Captura Question Cards no DOM]
    B --> C[Extrai Enunciado e Alternativas A-E]
    C --> D[Monta Prompt Acadêmico PhD JSON]
    D --> E{Consulta IA Selecionada}
    
    E -- Sucesso --> F[Recebe Letra e Justificativa]
    E -- Erro / 429 / 503 --> G{Existe Fallback Ativo?}
    G -- Sim: Groq / Mistral --> H[Chama Provedor Secundário]
    H --> F
    G -- Não --> I[Registra Erro no Log]
    
    F --> J[Dispara Clique Nativo React Fiber]
    J --> K[Marca Alternativa na Tela]
    K --> L[Adiciona Resposta ao Gabarito Salvo]
    L --> M[Renderiza Badges no Widget]
    M --> N{Mais Questões?}
    N -- Sim --> C
    N -- Não --> O([🎉 Prova Finalizada & Gabarito Salvo!])

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style F fill:#10b981,stroke:#047857,color:#fff
    style G fill:#f59e0b,stroke:#b45309,color:#fff
    style O fill:#8b5cf6,stroke:#6d28d9,color:#fff
```

---

### 🔍 2. Fluxo de Revisão de 1-Clique no Gabarito (Segunda Opinião)

```mermaid
sequenceDiagram
    autonumber
    actor Aluno as 👤 Aluno
    participant Widget as ⚡ Gabarito Widget
    participant DOM as 🖥️ DOM / React Fiber
    participant AI2 as 🧠 2ª IA (ex: Mistral Large)

    Aluno->>Widget: Clica na Badge [Q3: B 🔍]
    Widget->>Widget: Inicia Animação de Análise (Badge Dourada ⏳)
    Widget->>DOM: Rola suavemente até a Questão 3
    Widget->>AI2: Envia Enunciado + Alternativas
    AI2-->>Widget: Retorna {"letra": "D", "explicacao": "Cálculo corrigido..."}
    Widget->>DOM: Remarca Alternativa [D] via React Fiber
    Widget->>Widget: Atualiza Gabarito no localStorage
    Widget->>Widget: Atualiza Badge para [Q3: D 🔍] e Loga Parecer
```

---

### ⚙️ 3. State Machine da Conclusão Automática de Temas

```mermaid
stateDiagram-v2
    [*] --> CatalogaGrade: Usuário clica em 'Concluir Temas'
    CatalogaGrade --> IniciaFila: Identifica Temas Pendentes
    IniciaFila --> AbreTema: Clica no botão do Tema N
    
    state "Dentro do Tema" as InsideTheme {
        AbreTema --> ExtraiIDs: Lê turmaId, temaId, conteudoUuid
        ExtraiIDs --> EnviaPOST: POST /conclusoes + Bearer Token
        EnviaPOST --> AguardaDelay: Delay Humanizado (3.0s - 5.0s)
    }
    
    AguardaDelay --> VoltaGrade: Redireciona para /conteudos
    VoltaGrade --> ChecaRestantes: Incrementa ponteiro da fila
    
    ChecaRestantes --> AbreTema: Ainda há temas pendentes
    ChecaRestantes --> Concluido: Todos os temas finalizados
    Concluido --> [*]: 🏆 100% Concluído!
```

---

### 🏗️ 4. Arquitetura Modular do Código (`src/`)

```mermaid
graph TD
    subgraph UI ["🎨 Camada de Interface (UI)"]
        WIDGET[widget.js]
        DRAG[draggable.js]
        CSS[widget.css]
    end

    subgraph MODULES ["📦 Módulos de Domínio"]
        SOLVER[exam_solver.js]
        GABARITO[gabarito.js]
        REVIEW[reviewer.js]
        AUTOMATOR[theme_automator.js]
        PARSER[dom_parser.js]
    end

    subgraph CORE ["⚡ Núcleo e Integrações"]
        AI_ENG[ai_engine.js]
        PROMPT[prompt_builder.js]
        REACT[react_fiber.js]
    end

    subgraph CONFIG ["🔑 Configurações & Storage"]
        PROVIDERS[providers.js]
        STORAGE[storage.js]
        MASCOT[mascot.js]
    end

    WIDGET --> SOLVER
    WIDGET --> GABARITO
    WIDGET --> REVIEW
    WIDGET --> AUTOMATOR
    WIDGET --> DRAG
    WIDGET --> CSS

    SOLVER --> PARSER
    SOLVER --> AI_ENG
    SOLVER --> REACT
    SOLVER --> GABARITO

    REVIEW --> AI_ENG
    REVIEW --> REACT
    REVIEW --> GABARITO

    AUTOMATOR --> PARSER
    AUTOMATOR --> REACT
    AUTOMATOR --> STORAGE

    AI_ENG --> PROMPT
    AI_ENG --> PROVIDERS
    AI_ENG --> STORAGE
```

---

## 🛠️ Como Instalar

### Opção A: Userscript (Tampermonkey / Violentmonkey) — *Mais Rápido*
1. Instale a extensão [Tampermonkey](https://www.tampermonkey.net/) no seu navegador.
2. Crie um novo script e cole o conteúdo de [`estacio_solver.user.js`](./estacio_solver.user.js).
3. Salve com `Ctrl + S`.

### Opção B: Extensão do Chrome / Brave / Edge (Manifest V3)
1. Acesse `chrome://extensions/` no seu navegador.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione esta pasta `extensao_estacio`.

---

## 📄 Licença
Distribuído sob a licença **MIT**.

<p align="center">
  <img src="extensao_estacio/icons/cat_dancing.gif" width="120" alt="Mascote Anime Dançante" style="border-radius: 50%; box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);" />
</p>

<h1 align="center">⚡ Estácio Suite AI</h1>

<p align="center">
  <b>A suíte definitiva de IA & automação para estudantes da Estácio: Solver com Multi-Provedores (Claude, Mistral, Groq, Gemini, OpenAI, DeepSeek), Gabarito Persistente com Revisão de 1-Clique e Auto-Conclusão de Matérias</b>
</p>

<p align="center">
  <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript"><img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/"><img src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3"></a>
  <a href="https://www.tampermonkey.net/"><img src="https://img.shields.io/badge/Userscript-Tampermonkey-00485B?logo=tampermonkey&logoColor=white" alt="Tampermonkey"></a>
  <a href="https://esbuild.github.io/"><img src="https://img.shields.io/badge/Bundler-esbuild-FFCF00?logo=esbuild&logoColor=black" alt="esbuild"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT"></a>
</p>

<p align="center">
  <img src="extensao_estacio/icons/banner.png" width="100%" alt="Estácio Suite AI Dashboard Banner" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);" />
</p>

---

## 🌟 Funcionalidades Principais

### 1. 🎯 Resolução Inteligente de Provas & Simulados (`saladeavaliacoes.com.br`)
- 🤖 **Seleção Dinâmica de Provedor & Modelo**: Alterne na hora entre **Anthropic Claude** (`claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-5-haiku`), **Mistral AI** (`mistral-large-latest`, `codestral-latest`), **Groq** (`llama-3.3-70b-versatile`, `deepseek-r1-distill`), **Google Gemini** (`gemini-flash-latest`), **OpenAI** (`gpt-4o`, `o3-mini`) e **DeepSeek** (`deepseek-chat`, `deepseek-reasoner`).
- ⚡ **Auto-Fallback Inteligente**: Se a IA principal atingir limite de cota ou instabilidade, o sistema recorre em milissegundos a outra IA salva (Groq, Mistral ou Claude) sem interromper sua prova.
- 📝 **Gabarito Visual Persistente**: Exibe badges com o gabarito completo na interface (`[Q1: B 🔍] [Q2: D 🔍]...`). Persiste contra `F5` / recarregamento de página.
- 📋 **Cópia Instantânea de Gabarito**: Botão de 1-clique para copiar o gabarito formatado e detalhado para a área de transferência.
- 🔍 **Revisão com 1-Clique Direto no Gabarito (Segunda Opinião)**: Dê 1 clique em qualquer badge do gabarito para reavaliar a questão instantaneamente com uma segunda IA (ex: reavaliar questão de raciocínio com *Claude 3.7 Sonnet* ou *Mistral Large*).
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
    G -- Sim: Claude / Groq / Mistral --> H[Chama Provedor Secundário]
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
    participant AI2 as 🧠 2ª IA (ex: Claude 3.7 Sonnet / Mistral)

    Aluno->>Widget: Clica na Badge [Q3: B 🔍]
    Widget->>Widget: Inicia Animação de Análise (Badge Dourada ⏳)
    Widget->>DOM: Rola suavemente até a Questão 3
    Widget->>AI2: Envia Enunciado + Alternativas (Messages API)
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

## 🏗️ Estrutura de Pastas do Repositório

```text
extensao_estacio/
├── src/
│   ├── config/
│   │   ├── providers.js       # Registro de IAs (Claude, Mistral, Groq, Gemini, OpenAI, DeepSeek)
│   │   ├── storage.js         # Camada de armazenamento e tokens de sessão
│   │   └── mascot.js          # Mascote anime embutido em Base64
│   │
│   ├── core/
│   │   ├── ai_engine.js       # Chamadas HTTP para IAs e Auto-Fallback
│   │   ├── prompt_builder.js  # Formatação do prompt PhD com JSON estrito
│   │   └── react_fiber.js     # Dispatchers nativos do React (__reactProps$)
│   │
│   ├── modules/
│   │   ├── dom_parser.js      # Extração de questões e grade de matérias
│   │   ├── exam_solver.js     # Orquestrador da fila de resolução da prova
│   │   ├── gabarito.js        # Gerenciador de gabarito persistente e cópia
│   │   ├── reviewer.js        # Revisão com 1-clique (Segunda Opinião)
│   │   └── theme_automator.js # State Machine de conclusão automática
│   │
│   ├── ui/
│   │   ├── draggable.js       # Mecânica universal de drag & drop com memória
│   │   ├── widget.js          # Construtor da interface e eventos
│   │   └── widget.css         # Folha de estilos desacoplada
│   │
│   └── index.js               # Entry point do projeto
│
├── icons/                     # Ícones em PNG & GIF (16, 48, 128, mascot, banner)
├── build.js                   # Empacotador rápido (esbuild)
├── package.json
└── estacio_solver.user.js     # Bundle compilado final pronto para uso
```

### ⚡ Como compilar alterações:
```bash
cd extensao_estacio
npm install
npm run build
```
O comando `npm run build` compila tudo em milissegundos e atualiza simultaneamente:
- `estacio_solver.user.js` *(Tampermonkey Userscript)*
- `content/content.js` *(Extensão Chrome MV3)*
- `content/overlay.css` *(CSS sincronizado)*

---

## 🛠️ Como Instalar

### Opção A: Userscript (Tampermonkey / Violentmonkey) — *Mais Rápido*
1. Instale a extensão [Tampermonkey](https://www.tampermonkey.net/) no seu navegador (Chrome, Edge, Brave, Firefox, Opera).
2. Abra o painel do Tampermonkey e clique em **Criar um novo script (+)**.
3. Copie todo o conteúdo do arquivo [`extensao_estacio/estacio_solver.user.js`](./extensao_estacio/estacio_solver.user.js) e cole no editor.
4. Salve com `Ctrl + S`.
5. Acesse o portal da Estácio ou a Sala de Avaliações. O widget aparecerá automaticamente!

---

### Opção B: Extensão do Chrome / Brave / Edge (Manifest V3)
1. Baixe ou clone este repositório no seu computador.
2. Abra o navegador e acesse `chrome://extensions/` (ou `edge://extensions/` / `brave://extensions/`).
3. Ative a opção **Modo do desenvolvedor** (Developer mode) no canto superior direito.
4. Clique em **Carregar sem compactação** (Load unpacked).
5. Selecione a pasta `extensao_estacio` deste projeto.
6. Pronto! A extensão estará ativa com o ícone do gatinho.

---

## 🔑 Configuração de Chaves de API (Multi-Keys)

Você pode salvar as chaves de todos os seus provedores diretamente no campo do Widget:

| Provedor | Modelo Padrão | Modelos Disponíveis | Onde Obter Chave |
| :--- | :--- | :--- | :--- |
| **Anthropic Claude** | `claude-3-7-sonnet-20250219` | `Claude 3.7 Sonnet`, `Claude 3.5 Sonnet`, `Claude 3.5 Haiku` | [console.anthropic.com/keys](https://console.anthropic.com/settings/keys) |
| **Mistral AI** *(PhD / Raciocínio)* | `mistral-large-latest` | `Mistral Large`, `Codestral`, `Mistral Small` | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| **Groq** *(Ultra Rápido)* | `llama-3.3-70b-versatile` | `Llama 3.3 70B`, `DeepSeek R1 Distill 70B`, `Llama 3.1 8B` | [console.groq.com/keys](https://console.groq.com/keys) |
| **Google Gemini** | `gemini-flash-latest` | `Gemini Flash Latest`, `Gemini Pro Latest`, `Gemini 2.5 Flash` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `gpt-4o` | `GPT-4o`, `GPT-4o Mini`, `o3-mini` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **DeepSeek** | `deepseek-chat` | `DeepSeek V3`, `DeepSeek R1` | [platform.deepseek.com](https://platform.deepseek.com) |

> 🔒 **Segurança & Privacidade**: Suas chaves de API ficam salvas **exclusivamente no armazenamento local do seu próprio navegador** (`chrome.storage` / `localStorage`). Nenhuma chave ou dado sensível é enviado para servidores de terceiros.

---

## 📖 Como Usar

### 📝 Resolvendo Provas e Simulados:
1. Acesse a Sala de Avaliações (`https://estacio.saladeavaliacoes.com.br/`).
2. Abra a prova ou simulado desejado.
3. No widget flutuante, selecione sua IA e modelo desejado (ex: **Anthropic Claude** $\rightarrow$ `Claude 3.7 Sonnet` ou **Mistral AI** $\rightarrow$ `Mistral Large`).
4. Clique em **`[🎯 Resolver e Marcar Prova]`**.
5. Ao terminar, o **Gabarito** será exibido na tela.
6. Para revisar qualquer questão individual, basta dar **1 clique na badge da questão no gabarito** (ex: `[Q3: B 🔍]`) e a 2ª IA reavaliará a questão na hora!

### 📚 Concluindo Temas de Matérias:
1. Acesse a página de conteúdos de uma disciplina no portal do aluno (`https://estudante.estacio.br/disciplinas/{idTurma}/conteudos`).
2. Clique no botão **`[📚 Concluir Temas Desta Matéria]`** no widget.
3. O automador catalogará os temas pendentes, abrirá cada um em sequência, enviará a confirmação de leitura e retornará à lista até atingir 100% de conclusão.

---

## ⚖️ Aviso Legal / Disclaimer

Este projeto foi desenvolvido estritamente para **fins educacionais e de estudo sobre automação web, engenharia reversa de front-ends modernos e integração de APIs de inteligência artificial**. Os desenvolvedores não se responsabilizam pelo uso indevido da ferramenta. Utilize com responsabilidade.

---

## 📄 Licença

Distribuído sob a licença **MIT**.

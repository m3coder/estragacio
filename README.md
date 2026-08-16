<p align="center">
  <img src="extensao_estacio/icons/cat_dancing.gif" width="120" alt="Mascote Anime Dançante" style="border-radius: 50%; box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);" />
</p>

<h1 align="center">⚡ Estácio Suite AI v2.0.1</h1>

<p align="center">
  <b>A suíte definitiva de IA & automação para estudantes da Estácio: Multi-Provedores (Claude 3.7, Mistral PhD, Groq, Gemini, OpenAI, DeepSeek) com Descoberta Dinâmica de Modelos, Teste Live, Solver Incremental, Gabarito com 2ª Opinião e Auto-Conclusão de Matérias</b>
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

### 1. 🎯 Resolução Inteligente e Incremental de Provas (`saladeavaliacoes.com.br`)
- 🤖 **Multi-Provedores com Claude 3.7 Sonnet**: Suporte nativo a Anthropic Claude (`claude-3-7-sonnet-20250219`, `claude-3-5-sonnet`, `claude-3-5-haiku`), Mistral Large PhD, Groq Llama 3.3 70B, Google Gemini, OpenAI GPT-4o e DeepSeek R1.
- 📡 **Descoberta Dinâmica de Modelos (`GET /models`)**: Lista de modelos atualizada diretamente da API oficial de cada provedor em tempo real.
- 🧪 **Teste Live de Chaves (`[🧪 Testar & Salvar]`)**: Testa a conexão com a API antes de ativar o provedor. Apenas IAs com status `Live 🟢` aparecem nas listas de resolução.
- ⏩ **Solver Incremental (Anti-429 & Economia de Cota)**: Se atingir limite de cota durante uma prova, as questões já respondidas ficam salvas no gabarito. Ao clicar novamente, o sistema reaproveita o que já foi feito e consulta a IA **apenas para as questões pendentes**.
- 📝 **Gabarito Persistente com Revisão de 1-Clique**: Badges visuais no widget (`[Q1: B 🔍]...`). Clique em qualquer badge para pedir uma **2ª Opinião** para outra IA sem digitar nada.
- 🖱️ **Clique Nativo React Fiber**: Dispara o `setState` real do React para persistir as marcações com segurança.

---

### 2. 📚 Conclusão Automática de Temas & Matérias (`estudante.estacio.br`)
- 🚀 **Ciclo de 2 Ondas de POST + Clique Ativo**:
  1. **1ª Onda**: Dispara o `POST /conclusoes` para registrar o progresso e liberar o botão na tela (eliminando o timer de espera).
  2. **Clique Físico**: Rola a tela até o final, destrava e clica no botão `[Marcar como concluído]`.
  3. **2ª Onda**: Dispara o POST de confirmação imediata.
- 🔄 **Navegação Determinística**: Retorna diretamente para `https://estudante.estacio.br/disciplinas/{id_materia}/conteudos` (nunca volta para a tela inicial de todas as matérias).
- 🔒 **Deduplicação Estrita por Tema**: Processa perfeitamente temas simples e temas com múltiplos sub-itens (`Tema 1 | 2 Itens`) em loop contínuo até atingir 100% de conclusão.
- 🔑 **Captura Automática de Sessão**: Intercepta o `Bearer token` ativo automaticamente sem necessidade de login manual.

---

### 3. 🎨 Widget Flutuante com Mascote Chibi Animado
- 🐱 **Mascote Anime Dançante**: Animação suave no header do widget e na bolha minimizada.
- 🖱️ **100% Arrastável com Memória de Posição**: Posicione onde preferir; as coordenadas são salvas no `localStorage`.
- 🧹 **Limpeza em 1-Clique**: Botão de vassourinha `[🧹]` para limpar logs, gabaritos e filas acumuladas.
- 📋 **Cópia Silenciosa**: Cópia limpa e instantânea de gabaritos e logs sem poluir o terminal.

---

## 📊 Diagramas de Fluxo & Arquitetura (Mermaid)

### 🔄 1. Pipeline de Resolução de Provas com Retomada Incremental

```mermaid
flowchart TD
    A([🎯 Início: Resolver Prova]) --> B[Carrega Gabarito Salvo do localStorage]
    B --> C[Captura Question Cards no DOM]
    C --> D{Questão já respondida no Gabarito?}
    
    D -- Sim --> E[Marca Alternativa na Tela em 1ms ✅]
    D -- Não --> F[Extrai Enunciado e Alternativas A-E]
    F --> G[Monta Prompt Acadêmico PhD JSON]
    G --> H{Consulta IA Selecionada}
    
    H -- Sucesso --> I[Recebe Letra e Justificativa]
    H -- Erro / 429 --> J{Existe Outra IA Live 🟢?}
    J -- Sim: Groq / Claude / Mistral --> K[Chama Provedor Secundário]
    K --> I
    J -- Não --> L[Pausa Inteligente & Salva Progresso]
    
    I --> M[Dispara Clique Nativo React Fiber]
    M --> N[Salva Resposta Imediatamente no Gabarito]
    N --> O{Mais Questões?}
    O -- Sim --> D
    O -- Não --> P([🎉 Prova Finalizada & Gabarito Salvo!])

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style E fill:#10b981,stroke:#047857,color:#fff
    style I fill:#10b981,stroke:#047857,color:#fff
    style J fill:#f59e0b,stroke:#b45309,color:#fff
    style P fill:#8b5cf6,stroke:#6d28d9,color:#fff
```

---

### 🔄 2. Ciclo de Auto-Conclusão de Matérias

```mermaid
sequenceDiagram
    autonumber
    participant Auto as ⚡ Estácio Suite AI
    participant Portal as 🖥️ Portal do Aluno (Frontend)
    participant API as 🌐 API Estácio (Backend)

    Auto->>API: 1ª Onda: POST /conclusoes + /concluir
    API-->>Portal: Registra leitura & Libera botão na tela
    Auto->>Portal: Rola até o fim & Clica em [Marcar como concluído]
    Auto->>API: 2ª Onda: POST de Confirmação
    Auto->>Auto: Aguarda ~2.0s (sincronização do banco)
    Auto->>Portal: Retorna para /disciplinas/.../conteudos (Refresh)
    Note over Portal,API: Grade recarrega com badge verde [Concluído] ✅
    Auto->>Portal: Detecta próximo tema pendente e abre automaticamente!
```

---

## 🔑 Banco de Chaves de API (Multi-Keys)

| Provedor | Modelo Padrão | Modelos Disponíveis | Onde Obter Chave |
| :--- | :--- | :--- | :--- |
| **Anthropic Claude** | `claude-3-7-sonnet-20250219` | `Claude 3.7 Sonnet`, `Claude 3.5 Sonnet`, `Claude 3.5 Haiku` | [console.anthropic.com/keys](https://console.anthropic.com/settings/keys) |
| **Groq** *(Ultra Rápido)* | `llama-3.3-70b-versatile` | `Llama 3.3 70B`, `DeepSeek R1 Distill 70B`, `Llama 3.1 8B` | [console.groq.com/keys](https://console.groq.com/keys) |
| **Mistral AI** *(PhD)* | `mistral-large-latest` | `Mistral Large`, `Codestral`, `Mistral Small` | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| **Google Gemini** | `gemini-flash-latest` | `Gemini Flash Latest`, `Gemini Pro Latest`, `Gemini 2.5 Flash` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `gpt-4o` | `GPT-4o`, `GPT-4o Mini`, `o3-mini` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **DeepSeek** | `deepseek-chat` | `DeepSeek V3`, `DeepSeek R1` | [platform.deepseek.com](https://platform.deepseek.com) |

---

## 🛠️ Como Instalar

### Opção A: Userscript (Tampermonkey / Violentmonkey) — *Mais Rápido*
1. Instale o [Tampermonkey](https://www.tampermonkey.net/) no seu navegador.
2. Crie um novo script e cole o código de [`extensao_estacio/estacio_solver.user.js`](./extensao_estacio/estacio_solver.user.js).
3. Salve com `Ctrl + S`.

### Opção B: Extensão do Chrome / Brave / Edge (Manifest V3)
1. Acesse `chrome://extensions/` no seu navegador.
2. Ative o **Modo do desenvolvedor** no canto superior direito.
3. Clique em **Carregar sem compactação** e selecione a pasta `extensao_estacio`.

---

## 📄 Licença
Distribuído sob a licença **MIT**.

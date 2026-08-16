<p align="center">
  <img src="extensao_estacio/icons/cat_mascot.png" width="140" alt="Estácio Suite AI Mascote" style="border-radius: 50%; box-shadow: 0 0 20px rgba(96, 165, 250, 0.6);" />
</p>

<h1 align="center">⚡ Estácio Suite AI</h1>

<p align="center">
  <b>Suite All-in-One da Estácio: Solver de Provas com IA Multi-Provedor, Gabarito com 1-Clique para Revisão e Auto-Conclusão de Matérias</b>
</p>

<p align="center">
  <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript"><img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/"><img src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3"></a>
  <a href="https://www.tampermonkey.net/"><img src="https://img.shields.io/badge/Userscript-Tampermonkey-00485B?logo=tampermonkey&logoColor=white" alt="Tampermonkey"></a>
  <a href="https://esbuild.github.io/"><img src="https://img.shields.io/badge/Bundler-esbuild-FFCF00?logo=esbuild&logoColor=black" alt="esbuild"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT"></a>
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

## 🏗️ Arquitetura Modular (`extensao_estacio/src/`)

O código-fonte é 100% modular, desacoplado e compilado via `esbuild`:

```text
extensao_estacio/
├── src/
│   ├── config/
│   │   ├── providers.js       # Registro de IAs, modelos e endpoints
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
├── icons/                     # Ícones em PNG (16, 48, 128, mascot)
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
6. Pronto! A extensão estará ativa.

---

## 🔑 Configuração de Chaves de API (Multi-Keys)

Você pode salvar as chaves de todos os seus provedores diretamente no campo do Widget:

| Provedor | Modelo Padrão | Onde Obter Chave Gratuita |
| :--- | :--- | :--- |
| **Groq** *(Ultra Rápido)* | `llama-3.3-70b-versatile` | [console.groq.com/keys](https://console.groq.com/keys) |
| **Mistral AI** *(PhD / Raciocínio)* | `mistral-large-latest` | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| **Google Gemini** | `gemini-flash-latest` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `gpt-4o` / `o3-mini` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **DeepSeek** | `deepseek-chat` / `deepseek-reasoner` | [platform.deepseek.com](https://platform.deepseek.com) |

> 🔒 **Segurança & Privacidade**: Suas chaves de API ficam salvas **exclusivamente no armazenamento local do seu próprio navegador** (`chrome.storage` / `localStorage`). Nenhuma chave ou dado sensível é enviado para servidores de terceiros.

---

## 📖 Como Usar

### 📝 Resolvendo Provas e Simulados:
1. Acesse a Sala de Avaliações (`https://estacio.saladeavaliacoes.com.br/`).
2. Abra a prova ou simulado desejado.
3. No widget flutuante, selecione sua IA e modelo desejado (ex: **Mistral AI** $\rightarrow$ `Mistral Large (PhD)`).
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

# ⚡ Estácio Suite AI (Solver de Provas & Auto-Conclusão de Matérias)

[![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Chrome Extension](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![Tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-00485B?logo=tampermonkey&logoColor=white)](https://www.tampermonkey.net/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A suíte definitiva de produtividade e automação para estudantes da **Estácio**, integrando **resolução de provas com inteligência artificial multi-provedor**, **gabarito persistente com 1-clique para cópia**, **revisão com segunda opinião de IA** e **conclusão automática de temas/matérias** diretamente no navegador.

---

## 🌟 Funcionalidades Principais

### 1. 🎯 Resolução Inteligente de Provas & Simulados (`saladeavaliacoes.com.br`)
- 🤖 **Suporte Multi-Model IA**: Escolha entre **Groq** (`llama-3.3-70b`), **Mistral AI** (`mistral-large`, `codestral`), **Google Gemini** (`gemini-flash-latest`), **OpenAI** (`gpt-4o`, `o3-mini`) e **DeepSeek** (`V3`, `R1`).
- ⚡ **Auto-Fallback Inteligente**: Se a IA principal sofrer instabilidade ou limite de cota, o sistema recorre automaticamente ao Groq ou Mistral em milissegundos sem interromper sua prova.
- 📝 **Gabarito Visual Persistente**: Exibe badges com o gabarito completo na interface (`[Q1: B] [Q2: D]...`). Persiste contra `F5` / recarregamento de página.
- 📋 **Cópia Instantânea de Gabarito**: Botão de 1-clique para copiar o gabarito formatado e detalhado para sua área de transferência.
- 🔍 **Revisão com Segunda Opinião**: Permite selecionar qualquer questão individual e reavaliá-la com outra IA diferente (ex: revisar uma questão de cálculo com *Mistral Large* enquanto resolve o resto com *Groq*).
- 🖱️ **Clique Nativo React Fiber**: Dispara o `setState` real do React para registrar as marcações de forma 100% persistente no banco da Estácio.

---

### 2. 📚 Conclusão Automática de Temas & Matérias (`estudante.estacio.br`)
- 🚀 **Ciclo Completo com State Machine**: Abre tema $\rightarrow$ extrai IDs de conteúdo $\rightarrow$ envia requisição de conclusão $\rightarrow$ retorna à grade $\rightarrow$ avança para o próximo tema pendente.
- ⏱️ **Delays Humanizados**: Intervalos randômicos de 3.0s a 5.0s entre ações para segurança e simulação de uso real.
- 🔑 **Captura Automática de Sessão**: Intercepta o `Bearer token` ativo diretamente das requisições do portal, sem necessidade de configuração manual.
- 🚫 **Zero Dependência Externa**: Roda 100% no navegador (sem necessidade de instalar Python, Node ou Playwright).

---

### 3. 🎨 Widget Flutuante Moderno & Arrastável
- 🖱️ **100% Arrastável (Draggable)**: Arraste a janela ou a bolha minimizada para qualquer canto da tela.
- 💾 **Memória de Posição**: As coordenadas da interface são salvas no `localStorage`, mantendo a posição exata mesmo após navegações e recarregamentos.
- 🪟 **Modo Minimizável & Ocultável**: Minimize em bolha flutuante (`_`) ou oculte completamente (`✕`).
- 📋 **Logs Interativos**: Acompanhamento detalhado em tempo real com botão de cópia de logs com timestamps.

---

## 🛠️ Como Instalar

### Opção A: Userscript (Tampermonkey / Violentmonkey)
> **Recomendado para instalação rápida e multiplataforma.**

1. Instale a extensão [Tampermonkey](https://www.tampermonkey.net/) no seu navegador (Chrome, Edge, Brave, Firefox, Opera, etc.).
2. Abra o dashboard do Tampermonkey e clique em **Criar um novo script (+)**.
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

Você pode salvar as chaves de todos os seus provedores simultaneamente no Popup da extensão ou no campo do Widget:

| Provedor | Modelo Recomendado | Onde Obter Chave Gratuita |
| :--- | :--- | :--- |
| **Groq** *(Ultra Rápido)* | `llama-3.3-70b-versatile` | [console.groq.com/keys](https://console.groq.com/keys) |
| **Mistral AI** *(PhD / Raciocínio)* | `mistral-large-latest` | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| **Google Gemini** | `gemini-flash-latest` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `gpt-4o` / `o3-mini` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **DeepSeek** | `deepseek-chat` / `deepseek-reasoner` | [platform.deepseek.com](https://platform.deepseek.com) |

> 🔒 **Segurança & Privacidade**: Suas chaves de API ficam salvas **exclusivamente no armazenamento local do seu próprio navegador** (`chrome.storage` / `localStorage`). Nenhuma chave ou dado é enviado para servidores externos além da API oficial de IA escolhida por você.

---

## 📖 Como Usar

### 📝 Resolvendo Provas e Simulados:
1. Acesse a Sala de Avaliações (`https://estacio.saladeavaliacoes.com.br/`).
2. Abra a prova ou simulado desejado.
3. No widget flutuante, selecione sua IA principal (ex: **Groq** ou **Mistral**).
4. Clique em **`[🎯 Resolver e Marcar Prova]`**.
5. Acompanhe a resolução questão a questão. Ao terminar, o **Gabarito** será exibido com a opção de copiar!
6. Se tiver dúvida em alguma questão específica, selecione o número da questão no campo `🔍 Revisar Q: [ ]` e clique em **`Reavaliar`** com outra IA para obter uma segunda opinião.

### 📚 Concluindo Temas de Matérias:
1. Acesse a página de conteúdos de uma disciplina no portal do aluno (`https://estudante.estacio.br/disciplinas/{idTurma}/conteudos`).
2. Clique no botão **`[📚 Concluir Temas Desta Matéria]`** no widget.
3. O automador catalogará os temas pendentes, abrirá cada um em sequência, enviará a confirmação de leitura e retornará à lista até atingir 100% de conclusão.

---

## ⚖️ Aviso Legal / Disclaimer

Este projeto foi desenvolvido estritamente para **fins educacionais e de estudo sobre automação web, extensões de navegadores e integração de APIs de inteligência artificial**. Os desenvolvedores não se responsabilizam pelo uso indevido da ferramenta. Utilize com responsabilidade e em conformidade com as diretrizes da sua instituição de ensino.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

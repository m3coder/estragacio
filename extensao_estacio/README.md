<p align="center">
  <img src="icons/cat_dancing.gif" width="120" alt="Mascote Anime Dançante" style="border-radius: 50%; box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);" />
</p>

<h1 align="center">⚡ Estácio Suite AI (Extension & Userscript)</h1>

<p align="center">
  <b>A suíte definitiva de IA & automação para estudantes da Estácio: Solver com Multi-Provedores (Claude, Mistral, Groq, Gemini, OpenAI, DeepSeek), Gabarito Persistente com Revisão de 1-Clique e Auto-Conclusão de Matérias</b>
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
- 🤖 **Seleção Dinâmica de Provedor & Modelo**: Alterne na hora entre **Anthropic Claude** (`claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-5-haiku`), **Mistral AI** (`mistral-large-latest`, `codestral-latest`), **Groq** (`llama-3.3-70b-versatile`, `deepseek-r1-distill`), **Google Gemini** (`gemini-flash-latest`), **OpenAI** (`gpt-4o`, `o3-mini`) e **DeepSeek** (`deepseek-chat`, `deepseek-reasoner`).
- ⚡ **Auto-Fallback Inteligente**: Se a IA principal atingir limite de cota ou instabilidade, o sistema recorre em milissegundos a outra IA salva sem interromper sua prova.
- 📝 **Gabarito Visual Persistente**: Exibe badges com o gabarito completo na interface (`[Q1: B 🔍] [Q2: D 🔍]...`). Persiste contra `F5` / recarregamento de página.
- 📋 **Cópia Instantânea de Gabarito**: Botão de 1-clique para copiar o gabarito formatado e detalhado para a área de transferência.
- 🔍 **Revisão com 1-Clique Direto no Gabarito (Segunda Opinião)**: Dê 1 clique em qualquer badge do gabarito para reavaliar a questão instantaneamente com uma segunda IA (ex: reavaliar questão de cálculo com *Claude 3.7 Sonnet* ou *Mistral Large PhD*).
- 🖱️ **Clique Nativo React Fiber**: Dispara o `setState` real do React para registrar as marcações de forma 100% persistente no banco da Estácio.

---

## 🔑 Configuração de Chaves de API (Multi-Keys)

| Provedor | Modelo Padrão | Modelos Disponíveis | Onde Obter Chave |
| :--- | :--- | :--- | :--- |
| **Anthropic Claude** | `claude-3-7-sonnet-20250219` | `Claude 3.7 Sonnet`, `Claude 3.5 Sonnet`, `Claude 3.5 Haiku` | [console.anthropic.com/keys](https://console.anthropic.com/settings/keys) |
| **Mistral AI** *(PhD / Raciocínio)* | `mistral-large-latest` | `Mistral Large`, `Codestral`, `Mistral Small` | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| **Groq** *(Ultra Rápido)* | `llama-3.3-70b-versatile` | `Llama 3.3 70B`, `DeepSeek R1 Distill 70B`, `Llama 3.1 8B` | [console.groq.com/keys](https://console.groq.com/keys) |
| **Google Gemini** | `gemini-flash-latest` | `Gemini Flash Latest`, `Gemini Pro Latest`, `Gemini 2.5 Flash` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `gpt-4o` | `GPT-4o`, `GPT-4o Mini`, `o3-mini` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **DeepSeek** | `deepseek-chat` | `DeepSeek V3`, `DeepSeek R1` | [platform.deepseek.com](https://platform.deepseek.com) |

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

<p align="center">
  <img src="icons/cat_dancing.gif" width="120" alt="Mascote Anime Dançante" style="border-radius: 50%; box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);" />
</p>

<h1 align="center">⚡ Estácio Suite AI (Extension & Userscript) v2.0.1</h1>

<p align="center">
  <b>A suíte definitiva de IA & automação para estudantes da Estácio: Multi-Provedores (Claude, Mistral, Groq, Gemini, OpenAI, DeepSeek) com Descoberta Dinâmica de Modelos, Teste Live, Solver Incremental, Gabarito com 2ª Opinião e Auto-Conclusão de Matérias</b>
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

## 🌟 Novidades da Versão 2.0.1

1. **🔄 Sincronização Unificada de Chaves**:
   - As chaves de API e configurações salvas no **Popup Dashboard da Extensão** são sincronizadas instantaneamente e de forma bidirecional com o **Widget Flutuante na Página** (`chrome.storage.local` $\leftrightarrow$ `localStorage`).

2. **📡 Descoberta Dinâmica de Modelos (`GET /models`)**:
   - A lista do seletor `🧠 Modelo` é puxada em tempo real direto da API oficial de cada provedor (Groq, Mistral, Gemini, Claude, OpenAI, DeepSeek), disponibilizando na hora os modelos mais recentes da sua conta.

3. **🧪 Teste Live em Tempo Real (`[🧪 Testar & Salvar]`)**:
   - Ao salvar uma chave, o sistema realiza um teste de conexão real. Apenas provedores aprovados e ativos (`Live 🟢`) são exibidos nas listas de resolução e de 2ª Opinião.

4. **⏩ Solver Incremental Anti-429**:
   - Resolução inteligente de provas: se atingir limite de cota em uma questão, o gabarito das anteriores fica gravado. Ao clicar novamente, o script **reaproveita as questões já respondidas** e consulta a IA **apenas para as questões pendentes** com intervalo anti-rate-limit.

5. **📚 Auto-Conclusão de Matérias com Ciclo Completo de 2 Ondas**:
   - **1ª Onda POST (`/conclusoes`)**: Registra leitura no backend e libera o botão físico na interface.
   - **Clique Ativo React**: Rola a tela e clica no botão destravado `[Marcar como concluído]`.
   - **2ª Onda POST**: Confirmação de persistência no banco da Estácio.
   - **Deduplicação Estrita**: Reconhece perfeitamente temas de múltiplos sub-itens (`Tema 1 | 2 Itens`) e avança sequencialmente sem interrupção.

---

## 🔑 Provedores Suportados e Onde Obter Chaves

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
1. Instale a extensão [Tampermonkey](https://www.tampermonkey.net/) no seu navegador.
2. Crie um novo script e cole o conteúdo de [`estacio_solver.user.js`](./estacio_solver.user.js).
3. Salve com `Ctrl + S`.

### Opção B: Extensão do Chrome / Brave / Edge (Manifest V3)
1. Acesse `chrome://extensions/` no seu navegador.
2. Ative o **Modo do desenvolvedor** no canto superior direito.
3. Clique em **Carregar sem compactação** e selecione esta pasta `extensao_estacio`.

---

## 📄 Licença
Distribuído sob a licença **MIT**.

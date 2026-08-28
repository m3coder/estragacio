<p align="center">
  <img src="icons/cat_dancing.gif" width="120" alt="Mascote Gatinho Dançarino" style="border-radius: 50%; box-shadow: 0 0 25px rgba(168, 85, 247, 0.7);" />
</p>

<h1 align="center">⚡ Estácio Suite AI (Extension & Userscript) v2.5.5</h1>

<p align="center">
  <b>A suíte definitiva de IA & automação para estudantes da Estácio: Multi-Provedores (Groq, Gemini, OpenRouter/Hermes, Ollama Local, Mistral, Claude, OpenAI, DeepSeek), Filtro Free/Pagos, Mapeamento Visual de 10 Questões, 1-Click Retry/Revisão, Aplicação Instantânea de Gabarito (0 IA) e Auto-Conclusão de Matérias</b>
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

## 🌟 Novidades da Versão 2.5.5

1. **🗺️ Mapeamento Visual Completo das 10 Questões no Gabarito**:
   - Assim que a prova abre, as 10 questões aparecem mapeadas no topo do painel (`Q1` a `Q10`).
   - Estados visuais em tempo real:
     - 🟢 **Verde (`Qx: [ Letra ] ✅ 🔍`)**: Concluída e marcada com sucesso. Clique para pedir **2ª Opinião / Revisão**!
     - 🔴 **Vermelho (`Qx: ❌ Retry`)**: Questão que falhou. Clique para **Tentar Novamente (Retry Instantâneo)**!
     - 🔄 **Azul Pulsante (`Qx: 🔄`)**: Sendo processada pela IA no momento.
     - ⚪ **Cinza (`Qx: - ⏳`)**: Pendente. Clique para resolver individualmente em 1 clique.

2. **⚡ Botão "Aplicar na Prova" (0 Consumo de IA)**:
   - Se a tela recarregar ou desmarcar alternativas, basta clicar em **`[⚡ Aplicar na Prova]`**: o script lê as respostas já salvas no Gabarito e marca todas as alternativas na tela em segundos sem gastar cota de IA.

3. **🔘 Filtro Inteligente Free / Pagos (`[🟢 Apenas Free]` $\leftrightarrow$ `[💎 Free + Pagos]`)**:
   - Por padrão, exibe apenas modelos 100% gratuitos e de cota livre (Groq, Gemini Flash, OpenRouter `:free`, Ollama local).
   - Com 1 clique no botão toggle, desbloqueia todos os modelos premium e avançados (Claude Opus, GPT-4o, Mistral Large, Hermes 405B).

4. **💃 Mascote Gatinho Dançando com Passinho Fortnite**:
   - Animação ritmada e divertida no cabeçalho do widget e na bolha flutuante minimizada.

5. **🔄 Sincronização em Tempo Real (`chrome.storage.local` $\leftrightarrow$ `localStorage`)**:
   - As chaves de API e configurações salvas no popup refletem na hora no widget flutuante da página sem precisar dar F5.

6. **📚 Auto-Conclusão de Matérias com Alerta Sonoro e Verificação Contínua de "Concluído"**:
   - **Disparo de Leitura & Bypass de CORS**: Envio de confirmação via Universal Fetch no Chrome MV3 e Tampermonkey.
   - **Clique Ativo React Fiber**: Disparo de eventos `pointerdown`, `mousedown`, `pointerup`, `mouseup` e `click`.
   - **🔔 Alerta Sonoro Nativo (Web Audio API)**: Toca um bipe suave de atenção quando o botão está pronto para ação.
   - **🎯 Detecção Inteligente de Status "Concluído"**: Monitora ativamente o DOM da página; assim que o status "Concluído" é registrado (seja por auto-clique ou intervenção do aluno), toca um som de sucesso e retorna automaticamente para a grade da matéria para avançar ao próximo tema.
   - **🏆 Fanfarra de Conclusão Total**: Ao finalizar 100% dos temas da disciplina, dispara comemoração sonora e encerra o ciclo.

---

## 🔑 Provedores Suportados e Onde Obter Chaves

| Provedor | Modelo Padrão Free | Modelos Disponíveis | Onde Obter Chave |
| :--- | :--- | :--- | :--- |
| **Groq** *(100% Free / Ultra Rápido)* | `llama-3.3-70b-versatile` | `Llama 3.3 70B`, `DeepSeek R1 Distill 70B`, `Llama 3.1 8B` | [console.groq.com/keys](https://console.groq.com/keys) |
| **Google Gemini** | `gemini-2.5-flash` | `Gemini 2.5 Flash`, `Gemini 2.0 Flash`, `Gemini 1.5 Flash`, `Gemini 1.5 Pro` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **OpenRouter** *(Nous Hermes & Free Router)* | `openrouter/free` | `OpenRouter Free Router`, `Gemma 4 31B`, `Nemotron 3 Ultra`, `Hermes 3` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Ollama** *(100% Local Offline)* | `llama3.3` | `Llama 3.3`, `DeepSeek R1`, `Hermes 3`, `Qwen 2.5`, `Mistral` | [ollama.com](https://ollama.com) |
| **Mistral AI** *(PhD)* | `codestral-latest` | `Codestral Latest`, `Mistral Small`, `Mistral Large` | [console.mistral.ai/api-keys](https://console.mistral.ai/api-keys) |
| **Anthropic Claude** | `claude-3-7-sonnet-20250219` | `Claude 3.7 Sonnet`, `Claude 3.5 Sonnet`, `Claude 3.5 Haiku` | [console.anthropic.com/keys](https://console.anthropic.com/settings/keys) |
| **OpenAI** | `gpt-4o-mini` | `GPT-4o Mini`, `GPT-4o`, `o3-mini` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
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

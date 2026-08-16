# ⚡ Estácio Suite AI & Automation

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension%20MV3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![Tampermonkey](https://img.shields.io/badge/Userscript-Tampermonkey-00485B?logo=tampermonkey&logoColor=white)](https://www.tampermonkey.net/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Suíte completa de produtividade e automação para estudantes da **Estácio**, dividida em duas formas de uso:

1. **🌐 Extensão & Userscript Web (`extensao_estacio/`)**: Resolução de provas com IA Multi-Provedor, Gabarito visual com cópia rápida, Revisão com segunda opinião e conclusão automática de matérias direto no navegador (sem necessidade de Python).
2. **🐍 CLI Python & TUI (`main.py` / `app_tui.py`)**: Automação desktop via terminal com Playwright e interface interativa Textual TUI.

---

## 📁 Estrutura do Projeto

```text
estragacio/
├── extensao_estacio/              # 🌐 Extensão Chrome e Userscript Tampermonkey
│   ├── estacio_solver.user.js     # Userscript completo All-in-One
│   ├── manifest.json              # Manifesto Chrome MV3
│   ├── background/                # Service Worker (Chamadas de IA & Fallback)
│   ├── content/                   # Content Scripts & Widget Flutuante
│   ├── popup/                     # Interface de Configurações & Banco de Chaves
│   └── README.md                  # Documentação detalhada da extensão
│
├── main.py                        # 🐍 Script CLI de automação Playwright
├── app_tui.py                     # 🖥️ Interface interativa no terminal (Textual)
├── concluir_urls.py               # 🔗 Utilitário de conclusão via lista de URLs
├── pyproject.toml                 # 📦 Configuração do projeto Python
├── requirements-estacio.txt       # 📋 Dependências Python
├── .env.example                   # 📄 Modelo de variáveis de ambiente
└── README.md                      # 📖 Esta documentação
```

---

## 🌐 1. Extensão Web & Userscript (Recomendado)

> Consulte a documentação completa em [`extensao_estacio/README.md`](./extensao_estacio/README.md).

### ✨ Destaques da Extensão:
- **🤖 Multi-Model AI**: Suporte a **Groq** (`llama-3.3-70b`), **Mistral AI** (`mistral-large`), **Google Gemini** (`gemini-flash-latest`), **OpenAI** (`gpt-4o`) e **DeepSeek** (`V3`).
- **⚡ Auto-Fallback Inteligente**: Se a IA principal falhar ou atingir cota, alterna instantaneamente para Groq ou Mistral sem travar a prova.
- **📝 Gabarito Persistente & Cópia Instantânea**: Badges coloridas com respostas salvas no navegador (resistente a `F5`) e botão de cópia de gabarito formatado com 1 clique.
- **🔍 Revisão com Segunda Opinião**: Reavalie questões individuais com IAs diferentes para tirar dúvidas em questões de cálculo.
- **📚 Conclusão Automática de Temas**: State machine inteligente com delays humanizados (3 a 5 segundos) e captura automática de token de sessão.
- **🖱️ Widget Flutuante**: Arrastável para qualquer lugar da tela, minimizável em bolha e com memória de posição no `localStorage`.

---

## 🐍 2. Automação CLI Python (Desktop)

### Instalação:

1. Clone o repositório:
   ```bash
   git clone https://github.com/m3coder/estragacio.git
   cd estragacio
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements-estacio.txt
   playwright install chromium
   ```

4. Configure o arquivo `.env`:
   ```bash
   cp .env.example .env
   # Edite o .env com suas credenciais
   ```

5. Execute a interface interativa (TUI) ou o CLI:
   ```bash
   python app_tui.py
   # ou
   python main.py
   ```

---

## 🔒 Segurança e Privacidade

- **Nenhuma credencial ou chave é armazenada em servidores externos**.
- As chaves de API ficam salvas **exclusivamente no armazenamento local do seu próprio navegador** (`chrome.storage` / `localStorage`) ou no seu arquivo local `.env` (ignorado pelo Git).
- O arquivo `.gitignore` previne a inclusão acidental de arquivos de ambiente e perfis de sessão.

---

## ⚖️ Aviso Legal / Disclaimer

Este projeto foi desenvolvido estritamente para **fins de estudo, pesquisa em automação de navegadores e integração de APIs de inteligência artificial**. Os autores não se responsabilizam pelo uso indevido deste software.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

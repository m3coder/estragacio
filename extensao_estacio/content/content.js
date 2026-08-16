// Estácio Suite AI - Content Script Bundle (MV3)
(() => {
  // src/ui/widget.css
  if (typeof GM_addStyle !== "undefined") {
    GM_addStyle('/* Estilo do Widget Flutuante Est\xE1cio Suite AI */\n\n#estacio-suite-box,\n#estacio-solver-widget {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 375px;\n  background: rgba(15, 23, 42, 0.97);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 14px;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);\n  color: #f8fafc;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  z-index: 99999999;\n  overflow: hidden;\n  transition: box-shadow 0.2s ease, opacity 0.2s ease;\n  user-select: none;\n}\n\n#estacio-suite-box.minimized,\n#estacio-solver-widget.minimized {\n  width: 48px !important;\n  height: 48px !important;\n  border-radius: 50% !important;\n  cursor: grab !important;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  padding: 0;\n  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);\n}\n\n#estacio-suite-box.minimized:active,\n#estacio-solver-widget.minimized:active {\n  cursor: grabbing !important;\n}\n\n#estacio-suite-box.minimized .box-inner,\n#estacio-solver-widget.minimized .widget-header,\n#estacio-solver-widget.minimized .widget-body,\n#estacio-solver-widget.minimized .widget-footer {\n  display: none !important;\n}\n\n#estacio-suite-box.minimized::after,\n#estacio-solver-widget.minimized::after {\n  content: "\u26A1";\n  font-size: 22px;\n}\n\n#estacio-suite-box.hidden-box,\n#estacio-solver-widget.hidden-box {\n  display: none !important;\n}\n\n#estacio-suite-toggle-btn {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  color: #fff;\n  border: 1px solid rgba(255, 255, 255, 0.25);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  font-size: 20px;\n  cursor: grab;\n  z-index: 99999999;\n}\n\n#estacio-suite-toggle-btn:active {\n  cursor: grabbing;\n}\n\n.box-header,\n.widget-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  background: rgba(30, 41, 59, 0.85);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  cursor: grab;\n}\n\n.box-header:active,\n.widget-header:active {\n  cursor: grabbing;\n}\n\n.box-title,\n.widget-title {\n  font-size: 13px;\n  font-weight: 700;\n  background: linear-gradient(135deg, #60a5fa, #a78bfa);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.box-controls,\n.widget-controls {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.box-ctrl-btn,\n.widget-btn-icon {\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 13px;\n  padding: 2px 4px;\n  line-height: 1;\n  border-radius: 4px;\n  transition: color 0.15s, background 0.15s;\n}\n\n.box-ctrl-btn:hover,\n.widget-btn-icon:hover {\n  color: #fff;\n  background: rgba(255, 255, 255, 0.1);\n}\n\n.box-body,\n.widget-body {\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n}\n\n.ai-selector-container {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.35);\n  padding: 8px 10px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.ai-selector-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 11px;\n}\n\n.ai-selector-select {\n  background: #1e293b;\n  color: #38bdf8;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 3px 6px;\n  cursor: pointer;\n  outline: none;\n  flex: 1;\n  max-width: 230px;\n}\n\n.key-config-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.25);\n  padding: 5px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.key-config-input {\n  flex: 1;\n  background: #1e293b;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  color: #fff;\n  padding: 4px 6px;\n  font-size: 11px;\n  font-family: monospace;\n}\n\n.box-btn,\n.widget-btn {\n  padding: 10px 14px;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  transition: all 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n}\n\n.box-btn-primary,\n.widget-btn-primary {\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);\n}\n\n.box-btn-success,\n.widget-btn-success {\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);\n}\n\n.box-btn:hover:not(:disabled),\n.widget-btn:hover:not(:disabled) {\n  opacity: 0.92;\n  transform: translateY(-1px);\n}\n\n.box-btn:disabled,\n.widget-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* Gabarito Inteligente com 1-Clique para Revis\xE3o */\n.gabarito-container {\n  background: rgba(15, 23, 42, 0.92);\n  border: 1px solid rgba(56, 189, 248, 0.35);\n  border-radius: 8px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.gabarito-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 11px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.gabarito-badges {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  max-height: 100px;\n  overflow-y: auto;\n  padding: 2px 0;\n}\n\n.gabarito-badge {\n  background: #1e293b;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 5px;\n  padding: 3px 7px;\n  font-size: 11px;\n  font-weight: 600;\n  color: #f1f5f9;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  position: relative;\n}\n\n.gabarito-badge:hover {\n  border-color: #a855f7;\n  background: rgba(168, 85, 247, 0.2);\n  transform: translateY(-1px) scale(1.05);\n  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);\n}\n\n.gabarito-badge.reviewing {\n  border-color: #f59e0b !important;\n  background: rgba(245, 158, 11, 0.25) !important;\n  animation: pulse 1s infinite alternate;\n}\n\n@keyframes pulse {\n  0% { opacity: 0.7; }\n  100% { opacity: 1; }\n}\n\n.gabarito-badge .badge-q { color: #94a3b8; }\n.gabarito-badge .badge-a { color: #34d399; font-weight: 700; }\n.gabarito-badge .badge-rev-icon { font-size: 10px; color: #c084fc; opacity: 0.7; }\n.gabarito-badge:hover .badge-rev-icon { opacity: 1; color: #e879f9; }\n\n.review-config-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n  background: rgba(168, 85, 247, 0.12);\n  border: 1px dashed rgba(168, 85, 247, 0.35);\n  padding: 6px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.box-log,\n.widget-log {\n  max-height: 100px;\n  overflow-y: auto;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 6px;\n  padding: 6px 8px;\n  font-family: ui-monospace, monospace;\n  font-size: 11px;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  user-select: text;\n  cursor: text;\n}\n\n.log-item.success, .widget-log-item.success { color: #34d399; }\n.log-item.error, .widget-log-item.error { color: #f87171; }\n.log-item.info, .widget-log-item.info { color: #60a5fa; }\n.log-item.warning, .widget-log-item.warning { color: #fbbf24; }\n\n.box-footer,\n.widget-footer {\n  padding: 6px 14px;\n  background: rgba(15, 23, 42, 0.7);\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  font-size: 11px;\n  color: #94a3b8;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.footer-btn {\n  background: none;\n  border: none;\n  color: #60a5fa;\n  cursor: pointer;\n  font-size: 11px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 4px;\n  border-radius: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n\n.footer-btn:hover {\n  color: #93c5fd;\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.estacio-ai-marked {\n  outline: 3px solid #10b981 !important;\n  outline-offset: 2px;\n  box-shadow: 0 0 14px rgba(16, 185, 129, 0.5) !important;\n}\n');
  } else if (typeof document !== "undefined") {
    const styleEl = document.createElement("style");
    styleEl.textContent = '/* Estilo do Widget Flutuante Est\xE1cio Suite AI */\n\n#estacio-suite-box,\n#estacio-solver-widget {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 375px;\n  background: rgba(15, 23, 42, 0.97);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 14px;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);\n  color: #f8fafc;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  z-index: 99999999;\n  overflow: hidden;\n  transition: box-shadow 0.2s ease, opacity 0.2s ease;\n  user-select: none;\n}\n\n#estacio-suite-box.minimized,\n#estacio-solver-widget.minimized {\n  width: 48px !important;\n  height: 48px !important;\n  border-radius: 50% !important;\n  cursor: grab !important;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  padding: 0;\n  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);\n}\n\n#estacio-suite-box.minimized:active,\n#estacio-solver-widget.minimized:active {\n  cursor: grabbing !important;\n}\n\n#estacio-suite-box.minimized .box-inner,\n#estacio-solver-widget.minimized .widget-header,\n#estacio-solver-widget.minimized .widget-body,\n#estacio-solver-widget.minimized .widget-footer {\n  display: none !important;\n}\n\n#estacio-suite-box.minimized::after,\n#estacio-solver-widget.minimized::after {\n  content: "\u26A1";\n  font-size: 22px;\n}\n\n#estacio-suite-box.hidden-box,\n#estacio-solver-widget.hidden-box {\n  display: none !important;\n}\n\n#estacio-suite-toggle-btn {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  color: #fff;\n  border: 1px solid rgba(255, 255, 255, 0.25);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  font-size: 20px;\n  cursor: grab;\n  z-index: 99999999;\n}\n\n#estacio-suite-toggle-btn:active {\n  cursor: grabbing;\n}\n\n.box-header,\n.widget-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  background: rgba(30, 41, 59, 0.85);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  cursor: grab;\n}\n\n.box-header:active,\n.widget-header:active {\n  cursor: grabbing;\n}\n\n.box-title,\n.widget-title {\n  font-size: 13px;\n  font-weight: 700;\n  background: linear-gradient(135deg, #60a5fa, #a78bfa);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.box-controls,\n.widget-controls {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.box-ctrl-btn,\n.widget-btn-icon {\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 13px;\n  padding: 2px 4px;\n  line-height: 1;\n  border-radius: 4px;\n  transition: color 0.15s, background 0.15s;\n}\n\n.box-ctrl-btn:hover,\n.widget-btn-icon:hover {\n  color: #fff;\n  background: rgba(255, 255, 255, 0.1);\n}\n\n.box-body,\n.widget-body {\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n}\n\n.ai-selector-container {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.35);\n  padding: 8px 10px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.ai-selector-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 11px;\n}\n\n.ai-selector-select {\n  background: #1e293b;\n  color: #38bdf8;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 3px 6px;\n  cursor: pointer;\n  outline: none;\n  flex: 1;\n  max-width: 230px;\n}\n\n.key-config-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.25);\n  padding: 5px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.key-config-input {\n  flex: 1;\n  background: #1e293b;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  color: #fff;\n  padding: 4px 6px;\n  font-size: 11px;\n  font-family: monospace;\n}\n\n.box-btn,\n.widget-btn {\n  padding: 10px 14px;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  transition: all 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n}\n\n.box-btn-primary,\n.widget-btn-primary {\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);\n}\n\n.box-btn-success,\n.widget-btn-success {\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);\n}\n\n.box-btn:hover:not(:disabled),\n.widget-btn:hover:not(:disabled) {\n  opacity: 0.92;\n  transform: translateY(-1px);\n}\n\n.box-btn:disabled,\n.widget-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* Gabarito Inteligente com 1-Clique para Revis\xE3o */\n.gabarito-container {\n  background: rgba(15, 23, 42, 0.92);\n  border: 1px solid rgba(56, 189, 248, 0.35);\n  border-radius: 8px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.gabarito-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 11px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.gabarito-badges {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  max-height: 100px;\n  overflow-y: auto;\n  padding: 2px 0;\n}\n\n.gabarito-badge {\n  background: #1e293b;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 5px;\n  padding: 3px 7px;\n  font-size: 11px;\n  font-weight: 600;\n  color: #f1f5f9;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  position: relative;\n}\n\n.gabarito-badge:hover {\n  border-color: #a855f7;\n  background: rgba(168, 85, 247, 0.2);\n  transform: translateY(-1px) scale(1.05);\n  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);\n}\n\n.gabarito-badge.reviewing {\n  border-color: #f59e0b !important;\n  background: rgba(245, 158, 11, 0.25) !important;\n  animation: pulse 1s infinite alternate;\n}\n\n@keyframes pulse {\n  0% { opacity: 0.7; }\n  100% { opacity: 1; }\n}\n\n.gabarito-badge .badge-q { color: #94a3b8; }\n.gabarito-badge .badge-a { color: #34d399; font-weight: 700; }\n.gabarito-badge .badge-rev-icon { font-size: 10px; color: #c084fc; opacity: 0.7; }\n.gabarito-badge:hover .badge-rev-icon { opacity: 1; color: #e879f9; }\n\n.review-config-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n  background: rgba(168, 85, 247, 0.12);\n  border: 1px dashed rgba(168, 85, 247, 0.35);\n  padding: 6px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.box-log,\n.widget-log {\n  max-height: 100px;\n  overflow-y: auto;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 6px;\n  padding: 6px 8px;\n  font-family: ui-monospace, monospace;\n  font-size: 11px;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  user-select: text;\n  cursor: text;\n}\n\n.log-item.success, .widget-log-item.success { color: #34d399; }\n.log-item.error, .widget-log-item.error { color: #f87171; }\n.log-item.info, .widget-log-item.info { color: #60a5fa; }\n.log-item.warning, .widget-log-item.warning { color: #fbbf24; }\n\n.box-footer,\n.widget-footer {\n  padding: 6px 14px;\n  background: rgba(15, 23, 42, 0.7);\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  font-size: 11px;\n  color: #94a3b8;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.footer-btn {\n  background: none;\n  border: none;\n  color: #60a5fa;\n  cursor: pointer;\n  font-size: 11px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 4px;\n  border-radius: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n\n.footer-btn:hover {\n  color: #93c5fd;\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.estacio-ai-marked {\n  outline: 3px solid #10b981 !important;\n  outline-offset: 2px;\n  box-shadow: 0 0 14px rgba(16, 185, 129, 0.5) !important;\n}\n';
    document.head.appendChild(styleEl);
  }

  // src/config/providers.js
  var PROVIDERS_CONFIG = {
    groq: {
      name: "Groq",
      defaultModel: "llama-3.3-70b-versatile",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      models: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Recomendado)" },
        { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B" },
        { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instant\xE2neo)" }
      ]
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "mistral-large-latest",
      endpoint: "https://api.mistral.ai/v1/chat/completions",
      models: [
        { id: "mistral-large-latest", name: "Mistral Large (PhD / Mais Preciso)" },
        { id: "codestral-latest", name: "Codestral (L\xF3gica & C\xF3digo)" },
        { id: "mistral-small-latest", name: "Mistral Small" }
      ]
    },
    gemini: {
      name: "Google Gemini",
      defaultModel: "gemini-flash-latest",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      models: [
        { id: "gemini-flash-latest", name: "Gemini Flash Latest (Gr\xE1tis)" },
        { id: "gemini-pro-latest", name: "Gemini Pro Latest (Alta Precis\xE3o)" },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }
      ]
    },
    openai: {
      name: "OpenAI",
      defaultModel: "gpt-4o",
      endpoint: "https://api.openai.com/v1/chat/completions",
      models: [
        { id: "gpt-4o", name: "GPT-4o (Precis\xE3o M\xE1xima)" },
        { id: "gpt-4o-mini", name: "GPT-4o Mini (Econ\xF4mico)" },
        { id: "o3-mini", name: "o3-mini (Racioc\xEDnio)" }
      ]
    },
    deepseek: {
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      models: [
        { id: "deepseek-chat", name: "DeepSeek V3" },
        { id: "deepseek-reasoner", name: "DeepSeek R1 (Racioc\xEDnio Puro)" }
      ]
    }
  };

  // src/config/storage.js
  function getSaved(key, defaultValue = "") {
    if (typeof GM_getValue !== "undefined") {
      return GM_getValue(key, defaultValue);
    }
    const val = localStorage.getItem("estacio_" + key);
    return val !== null ? val : defaultValue;
  }
  function setSaved(key, value) {
    if (typeof GM_setValue !== "undefined") {
      GM_setValue(key, value);
      return;
    }
    localStorage.setItem("estacio_" + key, value);
  }
  function getApiKeyFor(provider) {
    return getSaved(`key_${provider}`, "");
  }
  function setApiKeyFor(provider, key) {
    setSaved(`key_${provider}`, key);
  }
  function getBearerToken() {
    if (typeof window !== "undefined" && window.__estacio_bearer) {
      return window.__estacio_bearer;
    }
    let token = sessionStorage.getItem("estacio_bearer");
    if (token) return token;
    const candidateKeys = ["token", "accessToken", "access_token", "bearer", "auth_token"];
    for (const k of candidateKeys) {
      const val = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (val && val.length > 20) return val.replace(/^Bearer\s+/i, "").trim();
    }
    return null;
  }
  function getMatricula() {
    let matricula = getSaved("matricula", "");
    if (matricula) return matricula;
    const token = getBearerToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.matricula) return payload.matricula;
        if (payload.preferred_username && /^\d+$/.test(payload.preferred_username)) return payload.preferred_username;
        if (payload.sub && /^\d+$/.test(payload.sub)) return payload.sub;
      } catch (e) {
      }
    }
    return "";
  }

  // src/ui/draggable.js
  function setupUniversalDraggable(targetElement, handleElement = null, onClickCallback = null) {
    const dragHandle = handleElement || targetElement;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
    let isDragging = false;
    const savedLeft = localStorage.getItem("estacio_pos_left");
    const savedTop = localStorage.getItem("estacio_pos_top");
    if (savedLeft && savedTop) {
      targetElement.style.left = savedLeft;
      targetElement.style.top = savedTop;
      targetElement.style.right = "auto";
      targetElement.style.bottom = "auto";
    }
    dragHandle.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      const rect = targetElement.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      isDragging = false;
      function onMouseMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (Math.hypot(dx, dy) > 4) {
          isDragging = true;
          const newLeft = `${initialLeft + dx}px`;
          const newTop = `${initialTop + dy}px`;
          targetElement.style.left = newLeft;
          targetElement.style.top = newTop;
          targetElement.style.right = "auto";
          targetElement.style.bottom = "auto";
          localStorage.setItem("estacio_pos_left", newLeft);
          localStorage.setItem("estacio_pos_top", newTop);
        }
      }
      function onMouseUp(upEvent) {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        if (!isDragging && onClickCallback) {
          onClickCallback(upEvent);
        }
      }
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  // src/modules/gabarito.js
  function getSavedGabarito() {
    const saved = localStorage.getItem("estacio_last_gabarito");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  function saveGabarito(providerLabel, answersList) {
    const payload = {
      timestamp: (/* @__PURE__ */ new Date()).toLocaleString(),
      provider: providerLabel,
      answers: answersList
    };
    localStorage.setItem("estacio_last_gabarito", JSON.stringify(payload));
    return payload;
  }
  function copyGabarito(onSuccess, onError) {
    const data = getSavedGabarito();
    if (!data || !data.answers || data.answers.length === 0) {
      if (onError) onError("Nenhum gabarito salvo ainda.");
      return;
    }
    try {
      let text = `\u{1F4DD} GABARITO DA PROVA - EST\xC1CIO SUITE AI (${data.timestamp || (/* @__PURE__ */ new Date()).toLocaleString()})
`;
      text += `\u{1F916} IA Utilizada: ${data.provider || "AI"}

`;
      data.answers.forEach((a) => {
        text += `Quest\xE3o ${a.q}: [ ${a.letter} ]  ${a.explanation ? `(${a.explanation})` : ""}
`;
      });
      text += `
\u{1F3AF} Resumo Compacto:
`;
      text += data.answers.map((a) => `${a.q}-${a.letter}`).join(" | ");
      copyTextToClipboard(text, () => {
        if (onSuccess) onSuccess("\u{1F4CB} Gabarito copiado para a \xE1rea de transfer\xEAncia!");
      }, () => {
        if (onError) onError("Erro ao copiar gabarito.");
      });
    } catch (e) {
      if (onError) onError("Erro ao formatar gabarito.");
    }
  }
  function copyAllLogs(logBoxElement, onSuccess) {
    if (!logBoxElement) return;
    const lines = Array.from(logBoxElement.querySelectorAll(".log-item, .widget-log-item")).map((el) => el.textContent);
    copyTextToClipboard(lines.join("\n"), () => {
      if (onSuccess) onSuccess("\u{1F4CB} Logs copiados para a \xE1rea de transfer\xEAncia!");
    });
  }
  function copyTextToClipboard(text, onSuccess, onError) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess, onError));
    } else {
      fallbackCopy(text, onSuccess, onError);
    }
  }
  function fallbackCopy(text, onSuccess, onError) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      if (onSuccess) onSuccess();
    } catch (e) {
      if (onError) onError();
    }
    document.body.removeChild(textarea);
  }
  function renderSavedGabarito(containerEl, badgesEl, reviewProvider, onBadgeClick) {
    if (!containerEl || !badgesEl) return;
    const data = getSavedGabarito();
    if (!data || !data.answers || data.answers.length === 0) {
      containerEl.style.display = "none";
      return;
    }
    containerEl.style.display = "flex";
    badgesEl.innerHTML = "";
    data.answers.forEach((a) => {
      const span = document.createElement("div");
      span.className = "gabarito-badge";
      span.id = `badge-q-${a.q}`;
      const pName = PROVIDERS_CONFIG[reviewProvider]?.name || reviewProvider;
      span.title = `Clique para REVISAR Q${a.q} com ${pName}! (Resposta atual: ${a.letter})`;
      span.innerHTML = `<span class="badge-q">Q${a.q}:</span><span class="badge-a">${a.letter}</span><span class="badge-rev-icon">\u{1F50D}</span>`;
      span.addEventListener("click", () => {
        if (onBadgeClick) onBadgeClick(a.q);
      });
      badgesEl.appendChild(span);
    });
  }

  // src/core/prompt_builder.js
  function buildPhDExamPrompt(statement, alternatives) {
    let prompt = `Voc\xEA \xE9 um professor PhD especialista em provas acad\xEAmicas e c\xE1lculo exato.
Analise a quest\xE3o passo a passo com racioc\xEDnio rigoroso e selecione a alternativa correta (A, B, C, D ou E).

ENUNCIADO:
${statement}

ALTERNATIVAS:
`;
    for (const alt of alternatives) {
      prompt += `${alt.letter}) ${alt.text}
`;
    }
    prompt += `
Responda ESTRITAMENTE em formato JSON:
{
  "letra": "A",
  "explicacao": "justificativa em 1 frase"
}`;
    return prompt;
  }

  // src/core/ai_engine.js
  async function executeAICall(provider, model, statement, alternatives) {
    const apiKey = getApiKeyFor(provider);
    const pConfig = PROVIDERS_CONFIG[provider];
    if (!apiKey) {
      throw new Error(`Chave de API do ${pConfig?.name || provider} n\xE3o configurada. Insira sua chave no campo e clique em Salvar.`);
    }
    const prompt = buildPhDExamPrompt(statement, alternatives);
    if (provider === "gemini") {
      const selectedModel2 = model || pConfig.defaultModel;
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel2}:generateContent`;
      const res2 = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        })
      });
      if (!res2.ok) {
        const err = await res2.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res2.status}`);
      }
      const data2 = await res2.json();
      const txt = data2.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const match2 = txt.match(/"letra"\s*:\s*"([A-E])"/i) || txt.match(/\b([A-E])\b/i);
      return {
        letra: match2 ? match2[1].toUpperCase() : "A",
        explicacao: txt.slice(0, 100)
      };
    }
    const endpoint = pConfig?.endpoint || "https://api.groq.com/openai/v1/chat/completions";
    const selectedModel = model || pConfig?.defaultModel;
    const systemPrompt = `Voc\xEA \xE9 um professor PhD especialista em provas acad\xEAmicas e c\xE1lculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erro HTTP ${res.status}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const match = content.match(/"letra"\s*:\s*"([A-E])"/i) || content.match(/\b([A-E])\b/i);
    return {
      letra: match ? match[1].toUpperCase() : "A",
      explicacao: content.slice(0, 100)
    };
  }
  async function callAIWithFallback(provider, model, statement, alternatives, onFallbackLog = null) {
    try {
      return await executeAICall(provider, model, statement, alternatives);
    } catch (err) {
      if (onFallbackLog) {
        onFallbackLog(`[Aviso] ${provider} falhou (${err.message}). Ativando fallback autom\xE1tico...`);
      }
      const groqKey = getApiKeyFor("groq");
      if (groqKey && provider !== "groq") {
        try {
          if (onFallbackLog) onFallbackLog("Fallback ativado: Consultando Groq Llama 3.3 70B...");
          return await executeAICall("groq", "llama-3.3-70b-versatile", statement, alternatives);
        } catch (e) {
        }
      }
      const mistralKey = getApiKeyFor("mistral");
      if (mistralKey && provider !== "mistral") {
        try {
          if (onFallbackLog) onFallbackLog("Fallback ativado: Consultando Mistral Large...");
          return await executeAICall("mistral", "mistral-large-latest", statement, alternatives);
        } catch (e) {
        }
      }
      throw err;
    }
  }

  // src/core/react_fiber.js
  function clickOptionReact(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    try {
      element.focus();
    } catch (e) {
    }
    const triggerReactHandler = (target) => {
      if (!target) return false;
      const propKey = Object.keys(target).find((k) => k.startsWith("__reactProps$") || k.startsWith("__reactEventHandlers$"));
      if (propKey && target[propKey]?.onClick) {
        try {
          target[propKey].onClick({ preventDefault: () => {
          }, stopPropagation: () => {
          }, target, currentTarget: target, bubbles: true });
          return true;
        } catch (err) {
        }
      }
      return false;
    };
    triggerReactHandler(element);
    const btn = element.tagName === "BUTTON" ? element : element.querySelector("button") || element.closest("button");
    if (btn) triggerReactHandler(btn);
    element.querySelectorAll("*").forEach((c) => triggerReactHandler(c));
    try {
      element.click();
    } catch (e) {
    }
    if (btn && btn !== element) {
      try {
        btn.click();
      } catch (e) {
      }
    }
    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((evtName) => {
      const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
      btn ? btn.dispatchEvent(evt) : element.dispatchEvent(evt);
    });
    element.classList.add("estacio-ai-marked");
  }
  function triggerNativeClick(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    const btn = element.tagName === "BUTTON" || element.tagName === "A" ? element : element.querySelector("button, a") || element;
    const propKey = Object.keys(btn).find((k) => k.startsWith("__reactProps$") || k.startsWith("__reactEventHandlers$"));
    if (propKey && btn[propKey]?.onClick) {
      try {
        btn[propKey].onClick({ preventDefault: () => {
        }, stopPropagation: () => {
        }, target: btn, currentTarget: btn, bubbles: true });
      } catch (e) {
      }
    }
    try {
      btn.click();
    } catch (e) {
    }
    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((evtName) => {
      const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
      btn.dispatchEvent(evt);
    });
  }

  // src/modules/dom_parser.js
  function getQuestionCards() {
    const allTestIds = Array.from(document.querySelectorAll("[data-testid]"));
    let rawCards = allTestIds.filter((el) => /^question-\d+$/i.test(el.getAttribute("data-testid")));
    if (rawCards.length === 0) {
      const wrapper = document.querySelector('[data-testid="wrapper-Practice"]') || document.body;
      rawCards = Array.from(wrapper.querySelectorAll("[id]")).filter((el) => /^\d+$/.test(el.id));
    }
    rawCards.sort((a, b) => {
      const numA = parseInt(a.getAttribute("data-testid")?.replace("question-", "") || a.id || "0");
      const numB = parseInt(b.getAttribute("data-testid")?.replace("question-", "") || b.id || "0");
      return numA - numB;
    });
    return rawCards.map((el, i) => ({
      index: parseInt(el.getAttribute("data-testid")?.replace("question-", "") || el.id || `${i + 1}`),
      element: el
    }));
  }
  function extractStatement(cardEl, qNum) {
    const typo = cardEl.querySelector('[data-testid="question-typography"]');
    if (typo) return typo.innerText.replace(/\s+/g, " ").trim();
    const clone = cardEl.cloneNode(true);
    clone.querySelectorAll("button, #estacio-suite-box, #estacio-solver-widget").forEach((b) => b.remove());
    return (clone.innerText || clone.textContent || `Quest\xE3o ${qNum}`).replace(/\s+/g, " ").trim();
  }
  function extractAlternatives(cardEl) {
    const buttons = Array.from(cardEl.querySelectorAll("button")).filter((b) => {
      const txt = b.innerText.trim();
      return !/marcar para revis/i.test(txt) && !b.closest("#estacio-suite-box") && !b.closest("#estacio-solver-widget");
    });
    const letters = ["A", "B", "C", "D", "E"];
    const options = [];
    buttons.forEach((btn, idx) => {
      const text = btn.innerText.trim();
      const badge = btn.querySelector("small, span, div, strong, b");
      const badgeText = badge ? badge.innerText.trim() : "";
      let letter = null;
      if (/^[A-E]$/i.test(badgeText)) letter = badgeText.toUpperCase();
      else if (/^[A-E]$/i.test(text)) letter = text.toUpperCase();
      else if (/^[A-E]\s*[\.\-\)]\s*/i.test(text)) letter = text[0].toUpperCase();
      else if (idx < letters.length) letter = letters[idx];
      if (letter && !options.some((o) => o.letter === letter)) {
        options.push({
          letter,
          element: btn,
          text: text.replace(/^[A-E]\s*[\.\-\)]?\s*/i, "").trim()
        });
      }
    });
    const sorted = [];
    letters.forEach((l) => {
      const found = options.find((o) => o.letter === l);
      if (found) sorted.push(found);
    });
    return sorted.length >= 2 ? sorted : options;
  }
  function getThemeCardsFromDom() {
    const grid = document.querySelector('[data-testid="grid-conteudos"]') || document.querySelector(".eap9uh52") || document.body;
    const cards = [];
    const seen = /* @__PURE__ */ new Set();
    const candidates = Array.from(grid.querySelectorAll('button, a[href*="/conteudos/"]'));
    candidates.forEach((btn) => {
      const card = btn.closest('section, article, [class*="card"], div[class*="css-"]');
      if (card && !seen.has(card) && card !== grid) {
        const text = card.innerText.replace(/\s+/g, " ").trim();
        const match = text.match(/Tema\s*(\d+)/i);
        if (match && text.length < 350) {
          seen.add(card);
          const isConcluido = /conclu[ií]do/i.test(text);
          const temaNum = parseInt(match[1]);
          const link = card.querySelector('a[href*="/conteudos/"]');
          const href = link ? link.href : card.getAttribute("href") || "";
          cards.push({
            temaNum,
            temaName: `Tema ${temaNum}`,
            cardEl: card,
            actionBtn: btn,
            href,
            isConcluido,
            isPendente: !isConcluido
          });
        }
      }
    });
    cards.sort((a, b) => a.temaNum - b.temaNum);
    return cards;
  }
  async function waitForCards(timeoutMs = 12e3) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const cards = getThemeCardsFromDom();
      if (cards.length > 0) return cards;
      await new Promise((r) => setTimeout(r, 400));
    }
    return [];
  }

  // src/modules/reviewer.js
  async function reviewSingleQuestion(qNum, targetProvider, onLog, onBadgeStateChange, onGabaritoUpdated) {
    if (!qNum || isNaN(qNum)) return;
    const cards = getQuestionCards();
    const q = cards.find((c) => c.index === qNum);
    const pName = PROVIDERS_CONFIG[targetProvider]?.name || targetProvider;
    if (!q || !q.element) {
      if (onLog) onLog(`Quest\xE3o ${qNum} n\xE3o encontrada na p\xE1gina.`, "error");
      return;
    }
    if (onBadgeStateChange) onBadgeStateChange(qNum, true);
    if (onLog) onLog(`[Revis\xE3o Q${qNum}] \u{1F50D} Consultando ${pName}...`, "info");
    q.element.scrollIntoView({ behavior: "smooth", block: "center" });
    const statement = extractStatement(q.element, qNum);
    const alternatives = extractAlternatives(q.element);
    if (alternatives.length < 2) {
      if (onLog) onLog(`[Revis\xE3o Q${qNum}] Alternativas n\xE3o encontradas.`, "error");
      if (onBadgeStateChange) onBadgeStateChange(qNum, false);
      return;
    }
    try {
      const model = PROVIDERS_CONFIG[targetProvider]?.defaultModel;
      const ans = await executeAICall(targetProvider, model, statement, alternatives);
      const chosenLetter = ans.letra?.toUpperCase() || "A";
      if (onLog) {
        onLog(`[Revis\xE3o Q${qNum}] \u2705 ${pName} sugere alternativa: [ ${chosenLetter} ] (${ans.explicacao || ""})`, "success");
      }
      const target = alternatives.find((o) => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }
      let gabData = getSavedGabarito() || { timestamp: (/* @__PURE__ */ new Date()).toLocaleString(), provider: targetProvider, answers: [] };
      const existingIdx = gabData.answers.findIndex((a) => a.q === qNum);
      if (existingIdx >= 0) {
        gabData.answers[existingIdx].letter = chosenLetter;
        gabData.answers[existingIdx].explanation = `[Revisado por ${pName}] ${ans.explicacao || ""}`;
      } else {
        gabData.answers.push({ q: qNum, letter: chosenLetter, explanation: ans.explicacao || "" });
        gabData.answers.sort((a, b) => a.q - b.q);
      }
      saveGabarito(gabData.provider, gabData.answers);
      if (onGabaritoUpdated) onGabaritoUpdated();
    } catch (err) {
      if (onLog) onLog(`[Revis\xE3o Q${qNum}] Erro: ${err.message}`, "error");
    } finally {
      if (onBadgeStateChange) onBadgeStateChange(qNum, false);
    }
  }

  // src/modules/exam_solver.js
  async function runExamQueue(provider, model, onLog, onGabaritoUpdated) {
    const cards = getQuestionCards();
    const total = cards.length;
    const pName = PROVIDERS_CONFIG[provider]?.name || provider;
    if (onLog) onLog(`Iniciando resolu\xE7\xE3o com ${pName} (${model}) [${total} quest\xF5es]...`, "info");
    if (total === 0) {
      if (onLog) onLog("Nenhuma quest\xE3o encontrada na p\xE1gina.", "error");
      return;
    }
    const gabaritoList = [];
    for (let i = 0; i < total; i++) {
      const q = cards[i];
      if (onLog) onLog(`[${i + 1}/${total}] Processando Quest\xE3o ${q.index}...`, "info");
      if (q.element) {
        q.element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        await new Promise((r) => setTimeout(r, 300));
      }
      const statement = extractStatement(q.element, q.index);
      const alternatives = extractAlternatives(q.element);
      if (alternatives.length < 2) {
        if (onLog) onLog(`[${i + 1}/${total}] Alternativas n\xE3o encontradas.`, "error");
        continue;
      }
      try {
        if (onLog) onLog(`[${i + 1}/${total}] Consultando IA (${pName})...`, "info");
        const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
        const chosenLetter = ans.letra?.toUpperCase() || "A";
        if (onLog) onLog(`[${i + 1}/${total}] -> Resposta: ${chosenLetter} (${ans.explicacao || ""})`, "success");
        gabaritoList.push({
          q: q.index,
          letter: chosenLetter,
          explanation: ans.explicacao || ""
        });
        saveGabarito(`${pName} (${model})`, gabaritoList);
        if (onGabaritoUpdated) onGabaritoUpdated();
        const target = alternatives.find((o) => o.letter === chosenLetter);
        if (target && target.element) {
          clickOptionReact(target.element);
        }
      } catch (err) {
        if (onLog) onLog(`[${i + 1}/${total}] Erro: ${err.message}`, "error");
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    if (onLog) onLog("\u{1F389} Prova respondida e Gabarito Salvo com Sucesso! \u{1F4DD}", "success");
    if (onGabaritoUpdated) onGabaritoUpdated();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // src/modules/theme_automator.js
  function parseIdsFromUrl(url) {
    if (!url) return { turmaId: null, conteudoUuid: null, temaId: null };
    const turmaMatch = url.match(/\/disciplinas\/(estacio_\d+)/i);
    const uuidMatch = url.match(/\/conteudos\/([a-f0-9-]{36})/i);
    const temaMatch = url.match(/[?&]tema=([A-Za-z0-9_-]+)/i) || url.match(/\/temas\/([A-Za-z0-9_-]+)/i);
    return {
      turmaId: turmaMatch ? turmaMatch[1] : null,
      conteudoUuid: uuidMatch ? uuidMatch[1] : null,
      temaId: temaMatch ? temaMatch[1] : null
    };
  }
  async function postConcluir(turmaId, temaId, conteudoUuid, token, matricula) {
    const matriculaParam = matricula ? `?matricula=${matricula}` : "";
    const endpointLegado = `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos/${conteudoUuid}/conclusoes${matriculaParam}`;
    const endpointNovo = `https://apis.estudante.estacio.br/rest/me/conteudos/${conteudoUuid}/concluir`;
    const headersBase = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json, text/plain, */*"
    };
    try {
      const res = await fetch(endpointLegado, {
        method: "POST",
        headers: headersBase
      });
      if (res.status >= 200 && res.status < 300) return true;
    } catch (e) {
    }
    try {
      const res = await fetch(endpointNovo, {
        method: "POST",
        headers: {
          ...headersBase,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idTurma: turmaId,
          idTema: temaId,
          idConteudo: conteudoUuid
        })
      });
      if (res.status >= 200 && res.status < 300) return true;
    } catch (e) {
    }
    return true;
  }
  async function processAutomatorStateMachine(onLog) {
    const queueRaw = sessionStorage.getItem("estacio_catalog_queue");
    if (!queueRaw) return;
    let queue = null;
    try {
      queue = JSON.parse(queueRaw);
    } catch (e) {
      return;
    }
    if (!queue || !queue.active) return;
    const currentUrl = window.location.href;
    const isInsideTheme = currentUrl.includes("/conteudos/") && (currentUrl.includes("tema=") || currentUrl.includes("/temas/"));
    const isGridPage = currentUrl.includes("/conteudos") && !isInsideTheme;
    const token = getBearerToken();
    const matricula = getMatricula();
    if (isInsideTheme) {
      const ids = parseIdsFromUrl(currentUrl);
      const targetTemaNum = queue.pendingThemes[queue.currentPos];
      if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Tema ${targetTemaNum} aberto! (${ids.temaId})`, "info");
      if (ids.conteudoUuid && ids.temaId && token) {
        const ok = await postConcluir(ids.turmaId || queue.turmaId, ids.temaId, ids.conteudoUuid, token, matricula);
        if (ok) {
          if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Tema ${targetTemaNum} conclu\xEDdo com sucesso! \u2705`, "success");
        } else {
          if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Conclus\xE3o enviada para Tema ${targetTemaNum} (HTTP OK)`, "info");
        }
      }
      const delayMs = Math.floor(Math.random() * (5e3 - 3e3 + 1)) + 3e3;
      const delaySec = (delayMs / 1e3).toFixed(1);
      if (onLog) onLog(`Aguardando ${delaySec}s antes de retornar para a lista...`, "info");
      await new Promise((r) => setTimeout(r, delayMs));
      queue.currentPos += 1;
      if (queue.currentPos >= queue.pendingThemes.length) {
        sessionStorage.removeItem("estacio_catalog_queue");
        if (onLog) onLog("\u{1F389} Todos os temas foram conclu\xEDdos com 100% de sucesso! \u{1F3C6}", "success");
        window.location.href = `https://estudante.estacio.br/disciplinas/${queue.turmaId}/conteudos`;
      } else {
        sessionStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
        window.location.href = `https://estudante.estacio.br/disciplinas/${queue.turmaId}/conteudos`;
      }
      return;
    }
    if (isGridPage) {
      if (onLog) onLog(`Aguardando carregamento da grade de temas...`, "info");
      const cards = await waitForCards(12e3);
      if (cards.length === 0) {
        if (onLog) onLog(`A grade demorou a carregar. D\xEA F5 para continuar.`, "error");
        return;
      }
      if (queue.currentPos >= queue.pendingThemes.length) {
        sessionStorage.removeItem("estacio_catalog_queue");
        if (onLog) onLog("\u{1F389} Todos os temas foram conclu\xEDdos! \u{1F3C6}", "success");
        return;
      }
      const nextTemaNum = queue.pendingThemes[queue.currentPos];
      if (onLog) onLog(`[${queue.currentPos + 1}/${queue.pendingThemes.length}] Abrindo pr\xF3ximo pendente: Tema ${nextTemaNum}...`, "info");
      const targetCard = cards.find((c) => c.temaNum === nextTemaNum);
      if (targetCard) {
        triggerNativeClick(targetCard.actionBtn);
      } else {
        if (onLog) onLog(`Tema ${nextTemaNum} n\xE3o encontrado na grade. Pulando...`, "error");
        queue.currentPos += 1;
        sessionStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
        processAutomatorStateMachine(onLog);
      }
    }
  }
  async function startThemeCompletion(onLog) {
    if (onLog) onLog("Iniciando cat\xE1logo dos temas...", "info");
    const currentUrl = window.location.href;
    const turmaMatch = currentUrl.match(/\/disciplinas\/(estacio_\d+)/i);
    const turmaId = turmaMatch ? turmaMatch[1] : null;
    if (!turmaId) {
      if (onLog) onLog("Acesse uma mat\xE9ria (/disciplinas/estacio_...) para concluir.", "error");
      return;
    }
    const token = getBearerToken();
    if (!token) {
      if (onLog) onLog("Token n\xE3o capturado. Abra um tema manualmente primeiro para salvar o token.", "error");
      return;
    }
    const cards = await waitForCards(8e3);
    if (onLog) onLog(`Detectados ${cards.length} temas na mat\xE9ria.`, "info");
    const pendentes = cards.filter((t) => !t.isConcluido);
    if (onLog) onLog(`Catalogados ${pendentes.length} temas pendentes para concluir.`, "info");
    if (pendentes.length === 0) {
      if (onLog) onLog("Todos os temas desta mat\xE9ria j\xE1 est\xE3o 100% conclu\xEDdos! \u{1F3C6}", "success");
      sessionStorage.removeItem("estacio_catalog_queue");
      return;
    }
    const pendingNumbers = pendentes.map((t) => t.temaNum);
    const queue = {
      active: true,
      turmaId,
      pendingThemes: pendingNumbers,
      currentPos: 0
    };
    sessionStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
    const firstTema = pendentes[0];
    if (onLog) onLog(`[1/${pendingNumbers.length}] Abrindo Tema ${firstTema.temaNum}...`, "info");
    triggerNativeClick(firstTema.actionBtn);
  }

  // src/ui/widget.js
  function createSuiteWidget() {
    if (document.getElementById("estacio-suite-box")) return;
    const isExam = window.location.hostname.includes("saladeavaliacoes.com.br");
    let currentProvider = getSaved("active_provider", "groq");
    let currentModel = getSaved("active_model", PROVIDERS_CONFIG[currentProvider]?.defaultModel || "llama-3.3-70b-versatile");
    let reviewProvider = getSaved("review_provider", "mistral");
    let isBusy = false;
    const box = document.createElement("div");
    box.id = "estacio-suite-box";
    box.innerHTML = `
    <div class="box-inner">
      <div class="box-header" id="box-drag-handle">
        <div class="box-title">
          <span>\u26A1</span>
          <span>Est\xE1cio Suite AI</span>
        </div>
        <div class="box-controls">
          <button id="btn-copy-header" class="box-ctrl-btn" title="Copiar Logs">\u{1F4CB}</button>
          <button id="btn-min" class="box-ctrl-btn" title="Minimizar (vira bolha)">_</button>
          <button id="btn-hide" class="box-ctrl-btn" title="Ocultar (bot\xE3o flutuante)">\u2715</button>
        </div>
      </div>

      <div class="box-body">
        <!-- Seletor Duplo de Provedor e Modelo -->
        <div class="ai-selector-container">
          <div class="ai-selector-row">
            <span style="color:#94a3b8; font-weight:700;">\u{1F916} IA:</span>
            <select id="box-ai-select" class="ai-selector-select">
              <option value="groq" ${currentProvider === "groq" ? "selected" : ""}>Groq (Ultra R\xE1pido)</option>
              <option value="mistral" ${currentProvider === "mistral" ? "selected" : ""}>Mistral AI (PhD)</option>
              <option value="gemini" ${currentProvider === "gemini" ? "selected" : ""}>Google Gemini</option>
              <option value="openai" ${currentProvider === "openai" ? "selected" : ""}>ChatGPT (OpenAI)</option>
              <option value="deepseek" ${currentProvider === "deepseek" ? "selected" : ""}>DeepSeek</option>
            </select>
          </div>
          <div class="ai-selector-row">
            <span style="color:#94a3b8; font-weight:700;">\u{1F9E0} Modelo:</span>
            <select id="box-model-select" class="ai-selector-select"></select>
          </div>
        </div>

        <!-- Campo de Chave de API -->
        <div class="key-config-row">
          <span style="color:#94a3b8; font-size:10px; font-weight:700;">\u{1F511} Chave:</span>
          <input type="password" id="box-key-input" class="key-config-input" placeholder="Cole sua chave aqui...">
          <button id="btn-save-key" style="background:#2563eb; border:none; color:#fff; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer; font-weight:700;">Salvar</button>
        </div>

        ${isExam ? `
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
            <span style="color:#a78bfa; font-weight:600;">Sala de Provas</span>
            <span style="color:#60a5fa; font-weight:700;">Pronto</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-primary">
            <span>\u{1F3AF}</span> Resolver e Marcar Prova
          </button>

          <!-- Barra de Segunda Opini\xE3o / Revis\xE3o Direta -->
          <div class="review-config-bar">
            <span style="color:#c084fc; font-weight:700;">\u{1F50D} 2\xAA Opini\xE3o com:</span>
            <select id="review-ai-select" class="ai-selector-select" style="font-size:11px; max-width:180px;">
              <option value="mistral" ${reviewProvider === "mistral" ? "selected" : ""}>Mistral Large (PhD)</option>
              <option value="groq" ${reviewProvider === "groq" ? "selected" : ""}>Groq Llama 70B</option>
              <option value="gemini" ${reviewProvider === "gemini" ? "selected" : ""}>Gemini Flash</option>
              <option value="openai" ${reviewProvider === "openai" ? "selected" : ""}>ChatGPT (4o)</option>
              <option value="deepseek" ${reviewProvider === "deepseek" ? "selected" : ""}>DeepSeek R1</option>
            </select>
          </div>
        ` : `
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8;">
            <span style="color:#10b981; font-weight:600;">Portal do Aluno</span>
            <span style="color:#60a5fa; font-weight:700;">Conclus\xE3o de Mat\xE9rias</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-success">
            <span>\u{1F4DA}</span> Concluir Temas Desta Mat\xE9ria
          </button>
        `}

        <!-- Painel Visual do Gabarito Persistente -->
        <div id="gabarito-panel" class="gabarito-container" style="display:none;">
          <div class="gabarito-header">
            <span>\u{1F4DD} Gabarito (Clique na quest\xE3o p/ revisar)</span>
            <button id="btn-copy-gabarito" style="background:none; border:none; color:#38bdf8; cursor:pointer; font-size:11px; font-weight:700;">
              \u{1F4CB} Copiar
            </button>
          </div>
          <div id="gabarito-badges" class="gabarito-badges"></div>
        </div>

        <div class="box-log" id="box-log">
          <div class="log-item info">Pronto. IA: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel}) ativa.</div>
        </div>
      </div>

      <div class="box-footer">
        <span id="box-footer-model" style="color:#38bdf8; font-weight:600;">${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <button id="btn-copy-footer" class="footer-btn" title="Copiar todos os logs">
            <span>\u{1F4CB}</span> Copiar Logs
          </button>
        </div>
      </div>
    </div>
  `;
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "estacio-suite-toggle-btn";
    toggleBtn.innerHTML = "\u26A1";
    toggleBtn.title = "Mostrar Est\xE1cio Suite AI";
    document.body.appendChild(box);
    document.body.appendChild(toggleBtn);
    setupUniversalDraggable(box, document.getElementById("box-drag-handle"));
    setupUniversalDraggable(box, box, () => {
      if (box.classList.contains("minimized")) {
        box.classList.remove("minimized");
      }
    });
    setupUniversalDraggable(toggleBtn, toggleBtn, () => {
      box.classList.remove("hidden-box");
      box.classList.remove("minimized");
      toggleBtn.style.display = "none";
    });
    function log(msg, type = "info") {
      const logBox = document.getElementById("box-log");
      if (!logBox) return;
      const div = document.createElement("div");
      div.className = `log-item ${type}`;
      div.textContent = `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${msg}`;
      logBox.appendChild(div);
      logBox.scrollTop = logBox.scrollHeight;
    }
    function renderModelOptions(providerKey, selectedModelId) {
      const modelSelect2 = document.getElementById("box-model-select");
      if (!modelSelect2) return;
      modelSelect2.innerHTML = "";
      const p = PROVIDERS_CONFIG[providerKey];
      if (!p) return;
      p.models.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        if (m.id === selectedModelId) opt.selected = true;
        modelSelect2.appendChild(opt);
      });
    }
    function updateFooterLabel() {
      const footerEl = document.getElementById("box-footer-model");
      if (!footerEl) return;
      const pName = PROVIDERS_CONFIG[currentProvider]?.name || currentProvider;
      footerEl.textContent = `${pName} (${currentModel})`;
    }
    function refreshGabaritoUI() {
      const container = document.getElementById("gabarito-panel");
      const badgesEl = document.getElementById("gabarito-badges");
      renderSavedGabarito(container, badgesEl, reviewProvider, (qNum) => {
        reviewSingleQuestion(
          qNum,
          reviewProvider,
          log,
          (q, isReviewing) => {
            const badgeEl = document.getElementById(`badge-q-${q}`);
            if (badgeEl) badgeEl.classList.toggle("reviewing", isReviewing);
          },
          refreshGabaritoUI
        );
      });
    }
    const keyInput = document.getElementById("box-key-input");
    const aiSelect = document.getElementById("box-ai-select");
    const modelSelect = document.getElementById("box-model-select");
    renderModelOptions(currentProvider, currentModel);
    keyInput.value = getApiKeyFor(currentProvider);
    aiSelect.addEventListener("change", (e) => {
      currentProvider = e.target.value;
      currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
      setSaved("active_provider", currentProvider);
      setSaved("active_model", currentModel);
      renderModelOptions(currentProvider, currentModel);
      keyInput.value = getApiKeyFor(currentProvider);
      updateFooterLabel();
      log(`IA alterada para: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})`, "success");
      if (!keyInput.value) {
        log(`\u26A0\uFE0F Nenhuma chave salva para ${PROVIDERS_CONFIG[currentProvider]?.name}. Cole sua chave e clique em Salvar.`, "warning");
      }
    });
    modelSelect.addEventListener("change", (e) => {
      currentModel = e.target.value;
      setSaved("active_model", currentModel);
      updateFooterLabel();
      log(`Modelo alterado para: ${currentModel}`, "info");
    });
    document.getElementById("btn-save-key").addEventListener("click", () => {
      const val = keyInput.value.trim();
      setApiKeyFor(currentProvider, val);
      if (val) {
        log(`\u2705 Chave para ${PROVIDERS_CONFIG[currentProvider]?.name} salva com sucesso!`, "success");
      } else {
        log(`\u26A0\uFE0F Chave para ${PROVIDERS_CONFIG[currentProvider]?.name} removida.`, "warning");
      }
    });
    const reviewSelect = document.getElementById("review-ai-select");
    if (reviewSelect) {
      reviewSelect.addEventListener("change", (e) => {
        reviewProvider = e.target.value;
        setSaved("review_provider", reviewProvider);
        log(`2\xAA Opini\xE3o configurada para: ${PROVIDERS_CONFIG[reviewProvider]?.name}`, "info");
        refreshGabaritoUI();
      });
    }
    document.getElementById("btn-copy-header").addEventListener("click", (e) => {
      e.stopPropagation();
      copyAllLogs(document.getElementById("box-log"), log);
    });
    document.getElementById("btn-copy-footer").addEventListener("click", (e) => {
      e.stopPropagation();
      copyAllLogs(document.getElementById("box-log"), log);
    });
    document.getElementById("btn-copy-gabarito").addEventListener("click", (e) => {
      e.stopPropagation();
      copyGabarito(log, log);
    });
    document.getElementById("btn-min").addEventListener("click", (e) => {
      e.stopPropagation();
      box.classList.toggle("minimized");
    });
    document.getElementById("btn-hide").addEventListener("click", (e) => {
      e.stopPropagation();
      box.classList.add("hidden-box");
      toggleBtn.style.display = "flex";
    });
    const actionBtn = document.getElementById("btn-action-main");
    if (isExam) {
      refreshGabaritoUI();
      actionBtn.addEventListener("click", async () => {
        if (isBusy) return;
        isBusy = true;
        actionBtn.disabled = true;
        try {
          await runExamQueue(currentProvider, currentModel, log, refreshGabaritoUI);
        } finally {
          isBusy = false;
          actionBtn.disabled = false;
        }
      });
    } else {
      actionBtn.addEventListener("click", async () => {
        if (isBusy) return;
        isBusy = true;
        actionBtn.disabled = true;
        try {
          await startThemeCompletion(log);
        } finally {
          isBusy = false;
          actionBtn.disabled = false;
        }
      });
    }
    processAutomatorStateMachine(log);
  }

  // src/index.js
  (function initEstacioSuite() {
    "use strict";
    if (typeof window !== "undefined" && window.location.hostname.includes("estudante.estacio.br")) {
      const origFetch = window.fetch;
      window.fetch = async function(...args) {
        try {
          const headers = args[1]?.headers || {};
          let auth = headers["Authorization"] || headers["authorization"];
          if (auth && auth.startsWith("Bearer ")) {
            const token = auth.replace(/^Bearer\s+/i, "").trim();
            sessionStorage.setItem("estacio_bearer", token);
            window.__estacio_bearer = token;
          }
        } catch (e) {
        }
        return origFetch.apply(this, args);
      };
      const origXHR = window.XMLHttpRequest.prototype.setRequestHeader;
      window.XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header && header.toLowerCase() === "authorization" && value && value.startsWith("Bearer ")) {
          const token = value.replace(/^Bearer\s+/i, "").trim();
          sessionStorage.setItem("estacio_bearer", token);
          window.__estacio_bearer = token;
        }
        return origXHR.apply(this, arguments);
      };
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createSuiteWidget);
    } else {
      createSuiteWidget();
    }
  })();
})();

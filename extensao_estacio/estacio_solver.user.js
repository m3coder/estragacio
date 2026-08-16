// ==UserScript==
// @name         Estácio Suite AI (Solver, Gabarito & Revisão Multi-IA)
// @namespace    https://github.com/m3coder/estragacio
// @version      2.0.1
// @description  Suite All-in-One da Estácio: 1) Resolução e Gabarito com IA Multi-Provedor (Claude, Mistral, Groq, Gemini, OpenAI, DeepSeek) 2) Troca Rápida de Modelo e Provedor 3) Revisão com 1-Clique no Gabarito 4) Auto-Conclusão de Temas.
// @author       m3coder
// @match        https://estacio.saladeavaliacoes.com.br/*
// @match        https://estudante.estacio.br/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @connect      apis.estudante.estacio.br
// @connect      api.anthropic.com
// @connect      generativelanguage.googleapis.com
// @connect      api.openai.com
// @connect      api.deepseek.com
// @connect      api.groq.com
// @connect      api.mistral.ai
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(() => {
  // src/ui/widget.css
  if (typeof GM_addStyle !== "undefined") {
    GM_addStyle('/* Estilo do Widget Flutuante Est\xE1cio Suite AI */\n\n#estacio-suite-box,\n#estacio-solver-widget {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 375px;\n  background: rgba(15, 23, 42, 0.97);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 14px;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);\n  color: #f8fafc;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  z-index: 99999999;\n  overflow: hidden;\n  transition: box-shadow 0.2s ease, opacity 0.2s ease;\n  user-select: none;\n}\n\n#estacio-suite-box.minimized,\n#estacio-solver-widget.minimized {\n  width: 52px !important;\n  height: 52px !important;\n  border-radius: 50% !important;\n  cursor: grab !important;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  padding: 0;\n  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);\n  border: 2px solid rgba(255, 255, 255, 0.3);\n}\n\n#estacio-suite-box.minimized:active,\n#estacio-solver-widget.minimized:active {\n  cursor: grabbing !important;\n}\n\n#estacio-suite-box.minimized .box-inner,\n#estacio-solver-widget.minimized .widget-header,\n#estacio-solver-widget.minimized .widget-body,\n#estacio-solver-widget.minimized .widget-footer {\n  display: none !important;\n}\n\n#estacio-suite-box.hidden-box,\n#estacio-solver-widget.hidden-box {\n  display: none !important;\n}\n\n#estacio-suite-toggle-btn {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  color: #fff;\n  border: 2px solid rgba(255, 255, 255, 0.35);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  cursor: grab;\n  z-index: 99999999;\n  overflow: hidden;\n}\n\n#estacio-suite-toggle-btn:active {\n  cursor: grabbing;\n}\n\n/* Anime Dancing Cat Mascot Animations */\n.cat-dancing-avatar {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 1.5px solid #60a5fa;\n  animation: catBop 0.6s infinite alternate ease-in-out;\n  box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);\n  flex-shrink: 0;\n}\n\n.cat-bubble-avatar {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  object-fit: cover;\n  animation: catDance 0.8s infinite alternate ease-in-out;\n  box-shadow: 0 0 12px rgba(168, 85, 247, 0.8);\n  pointer-events: none;\n}\n\n@keyframes catBop {\n  0% { transform: translateY(0) rotate(-5deg); }\n  50% { transform: translateY(-2px) scale(1.08) rotate(0deg); }\n  100% { transform: translateY(0) rotate(5deg); }\n}\n\n@keyframes catDance {\n  0% { transform: translateY(0) rotate(-8deg) scale(1); }\n  50% { transform: translateY(-3px) rotate(0deg) scale(1.1); }\n  100% { transform: translateY(0) rotate(8deg) scale(1); }\n}\n\n.box-header,\n.widget-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  background: rgba(30, 41, 59, 0.85);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  cursor: grab;\n}\n\n.box-header:active,\n.widget-header:active {\n  cursor: grabbing;\n}\n\n.box-title,\n.widget-title {\n  font-size: 13px;\n  font-weight: 700;\n  background: linear-gradient(135deg, #60a5fa, #a78bfa);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.box-controls,\n.widget-controls {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.box-ctrl-btn,\n.widget-btn-icon {\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 13px;\n  padding: 2px 4px;\n  line-height: 1;\n  border-radius: 4px;\n  transition: color 0.15s, background 0.15s;\n}\n\n.box-ctrl-btn:hover,\n.widget-btn-icon:hover {\n  color: #fff;\n  background: rgba(255, 255, 255, 0.1);\n}\n\n.box-body,\n.widget-body {\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n}\n\n.ai-selector-container {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.35);\n  padding: 8px 10px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.ai-selector-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 11px;\n}\n\n.ai-selector-select {\n  background: #1e293b;\n  color: #38bdf8;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 3px 6px;\n  cursor: pointer;\n  outline: none;\n  flex: 1;\n  max-width: 230px;\n}\n\n.key-config-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.25);\n  padding: 5px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.key-config-input {\n  flex: 1;\n  background: #1e293b;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  color: #fff;\n  padding: 4px 6px;\n  font-size: 11px;\n  font-family: monospace;\n}\n\n.box-btn,\n.widget-btn {\n  padding: 10px 14px;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  transition: all 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n}\n\n.box-btn-primary,\n.widget-btn-primary {\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);\n}\n\n.box-btn-success,\n.widget-btn-success {\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);\n}\n\n.box-btn:hover:not(:disabled),\n.widget-btn:hover:not(:disabled) {\n  opacity: 0.92;\n  transform: translateY(-1px);\n}\n\n.box-btn:disabled,\n.widget-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* Gabarito Inteligente com 1-Clique para Revis\xE3o */\n.gabarito-container {\n  background: rgba(15, 23, 42, 0.92);\n  border: 1px solid rgba(56, 189, 248, 0.35);\n  border-radius: 8px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.gabarito-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 11px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.gabarito-badges {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  max-height: 100px;\n  overflow-y: auto;\n  padding: 2px 0;\n}\n\n.gabarito-badge {\n  background: #1e293b;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 5px;\n  padding: 3px 7px;\n  font-size: 11px;\n  font-weight: 600;\n  color: #f1f5f9;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  position: relative;\n}\n\n.gabarito-badge:hover {\n  border-color: #a855f7;\n  background: rgba(168, 85, 247, 0.2);\n  transform: translateY(-1px) scale(1.05);\n  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);\n}\n\n.gabarito-badge.reviewing {\n  border-color: #f59e0b !important;\n  background: rgba(245, 158, 11, 0.25) !important;\n  animation: pulse 1s infinite alternate;\n}\n\n@keyframes pulse {\n  0% { opacity: 0.7; }\n  100% { opacity: 1; }\n}\n\n.gabarito-badge .badge-q { color: #94a3b8; }\n.gabarito-badge .badge-a { color: #34d399; font-weight: 700; }\n.gabarito-badge .badge-rev-icon { font-size: 10px; color: #c084fc; opacity: 0.7; }\n.gabarito-badge:hover .badge-rev-icon { opacity: 1; color: #e879f9; }\n\n.review-config-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n  background: rgba(168, 85, 247, 0.12);\n  border: 1px dashed rgba(168, 85, 247, 0.35);\n  padding: 6px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.box-log,\n.widget-log {\n  max-height: 100px;\n  overflow-y: auto;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 6px;\n  padding: 6px 8px;\n  font-family: ui-monospace, monospace;\n  font-size: 11px;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  user-select: text;\n  cursor: text;\n}\n\n.log-item.success, .widget-log-item.success { color: #34d399; }\n.log-item.error, .widget-log-item.error { color: #f87171; }\n.log-item.info, .widget-log-item.info { color: #60a5fa; }\n.log-item.warning, .widget-log-item.warning { color: #fbbf24; }\n\n.box-footer,\n.widget-footer {\n  padding: 6px 14px;\n  background: rgba(15, 23, 42, 0.7);\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  font-size: 11px;\n  color: #94a3b8;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.footer-btn {\n  background: none;\n  border: none;\n  color: #60a5fa;\n  cursor: pointer;\n  font-size: 11px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 4px;\n  border-radius: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n\n.footer-btn:hover {\n  color: #93c5fd;\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.estacio-ai-marked {\n  outline: 3px solid #10b981 !important;\n  outline-offset: 2px;\n  box-shadow: 0 0 14px rgba(16, 185, 129, 0.5) !important;\n}\n');
  } else if (typeof document !== "undefined") {
    const styleEl = document.createElement("style");
    styleEl.textContent = '/* Estilo do Widget Flutuante Est\xE1cio Suite AI */\n\n#estacio-suite-box,\n#estacio-solver-widget {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 375px;\n  background: rgba(15, 23, 42, 0.97);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 14px;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);\n  color: #f8fafc;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  z-index: 99999999;\n  overflow: hidden;\n  transition: box-shadow 0.2s ease, opacity 0.2s ease;\n  user-select: none;\n}\n\n#estacio-suite-box.minimized,\n#estacio-solver-widget.minimized {\n  width: 52px !important;\n  height: 52px !important;\n  border-radius: 50% !important;\n  cursor: grab !important;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  padding: 0;\n  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);\n  border: 2px solid rgba(255, 255, 255, 0.3);\n}\n\n#estacio-suite-box.minimized:active,\n#estacio-solver-widget.minimized:active {\n  cursor: grabbing !important;\n}\n\n#estacio-suite-box.minimized .box-inner,\n#estacio-solver-widget.minimized .widget-header,\n#estacio-solver-widget.minimized .widget-body,\n#estacio-solver-widget.minimized .widget-footer {\n  display: none !important;\n}\n\n#estacio-suite-box.hidden-box,\n#estacio-solver-widget.hidden-box {\n  display: none !important;\n}\n\n#estacio-suite-toggle-btn {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, #2563eb, #7c3aed);\n  color: #fff;\n  border: 2px solid rgba(255, 255, 255, 0.35);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  cursor: grab;\n  z-index: 99999999;\n  overflow: hidden;\n}\n\n#estacio-suite-toggle-btn:active {\n  cursor: grabbing;\n}\n\n/* Anime Dancing Cat Mascot Animations */\n.cat-dancing-avatar {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 1.5px solid #60a5fa;\n  animation: catBop 0.6s infinite alternate ease-in-out;\n  box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);\n  flex-shrink: 0;\n}\n\n.cat-bubble-avatar {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  object-fit: cover;\n  animation: catDance 0.8s infinite alternate ease-in-out;\n  box-shadow: 0 0 12px rgba(168, 85, 247, 0.8);\n  pointer-events: none;\n}\n\n@keyframes catBop {\n  0% { transform: translateY(0) rotate(-5deg); }\n  50% { transform: translateY(-2px) scale(1.08) rotate(0deg); }\n  100% { transform: translateY(0) rotate(5deg); }\n}\n\n@keyframes catDance {\n  0% { transform: translateY(0) rotate(-8deg) scale(1); }\n  50% { transform: translateY(-3px) rotate(0deg) scale(1.1); }\n  100% { transform: translateY(0) rotate(8deg) scale(1); }\n}\n\n.box-header,\n.widget-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  background: rgba(30, 41, 59, 0.85);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  cursor: grab;\n}\n\n.box-header:active,\n.widget-header:active {\n  cursor: grabbing;\n}\n\n.box-title,\n.widget-title {\n  font-size: 13px;\n  font-weight: 700;\n  background: linear-gradient(135deg, #60a5fa, #a78bfa);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.box-controls,\n.widget-controls {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.box-ctrl-btn,\n.widget-btn-icon {\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 13px;\n  padding: 2px 4px;\n  line-height: 1;\n  border-radius: 4px;\n  transition: color 0.15s, background 0.15s;\n}\n\n.box-ctrl-btn:hover,\n.widget-btn-icon:hover {\n  color: #fff;\n  background: rgba(255, 255, 255, 0.1);\n}\n\n.box-body,\n.widget-body {\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n}\n\n.ai-selector-container {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.35);\n  padding: 8px 10px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.ai-selector-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 11px;\n}\n\n.ai-selector-select {\n  background: #1e293b;\n  color: #38bdf8;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 3px 6px;\n  cursor: pointer;\n  outline: none;\n  flex: 1;\n  max-width: 230px;\n}\n\n.key-config-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: rgba(0, 0, 0, 0.25);\n  padding: 5px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.key-config-input {\n  flex: 1;\n  background: #1e293b;\n  border: 1px solid #475569;\n  border-radius: 4px;\n  color: #fff;\n  padding: 4px 6px;\n  font-size: 11px;\n  font-family: monospace;\n}\n\n.box-btn,\n.widget-btn {\n  padding: 10px 14px;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  transition: all 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n}\n\n.box-btn-primary,\n.widget-btn-primary {\n  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);\n}\n\n.box-btn-success,\n.widget-btn-success {\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  color: #fff;\n  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);\n}\n\n.box-btn:hover:not(:disabled),\n.widget-btn:hover:not(:disabled) {\n  opacity: 0.92;\n  transform: translateY(-1px);\n}\n\n.box-btn:disabled,\n.widget-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* Gabarito Inteligente com 1-Clique para Revis\xE3o */\n.gabarito-container {\n  background: rgba(15, 23, 42, 0.92);\n  border: 1px solid rgba(56, 189, 248, 0.35);\n  border-radius: 8px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.gabarito-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 11px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.gabarito-badges {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  max-height: 100px;\n  overflow-y: auto;\n  padding: 2px 0;\n}\n\n.gabarito-badge {\n  background: #1e293b;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 5px;\n  padding: 3px 7px;\n  font-size: 11px;\n  font-weight: 600;\n  color: #f1f5f9;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  position: relative;\n}\n\n.gabarito-badge:hover {\n  border-color: #a855f7;\n  background: rgba(168, 85, 247, 0.2);\n  transform: translateY(-1px) scale(1.05);\n  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);\n}\n\n.gabarito-badge.reviewing {\n  border-color: #f59e0b !important;\n  background: rgba(245, 158, 11, 0.25) !important;\n  animation: pulse 1s infinite alternate;\n}\n\n@keyframes pulse {\n  0% { opacity: 0.7; }\n  100% { opacity: 1; }\n}\n\n.gabarito-badge .badge-q { color: #94a3b8; }\n.gabarito-badge .badge-a { color: #34d399; font-weight: 700; }\n.gabarito-badge .badge-rev-icon { font-size: 10px; color: #c084fc; opacity: 0.7; }\n.gabarito-badge:hover .badge-rev-icon { opacity: 1; color: #e879f9; }\n\n.review-config-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n  background: rgba(168, 85, 247, 0.12);\n  border: 1px dashed rgba(168, 85, 247, 0.35);\n  padding: 6px 8px;\n  border-radius: 6px;\n  font-size: 11px;\n}\n\n.box-log,\n.widget-log {\n  max-height: 100px;\n  overflow-y: auto;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 6px;\n  padding: 6px 8px;\n  font-family: ui-monospace, monospace;\n  font-size: 11px;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  user-select: text;\n  cursor: text;\n}\n\n.log-item.success, .widget-log-item.success { color: #34d399; }\n.log-item.error, .widget-log-item.error { color: #f87171; }\n.log-item.info, .widget-log-item.info { color: #60a5fa; }\n.log-item.warning, .widget-log-item.warning { color: #fbbf24; }\n\n.box-footer,\n.widget-footer {\n  padding: 6px 14px;\n  background: rgba(15, 23, 42, 0.7);\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  font-size: 11px;\n  color: #94a3b8;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.footer-btn {\n  background: none;\n  border: none;\n  color: #60a5fa;\n  cursor: pointer;\n  font-size: 11px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 4px;\n  border-radius: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n\n.footer-btn:hover {\n  color: #93c5fd;\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.estacio-ai-marked {\n  outline: 3px solid #10b981 !important;\n  outline-offset: 2px;\n  box-shadow: 0 0 14px rgba(16, 185, 129, 0.5) !important;\n}\n';
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
    claude: {
      name: "Anthropic Claude",
      defaultModel: "claude-3-7-sonnet-20250219",
      endpoint: "https://api.anthropic.com/v1/messages",
      models: [
        { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (Racioc\xEDnio H\xEDbrido)" },
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Alta Precis\xE3o)" },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Ultra R\xE1pido)" }
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

  // src/config/mascot.js
  var CAT_MASCOT_DATA_URI = "data:image/png;base64,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";

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
        if (onSuccess) onSuccess();
      }, () => {
        if (onError) onError();
      });
    } catch (e) {
      if (onError) onError();
    }
  }
  function copyAllLogs(logBoxElement, onSuccess) {
    if (!logBoxElement) return;
    const lines = Array.from(logBoxElement.querySelectorAll(".log-item, .widget-log-item")).map((el) => el.textContent);
    copyTextToClipboard(lines.join("\n"), () => {
      if (onSuccess) onSuccess();
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
      span.innerHTML = `Q${a.q}: <b>${a.letter}</b> <span class="gabarito-search-icon">\u{1F50D}</span>`;
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
    if (provider === "claude") {
      const selectedModel2 = model || pConfig.defaultModel;
      const claudeUrl = "https://api.anthropic.com/v1/messages";
      const systemPrompt2 = `Voc\xEA \xE9 um professor PhD especialista em provas acad\xEAmicas e c\xE1lculo exato. Responda ESTRITAMENTE em formato JSON no formato: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;
      const res2 = await fetch(claudeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: selectedModel2,
          max_tokens: 1e3,
          system: systemPrompt2,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.1
        })
      });
      if (!res2.ok) {
        const err = await res2.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res2.status}`);
      }
      const data2 = await res2.json();
      const content2 = data2.content?.[0]?.text || "";
      const match2 = content2.match(/"letra"\s*:\s*"([A-E])"/i) || content2.match(/\b([A-E])\b/i);
      return {
        letra: match2 ? match2[1].toUpperCase() : "A",
        explicacao: content2.slice(0, 100)
      };
    }
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
        const msg = err.error?.message || `HTTP ${res2.status}`;
        throw new Error(msg);
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
    const allProviders = ["groq", "claude", "mistral", "gemini", "openai", "deepseek"];
    const fallbackQueue = [
      { p: provider, m: model },
      ...allProviders.filter((p) => p !== provider).map((p) => ({ p, m: PROVIDERS_CONFIG[p]?.defaultModel }))
    ];
    let lastError = null;
    for (let attempt = 0; attempt < fallbackQueue.length; attempt++) {
      const current = fallbackQueue[attempt];
      const key = getApiKeyFor(current.p);
      if (!key && attempt > 0) continue;
      try {
        if (attempt > 0 && onFallbackLog) {
          onFallbackLog(`Fallback ativado: Consultando ${PROVIDERS_CONFIG[current.p]?.name || current.p}...`, "info");
        }
        return await executeAICall(current.p, current.m, statement, alternatives);
      } catch (err) {
        lastError = err;
        const isRateLimit = /429|quota|rate limit/i.test(err.message);
        if (onFallbackLog) {
          onFallbackLog(`[Aviso] ${PROVIDERS_CONFIG[current.p]?.name || current.p} falhou (${err.message.slice(0, 80)}...). Ativando fallback...`, "warning");
        }
        if (isRateLimit && attempt === fallbackQueue.length - 1) {
          if (onFallbackLog) onFallbackLog(`Aguardando 4s de respiro para al\xEDvio de cota...`, "info");
          await new Promise((r) => setTimeout(r, 4e3));
          try {
            return await executeAICall(current.p, current.m, statement, alternatives);
          } catch (retryErr) {
            lastError = retryErr;
          }
        }
      }
    }
    throw lastError || new Error("Todas as IAs de fallback falharam.");
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
    const cardsMap = /* @__PURE__ */ new Map();
    const candidates = Array.from(document.querySelectorAll('button, a[href*="/conteudos/"], [role="button"], article, section, [class*="card"], div'));
    candidates.forEach((el) => {
      let card = el.closest('article, section, [class*="card"], div');
      if (!card) return;
      const text = (card.innerText || "").replace(/\s+/g, " ").trim();
      if (text.toLowerCase().includes("continue de onde parou") && !text.match(/Tema\s*1\s*\|/i)) {
        return;
      }
      const match = text.match(/Tema\s*(\d+)/i);
      if (match && text.length < 400) {
        const temaNum = parseInt(match[1]);
        if (!cardsMap.has(temaNum)) {
          const isConcluido = /conclu[ií]do/i.test(text);
          const itemsMatch = text.match(/(\d+)\s*Itens?/i);
          const totalItems = itemsMatch ? parseInt(itemsMatch[1]) : 1;
          const link = card.querySelector('a[href*="/conteudos/"]');
          const href = link ? link.href : card.getAttribute("href") || "";
          const actionBtn = card.querySelector('button, [role="button"], a[href*="/conteudos/"]') || card;
          cardsMap.set(temaNum, {
            temaNum,
            temaName: `Tema ${temaNum}`,
            totalItems,
            cardEl: card,
            actionBtn,
            href,
            isConcluido,
            isPendente: !isConcluido
          });
        }
      }
    });
    const cards = Array.from(cardsMap.values());
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
    if (total === 0) {
      if (onLog) onLog("Nenhuma quest\xE3o encontrada na p\xE1gina.", "error");
      return;
    }
    const existingGabarito = getSavedGabarito()?.answers || [];
    const gabaritoMap = /* @__PURE__ */ new Map();
    existingGabarito.forEach((a) => {
      if (a.q && a.letter && !a.explanation?.toLowerCase().includes("dados insuficientes") && !a.explanation?.toLowerCase().includes("erro")) {
        gabaritoMap.set(a.q, a);
      }
    });
    const alreadyCount = gabaritoMap.size;
    if (alreadyCount > 0 && onLog) {
      onLog(`Retomando prova: ${alreadyCount} quest\xE3o(\xF5es) j\xE1 respondidas anteriormente ser\xE3o aproveitadas! \u23E9`, "info");
    } else if (onLog) {
      onLog(`Iniciando resolu\xE7\xE3o com ${pName} (${model}) [${total} quest\xF5es]...`, "info");
    }
    for (let i = 0; i < total; i++) {
      const q = cards[i];
      if (q.element) {
        q.element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        await new Promise((r) => setTimeout(r, 250));
      }
      const statement = extractStatement(q.element, q.index);
      const alternatives = extractAlternatives(q.element);
      if (alternatives.length < 2) {
        if (onLog) onLog(`[${i + 1}/${total}] Alternativas n\xE3o encontradas.`, "error");
        continue;
      }
      if (gabaritoMap.has(q.index)) {
        const saved = gabaritoMap.get(q.index);
        const chosenLetter = saved.letter;
        if (onLog) onLog(`[${i + 1}/${total}] Quest\xE3o ${q.index} j\xE1 respondida: [ ${chosenLetter} ] -> Marcando na tela \u2705`, "success");
        const target = alternatives.find((o) => o.letter === chosenLetter);
        if (target && target.element) {
          clickOptionReact(target.element);
        }
        await new Promise((r) => setTimeout(r, 350));
        continue;
      }
      if (onLog) onLog(`[${i + 1}/${total}] Processando Quest\xE3o ${q.index}...`, "info");
      try {
        if (onLog) onLog(`[${i + 1}/${total}] Consultando IA (${pName})...`, "info");
        const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
        const chosenLetter = ans.letra?.toUpperCase() || "A";
        if (onLog) onLog(`[${i + 1}/${total}] -> Resposta: ${chosenLetter} (${ans.explicacao || ""})`, "success");
        gabaritoMap.set(q.index, {
          q: q.index,
          letter: chosenLetter,
          explanation: ans.explicacao || ""
        });
        const currentList = Array.from(gabaritoMap.values()).sort((a, b) => a.q - b.q);
        saveGabarito(`${pName} (${model})`, currentList);
        if (onGabaritoUpdated) onGabaritoUpdated();
        const target = alternatives.find((o) => o.letter === chosenLetter);
        if (target && target.element) {
          clickOptionReact(target.element);
        }
        const pauseMs = Math.floor(Math.random() * (2500 - 1800 + 1)) + 1800;
        await new Promise((r) => setTimeout(r, pauseMs));
      } catch (err) {
        if (onLog) onLog(`[${i + 1}/${total}] Quest\xE3o ${q.index} falhou: ${err.message.slice(0, 90)}`, "error");
        await new Promise((r) => setTimeout(r, 3e3));
      }
    }
    const finalCount = gabaritoMap.size;
    if (finalCount >= total) {
      if (onLog) onLog("\u{1F389} Todas as 10 quest\xF5es foram respondidas e salvas no Gabarito! \u{1F4DD}\u{1F3C6}", "success");
    } else {
      if (onLog) onLog(`\u26A0\uFE0F Prova pausada: ${finalCount}/${total} respondidas. Clique novamente em Resolver para continuar as restantes!`, "warning");
    }
    if (onGabaritoUpdated) onGabaritoUpdated();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // src/modules/theme_automator.js
  var isStateMachineRunning = false;
  function dispatchFullMouseEvents(el) {
    if (!el) return;
    const events = ["pointerdown", "mousedown", "pointerup", "mouseup", "click"];
    events.forEach((type) => {
      try {
        const ev = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window
        });
        el.dispatchEvent(ev);
      } catch (e) {
      }
    });
  }
  function isInsideThemeUrl(url) {
    if (!url) return false;
    return /\/conteudos\/[a-f0-9-]{36}/i.test(url) || url.includes("tema=") || url.includes("/temas/");
  }
  function isCurrentlyInsideTheme() {
    const url = window.location.href;
    if (isInsideThemeUrl(url)) return true;
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], span, div'));
    const hasVoltar = buttons.some((el) => {
      const t = (el.innerText || el.getAttribute("aria-label") || "").trim().toLowerCase();
      return (t === "voltar" || t === "\u2190 voltar" || t === "\u2190") && !el.closest("#estacio-suite-box");
    });
    const hasConcluirBtn = Array.from(document.querySelectorAll('button, [role="button"]')).some((el) => {
      const t = (el.innerText || "").toLowerCase();
      return t.includes("marcar como conclu") && !el.closest("#estacio-suite-box");
    });
    const hasThemeHeader = /Tema\s*\d+\s*[-–|:]/i.test(document.body.innerText);
    return hasVoltar && (hasConcluirBtn || hasThemeHeader);
  }
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
  function harvestInPageContentUuids() {
    const uuids = /* @__PURE__ */ new Set();
    const allLinks = Array.from(document.querySelectorAll('a[href*="/conteudos/"], button[data-uuid], [data-conteudo-id], [data-id]'));
    allLinks.forEach((el) => {
      const href = el.href || el.getAttribute("data-href") || "";
      const match = href.match(/\/conteudos\/([a-f0-9-]{36})/i);
      if (match) uuids.add(match[1]);
      const directId = el.getAttribute("data-uuid") || el.getAttribute("data-conteudo-id") || el.getAttribute("data-id");
      if (directId && directId.length > 20 && /^[a-f0-9-]{36}$/i.test(directId)) uuids.add(directId);
    });
    return Array.from(uuids);
  }
  async function fetchAllThemeSubContents(turmaId, temaId, token) {
    const discoveredUuids = /* @__PURE__ */ new Set();
    const endpoints = [
      `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos`,
      `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}`,
      `https://apis.estudante.estacio.br/rest/me/turmas/${turmaId}/temas/${temaId}/conteudos`
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json, text/plain, */*"
          }
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.conteudos || data.itens || data.items || [];
          if (Array.isArray(items)) {
            items.forEach((item) => {
              const uuid = item.idConteudo || item.conteudoUuid || item.uuid || item.id;
              if (uuid && typeof uuid === "string" && uuid.length > 20) {
                discoveredUuids.add(uuid);
              }
            });
          }
        }
      } catch (e) {
      }
    }
    return Array.from(discoveredUuids);
  }
  async function postConcluir(turmaId, temaId, conteudoUuid, token, matricula, onLog = null) {
    const matriculaParam = matricula ? `?matricula=${matricula}` : "";
    const endpointLegado = `https://apis.estudante.estacio.br/rest/turmas/${turmaId}/temas/${temaId}/conteudos/${conteudoUuid}/conclusoes${matriculaParam}`;
    const endpointNovo = `https://apis.estudante.estacio.br/rest/me/conteudos/${conteudoUuid}/concluir`;
    const headersBase = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json, text/plain, */*"
    };
    let statusInfo = "";
    try {
      const res = await fetch(endpointLegado, {
        method: "POST",
        headers: headersBase
      });
      statusInfo += `Legado: HTTP ${res.status} `;
      if (res.status >= 200 && res.status < 300) {
        if (onLog) onLog(`[POST Conclus\xF5es] /temas/${temaId}/conteudos/${conteudoUuid.slice(0, 8)}... \u2192 HTTP ${res.status} OK \u2705`, "success");
        return true;
      }
    } catch (e) {
      statusInfo += `Legado: ${e.message} `;
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
      statusInfo += `Novo: HTTP ${res.status}`;
      if (res.status >= 200 && res.status < 300) {
        if (onLog) onLog(`[POST Concluir] /me/conteudos/${conteudoUuid.slice(0, 8)}... \u2192 HTTP ${res.status} OK \u2705`, "success");
        return true;
      }
    } catch (e) {
      statusInfo += `Novo: ${e.message}`;
    }
    if (onLog) {
      onLog(`[Aviso POST] Resposta da API: ${statusInfo}`, "warning");
    }
    return false;
  }
  async function clickConcludeButtonActiveLoop(onLog = null) {
    try {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (e) {
    }
    await new Promise((r) => setTimeout(r, 600));
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a, div, span'));
    const concludeEl = candidates.find((el) => {
      const txt = (el.innerText || "").trim().toLowerCase();
      return txt.includes("marcar como conclu") && !el.closest("#estacio-suite-box");
    });
    if (concludeEl) {
      const targetBtn = concludeEl.closest('button, [role="button"]') || concludeEl;
      targetBtn.removeAttribute("disabled");
      targetBtn.setAttribute("aria-disabled", "false");
      dispatchFullMouseEvents(targetBtn);
      triggerNativeClick(targetBtn);
      if (onLog) onLog("Bot\xE3o [Marcar como conclu\xEDdo] liberado e clicado na tela! \u{1F3AF}", "success");
      await new Promise((r) => setTimeout(r, 800));
      const currentTxt = (targetBtn.innerText || "").toLowerCase();
      if (currentTxt.includes("marcar como conclu") && !currentTxt.includes("j\xE1")) {
        dispatchFullMouseEvents(targetBtn);
        triggerNativeClick(targetBtn);
      }
    }
  }
  function openThemeByIndex(temaNum) {
    const cards = getThemeCardsFromDom();
    const targetCard = cards.find((c) => c.temaNum === temaNum);
    if (!targetCard) return false;
    try {
      targetCard.cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) {
    }
    const innerButtons = Array.from(targetCard.cardEl.querySelectorAll('button, [role="button"], a'));
    const actionBtn = innerButtons.find((b) => {
      const label = (b.getAttribute("aria-label") || b.getAttribute("title") || b.innerText || "").toLowerCase();
      return label.includes("acessar") || label.includes("tema");
    }) || innerButtons[0] || targetCard.cardEl;
    dispatchFullMouseEvents(actionBtn);
    triggerNativeClick(actionBtn);
    if (targetCard.cardEl !== actionBtn) {
      dispatchFullMouseEvents(targetCard.cardEl);
      triggerNativeClick(targetCard.cardEl);
    }
    const linkEl = targetCard.cardEl.querySelector('a[href*="/conteudos/"]');
    if (linkEl) {
      dispatchFullMouseEvents(linkEl);
      triggerNativeClick(linkEl);
    }
    if (targetCard.href && targetCard.href.includes("/conteudos/")) {
      setTimeout(() => {
        if (!isCurrentlyInsideTheme()) {
          window.location.href = targetCard.href;
        }
      }, 1500);
    }
    return true;
  }
  async function processAutomatorStateMachine(onLog) {
    if (isStateMachineRunning) return;
    const queueRaw = localStorage.getItem("estacio_catalog_queue");
    if (!queueRaw) return;
    let queue = null;
    try {
      queue = JSON.parse(queueRaw);
    } catch (e) {
      return;
    }
    if (!queue || !queue.active) return;
    const token = getBearerToken();
    const matricula = getMatricula();
    const insideTheme = isCurrentlyInsideTheme();
    if (insideTheme) {
      isStateMachineRunning = true;
      try {
        const url = window.location.href;
        const ids = parseIdsFromUrl(url);
        const turmaId = ids.turmaId || queue.turmaId;
        const targetMateriaUrl = `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`;
        let temaId = ids.temaId;
        const headerText = document.body.innerText;
        const headerMatch = headerText.match(/Tema\s*(\d+)/i);
        const temaNum = headerMatch ? parseInt(headerMatch[1]) : queue.pendingThemes[queue.currentPos] || 1;
        if (!temaId) temaId = `tema_${temaNum}`;
        if (onLog) onLog(`[Tema ${temaNum}] Aberto na tela! Coletando sub-conte\xFAdos...`, "info");
        const allUuids = /* @__PURE__ */ new Set();
        if (ids.conteudoUuid) allUuids.add(ids.conteudoUuid);
        harvestInPageContentUuids().forEach((u) => allUuids.add(u));
        if (turmaId && token) {
          const apiUuids = await fetchAllThemeSubContents(turmaId, temaId, token);
          apiUuids.forEach((u) => allUuids.add(u));
        }
        const uuidList = Array.from(allUuids);
        if (onLog) onLog(`[Tema ${temaNum}] Disparando requisi\xE7\xE3o de conclus\xE3o para ${uuidList.length || 1} sub-item(ns)...`, "info");
        if (uuidList.length > 0) {
          for (let idx = 0; idx < uuidList.length; idx++) {
            const uuid = uuidList[idx];
            await postConcluir(turmaId, temaId, uuid, token, matricula, onLog);
            await new Promise((r) => setTimeout(r, 300));
          }
        } else if (ids.conteudoUuid) {
          await postConcluir(turmaId, temaId, ids.conteudoUuid, token, matricula, onLog);
        }
        await clickConcludeButtonActiveLoop(onLog);
        if (uuidList.length > 0) {
          for (const uuid of uuidList) {
            await postConcluir(turmaId, temaId, uuid, token, matricula);
          }
        }
        const delayMs = Math.floor(Math.random() * (2200 - 1500 + 1)) + 1500;
        const delaySec = (delayMs / 1e3).toFixed(1);
        if (onLog) onLog(`[Tema ${temaNum}] Conclu\xEDdo com sucesso! Aguardando ${delaySec}s e voltando para a grade...`, "success");
        await new Promise((r) => setTimeout(r, delayMs));
        queue.completedThemes = queue.completedThemes || [];
        if (!queue.completedThemes.includes(temaNum)) {
          queue.completedThemes.push(temaNum);
        }
        queue.currentPos += 1;
        localStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
        if (onLog) onLog(`Voltando para: /disciplinas/${turmaId}/conteudos \u21A9\uFE0F`, "info");
        window.location.href = targetMateriaUrl;
      } finally {
        isStateMachineRunning = false;
      }
      return;
    }
    if (!insideTheme) {
      isStateMachineRunning = true;
      try {
        await new Promise((r) => setTimeout(r, 1200));
        const gridCards = await waitForCards(15e3);
        if (gridCards.length === 0) {
          return;
        }
        const completedSet = new Set(queue.completedThemes || []);
        const pendentes = gridCards.filter((c) => !c.isConcluido && !completedSet.has(c.temaNum));
        const expectedTotal = queue.totalThemes || gridCards.length;
        if (pendentes.length === 0 && gridCards.length >= expectedTotal) {
          localStorage.removeItem("estacio_catalog_queue");
          if (onLog) onLog(`\u{1F3C6} Todos os ${gridCards.length} temas desta mat\xE9ria est\xE3o 100% CONCLU\xCDDOS! Parab\xE9ns!`, "success");
          return;
        }
        if (pendentes.length === 0) {
          return;
        }
        if (onLog) onLog(`Restam ${pendentes.length} tema(s) pendente(s) na mat\xE9ria.`, "info");
        queue.pendingThemes = pendentes.map((c) => c.temaNum);
        localStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
        const nextTema = pendentes[0];
        if (onLog) onLog(`[${pendentes.length} restantes] Abrindo Tema ${nextTema.temaNum} (${nextTema.totalItems} itens)...`, "info");
        await new Promise((r) => setTimeout(r, 800));
        openThemeByIndex(nextTema.temaNum);
      } finally {
        isStateMachineRunning = false;
      }
    }
  }
  function startThemeCompletion(onLog) {
    const currentUrl = window.location.href;
    const turmaMatch = currentUrl.match(/\/disciplinas\/(estacio_\d+)/i);
    const turmaId = turmaMatch ? turmaMatch[1] : null;
    if (!turmaId) {
      if (onLog) onLog("Acesse a p\xE1gina de conte\xFAdos da mat\xE9ria (/disciplinas/estacio_...) para concluir.", "error");
      return;
    }
    const token = getBearerToken();
    if (!token) {
      if (onLog) onLog("Token n\xE3o capturado. Abra qualquer tema manualmente primeiro para salvar a sess\xE3o.", "error");
      return;
    }
    if (onLog) onLog("Iniciando automa\xE7\xE3o dos temas da mat\xE9ria...", "info");
    if (isCurrentlyInsideTheme()) {
      const queue = {
        active: true,
        turmaId,
        totalThemes: 5,
        conteudosUrl: `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`,
        pendingThemes: [1],
        completedThemes: [],
        currentPos: 0
      };
      localStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
      processAutomatorStateMachine(onLog);
      return;
    }
    waitForCards(8e3).then((cards) => {
      const pendentes = cards.filter((t) => !t.isConcluido);
      if (onLog) onLog(`Detectados ${cards.length} temas no total (${pendentes.length} pendentes).`, "info");
      if (pendentes.length === 0) {
        if (onLog) onLog("Todos os temas desta mat\xE9ria j\xE1 est\xE3o 100% conclu\xEDdos! \u{1F3C6}", "success");
        localStorage.removeItem("estacio_catalog_queue");
        return;
      }
      const pendingNumbers = pendentes.map((t) => t.temaNum);
      const queue = {
        active: true,
        turmaId,
        totalThemes: cards.length,
        conteudosUrl: `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`,
        pendingThemes: pendingNumbers,
        completedThemes: [],
        currentPos: 0
      };
      localStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
      const firstTema = pendentes[0];
      if (onLog) onLog(`[1/${pendingNumbers.length}] Abrindo Tema ${firstTema.temaNum}...`, "info");
      openThemeByIndex(firstTema.temaNum);
    });
  }

  // src/ui/widget.js
  function createSuiteWidget() {
    if (document.getElementById("estacio-suite-box")) return;
    const isExam = window.location.hostname.includes("saladeavaliacoes.com.br");
    let currentProvider = getSaved("active_provider", "groq");
    let currentModel = getSaved("active_model", PROVIDERS_CONFIG[currentProvider]?.defaultModel || "llama-3.3-70b-versatile");
    let reviewProvider = getSaved("review_provider", "claude");
    let isBusy = false;
    const savedLogsRaw = localStorage.getItem("estacio_suite_logs");
    let initialLogs = [];
    try {
      initialLogs = JSON.parse(savedLogsRaw) || [];
    } catch (e) {
    }
    const box = document.createElement("div");
    box.id = "estacio-suite-box";
    box.innerHTML = `
    <div class="box-inner">
      <div class="box-header" id="box-drag-handle">
        <div class="box-title">
          <img src="${CAT_MASCOT_DATA_URI}" class="cat-dancing-avatar" alt="Mascote">
          <span>Est\xE1cio Suite AI</span>
        </div>
        <div class="box-controls">
          <button id="btn-clear-header" class="box-ctrl-btn" title="Limpar Logs e Cache">\u{1F9F9}</button>
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
              <option value="claude" ${currentProvider === "claude" ? "selected" : ""}>Anthropic Claude (3.7 / 3.5)</option>
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
              <option value="claude" ${reviewProvider === "claude" ? "selected" : ""}>Claude 3.7 Sonnet</option>
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

        <div class="box-log" id="box-log"></div>
      </div>

      <div class="box-footer">
        <span id="box-footer-model" style="color:#38bdf8; font-weight:600;">${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel})</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <button id="btn-clear-footer" class="footer-btn" title="Limpar logs e dados acumulados">
            <span>\u{1F9F9}</span> Limpar
          </button>
          <button id="btn-copy-footer" class="footer-btn" title="Copiar todos os logs">
            <span>\u{1F4CB}</span> Copiar
          </button>
        </div>
      </div>
    </div>
  `;
    const minMascotImg = document.createElement("img");
    minMascotImg.src = CAT_MASCOT_DATA_URI;
    minMascotImg.className = "cat-bubble-avatar";
    minMascotImg.style.display = "none";
    box.appendChild(minMascotImg);
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "estacio-suite-toggle-btn";
    toggleBtn.innerHTML = `<img src="${CAT_MASCOT_DATA_URI}" class="cat-bubble-avatar" alt="Mascote">`;
    toggleBtn.title = "Mostrar Est\xE1cio Suite AI";
    document.body.appendChild(box);
    document.body.appendChild(toggleBtn);
    setupUniversalDraggable(box, document.getElementById("box-drag-handle"));
    setupUniversalDraggable(box, box, () => {
      if (box.classList.contains("minimized")) {
        box.classList.remove("minimized");
        minMascotImg.style.display = "none";
      }
    });
    setupUniversalDraggable(toggleBtn, toggleBtn, () => {
      box.classList.remove("hidden-box");
      box.classList.remove("minimized");
      minMascotImg.style.display = "none";
      toggleBtn.style.display = "none";
    });
    const logBox = document.getElementById("box-log");
    if (initialLogs.length > 0) {
      initialLogs.forEach((entry) => {
        if (entry && entry.text && entry.text !== "undefined") {
          const div = document.createElement("div");
          div.className = `log-item ${entry.type || "info"}`;
          div.textContent = entry.text;
          logBox.appendChild(div);
        }
      });
      logBox.scrollTop = logBox.scrollHeight;
    } else {
      const div = document.createElement("div");
      div.className = "log-item info";
      div.textContent = `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Pronto. IA: ${PROVIDERS_CONFIG[currentProvider]?.name} (${currentModel}) ativa.`;
      logBox.appendChild(div);
    }
    function log(msg, type = "info") {
      if (!logBox || !msg || msg === "undefined") return;
      const formatted = `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${msg}`;
      const div = document.createElement("div");
      div.className = `log-item ${type}`;
      div.textContent = formatted;
      logBox.appendChild(div);
      logBox.scrollTop = logBox.scrollHeight;
      try {
        const current = JSON.parse(localStorage.getItem("estacio_suite_logs") || "[]");
        current.push({ text: formatted, type });
        if (current.length > 40) current.splice(0, current.length - 40);
        localStorage.setItem("estacio_suite_logs", JSON.stringify(current));
      } catch (e) {
      }
    }
    function clearAllStoredData() {
      localStorage.removeItem("estacio_suite_logs");
      localStorage.removeItem("estacio_last_gabarito");
      localStorage.removeItem("estacio_catalog_queue");
      sessionStorage.removeItem("estacio_catalog_queue");
      if (logBox) logBox.innerHTML = "";
      const gabaritoPanel = document.getElementById("gabarito-panel");
      const gabaritoBadges = document.getElementById("gabarito-badges");
      if (gabaritoPanel) gabaritoPanel.style.display = "none";
      if (gabaritoBadges) gabaritoBadges.innerHTML = "";
      log("\u{1F9F9} Todos os logs, gabaritos e filas foram limpos com sucesso!", "success");
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
    document.getElementById("btn-clear-header").addEventListener("click", (e) => {
      e.stopPropagation();
      clearAllStoredData();
    });
    document.getElementById("btn-clear-footer").addEventListener("click", (e) => {
      e.stopPropagation();
      clearAllStoredData();
    });
    document.getElementById("btn-copy-header").addEventListener("click", (e) => {
      e.stopPropagation();
      copyAllLogs(document.getElementById("box-log"));
    });
    document.getElementById("btn-copy-footer").addEventListener("click", (e) => {
      e.stopPropagation();
      copyAllLogs(document.getElementById("box-log"));
    });
    document.getElementById("btn-copy-gabarito").addEventListener("click", (e) => {
      e.stopPropagation();
      copyGabarito();
    });
    document.getElementById("btn-min").addEventListener("click", (e) => {
      e.stopPropagation();
      const isMin = box.classList.toggle("minimized");
      minMascotImg.style.display = isMin ? "block" : "none";
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
      actionBtn.addEventListener("click", () => {
        startThemeCompletion(log);
      });
    }
    processAutomatorStateMachine(log);
    let lastMonitoredUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastMonitoredUrl) {
        lastMonitoredUrl = window.location.href;
        processAutomatorStateMachine(log);
      }
    }, 1e3);
    window.addEventListener("popstate", () => {
      lastMonitoredUrl = window.location.href;
      processAutomatorStateMachine(log);
    });
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

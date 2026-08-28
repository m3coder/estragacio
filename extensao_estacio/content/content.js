// Estácio Suite AI - Content Script Bundle (MV3)
(() => {
  // src/ui/widget.css
  if (typeof GM_addStyle !== "undefined") {
    GM_addStyle('/* Estilo Premium do Widget Flutuante Est\xE1cio Suite AI v2.5.5 */\n\n#estacio-suite-box,\n#estacio-solver-widget {\n  --widget-idle-opacity: 0.45;\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 410px;\n  max-width: calc(100vw - 32px);\n  background: rgba(15, 23, 42, 0.96);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 16px;\n  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06);\n  color: #f8fafc;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;\n  z-index: 99999999;\n  overflow: hidden;\n  opacity: var(--widget-idle-opacity, 0.45);\n  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;\n  user-select: none;\n}\n\n#estacio-suite-box:hover,\n#estacio-suite-box:focus-within,\n#estacio-suite-box.is-dragging,\n#estacio-solver-widget:hover,\n#estacio-solver-widget:focus-within {\n  opacity: 1 !important;\n}\n\n#estacio-suite-box.minimized,\n#estacio-solver-widget.minimized {\n  width: 58px !important;\n  height: 58px !important;\n  border-radius: 50% !important;\n  cursor: pointer !important;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: radial-gradient(circle, #1e293b, #0f172a);\n  padding: 0;\n  box-shadow: 0 0 20px rgba(56, 189, 248, 0.6), 0 10px 25px rgba(0, 0, 0, 0.6);\n  border: 2px solid rgba(56, 189, 248, 0.7);\n  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n#estacio-suite-box.minimized:hover,\n#estacio-solver-widget.minimized:hover {\n  transform: scale(1.1);\n  border-color: #c084fc;\n  box-shadow: 0 0 26px rgba(192, 132, 252, 0.9), 0 12px 30px rgba(0, 0, 0, 0.7);\n}\n\n#estacio-suite-box.minimized:active,\n#estacio-solver-widget.minimized:active {\n  cursor: grabbing !important;\n  transform: scale(0.95);\n}\n\n#estacio-suite-box.minimized .box-inner,\n#estacio-solver-widget.minimized .widget-header,\n#estacio-solver-widget.minimized .widget-body,\n#estacio-solver-widget.minimized .widget-footer {\n  display: none !important;\n}\n\n#estacio-suite-box.hidden-box,\n#estacio-solver-widget.hidden-box {\n  display: none !important;\n}\n\n#estacio-suite-toggle-btn {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 58px;\n  height: 58px;\n  border-radius: 50%;\n  background: radial-gradient(circle, #1e293b, #0f172a);\n  color: #fff;\n  border: 2px solid rgba(56, 189, 248, 0.7);\n  box-shadow: 0 0 20px rgba(56, 189, 248, 0.6), 0 10px 25px rgba(0, 0, 0, 0.6);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  z-index: 99999999;\n  overflow: hidden;\n  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n#estacio-suite-toggle-btn:hover {\n  transform: scale(1.1);\n  border-color: #c084fc;\n  box-shadow: 0 0 26px rgba(192, 132, 252, 0.9), 0 12px 30px rgba(0, 0, 0, 0.7);\n}\n\n#estacio-suite-toggle-btn:active {\n  cursor: grabbing;\n  transform: scale(0.95);\n}\n\n/* Anime Dancing Cat Mascot Avatar (Enlarged, Interactive, Smooth Dancing Frame) */\n.cat-dancing-avatar {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 2px solid #60a5fa;\n  box-shadow: 0 0 14px rgba(96, 165, 250, 0.75), 0 2px 8px rgba(0, 0, 0, 0.4);\n  flex-shrink: 0;\n  display: inline-block;\n  vertical-align: middle;\n  cursor: pointer;\n  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n.cat-dancing-avatar:hover {\n  transform: scale(1.14);\n  border-color: #c084fc;\n  box-shadow: 0 0 20px rgba(192, 132, 252, 0.95), 0 4px 12px rgba(0, 0, 0, 0.5);\n}\n\n.cat-dancing-avatar:active {\n  transform: scale(0.92);\n}\n\n.cat-bubble-avatar {\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  object-fit: cover;\n  box-shadow: 0 0 14px rgba(168, 85, 247, 0.85);\n  pointer-events: none;\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.box-title-info {\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.box-subtitle-tip {\n  font-size: 9.5px;\n  color: #94a3b8;\n  font-weight: 500;\n  letter-spacing: 0.1px;\n}\n\n/* Header */\n.box-header,\n.widget-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  background: rgba(30, 41, 59, 0.7);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  cursor: grab;\n}\n\n.box-header:active,\n.widget-header:active {\n  cursor: grabbing;\n}\n\n.box-title,\n.widget-title {\n  font-size: 13px;\n  font-weight: 700;\n  color: #f8fafc;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.title-gradient-text {\n  background: linear-gradient(135deg, #38bdf8, #a855f7);\n  background-clip: text;\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  font-weight: 800;\n  letter-spacing: -0.2px;\n}\n\n.version-badge {\n  font-size: 10px;\n  font-weight: 600;\n  color: #94a3b8;\n  background: rgba(255, 255, 255, 0.08);\n  padding: 1px 5px;\n  border-radius: 4px;\n}\n\n.box-controls,\n.widget-controls {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.box-ctrl-btn,\n.widget-btn-icon {\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 13px;\n  padding: 4px 6px;\n  line-height: 1;\n  border-radius: 6px;\n  transition: all 0.15s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.box-ctrl-btn:hover,\n.widget-btn-icon:hover {\n  color: #fff;\n  background: rgba(255, 255, 255, 0.12);\n  transform: translateY(-1px);\n}\n\n/* Body */\n.box-body,\n.widget-body {\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n/* Section Cards */\n.ui-card {\n  background: rgba(15, 23, 42, 0.65);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 10px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 7px;\n}\n\n.ui-card-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  font-size: 11px;\n  font-weight: 700;\n  color: #cbd5e1;\n}\n\n.ui-form-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ui-form-label {\n  font-size: 11px;\n  font-weight: 600;\n  color: #94a3b8;\n  white-space: nowrap;\n  min-width: 65px;\n}\n\n.ui-select {\n  background: #1e293b;\n  color: #f1f5f9;\n  border: 1px solid #475569;\n  border-radius: 6px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 5px 8px;\n  cursor: pointer;\n  outline: none;\n  flex: 1;\n  min-width: 0;\n  transition: border-color 0.15s;\n}\n\n.ui-select:focus,\n.ui-select:hover {\n  border-color: #38bdf8;\n}\n\n.ui-input {\n  background: #1e293b;\n  border: 1px solid #475569;\n  border-radius: 6px;\n  color: #fff;\n  padding: 5px 8px;\n  font-size: 11px;\n  font-family: monospace;\n  flex: 1;\n  min-width: 0;\n  outline: none;\n  transition: border-color 0.15s;\n}\n\n.ui-input:focus {\n  border-color: #38bdf8;\n  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);\n}\n\n/* Micro Action Buttons */\n.pill-btn {\n  border: none;\n  border-radius: 20px;\n  font-size: 10.5px;\n  font-weight: 700;\n  padding: 3px 10px;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.pill-btn:hover {\n  transform: translateY(-1px);\n}\n\n.pill-btn-free {\n  background: #065f46;\n  color: #a7f3d0;\n  border: 1px solid #059669;\n}\n.pill-btn-free:hover {\n  background: #047857;\n  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);\n}\n\n.pill-btn-paid {\n  background: #701a75;\n  color: #f5d0fe;\n  border: 1px solid #a21caf;\n}\n.pill-btn-paid:hover {\n  background: #86198f;\n  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.35);\n}\n\n.btn-secondary-action {\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  color: #38bdf8;\n  border-radius: 6px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 4px 8px;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.btn-secondary-action:hover:not(:disabled) {\n  background: rgba(56, 189, 248, 0.18);\n  border-color: #38bdf8;\n  transform: translateY(-1px);\n}\n\n.btn-secondary-action:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* Primary Action Buttons */\n.box-btn,\n.widget-btn {\n  padding: 11px 16px;\n  border-radius: 10px;\n  font-size: 13px;\n  font-weight: 700;\n  cursor: pointer;\n  border: none;\n  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.box-btn-primary,\n.widget-btn-primary {\n  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);\n  color: #fff;\n  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);\n}\n\n.box-btn-success,\n.widget-btn-success {\n  background: linear-gradient(135deg, #059669 0%, #0d9488 100%);\n  color: #fff;\n  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);\n}\n\n.box-btn:hover:not(:disabled),\n.widget-btn:hover:not(:disabled) {\n  opacity: 0.96;\n  transform: translateY(-1.5px);\n  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);\n}\n\n.box-btn:disabled,\n.widget-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n  transform: none;\n}\n\n/* Gabarito Inteligente */\n.gabarito-container {\n  background: rgba(15, 23, 42, 0.85);\n  border: 1px solid rgba(56, 189, 248, 0.25);\n  border-radius: 10px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.gabarito-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 11px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.gabarito-header-actions {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.btn-gabarito-apply {\n  background: linear-gradient(135deg, #0284c7, #0369a1);\n  color: #fff;\n  border: 1px solid #38bdf8;\n  border-radius: 5px;\n  font-size: 10px;\n  font-weight: 700;\n  padding: 3px 8px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n}\n\n.btn-gabarito-apply:hover:not(:disabled) {\n  background: #0ea5e9;\n  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);\n  transform: translateY(-1px);\n}\n\n.gabarito-badges {\n  display: grid;\n  grid-template-columns: repeat(5, 1fr);\n  gap: 6px;\n  max-height: 120px;\n  overflow-y: auto;\n  padding: 2px 0;\n}\n\n.gabarito-badge {\n  border-radius: 6px;\n  padding: 6px 4px;\n  font-size: 11.5px;\n  font-weight: 600;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  position: relative;\n  user-select: none;\n  text-align: center;\n}\n\n.gabarito-badge:hover {\n  transform: translateY(-1px) scale(1.04);\n}\n\n.gabarito-badge.badge-done {\n  background: rgba(16, 185, 129, 0.16);\n  border: 1px solid #10b981;\n  color: #34d399;\n}\n.gabarito-badge.badge-done:hover {\n  background: rgba(16, 185, 129, 0.28);\n  border-color: #34d399;\n  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);\n}\n\n.gabarito-badge.badge-failed {\n  background: rgba(239, 68, 68, 0.2);\n  border: 1px solid #ef4444;\n  color: #f87171;\n  animation: pulse-fail 1.5s infinite alternate;\n}\n.gabarito-badge.badge-failed:hover {\n  background: rgba(239, 68, 68, 0.35);\n  border-color: #f87171;\n  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.5);\n}\n\n.gabarito-badge.badge-processing {\n  background: rgba(59, 130, 246, 0.25);\n  border: 1px solid #60a5fa;\n  color: #93c5fd;\n  animation: pulse 1s infinite alternate;\n}\n\n.gabarito-badge.badge-pending {\n  background: #1e293b;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  color: #94a3b8;\n}\n.gabarito-badge.badge-pending:hover {\n  background: rgba(56, 189, 248, 0.18);\n  border-color: #38bdf8;\n  color: #fff;\n  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.3);\n}\n\n@keyframes pulse {\n  0% { opacity: 0.7; transform: scale(1); }\n  100% { opacity: 1; transform: scale(1.03); }\n}\n\n@keyframes pulse-fail {\n  0% { opacity: 0.85; }\n  100% { opacity: 1; }\n}\n\n.gabarito-badge .badge-q { color: #94a3b8; font-size: 11px; font-weight: 600; }\n.gabarito-badge .badge-letter { color: #34d399; font-weight: 800; font-size: 13px; }\n.gabarito-badge .badge-fail { color: #f87171; font-weight: 800; font-size: 12px; }\n.gabarito-badge .badge-proc { color: #60a5fa; font-weight: 800; font-size: 12px; }\n.gabarito-badge .badge-pend { color: #64748b; font-weight: 800; font-size: 12px; }\n\n.review-config-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n  background: rgba(168, 85, 247, 0.1);\n  border: 1px dashed rgba(168, 85, 247, 0.3);\n  padding: 6px 10px;\n  border-radius: 8px;\n  font-size: 11px;\n}\n\n/* Log Box & Scrollbar */\n.box-log,\n.widget-log {\n  max-height: 105px;\n  min-height: 65px;\n  overflow-y: auto;\n  background: rgba(0, 0, 0, 0.55);\n  border: 1px solid rgba(255, 255, 255, 0.05);\n  border-radius: 8px;\n  padding: 6px 9px;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;\n  font-size: 10.5px;\n  line-height: 1.4;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  user-select: text;\n  cursor: text;\n}\n\n.box-log::-webkit-scrollbar,\n.gabarito-badges::-webkit-scrollbar {\n  width: 5px;\n  height: 5px;\n}\n\n.box-log::-webkit-scrollbar-track,\n.gabarito-badges::-webkit-scrollbar-track {\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 4px;\n}\n\n.box-log::-webkit-scrollbar-thumb,\n.gabarito-badges::-webkit-scrollbar-thumb {\n  background: #334155;\n  border-radius: 4px;\n}\n\n.box-log::-webkit-scrollbar-thumb:hover,\n.gabarito-badges::-webkit-scrollbar-thumb:hover {\n  background: #475569;\n}\n\n.log-item.success, .widget-log-item.success { color: #34d399; }\n.log-item.error, .widget-log-item.error { color: #f87171; }\n.log-item.info, .widget-log-item.info { color: #60a5fa; }\n.log-item.warning, .widget-log-item.warning { color: #fbbf24; }\n\n/* Footer */\n.box-footer,\n.widget-footer {\n  padding: 7px 14px;\n  background: rgba(15, 23, 42, 0.75);\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  font-size: 11px;\n  color: #94a3b8;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.footer-btn {\n  background: none;\n  border: none;\n  color: #60a5fa;\n  cursor: pointer;\n  font-size: 11px;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 6px;\n  border-radius: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n\n.footer-btn:hover {\n  color: #93c5fd;\n  background: rgba(255, 255, 255, 0.08);\n}\n\n/* Opacity Slider Control */\n.opacity-control-bar {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 12px;\n  padding: 2px 7px;\n  user-select: none;\n}\n\n.opacity-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 50px;\n  height: 4px;\n  border-radius: 2px;\n  background: #334155;\n  outline: none;\n  cursor: pointer;\n  vertical-align: middle;\n}\n\n.opacity-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: #38bdf8;\n  cursor: pointer;\n  box-shadow: 0 0 5px rgba(56, 189, 248, 0.8);\n  transition: transform 0.15s, background 0.15s;\n}\n\n.opacity-slider::-webkit-slider-thumb:hover {\n  transform: scale(1.3);\n  background: #60a5fa;\n}\n\n.opacity-slider::-moz-range-thumb {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: #38bdf8;\n  cursor: pointer;\n  border: none;\n}\n\n.opacity-val-badge {\n  font-size: 9.5px;\n  font-weight: 700;\n  color: #94a3b8;\n  min-width: 24px;\n  text-align: right;\n  font-family: monospace;\n}\n\n.estacio-ai-marked {\n  outline: 3px solid #10b981 !important;\n  outline-offset: 2px;\n  box-shadow: 0 0 14px rgba(16, 185, 129, 0.5) !important;\n}\n\n@keyframes pulseConcludeGlow {\n  0% {\n    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.8), 0 0 15px rgba(56, 189, 248, 0.6);\n    transform: scale(1);\n  }\n  50% {\n    box-shadow: 0 0 0 8px rgba(56, 189, 248, 0), 0 0 25px rgba(56, 189, 248, 0.95);\n    transform: scale(1.03);\n  }\n  100% {\n    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0), 0 0 15px rgba(56, 189, 248, 0.6);\n    transform: scale(1);\n  }\n}\n\n.estacio-conclude-pulse {\n  outline: 3px solid #38bdf8 !important;\n  outline-offset: 3px !important;\n  animation: pulseConcludeGlow 1.4s infinite ease-in-out !important;\n  position: relative !important;\n  z-index: 99999 !important;\n}\n');
  } else if (typeof document !== "undefined") {
    const styleEl = document.createElement("style");
    styleEl.textContent = '/* Estilo Premium do Widget Flutuante Est\xE1cio Suite AI v2.5.5 */\n\n#estacio-suite-box,\n#estacio-solver-widget {\n  --widget-idle-opacity: 0.45;\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 410px;\n  max-width: calc(100vw - 32px);\n  background: rgba(15, 23, 42, 0.96);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 16px;\n  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06);\n  color: #f8fafc;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;\n  z-index: 99999999;\n  overflow: hidden;\n  opacity: var(--widget-idle-opacity, 0.45);\n  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;\n  user-select: none;\n}\n\n#estacio-suite-box:hover,\n#estacio-suite-box:focus-within,\n#estacio-suite-box.is-dragging,\n#estacio-solver-widget:hover,\n#estacio-solver-widget:focus-within {\n  opacity: 1 !important;\n}\n\n#estacio-suite-box.minimized,\n#estacio-solver-widget.minimized {\n  width: 58px !important;\n  height: 58px !important;\n  border-radius: 50% !important;\n  cursor: pointer !important;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: radial-gradient(circle, #1e293b, #0f172a);\n  padding: 0;\n  box-shadow: 0 0 20px rgba(56, 189, 248, 0.6), 0 10px 25px rgba(0, 0, 0, 0.6);\n  border: 2px solid rgba(56, 189, 248, 0.7);\n  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n#estacio-suite-box.minimized:hover,\n#estacio-solver-widget.minimized:hover {\n  transform: scale(1.1);\n  border-color: #c084fc;\n  box-shadow: 0 0 26px rgba(192, 132, 252, 0.9), 0 12px 30px rgba(0, 0, 0, 0.7);\n}\n\n#estacio-suite-box.minimized:active,\n#estacio-solver-widget.minimized:active {\n  cursor: grabbing !important;\n  transform: scale(0.95);\n}\n\n#estacio-suite-box.minimized .box-inner,\n#estacio-solver-widget.minimized .widget-header,\n#estacio-solver-widget.minimized .widget-body,\n#estacio-solver-widget.minimized .widget-footer {\n  display: none !important;\n}\n\n#estacio-suite-box.hidden-box,\n#estacio-solver-widget.hidden-box {\n  display: none !important;\n}\n\n#estacio-suite-toggle-btn {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  width: 58px;\n  height: 58px;\n  border-radius: 50%;\n  background: radial-gradient(circle, #1e293b, #0f172a);\n  color: #fff;\n  border: 2px solid rgba(56, 189, 248, 0.7);\n  box-shadow: 0 0 20px rgba(56, 189, 248, 0.6), 0 10px 25px rgba(0, 0, 0, 0.6);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  z-index: 99999999;\n  overflow: hidden;\n  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n#estacio-suite-toggle-btn:hover {\n  transform: scale(1.1);\n  border-color: #c084fc;\n  box-shadow: 0 0 26px rgba(192, 132, 252, 0.9), 0 12px 30px rgba(0, 0, 0, 0.7);\n}\n\n#estacio-suite-toggle-btn:active {\n  cursor: grabbing;\n  transform: scale(0.95);\n}\n\n/* Anime Dancing Cat Mascot Avatar (Enlarged, Interactive, Smooth Dancing Frame) */\n.cat-dancing-avatar {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: 2px solid #60a5fa;\n  box-shadow: 0 0 14px rgba(96, 165, 250, 0.75), 0 2px 8px rgba(0, 0, 0, 0.4);\n  flex-shrink: 0;\n  display: inline-block;\n  vertical-align: middle;\n  cursor: pointer;\n  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;\n}\n\n.cat-dancing-avatar:hover {\n  transform: scale(1.14);\n  border-color: #c084fc;\n  box-shadow: 0 0 20px rgba(192, 132, 252, 0.95), 0 4px 12px rgba(0, 0, 0, 0.5);\n}\n\n.cat-dancing-avatar:active {\n  transform: scale(0.92);\n}\n\n.cat-bubble-avatar {\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  object-fit: cover;\n  box-shadow: 0 0 14px rgba(168, 85, 247, 0.85);\n  pointer-events: none;\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.box-title-info {\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.box-subtitle-tip {\n  font-size: 9.5px;\n  color: #94a3b8;\n  font-weight: 500;\n  letter-spacing: 0.1px;\n}\n\n/* Header */\n.box-header,\n.widget-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  background: rgba(30, 41, 59, 0.7);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  cursor: grab;\n}\n\n.box-header:active,\n.widget-header:active {\n  cursor: grabbing;\n}\n\n.box-title,\n.widget-title {\n  font-size: 13px;\n  font-weight: 700;\n  color: #f8fafc;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.title-gradient-text {\n  background: linear-gradient(135deg, #38bdf8, #a855f7);\n  background-clip: text;\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  font-weight: 800;\n  letter-spacing: -0.2px;\n}\n\n.version-badge {\n  font-size: 10px;\n  font-weight: 600;\n  color: #94a3b8;\n  background: rgba(255, 255, 255, 0.08);\n  padding: 1px 5px;\n  border-radius: 4px;\n}\n\n.box-controls,\n.widget-controls {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.box-ctrl-btn,\n.widget-btn-icon {\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 13px;\n  padding: 4px 6px;\n  line-height: 1;\n  border-radius: 6px;\n  transition: all 0.15s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.box-ctrl-btn:hover,\n.widget-btn-icon:hover {\n  color: #fff;\n  background: rgba(255, 255, 255, 0.12);\n  transform: translateY(-1px);\n}\n\n/* Body */\n.box-body,\n.widget-body {\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n/* Section Cards */\n.ui-card {\n  background: rgba(15, 23, 42, 0.65);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 10px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 7px;\n}\n\n.ui-card-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  font-size: 11px;\n  font-weight: 700;\n  color: #cbd5e1;\n}\n\n.ui-form-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ui-form-label {\n  font-size: 11px;\n  font-weight: 600;\n  color: #94a3b8;\n  white-space: nowrap;\n  min-width: 65px;\n}\n\n.ui-select {\n  background: #1e293b;\n  color: #f1f5f9;\n  border: 1px solid #475569;\n  border-radius: 6px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 5px 8px;\n  cursor: pointer;\n  outline: none;\n  flex: 1;\n  min-width: 0;\n  transition: border-color 0.15s;\n}\n\n.ui-select:focus,\n.ui-select:hover {\n  border-color: #38bdf8;\n}\n\n.ui-input {\n  background: #1e293b;\n  border: 1px solid #475569;\n  border-radius: 6px;\n  color: #fff;\n  padding: 5px 8px;\n  font-size: 11px;\n  font-family: monospace;\n  flex: 1;\n  min-width: 0;\n  outline: none;\n  transition: border-color 0.15s;\n}\n\n.ui-input:focus {\n  border-color: #38bdf8;\n  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);\n}\n\n/* Micro Action Buttons */\n.pill-btn {\n  border: none;\n  border-radius: 20px;\n  font-size: 10.5px;\n  font-weight: 700;\n  padding: 3px 10px;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.pill-btn:hover {\n  transform: translateY(-1px);\n}\n\n.pill-btn-free {\n  background: #065f46;\n  color: #a7f3d0;\n  border: 1px solid #059669;\n}\n.pill-btn-free:hover {\n  background: #047857;\n  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);\n}\n\n.pill-btn-paid {\n  background: #701a75;\n  color: #f5d0fe;\n  border: 1px solid #a21caf;\n}\n.pill-btn-paid:hover {\n  background: #86198f;\n  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.35);\n}\n\n.btn-secondary-action {\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  color: #38bdf8;\n  border-radius: 6px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 4px 8px;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n\n.btn-secondary-action:hover:not(:disabled) {\n  background: rgba(56, 189, 248, 0.18);\n  border-color: #38bdf8;\n  transform: translateY(-1px);\n}\n\n.btn-secondary-action:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* Primary Action Buttons */\n.box-btn,\n.widget-btn {\n  padding: 11px 16px;\n  border-radius: 10px;\n  font-size: 13px;\n  font-weight: 700;\n  cursor: pointer;\n  border: none;\n  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.box-btn-primary,\n.widget-btn-primary {\n  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);\n  color: #fff;\n  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);\n}\n\n.box-btn-success,\n.widget-btn-success {\n  background: linear-gradient(135deg, #059669 0%, #0d9488 100%);\n  color: #fff;\n  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);\n}\n\n.box-btn:hover:not(:disabled),\n.widget-btn:hover:not(:disabled) {\n  opacity: 0.96;\n  transform: translateY(-1.5px);\n  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);\n}\n\n.box-btn:disabled,\n.widget-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n  transform: none;\n}\n\n/* Gabarito Inteligente */\n.gabarito-container {\n  background: rgba(15, 23, 42, 0.85);\n  border: 1px solid rgba(56, 189, 248, 0.25);\n  border-radius: 10px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.gabarito-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 11px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.gabarito-header-actions {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.btn-gabarito-apply {\n  background: linear-gradient(135deg, #0284c7, #0369a1);\n  color: #fff;\n  border: 1px solid #38bdf8;\n  border-radius: 5px;\n  font-size: 10px;\n  font-weight: 700;\n  padding: 3px 8px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n}\n\n.btn-gabarito-apply:hover:not(:disabled) {\n  background: #0ea5e9;\n  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);\n  transform: translateY(-1px);\n}\n\n.gabarito-badges {\n  display: grid;\n  grid-template-columns: repeat(5, 1fr);\n  gap: 6px;\n  max-height: 120px;\n  overflow-y: auto;\n  padding: 2px 0;\n}\n\n.gabarito-badge {\n  border-radius: 6px;\n  padding: 6px 4px;\n  font-size: 11.5px;\n  font-weight: 600;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  position: relative;\n  user-select: none;\n  text-align: center;\n}\n\n.gabarito-badge:hover {\n  transform: translateY(-1px) scale(1.04);\n}\n\n.gabarito-badge.badge-done {\n  background: rgba(16, 185, 129, 0.16);\n  border: 1px solid #10b981;\n  color: #34d399;\n}\n.gabarito-badge.badge-done:hover {\n  background: rgba(16, 185, 129, 0.28);\n  border-color: #34d399;\n  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);\n}\n\n.gabarito-badge.badge-failed {\n  background: rgba(239, 68, 68, 0.2);\n  border: 1px solid #ef4444;\n  color: #f87171;\n  animation: pulse-fail 1.5s infinite alternate;\n}\n.gabarito-badge.badge-failed:hover {\n  background: rgba(239, 68, 68, 0.35);\n  border-color: #f87171;\n  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.5);\n}\n\n.gabarito-badge.badge-processing {\n  background: rgba(59, 130, 246, 0.25);\n  border: 1px solid #60a5fa;\n  color: #93c5fd;\n  animation: pulse 1s infinite alternate;\n}\n\n.gabarito-badge.badge-pending {\n  background: #1e293b;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  color: #94a3b8;\n}\n.gabarito-badge.badge-pending:hover {\n  background: rgba(56, 189, 248, 0.18);\n  border-color: #38bdf8;\n  color: #fff;\n  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.3);\n}\n\n@keyframes pulse {\n  0% { opacity: 0.7; transform: scale(1); }\n  100% { opacity: 1; transform: scale(1.03); }\n}\n\n@keyframes pulse-fail {\n  0% { opacity: 0.85; }\n  100% { opacity: 1; }\n}\n\n.gabarito-badge .badge-q { color: #94a3b8; font-size: 11px; font-weight: 600; }\n.gabarito-badge .badge-letter { color: #34d399; font-weight: 800; font-size: 13px; }\n.gabarito-badge .badge-fail { color: #f87171; font-weight: 800; font-size: 12px; }\n.gabarito-badge .badge-proc { color: #60a5fa; font-weight: 800; font-size: 12px; }\n.gabarito-badge .badge-pend { color: #64748b; font-weight: 800; font-size: 12px; }\n\n.review-config-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n  background: rgba(168, 85, 247, 0.1);\n  border: 1px dashed rgba(168, 85, 247, 0.3);\n  padding: 6px 10px;\n  border-radius: 8px;\n  font-size: 11px;\n}\n\n/* Log Box & Scrollbar */\n.box-log,\n.widget-log {\n  max-height: 105px;\n  min-height: 65px;\n  overflow-y: auto;\n  background: rgba(0, 0, 0, 0.55);\n  border: 1px solid rgba(255, 255, 255, 0.05);\n  border-radius: 8px;\n  padding: 6px 9px;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;\n  font-size: 10.5px;\n  line-height: 1.4;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  user-select: text;\n  cursor: text;\n}\n\n.box-log::-webkit-scrollbar,\n.gabarito-badges::-webkit-scrollbar {\n  width: 5px;\n  height: 5px;\n}\n\n.box-log::-webkit-scrollbar-track,\n.gabarito-badges::-webkit-scrollbar-track {\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 4px;\n}\n\n.box-log::-webkit-scrollbar-thumb,\n.gabarito-badges::-webkit-scrollbar-thumb {\n  background: #334155;\n  border-radius: 4px;\n}\n\n.box-log::-webkit-scrollbar-thumb:hover,\n.gabarito-badges::-webkit-scrollbar-thumb:hover {\n  background: #475569;\n}\n\n.log-item.success, .widget-log-item.success { color: #34d399; }\n.log-item.error, .widget-log-item.error { color: #f87171; }\n.log-item.info, .widget-log-item.info { color: #60a5fa; }\n.log-item.warning, .widget-log-item.warning { color: #fbbf24; }\n\n/* Footer */\n.box-footer,\n.widget-footer {\n  padding: 7px 14px;\n  background: rgba(15, 23, 42, 0.75);\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  font-size: 11px;\n  color: #94a3b8;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.footer-btn {\n  background: none;\n  border: none;\n  color: #60a5fa;\n  cursor: pointer;\n  font-size: 11px;\n  font-weight: 500;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 6px;\n  border-radius: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n\n.footer-btn:hover {\n  color: #93c5fd;\n  background: rgba(255, 255, 255, 0.08);\n}\n\n/* Opacity Slider Control */\n.opacity-control-bar {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 12px;\n  padding: 2px 7px;\n  user-select: none;\n}\n\n.opacity-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 50px;\n  height: 4px;\n  border-radius: 2px;\n  background: #334155;\n  outline: none;\n  cursor: pointer;\n  vertical-align: middle;\n}\n\n.opacity-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: #38bdf8;\n  cursor: pointer;\n  box-shadow: 0 0 5px rgba(56, 189, 248, 0.8);\n  transition: transform 0.15s, background 0.15s;\n}\n\n.opacity-slider::-webkit-slider-thumb:hover {\n  transform: scale(1.3);\n  background: #60a5fa;\n}\n\n.opacity-slider::-moz-range-thumb {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: #38bdf8;\n  cursor: pointer;\n  border: none;\n}\n\n.opacity-val-badge {\n  font-size: 9.5px;\n  font-weight: 700;\n  color: #94a3b8;\n  min-width: 24px;\n  text-align: right;\n  font-family: monospace;\n}\n\n.estacio-ai-marked {\n  outline: 3px solid #10b981 !important;\n  outline-offset: 2px;\n  box-shadow: 0 0 14px rgba(16, 185, 129, 0.5) !important;\n}\n\n@keyframes pulseConcludeGlow {\n  0% {\n    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.8), 0 0 15px rgba(56, 189, 248, 0.6);\n    transform: scale(1);\n  }\n  50% {\n    box-shadow: 0 0 0 8px rgba(56, 189, 248, 0), 0 0 25px rgba(56, 189, 248, 0.95);\n    transform: scale(1.03);\n  }\n  100% {\n    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0), 0 0 15px rgba(56, 189, 248, 0.6);\n    transform: scale(1);\n  }\n}\n\n.estacio-conclude-pulse {\n  outline: 3px solid #38bdf8 !important;\n  outline-offset: 3px !important;\n  animation: pulseConcludeGlow 1.4s infinite ease-in-out !important;\n  position: relative !important;\n  z-index: 99999 !important;\n}\n';
    document.head.appendChild(styleEl);
  }

  // src/config/mascot.js
  var CAT_MASCOT_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAAXK0lEQVR4nG2ZZ5SdxZnnnwpvuOG9ue/t27dzDpK6lYUklJCEwR4wyASDQTbJxpgdZo3NeNfjmZ2d4wD24OGs84xtxsbkAXtIFlESklC3EpK61TnevqFvzm+s2g8CxnvO/j/Up6pzfqfqearqef6I4E4ABB8JAb88cAAOCAPCDAAQRh8LACNMMKGACQfMAANH/KPlHCGOEUecAbOYZXLGOLcAOOecMwacIc6BM4QAACP4eN3H4sAooI9pGDDOMMKcc0AIEEZEAEAIOEKAEEYIYyoAEU2LmIwKVJadis3jlhWnIIsckKlqarFcKxTUUslkKiImESzEDGYanFscIcwFzoFjQKbKOeeXGYBz4Bw4AowAUwAOgDjjBIuK7NW4bjLdMnQOAJwhIgiYMs6wIHIsmaYo272NA10NW9d41vUILWFwO5lIOQBwwMCJbvFCWZ+P585NxE+cT1ycUotZIuoYDLNWUvzNNNCsIqYtXjSLSYQpBkyAUEQERDWmqlYNEdIFHBDCXkfEsIyqWeKEMGYiQE57g25WLNCQ4NB17Glq6vzs7vBndpjhYDqRTl2YLo7PqksJI5PnVY0DYFkiHqetKezu7wit7vLXB0gyFXv1yMzL7xaiUWTm5VW9YmuPNZNQly5ZuTQWBLvkd3PFj5UmuWGyfH68dA4R0sUYc0hekcoqEmTZV64scYopCG5Xe9VM12q6zRvuO/ip8K2fTpf02VcOZ986al6aQ7kiAk5EmdptWBIQQtw0AVNuGrVaxRAFubfDv3tr63W7/R5b/NlXxn/3hlrMYqvAdBUQcMsUBRumDssoqrUCN2uAKEEYEdLFOLOJHonYNEyp4NBYkTi9ejYmODyGJrbt3jLwrbuyYB/7xbOFN94kK1lKJbGlwTPU5Rto9TQFnC6bQOkHP3opO7HUduDaciajnImui/T88fyfLcEyZJt968aBr93po/roY7+df/sEwQUwNECAQLD0oqyEsWFUSzHGTQCOCLmcZchpr7eAmxSou94oZ5hlIhpY/+Ct4dtuPPf7Q0u/+DeaSVOHR17b79m/wdXbhDWTCt6qlQrawbg1MV5PVtp2b1x+ejZ60jkS+u2HvzTL9jaTlYs6EuzlUK+/uAX1t59XfKZl8898QewMoA5pxKta9WWL9qRrFcLup5HgBHGnQgwA44IlSQ3sjktU2ccCY7wFd/7GhlYP/z171WOvyt7/LS1Vblxn6231VxMGqdm2sryBVaiESXsdwdsslu26YaZK5XTWqWa1aW4WQpI1EtclFezhjE7VRq7AF39m3/0bTZ+ZvhbPzGtLJJEsaG/MnHEhu16LW+oBUAIYdwBgDmmHAATihHBsovaw9t//I2Ku234wYdZdsGphK1S1XvwJtrS7KzkzGy1UKMNflu/3d6fFEI5AZd5NV3UMWdeqeqWcj7rrJA2xOx9G/sW06Vfn02Wzi8qAi5Mjuo8suNn/6QVzh3/+o8tK28U4wSLkugsl5bB0gEAYdyFscAwxlhAmFCbiyHv9kcf0sMDJx/67y11Sn/D2okWqzIWs5iMurp3hdkda1t/e+JSZNGHzxdmk8kkrZUbZGlNIyvrVjQhJ40GW6Ql3Fd1zO5Yj3vbO746OT9/IgrJWZ808IWGgefGTkv/eLMzO3P0kR9iVBQY18yqpZaBmRbTMEfAEHDOCBGRKJqmfe39N5HuTcNf+4bfK2xv3FHMZfVCxbG5H/tDHFurFXvs6LTyjvrey8efyb279N01hYMNO67xNO6vX/nsYOXvbta/1JqpnxouvBWVu3/1Vu3E8TNNHjuqD2pq8Lahde1DkeLK3Lmv/w/csnboq5/Xq1hjmsUMYlM4FjggLAsehxQQBDsQhMDdvGNT+PobTn37UXNpLBRePclSx8bPpt6f6s/ZIhqlxBybGD/+fvn10VO3fGfnQ9+51/Xh9D0Dbd88eP1PNvf9TyG/48ORWxrDf3juf90x1NLx4ZN6/6qXvaGFsVFnqPG2/dc+dO/quWja7Q12+VpP//NvQvs/3bJnu6kjjClQCgQDR1Sx1QMRTT1pgOXw1A3cf8foc0fy773k7lhXs7t0o+Jt6bS7XL1zLFk06YAtNyZklxO3NAgbepvWrGty5HP9/nA44sEY3Xvdtjs1Jgr48NH5mZGpb69vfyhxbIpsMtE8U/MeTRLrqG6pwlBvs+JJPPWjCx2Nq+47uHJuzKitALIAAQDCZXWlpmc44oi7uz+3t2K45379hKOuyd7eo2YT1YbGtvV79qO2k9lY1AM+GyonpY1KaW1PvRgAf9D+pa9elSmohYJ2+WmSJKyaRv9AJHTrVSeT2t1Ur5w82T0hOsVayrAe/ecLL9lIaHPH4vEP+ur748//ply19d78aaMGWKBABECAq0ahpucsy3JFIg1XXz3x9Es8HXUMbRQJFlvDCPH0iVML2XyeInEw1JNilelpFVfC9+5Z3d1SKauigD97wyqvV0YIxZfzw8dmAcChwHUHNsau3PL+fLqvsXff7pvXqNKUXX/8jXc23tWrmghMnSjucJWNPvtc41WfUupDlsYxEQAQxohgKoJlb71qS6VIk4decLT2CcEmRpjc3lodPgfJxA/u2/fFjRt1EwkZs4bwUqNrz9Vb4ovl2akMADDGL8vUobGpziYKwJFX4eOp+I8XS8lsNjNvBqNsypntuGH9wpujKaoKjS2xaHZ985XsxIl81uq4eo9V48AMhDEGhDgHwekKbdu+ePgDyCZsA4OSZG+6ZldpMW8WeZ6S37127l29OohRVi009rZ88dZPxROpD86+39kXgMsfFA4IoXQx8b+//8QPHnvSLtOLo1MzZ/LXfPEz16wayIRSdc7GrSpEM+n482fkwxN7dqz9yd/ds2vDNmehsnDkWP3WnaJDAcPCiFCEMTeJr6cDextXjv5K8gbtLc3mSqF+sLmrJTQreRSJ/Z9XRhrbeh8KNayEGiafHgZZ+9uHf7s4OfX2q+f+/Zl/MC2LEjI1vfQvP3hm9Gz05z87ZDFkB78uBXqDgZ5235MzS32Kpy0uzzZagy2dvpL7vqt733194l8P/bnR3/zhB0fwX+0L9HbFhuMIY4oxZiYNDa6qpGvVyYuuvi5U1TxB+/kj5zwl+Z5vbFU8NG5zsloy+mHhEld1LRNdlLC/IT8QKcSnVFUVBIExrqn6Gdy60h/cuW+fXijFlxNJxi+cd5SbHd4+vz3kcf+pyFn86GL++9f2PP3O4pvJVMBhny0vatFkeaUaXD2wfPIEpgZFCBPR5u7szM1FWTXrXLUKZ8vuYHOT6Tj90vHH55eVoZ5sqlIXkpbO6DNoyW+t3PmZg8uJ4o8nF7f1rheztaUjZ1tuvaKnu/mRv94+NrN8hcO2f03P/Q8/mSvmS8KG6YRWU/ItO5qKCyV5ULlqdctiPv3nmSjd25o8TRKlEqoW8zOL3o5uKtg41ChwLDqdcqChNHoRIdBSSVvBY6p8lcezZtfuZ0bOSKtNqVrLmwSkWnGl2hKgqdHl3vnUv+3sygSdv/2PozOnZ7rUYnt76PYdQ5Aq8JnERInZFHtleSzes7xabcpJ1dnb33L3sGgN/W58igtW/c5OFyXOpkZHzlPKxgqL85He9aKiqMUcZoxLLqdgc9WScUF0+SY0oVBmAfvTIyOHUkt7Hrre1h9p3tLJ7PWxK/w+nyuWsQqCYA21VhSHK+BbGJ2ynn574vFn/WEf41BtCRW7G02/sm7T6jpLUEux2NxkW0xy1eORduJMQL1FWvb05kcWahXd0d/ha2urs4eqK3FBcssuFzBEgSHR4cRE0nMZ0RdCHi9hjGIsIys6csRlYndn13h0nvV49V6pfbV5SsUvzi933XY1MlWBw01/ffNUqeYZ7Aw3hSsV3YwEUTDCYpUGQtbcsePYi0e+8M198tLSc9XCrNp/i8TbtoQffeY1rVRtv2m3W0LT1JYnTK6UGFDR4eAcUeCIihLnCHSdIZaHXBgFMMHAibvJX8kkrt+7MW8FKuLyN3N8/fbNTw11PHf8YuHRwu2fu6atTmgNNfG/vdvhtEMZChWeXKkePnmhciY3YSbOZMe+8/f7D4baoRFPn7s0nM0cy5P3ozHsAoTcosspiQzZFWRXwNA4x0SUgAP9qB6yACGMTC4SBzWwBARjWmVGFOX/8cSoFKD9tcpQCc=";
  function getMascotUrl() {
    try {
      if (typeof chrome !== "undefined" && chrome?.runtime?.getURL) {
        return chrome.runtime.getURL("icons/cat_dancing.gif");
      }
    } catch (e) {
    }
    return CAT_MASCOT_DATA_URI;
  }

  // src/ui/draggable.js
  function clampElementToViewport(targetElement, margin = 16) {
    if (!targetElement) return;
    const rect = targetElement.getBoundingClientRect();
    const winW = window.innerWidth || document.documentElement.clientWidth;
    const winH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.width === 0 || rect.height === 0) return;
    let currentLeft = rect.left;
    let currentTop = rect.top;
    let changed = false;
    if (currentLeft + rect.width > winW - margin) {
      currentLeft = Math.max(margin, winW - rect.width - margin);
      changed = true;
    }
    if (currentLeft < margin) {
      currentLeft = margin;
      changed = true;
    }
    if (currentTop + rect.height > winH - margin) {
      currentTop = Math.max(margin, winH - rect.height - margin);
      changed = true;
    }
    if (currentTop < margin) {
      currentTop = margin;
      changed = true;
    }
    if (changed || targetElement.style.right || targetElement.style.bottom) {
      const leftPx = `${Math.round(currentLeft)}px`;
      const topPx = `${Math.round(currentTop)}px`;
      targetElement.style.left = leftPx;
      targetElement.style.top = topPx;
      targetElement.style.right = "auto";
      targetElement.style.bottom = "auto";
      localStorage.setItem("estacio_pos_left", leftPx);
      localStorage.setItem("estacio_pos_top", topPx);
    }
  }
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
      requestAnimationFrame(() => {
        clampElementToViewport(targetElement);
      });
    }
    dragHandle.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "SELECT" || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.closest("button") || e.target.closest("#box-header-cat")) {
        return;
      }
      if (dragHandle === targetElement && !targetElement.classList.contains("minimized") && targetElement.id === "estacio-suite-box") {
        if (!e.target.closest("#box-drag-handle") && !e.target.closest(".box-header")) {
          return;
        }
      }
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
          if (!isDragging) {
            isDragging = true;
            targetElement.classList.add("is-dragging");
          }
          const winW = window.innerWidth || document.documentElement.clientWidth;
          const winH = window.innerHeight || document.documentElement.clientHeight;
          const elemW = targetElement.offsetWidth || 50;
          const elemH = targetElement.offsetHeight || 50;
          let targetL = initialLeft + dx;
          let targetT = initialTop + dy;
          targetL = Math.max(8, Math.min(winW - elemW - 8, targetL));
          targetT = Math.max(8, Math.min(winH - elemH - 8, targetT));
          const newLeft = `${Math.round(targetL)}px`;
          const newTop = `${Math.round(targetT)}px`;
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
        targetElement.classList.remove("is-dragging");
        if (isDragging) {
          clampElementToViewport(targetElement);
        } else if (onClickCallback) {
          onClickCallback(upEvent);
        }
      }
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  // src/config/providers.js
  var PROVIDERS_CONFIG = {
    groq: {
      name: "Groq",
      defaultModel: "llama-3.3-70b-versatile",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      models: [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (\u{1F525} 100% Gr\xE1tis \u2022 14.4k req/dia \u2022 Recomendado)", isFree: true },
        { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B (\u{1F525} 100% Gr\xE1tis \u2022 Racioc\xEDnio)", isFree: true },
        { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (\u26A1 100% Gr\xE1tis \u2022 Ultra R\xE1pido)", isFree: true }
      ]
    },
    gemini: {
      name: "Google Gemini",
      defaultModel: "gemini-2.5-flash",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      models: [
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (\u{1F381} Gr\xE1tis \u2022 Racioc\xEDnio & Rapidez \u2022 Recomendado)", isFree: true },
        { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (\u26A1 Gr\xE1tis 1.500 req/dia \u2022 Mais R\xE1pido)", isFree: true },
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (\u{1F381} Gr\xE1tis 1.500 req/dia \u2022 Est\xE1vel)", isFree: true },
        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (\u{1F9E0} Gr\xE1tis Cota Di\xE1ria \u2022 M\xE1ximo Racioc\xEDnio)", isFree: true },
        { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite (\u26A1 Gr\xE1tis \u2022 Ultra R\xE1pido)", isFree: true },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (\u{1F48E} Pago \u2022 Frontier Reasoning)", isFree: false }
      ]
    },
    nous: {
      name: "Nous Research / Portal",
      defaultModel: "poolside/laguna-s-2.1:free",
      endpoint: "https://inference-api.nousresearch.com/v1/chat/completions",
      models: [
        { id: "poolside/laguna-s-2.1:free", name: "Poolside Laguna S 2.1 (\u{1F525} 100% Gr\xE1tis \u2022 118B Coding \u2022 Recomendado)", isFree: true },
        { id: "meituan/longcat-2.0:free", name: "Meituan LongCat 2.0 (\u{1F525} 100% Gr\xE1tis \u2022 1.6T MoE / 1M Context)", isFree: true },
        { id: "tencent/hy3:free", name: "Tencent Hy3 (\u{1F525} 100% Gr\xE1tis \u2022 295B MoE)", isFree: true },
        { id: "stepfun/step-3.7-flash:free", name: "StepFun Step 3.7 Flash (\u{1F525} 100% Gr\xE1tis \u2022 Ultra R\xE1pido)", isFree: true },
        { id: "upstage/solar-pro4:free", name: "Upstage Solar Pro 4 (\u{1F525} 100% Gr\xE1tis \u2022 Racioc\xEDnio)", isFree: true },
        { id: "poolside/laguna-xs-2.1:free", name: "Poolside Laguna XS 2.1 (\u{1F525} 100% Gr\xE1tis \u2022 Leve)", isFree: true }
      ]
    },
    openrouter: {
      name: "OpenRouter (Free Tier & Router)",
      defaultModel: "openrouter/free",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      models: [
        { id: "openrouter/free", name: "OpenRouter Free Router (\u{1F525} 100% Gr\xE1tis \u2022 Roteamento Autom\xE1tico)", isFree: true },
        { id: "google/gemma-4-31b-it:free", name: "Google Gemma 4 31B (\u{1F525} 100% Gr\xE1tis)", isFree: true },
        { id: "google/gemma-4-26b-a4b-it:free", name: "Google Gemma 4 26B (\u{1F525} 100% Gr\xE1tis)", isFree: true },
        { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "NVIDIA Nemotron 3 Ultra (\u{1F525} 100% Gr\xE1tis)", isFree: true },
        { id: "minimax/minimax-m3:free", name: "MiniMax M3 (\u{1F525} 100% Gr\xE1tis)", isFree: true },
        { id: "z-ai/glm-5.2:free", name: "GLM 5.2 (\u{1F525} 100% Gr\xE1tis)", isFree: true },
        { id: "liquid/lfm-2.5-2.6b:free", name: "Liquid LFM 2.5 (\u{1F525} 100% Gr\xE1tis)", isFree: true }
      ]
    },
    ollama: {
      name: "Ollama (Local / Offline - 100% Gr\xE1tis)",
      defaultModel: "llama3.3",
      endpoint: "http://localhost:11434/v1/chat/completions",
      models: [
        { id: "llama3.3", name: "Llama 3.3 (Local \u2022 Offline \u2022 Ilimitado)", isFree: true },
        { id: "deepseek-r1", name: "DeepSeek R1 (Local \u2022 Racioc\xEDnio)", isFree: true },
        { id: "hermes3", name: "Hermes 3 (Local \u2022 Nous Research)", isFree: true },
        { id: "qwen2.5", name: "Qwen 2.5 (Local)", isFree: true },
        { id: "mistral", name: "Mistral (Local)", isFree: true }
      ]
    },
    mistral: {
      name: "Mistral AI",
      defaultModel: "codestral-latest",
      endpoint: "https://api.mistral.ai/v1/chat/completions",
      models: [
        { id: "codestral-latest", name: "Codestral Latest (\u{1F4A1} Gr\xE1tis Dev / L\xF3gica Exata)", isFree: true },
        { id: "mistral-small-latest", name: "Mistral Small Latest (\u26A1 Econ\xF4mico & R\xE1pido)", isFree: true },
        { id: "mistral-large-latest", name: "Mistral Large Latest (\u{1F48E} Pago \u2022 PhD / M\xE1xima Precis\xE3o)", isFree: false }
      ]
    },
    claude: {
      name: "Anthropic Claude",
      defaultModel: "claude-3-7-sonnet-20250219",
      endpoint: "https://api.anthropic.com/v1/messages",
      models: [
        { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (\u{1F48E} Pago \u2022 Racioc\xEDnio H\xEDbrido)", isFree: false },
        { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (\u{1F48E} Pago \u2022 Alta Precis\xE3o)", isFree: false },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (\u{1F48E} Pago \u2022 Ultra R\xE1pido & Econ\xF4mico)", isFree: false },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku (\u{1F48E} Pago \u2022 Econ\xF4mico)", isFree: false },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus (\u{1F48E} Pago \u2022 Frontier PhD)", isFree: false }
      ]
    },
    openai: {
      name: "OpenAI",
      defaultModel: "gpt-4o-mini",
      endpoint: "https://api.openai.com/v1/chat/completions",
      models: [
        { id: "gpt-4o-mini", name: "GPT-4o Mini (\u{1F48E} Pago \u2022 Econ\xF4mico)", isFree: false },
        { id: "gpt-4o", name: "GPT-4o (\u{1F48E} Pago \u2022 Precis\xE3o M\xE1xima)", isFree: false },
        { id: "o3-mini", name: "o3-mini (\u{1F48E} Pago \u2022 Racioc\xEDnio)", isFree: false }
      ]
    },
    deepseek: {
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      models: [
        { id: "deepseek-chat", name: "DeepSeek V3 (\u{1F48E} Pago \u2022 Econ\xF4mico)", isFree: false },
        { id: "deepseek-reasoner", name: "DeepSeek R1 (\u{1F48E} Pago \u2022 Racioc\xEDnio Matem\xE1tico Puro)", isFree: false }
      ]
    }
  };

  // src/config/storage.js
  var storageListeners = /* @__PURE__ */ new Set();
  function onStorageChange(callback) {
    storageListeners.add(callback);
    return () => storageListeners.delete(callback);
  }
  function getSaved(key, defaultValue = "") {
    let val = null;
    if (typeof GM_getValue !== "undefined") {
      val = GM_getValue(key, null);
    }
    if (val === null || val === void 0) {
      val = localStorage.getItem("estacio_" + key);
    }
    if (val === null || val === void 0) {
      return defaultValue;
    }
    try {
      if (typeof val === "string" && (val.startsWith("{") || val.startsWith("["))) {
        return JSON.parse(val);
      }
    } catch (e) {
    }
    return val;
  }
  function setSaved(key, value) {
    const serialized = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
    if (typeof GM_setValue !== "undefined") {
      GM_setValue(key, serialized);
    }
    try {
      localStorage.setItem("estacio_" + key, serialized);
    } catch (e) {
    }
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ ["estacio_" + key]: serialized }).catch(() => {
      });
    }
  }
  function getApiKeyFor(provider) {
    return getSaved(`key_${provider}`, "");
  }
  function setApiKeyFor(provider, key) {
    setSaved(`key_${provider}`, key);
  }
  function getProviderStatus(provider) {
    return getSaved(`status_${provider}`, "untested");
  }
  function setProviderStatus(provider, status) {
    setSaved(`status_${provider}`, status);
  }
  function getShowPaidModels() {
    return getSaved("show_paid_models", "false") === "true";
  }
  function setShowPaidModels(showPaid) {
    setSaved("show_paid_models", showPaid ? "true" : "false");
  }
  function getLiveProviders() {
    const all = ["groq", "gemini", "nous", "openrouter", "ollama", "mistral", "claude", "openai", "deepseek"];
    return all.filter((p) => {
      const key = getApiKeyFor(p);
      const status = getProviderStatus(p);
      return Boolean(key && (status === "live" || status === "untested"));
    });
  }
  async function syncStorageFromChromeExtension() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      try {
        const all = await chrome.storage.local.get(null);
        if (all) {
          Object.keys(all).forEach((k) => {
            if (k.startsWith("estacio_")) {
              localStorage.setItem(k, typeof all[k] === "object" ? JSON.stringify(all[k]) : all[k]);
            }
          });
        }
      } catch (e) {
      }
    }
  }
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local") {
        Object.keys(changes).forEach((k) => {
          if (k.startsWith("estacio_")) {
            const val = changes[k].newValue;
            try {
              localStorage.setItem(k, typeof val === "object" ? JSON.stringify(val) : String(val !== void 0 ? val : ""));
            } catch (e) {
            }
          }
        });
        storageListeners.forEach((cb) => {
          try {
            cb(changes);
          } catch (e) {
          }
        });
      }
    });
  }
  if (typeof window !== "undefined") {
    window.addEventListener("estacio_token_captured", (e) => {
      if (e.detail && e.detail.token) {
        window.__estacio_bearer = e.detail.token;
        try {
          sessionStorage.setItem("estacio_bearer", e.detail.token);
        } catch (err) {
        }
        try {
          localStorage.setItem("estacio_bearer", e.detail.token);
        } catch (err) {
        }
        storageListeners.forEach((cb) => {
          try {
            cb({ estacio_bearer: { newValue: e.detail.token } });
          } catch (err) {
          }
        });
      }
    });
  }
  syncStorageFromChromeExtension();
  function getBearerToken() {
    if (typeof window !== "undefined" && window.__estacio_bearer) {
      return window.__estacio_bearer;
    }
    let token = sessionStorage.getItem("estacio_bearer") || localStorage.getItem("estacio_bearer");
    if (token && token.length > 20) return token.replace(/^Bearer\s+/i, "").trim();
    const candidateKeys = ["token", "accessToken", "access_token", "bearer", "auth_token", "jwt", "auth"];
    for (const k of candidateKeys) {
      const val = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (val && val.length > 20) return val.replace(/^Bearer\s+/i, "").trim();
    }
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("oidc.user") || key.includes("authority") || key.includes("token") || key.includes("auth"))) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item && item.access_token) {
              return item.access_token.replace(/^Bearer\s+/i, "").trim();
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
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
  function initGabaritoStructure(totalQuestions = 10, providerLabel = "AI") {
    let existing = getSavedGabarito();
    let answers = existing?.answers ? [...existing.answers] : [];
    answers = answers.filter((a) => a.q <= totalQuestions);
    for (let q = 1; q <= totalQuestions; q++) {
      if (!answers.some((a) => a.q === q)) {
        answers.push({
          q,
          status: "pending",
          // 'pending', 'processing', 'done', 'failed'
          letter: null,
          explanation: "",
          error: null
        });
      }
    }
    answers.sort((a, b) => a.q - b.q);
    return saveGabarito(existing?.provider || providerLabel, answers);
  }
  function resetGabaritoAnswers(totalQuestions = 10, providerLabel = "AI") {
    const answers = [];
    for (let q = 1; q <= totalQuestions; q++) {
      answers.push({
        q,
        status: "pending",
        letter: null,
        explanation: "",
        error: null
      });
    }
    return saveGabarito(providerLabel, answers);
  }
  function updateGabaritoQuestion(qNum, { status, letter, explanation, error, provider }) {
    let data = getSavedGabarito() || { timestamp: (/* @__PURE__ */ new Date()).toLocaleString(), provider: provider || "AI", answers: [] };
    let item = data.answers.find((a) => a.q === qNum);
    if (!item) {
      item = { q: qNum, status: "pending", letter: null, explanation: "", error: null };
      data.answers.push(item);
    }
    if (status !== void 0) item.status = status;
    if (letter !== void 0) item.letter = letter;
    if (explanation !== void 0) item.explanation = explanation;
    if (error !== void 0) item.error = error;
    if (provider) data.provider = provider;
    data.answers.sort((a, b) => a.q - b.q);
    saveGabarito(data.provider, data.answers);
    return data;
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
        if (a.letter) {
          text += `Quest\xE3o ${a.q}: [ ${a.letter} ]  ${a.explanation ? `(${a.explanation})` : ""}
`;
        } else {
          text += `Quest\xE3o ${a.q}: [ Pendente ]
`;
        }
      });
      const answeredOnly = data.answers.filter((a) => a.letter);
      if (answeredOnly.length > 0) {
        text += `
\u{1F3AF} Resumo Compacto:
`;
        text += answeredOnly.map((a) => `${a.q}-${a.letter}`).join(" | ");
      }
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
      initGabaritoStructure(10);
    }
    const currentData = getSavedGabarito();
    if (!currentData || !currentData.answers || currentData.answers.length === 0) {
      containerEl.style.display = "none";
      return;
    }
    const headerSpan = containerEl.querySelector(".gabarito-header > span:first-child");
    if (headerSpan) {
      headerSpan.textContent = `\u{1F4DD} Gabarito (${currentData.answers.length} Quest\xF5es)`;
    }
    containerEl.style.display = "flex";
    badgesEl.innerHTML = "";
    const pName = PROVIDERS_CONFIG[reviewProvider]?.name || reviewProvider;
    currentData.answers.forEach((a) => {
      const span = document.createElement("div");
      span.id = `badge-q-${a.q}`;
      let status = a.status || (a.letter ? "done" : "pending");
      if (status === "done" || a.letter && status !== "failed") {
        span.className = "gabarito-badge badge-done";
        span.title = `Quest\xE3o ${a.q}: [ ${a.letter} ] - ${a.explanation || "Conclu\xEDda"}
\u{1F449} Clique para REVISAR (2\xAA Opini\xE3o com ${pName})!`;
        span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-letter">${a.letter}</b>`;
      } else if (status === "failed") {
        span.className = "gabarito-badge badge-failed";
        span.title = `Quest\xE3o ${a.q} falhou: ${a.error || "Erro"}
\u{1F449} Clique para RETRY / TENTAR NOVAMENTE!`;
        span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-fail">\u274C</b>`;
      } else if (status === "processing") {
        span.className = "gabarito-badge badge-processing";
        span.title = `Quest\xE3o ${a.q} sendo processada pela IA...`;
        span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-proc">\u{1F504}</b>`;
      } else {
        span.className = "gabarito-badge badge-pending";
        span.title = `Quest\xE3o ${a.q} pendente.
\u{1F449} Clique para RESOLVER AGORA com a IA ativa!`;
        span.innerHTML = `<span class="badge-q">Q${a.q}:</span> <b class="badge-pend">-</b>`;
      }
      span.addEventListener("click", () => {
        if (onBadgeClick) onBadgeClick(a.q, status);
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

  // src/core/network.js
  async function universalFetch(url, options = {}) {
    if (typeof GM_xmlhttpRequest !== "undefined") {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: options.method || "GET",
          url,
          headers: options.headers || {},
          data: options.body || null,
          timeout: options.timeout || 25e3,
          onload: (res) => {
            resolve({
              ok: res.status >= 200 && res.status < 300,
              status: res.status,
              statusText: res.statusText || "OK",
              headers: {
                get: (headerName) => {
                  const headerMap = {};
                  (res.responseHeaders || "").split("\r\n").forEach((line) => {
                    const parts = line.split(": ");
                    if (parts[0]) headerMap[parts[0].toLowerCase()] = parts.slice(1).join(": ");
                  });
                  return headerMap[headerName.toLowerCase()] || null;
                }
              },
              json: async () => {
                try {
                  return JSON.parse(res.responseText);
                } catch (e) {
                  throw new Error(`Resposta da API n\xE3o \xE9 JSON v\xE1lido: ${res.responseText.slice(0, 100)}`);
                }
              },
              text: async () => res.responseText
            });
          },
          onerror: (err) => reject(new Error(err.statusText || "Falha na requisi\xE7\xE3o de rede (GM_xmlhttpRequest)")),
          ontimeout: () => reject(new Error("Tempo limite excedido na requisi\xE7\xE3o"))
        });
      });
    }
    try {
      const res = await fetch(url, options);
      return res;
    } catch (directErr) {
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            type: "PROXY_FETCH",
            url,
            options: {
              method: options.method || "GET",
              headers: options.headers || {},
              body: options.body || null
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message || directErr.message));
            } else if (!response || !response.success) {
              reject(new Error(response?.error || directErr.message || "Falha no Proxy Fetch"));
            } else {
              resolve({
                ok: response.status >= 200 && response.status < 300,
                status: response.status,
                statusText: response.statusText || "OK",
                headers: {
                  get: (headerName) => (response.headers || {})[headerName.toLowerCase()] || null
                },
                json: async () => typeof response.data === "string" ? JSON.parse(response.data) : response.data,
                text: async () => typeof response.data === "string" ? response.data : JSON.stringify(response.data)
              });
            }
          });
        });
      }
      throw directErr;
    }
  }

  // src/core/ai_engine.js
  function parseAIResponse(rawText) {
    if (!rawText) return { letra: "A", explicacao: "" };
    let letra = null;
    let explicacao = "";
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.letra && typeof parsed.letra === "string") {
          const lMatch = parsed.letra.match(/[A-E]/i);
          if (lMatch) letra = lMatch[0].toUpperCase();
        }
        if (parsed.explicacao && typeof parsed.explicacao === "string") {
          explicacao = parsed.explicacao.trim();
        }
      }
    } catch (e) {
    }
    if (!letra) {
      const lMatch = rawText.match(/"letra"\s*:\s*"([A-E])"/i) || rawText.match(/(?:letra|alternativa|opção|resposta|correta|item)\s*[:\s-]*\**([A-E])\b/i) || rawText.match(/\b([A-E])\s*\)/i) || rawText.match(/\b([A-E])\b/i);
      letra = lMatch ? lMatch[1].toUpperCase() : "A";
    }
    if (!explicacao) {
      const expMatch = rawText.match(/"explicacao"\s*:\s*"([^"]+)"/i);
      if (expMatch) {
        explicacao = expMatch[1].trim();
      } else {
        explicacao = rawText.replace(/```(?:json)?[\s\S]*?```/gi, "").replace(/\{[\s\S]*?\}/g, "").replace(/["'{}]/g, "").trim();
        if (!explicacao) {
          explicacao = rawText.replace(/```(?:json)?\s*|\s*```/gi, "").trim();
        }
      }
    }
    explicacao = explicacao.replace(/\s+/g, " ").slice(0, 150).trim();
    return { letra: letra || "A", explicacao };
  }
  async function executeAICall(provider, model, statement, alternatives) {
    const apiKey = getApiKeyFor(provider);
    const pConfig = PROVIDERS_CONFIG[provider];
    if (!apiKey && provider !== "ollama") {
      throw new Error(`Chave de API do ${pConfig?.name || provider} n\xE3o configurada. Insira sua chave no campo e clique em Salvar.`);
    }
    const prompt = buildPhDExamPrompt(statement, alternatives);
    if (provider === "claude") {
      const selectedModel2 = (model || pConfig?.defaultModel || "claude-3-7-sonnet-20250219").trim();
      const claudeUrl = "https://api.anthropic.com/v1/messages";
      const systemPrompt2 = `Voc\xEA \xE9 um professor PhD especialista em provas acad\xEAmicas e c\xE1lculo exato. Responda ESTRITAMENTE em formato JSON no formato: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;
      const res2 = await universalFetch(claudeUrl, {
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
        const rawMsg = err.error?.message || `HTTP ${res2.status}`;
        if (/credit balance is too low|insufficient credits|purchase credits/i.test(rawMsg)) {
          throw new Error("Saldo insuficiente na Anthropic ($0.00). Sua chave \xE9 v\xE1lida, mas sua conta em console.anthropic.com precisa de cr\xE9ditos pr\xE9-pagos.");
        }
        if (res2.status === 401 || /invalid api key/i.test(rawMsg)) {
          throw new Error("Chave da Anthropic Claude inv\xE1lida ou revogada.");
        }
        throw new Error(rawMsg);
      }
      const data2 = await res2.json();
      const content2 = data2.content?.[0]?.text || "";
      return parseAIResponse(content2);
    }
    if (provider === "gemini") {
      let selectedModel2 = (model || pConfig?.defaultModel || "gemini-2.5-flash").replace(/^models\//, "").trim();
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel2}:generateContent`;
      const res2 = await universalFetch(geminiUrl, {
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
        if (/not_found|404|is not found/i.test(msg)) {
          throw new Error(`Modelo '${selectedModel2}' n\xE3o encontrado na API do Gemini. Use 'gemini-2.5-flash' ou 'gemini-2.0-flash'.`);
        }
        if (/api_key_invalid|invalid api key/i.test(msg)) {
          throw new Error("Chave da API do Google Gemini inv\xE1lida.");
        }
        throw new Error(msg);
      }
      const data2 = await res2.json();
      const txt = data2.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return parseAIResponse(txt);
    }
    if (provider === "openrouter") {
      let selectedModel2 = (model || pConfig?.defaultModel || "openrouter/free").trim();
      const endpoint2 = "https://openrouter.ai/api/v1/chat/completions";
      const systemPrompt2 = `Voc\xEA \xE9 um professor PhD especialista em provas acad\xEAmicas e c\xE1lculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;
      const headers2 = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://estudante.estacio.br",
        "X-Title": "Estacio Suite AI"
      };
      const payloadModels = [
        selectedModel2,
        "openrouter/free",
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "minimax/minimax-m3:free",
        "z-ai/glm-5.2:free"
      ].filter((v, i, a) => a.indexOf(v) === i);
      let lastOpenRouterErr = null;
      try {
        const res2 = await universalFetch(endpoint2, {
          method: "POST",
          headers: headers2,
          body: JSON.stringify({
            model: selectedModel2,
            models: payloadModels,
            messages: [
              { role: "system", content: systemPrompt2 },
              { role: "user", content: prompt }
            ],
            temperature: 0.1
          })
        });
        if (res2.ok) {
          const data2 = await res2.json();
          const content2 = data2.choices?.[0]?.message?.content || "";
          return parseAIResponse(content2);
        } else {
          const err = await res2.json().catch(() => ({}));
          lastOpenRouterErr = new Error(err.error?.message || `HTTP ${res2.status}`);
        }
      } catch (netErr) {
        lastOpenRouterErr = netErr;
      }
      for (const fbModel of payloadModels) {
        if (fbModel === selectedModel2) continue;
        try {
          const res2 = await universalFetch(endpoint2, {
            method: "POST",
            headers: headers2,
            body: JSON.stringify({
              model: fbModel,
              messages: [
                { role: "system", content: systemPrompt2 },
                { role: "user", content: prompt }
              ],
              temperature: 0.1
            })
          });
          if (res2.ok) {
            const data2 = await res2.json();
            const content2 = data2.choices?.[0]?.message?.content || "";
            return parseAIResponse(content2);
          }
        } catch (e) {
        }
      }
      throw lastOpenRouterErr || new Error("Falha na requisi\xE7\xE3o ao OpenRouter");
    }
    const endpoint = pConfig?.endpoint || "https://api.groq.com/openai/v1/chat/completions";
    let selectedModel = (model || pConfig?.defaultModel || "llama-3.3-70b-versatile").trim();
    selectedModel = selectedModel.replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-");
    if (provider === "nous") {
      if (/hy3|longcat|solar|step|laguna/i.test(selectedModel) && !selectedModel.includes(":free")) {
        selectedModel = `${selectedModel}:free`;
      }
    }
    const systemPrompt = `Voc\xEA \xE9 um professor PhD especialista em provas acad\xEAmicas e c\xE1lculo exato. Responda ESTRITAMENTE em formato JSON: {"letra": "A", "explicacao": "justificativa em 1 frase"}`;
    const headers = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    const res = await universalFetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const rawMsg = err.error?.message || err.message || err.detail || `Erro HTTP ${res.status}`;
      if (provider === "groq" && /does not exist|model_not_found/i.test(rawMsg)) {
        try {
          const fbRes = await universalFetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
              ],
              temperature: 0.1,
              max_tokens: 500
            })
          });
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            const fbContent = fbData.choices?.[0]?.message?.content || "";
            return parseAIResponse(fbContent);
          }
        } catch (e) {
        }
      }
      if (provider === "nous" && (/credit|balance|payment|insufficient|does not exist|model_not_found/i.test(rawMsg) || res.status === 402 || res.status === 404)) {
        try {
          const fbRes = await universalFetch(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: "poolside/laguna-s-2.1:free",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
              ],
              temperature: 0.1,
              max_tokens: 500
            })
          });
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            const fbContent = fbData.choices?.[0]?.message?.content || "";
            return parseAIResponse(fbContent);
          }
        } catch (e) {
        }
      }
      throw new Error(rawMsg);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return parseAIResponse(content);
  }
  async function testProviderKey(provider, testKey, specificModel = null) {
    const pConfig = PROVIDERS_CONFIG[provider];
    if (!testKey && provider !== "ollama") throw new Error("Chave de API n\xE3o informada.");
    const originalKey = getApiKeyFor(provider);
    if (testKey || provider === "ollama") {
      setApiKeyFor(provider, testKey || "local");
    }
    let modelToTest = specificModel || getSaved("active_model") || pConfig.defaultModel;
    const testStatement = "Resolva esta quest\xE3o acad\xEAmica de teste: Quanto \xE9 2 + 2?";
    const testAlternatives = [
      { letter: "A", text: "4" },
      { letter: "B", text: "5" }
    ];
    try {
      const result = await executeAICall(provider, modelToTest, testStatement, testAlternatives);
      if (result && result.letra) {
        setProviderStatus(provider, "live");
        return { success: true, result, model: modelToTest };
      }
      throw new Error("Resposta sem formato esperado.");
    } catch (err) {
      if (provider === "openrouter") {
        const openRouterFallbacks = [
          "openrouter/free",
          "google/gemma-4-31b-it:free",
          "google/gemma-4-26b-a4b-it:free",
          "nvidia/nemotron-3-ultra-550b-a55b:free",
          "minimax/minimax-m3:free",
          "z-ai/glm-5.2:free"
        ];
        for (const fallbackModel of openRouterFallbacks) {
          if (fallbackModel !== modelToTest) {
            try {
              const fbResult = await executeAICall(provider, fallbackModel, testStatement, testAlternatives);
              if (fbResult && fbResult.letra) {
                setProviderStatus(provider, "live");
                setSaved("active_model", fallbackModel);
                return {
                  success: true,
                  result: fbResult,
                  model: fallbackModel,
                  warning: `O modelo ${modelToTest} n\xE3o aceitou requisi\xE7\xE3o no OpenRouter. Chave validada via ${fallbackModel}!`
                };
              }
            } catch (fbErr) {
            }
          }
        }
      }
      if (provider === "nous") {
        const nousFallbacks = [
          "poolside/laguna-s-2.1:free",
          "meituan/longcat-2.0:free",
          "tencent/hy3:free",
          "stepfun/step-3.7-flash:free",
          "upstage/solar-pro4:free",
          "poolside/laguna-xs-2.1:free"
        ];
        for (const fallbackModel of nousFallbacks) {
          if (fallbackModel !== modelToTest) {
            try {
              const fbResult = await executeAICall(provider, fallbackModel, testStatement, testAlternatives);
              if (fbResult && fbResult.letra) {
                setProviderStatus(provider, "live");
                setSaved("active_model", fallbackModel);
                return {
                  success: true,
                  result: fbResult,
                  model: fallbackModel,
                  warning: `Chave do Nous Portal validada via ${fallbackModel}!`
                };
              }
            } catch (fbErr) {
            }
          }
        }
      }
      if (provider === "gemini" && /quota|rate limit|429|no longer available|not_found|404|is not found/i.test(err.message)) {
        const geminiFallbacks = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];
        for (const fbModel of geminiFallbacks) {
          if (fbModel !== modelToTest) {
            try {
              const fbResult = await executeAICall(provider, fbModel, testStatement, testAlternatives);
              if (fbResult && fbResult.letra) {
                setProviderStatus(provider, "live");
                setSaved("active_model", fbModel);
                return {
                  success: true,
                  result: fbResult,
                  model: fbModel,
                  warning: `O modelo ${modelToTest} estava indispon\xEDvel na API do Google. Chave validada automaticamente via ${fbModel}!`
                };
              }
            } catch (fbErr) {
            }
          }
        }
      }
      if (provider === "groq" && /quota|rate limit|429|does not exist/i.test(err.message)) {
        const groqFallbacks = ["llama-3.1-8b-instant", "deepseek-r1-distill-llama-70b", "llama-3.3-70b-versatile"];
        for (const fbModel of groqFallbacks) {
          if (fbModel !== modelToTest) {
            try {
              const fbResult = await executeAICall(provider, fbModel, testStatement, testAlternatives);
              if (fbResult && fbResult.letra) {
                setProviderStatus(provider, "live");
                setSaved("active_model", fbModel);
                return {
                  success: true,
                  result: fbResult,
                  model: fbModel,
                  warning: `Chave do Groq validada via ${fbModel}!`
                };
              }
            } catch (fbErr) {
            }
          }
        }
      }
      setProviderStatus(provider, "error");
      setApiKeyFor(provider, originalKey);
      throw err;
    }
  }
  async function callAIWithFallback(provider, model, statement, alternatives, onFallbackLog = null) {
    const liveList = getLiveProviders();
    const fallbackQueue = [
      { p: provider, m: model },
      ...liveList.filter((p) => p !== provider).map((p) => ({ p, m: PROVIDERS_CONFIG[p]?.defaultModel }))
    ];
    let lastError = null;
    for (let attempt = 0; attempt < fallbackQueue.length; attempt++) {
      const current = fallbackQueue[attempt];
      try {
        if (attempt > 0 && onFallbackLog) {
          onFallbackLog(`Fallback ativado: Consultando ${PROVIDERS_CONFIG[current.p]?.name || current.p}...`, "info");
        }
        return await executeAICall(current.p, current.m, statement, alternatives);
      } catch (err) {
        lastError = err;
        const isRateLimit = /429|quota|rate limit/i.test(err.message);
        if (onFallbackLog) {
          onFallbackLog(`[Aviso] ${PROVIDERS_CONFIG[current.p]?.name || current.p} falhou (${err.message.slice(0, 80)}...).`, "warning");
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
    throw lastError || new Error("Todas as IAs ativas falharam.");
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
    try {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) {
    }
    const btn = element.tagName === "BUTTON" || element.tagName === "A" ? element : element.querySelector("button, a") || element;
    try {
      btn.removeAttribute("disabled");
      btn.setAttribute("aria-disabled", "false");
      if (btn.style) btn.style.pointerEvents = "auto";
    } catch (e) {
    }
    try {
      btn.focus();
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
    if (btn && btn !== element) triggerReactHandler(btn);
    element.querySelectorAll("*").forEach((c) => triggerReactHandler(c));
    try {
      if (typeof btn.click === "function") btn.click();
      else if (typeof element.click === "function") element.click();
    } catch (e) {
    }
    ["pointerover", "mouseover", "pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((evtName) => {
      try {
        const evt = new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window });
        (btn || element).dispatchEvent(evt);
      } catch (e) {
      }
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
  function getTotalExamQuestionsCount() {
    const cards = getQuestionCards();
    if (cards.length > 0) {
      const validIndices = cards.map((c) => c.index).filter((n) => n >= 1 && n <= 30);
      if (validIndices.length > 0) {
        return Math.max(...validIndices, cards.length);
      }
      return cards.length;
    }
    const specificNav = Array.from(document.querySelectorAll('[data-testid*="question-nav-"], [aria-label*="Quest\xE3o "]'));
    if (specificNav.length > 0) {
      const navIndices = specificNav.map((el) => {
        const match = (el.getAttribute("data-testid") || "").match(/question-nav-(\d+)/) || (el.getAttribute("aria-label") || "").match(/Quest[aã]o\s*(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      }).filter((n) => n >= 1 && n <= 30);
      if (navIndices.length > 0) {
        return Math.max(...navIndices);
      }
    }
    return 10;
  }
  async function navigateToQuestionCard(qNum) {
    let cards = getQuestionCards();
    let found = cards.find((c) => c.index === qNum);
    if (found && found.element) {
      found.element.scrollIntoView({ behavior: "smooth", block: "center" });
      return found;
    }
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], span'));
    const targetBtn = buttons.find((b) => {
      const txt = b.innerText?.trim();
      return txt === String(qNum) || b.getAttribute("data-testid") === `question-nav-${qNum}` || b.getAttribute("aria-label")?.includes(`Quest\xE3o ${qNum}`);
    });
    if (targetBtn) {
      targetBtn.click();
      await new Promise((r) => setTimeout(r, 350));
      cards = getQuestionCards();
      found = cards.find((c) => c.index === qNum) || cards[0];
      if (found && found.element) {
        found.element.scrollIntoView({ behavior: "smooth", block: "center" });
        return found;
      }
    }
    return null;
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
      if (el.closest("#estacio-suite-box")) return;
      let card = el.closest('article, section, [class*="card"], div');
      if (!card || card.closest("#estacio-suite-box")) return;
      const text = (card.innerText || "").replace(/\s+/g, " ").trim();
      if (text.toLowerCase().includes("continue de onde parou") && !text.match(/Tema\s*1\s*\|/i)) {
        return;
      }
      const match = text.match(/Tema\s*(\d+)/i);
      if (match && text.length < 450) {
        const temaNum = parseInt(match[1], 10);
        if (!cardsMap.has(temaNum)) {
          const lowerText = text.toLowerCase();
          const hasConcluidoKeyword = /conclu[ií]d[oa]/i.test(text);
          const isActionToConclude = lowerText.includes("marcar como conclu");
          const hasCheckmarkIcon = Boolean(card.querySelector('[class*="check"], [class*="conclu"], [data-status="completed"], [data-status="concluido"], [aria-label*="conclu" i]'));
          const isConcluido = hasConcluidoKeyword && !isActionToConclude || hasCheckmarkIcon;
          const itemsMatch = text.match(/(\d+)\s*Itens?/i);
          const totalItems = itemsMatch ? parseInt(itemsMatch[1], 10) : 1;
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

  // src/modules/audio_alerts.js
  var audioCtx = null;
  function getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {
      });
    }
    return audioCtx;
  }
  function isSoundEnabled() {
    return getSaved("sound_enabled", "true") !== "false";
  }
  function setSoundEnabled(enabled) {
    setSaved("sound_enabled", enabled ? "true" : "false");
  }
  function isAudioMuted() {
    return !isSoundEnabled();
  }
  function setAudioMuted(muted) {
    setSoundEnabled(!muted);
  }
  function playTone(freq, duration = 0.15, type = "sine", startTimeOffset = 0, gainLevel = 0.15) {
    try {
      if (!isSoundEnabled()) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);
      gain.gain.setValueAtTime(1e-4, ctx.currentTime + startTimeOffset);
      gain.gain.exponentialRampToValueAtTime(gainLevel, ctx.currentTime + startTimeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + startTimeOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTimeOffset);
      osc.stop(ctx.currentTime + startTimeOffset + duration + 0.05);
    } catch (e) {
    }
  }
  function playAttentionSound() {
    try {
      playTone(587.33, 0.12, "sine", 0, 0.12);
      playTone(880, 0.18, "sine", 0.1, 0.15);
    } catch (e) {
    }
  }
  function playSuccessSound() {
    try {
      playTone(523.25, 0.12, "sine", 0, 0.12);
      playTone(659.25, 0.12, "sine", 0.1, 0.12);
      playTone(783.99, 0.25, "sine", 0.2, 0.18);
    } catch (e) {
    }
  }
  function playCelebrationFanfare() {
    try {
      playTone(523.25, 0.15, "triangle", 0, 0.15);
      playTone(659.25, 0.15, "triangle", 0.12, 0.15);
      playTone(783.99, 0.18, "triangle", 0.24, 0.18);
      playTone(1046.5, 0.5, "triangle", 0.38, 0.22);
      playTone(1318.51, 0.6, "sine", 0.42, 0.15);
    } catch (e) {
    }
  }

  // src/modules/exam_solver.js
  async function runExamQueue(provider, model, onLog, onGabaritoUpdated) {
    const total = getTotalExamQuestionsCount();
    const pName = PROVIDERS_CONFIG[provider]?.name || provider;
    if (total === 0) {
      if (onLog) onLog("Nenhuma quest\xE3o encontrada na p\xE1gina.", "error");
      return;
    }
    initGabaritoStructure(total, `${pName} (${model})`);
    if (onGabaritoUpdated) onGabaritoUpdated();
    const existingData = getSavedGabarito() || { answers: [] };
    const doneQuestions = new Set(
      existingData.answers.filter((a) => a.status === "done" || a.letter && a.status !== "failed").map((a) => a.q)
    );
    const alreadyCount = doneQuestions.size;
    if (alreadyCount > 0 && onLog) {
      onLog(`Retomando prova: ${alreadyCount}/${total} quest\xE3o(\xF5es) j\xE1 conclu\xEDdas anteriormente! \u23E9`, "info");
    } else if (onLog) {
      onLog(`Iniciando resolu\xE7\xE3o com ${pName} (${model}) [${total} quest\xF5es mapeadas]...`, "info");
    }
    for (let qNum = 1; qNum <= total; qNum++) {
      if (doneQuestions.has(qNum)) {
        const saved = existingData.answers.find((a) => a.q === qNum);
        if (onLog) onLog(`[${qNum}/${total}] Quest\xE3o ${qNum} j\xE1 respondida: [ ${saved?.letter} ] \u2705`, "info");
        const qCard2 = await navigateToQuestionCard(qNum);
        if (qCard2 && qCard2.element) {
          const alternatives2 = extractAlternatives(qCard2.element);
          const target = alternatives2.find((o) => o.letter === saved?.letter);
          if (target && target.element) clickOptionReact(target.element);
        }
        continue;
      }
      updateGabaritoQuestion(qNum, { status: "processing", provider: `${pName} (${model})` });
      if (onGabaritoUpdated) onGabaritoUpdated();
      if (onLog) onLog(`[${qNum}/${total}] Processando Quest\xE3o ${qNum}...`, "info");
      const qCard = await navigateToQuestionCard(qNum);
      if (!qCard || !qCard.element) {
        if (onLog) onLog(`[${qNum}/${total}] N\xE3o foi poss\xEDvel localizar o card da Quest\xE3o ${qNum}.`, "error");
        updateGabaritoQuestion(qNum, { status: "failed", error: "Card n\xE3o localizado no DOM" });
        if (onGabaritoUpdated) onGabaritoUpdated();
        continue;
      }
      const statement = extractStatement(qCard.element, qNum);
      const alternatives = extractAlternatives(qCard.element);
      if (alternatives.length < 2) {
        if (onLog) onLog(`[${qNum}/${total}] Alternativas n\xE3o encontradas na Quest\xE3o ${qNum}.`, "error");
        updateGabaritoQuestion(qNum, { status: "failed", error: "Alternativas insuficientes" });
        if (onGabaritoUpdated) onGabaritoUpdated();
        continue;
      }
      try {
        if (onLog) onLog(`[${qNum}/${total}] Consultando IA (${pName})...`, "info");
        const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
        const chosenLetter = ans.letra?.toUpperCase() || "A";
        if (onLog) onLog(`[${qNum}/${total}] -> Resposta: ${chosenLetter} (${ans.explicacao || ""})`, "success");
        const target = alternatives.find((o) => o.letter === chosenLetter);
        if (target && target.element) {
          clickOptionReact(target.element);
        }
        try {
          playAttentionSound();
        } catch (e) {
        }
        updateGabaritoQuestion(qNum, {
          status: "done",
          letter: chosenLetter,
          explanation: ans.explicacao || "",
          error: null
        });
        doneQuestions.add(qNum);
        if (onGabaritoUpdated) onGabaritoUpdated();
        const pauseMs = Math.floor(Math.random() * (2200 - 1500 + 1)) + 1500;
        await new Promise((r) => setTimeout(r, pauseMs));
      } catch (err) {
        if (onLog) onLog(`[${qNum}/${total}] Quest\xE3o ${qNum} falhou: ${err.message.slice(0, 85)}`, "error");
        updateGabaritoQuestion(qNum, {
          status: "failed",
          error: err.message.slice(0, 90)
        });
        if (onGabaritoUpdated) onGabaritoUpdated();
        await new Promise((r) => setTimeout(r, 2e3));
      }
    }
    const finalData = getSavedGabarito();
    const finalDone = finalData?.answers?.filter((a) => a.status === "done" || a.letter).length || 0;
    if (finalDone >= total) {
      try {
        playCelebrationFanfare();
      } catch (e) {
      }
      if (onLog) onLog("\u{1F389} Todas as 10 quest\xF5es foram respondidas e salvas com sucesso! \u{1F4DD}\u{1F3C6}", "success");
    } else {
      if (onLog) onLog(`\u26A0\uFE0F Prova em andamento: ${finalDone}/${total} conclu\xEDdas. Clique nos badges vermelhos para tentar novamente!`, "warning");
    }
    if (onGabaritoUpdated) onGabaritoUpdated();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function solveSingleQuestion(qNum, provider, model, onLog, onGabaritoUpdated) {
    if (!qNum || isNaN(qNum)) return;
    const pName = PROVIDERS_CONFIG[provider]?.name || provider;
    updateGabaritoQuestion(qNum, { status: "processing" });
    if (onGabaritoUpdated) onGabaritoUpdated();
    if (onLog) onLog(`[Retry/Resolver Q${qNum}] \u{1F3AF} Focando na Quest\xE3o ${qNum}...`, "info");
    const qCard = await navigateToQuestionCard(qNum);
    if (!qCard || !qCard.element) {
      if (onLog) onLog(`[Q${qNum}] Quest\xE3o ${qNum} n\xE3o encontrada na p\xE1gina.`, "error");
      updateGabaritoQuestion(qNum, { status: "failed", error: "Card n\xE3o encontrado" });
      if (onGabaritoUpdated) onGabaritoUpdated();
      return;
    }
    const statement = extractStatement(qCard.element, qNum);
    const alternatives = extractAlternatives(qCard.element);
    if (alternatives.length < 2) {
      if (onLog) onLog(`[Q${qNum}] Alternativas n\xE3o encontradas.`, "error");
      updateGabaritoQuestion(qNum, { status: "failed", error: "Alternativas n\xE3o encontradas" });
      if (onGabaritoUpdated) onGabaritoUpdated();
      return;
    }
    try {
      if (onLog) onLog(`[Q${qNum}] Consultando ${pName} (${model})...`, "info");
      const ans = await callAIWithFallback(provider, model, statement, alternatives, onLog);
      const chosenLetter = ans.letra?.toUpperCase() || "A";
      if (onLog) {
        onLog(`[Q${qNum}] \u2705 Resolvida com sucesso: [ ${chosenLetter} ] (${ans.explicacao || ""})`, "success");
      }
      const target = alternatives.find((o) => o.letter === chosenLetter);
      if (target && target.element) {
        clickOptionReact(target.element);
      }
      try {
        playSuccessSound();
      } catch (e) {
      }
      updateGabaritoQuestion(qNum, {
        status: "done",
        letter: chosenLetter,
        explanation: ans.explicacao || "",
        error: null
      });
      if (onGabaritoUpdated) onGabaritoUpdated();
    } catch (err) {
      if (onLog) onLog(`[Q${qNum}] \u274C Falha no retry: ${err.message}`, "error");
      updateGabaritoQuestion(qNum, {
        status: "failed",
        error: err.message
      });
      if (onGabaritoUpdated) onGabaritoUpdated();
    }
  }
  async function applySavedGabaritoToDOM(onLog, onGabaritoUpdated) {
    const gabData = getSavedGabarito();
    const answers = gabData?.answers?.filter((a) => a.letter) || [];
    if (answers.length === 0) {
      if (onLog) onLog("\u26A0\uFE0F Nenhum gabarito com respostas salvo para aplicar. Resolva as quest\xF5es primeiro!", "warning");
      return;
    }
    if (onLog) onLog(`\u26A1 Aplicando ${answers.length} respostas salvas diretamente na prova (0 IA)...`, "info");
    let markedCount = 0;
    for (let i = 0; i < answers.length; i++) {
      const a = answers[i];
      const qNum = a.q;
      const chosenLetter = a.letter;
      const qCard = await navigateToQuestionCard(qNum);
      if (qCard && qCard.element) {
        const alternatives = extractAlternatives(qCard.element);
        const target = alternatives.find((o) => o.letter === chosenLetter);
        if (target && target.element) {
          clickOptionReact(target.element);
          markedCount++;
          if (onLog) onLog(`[${i + 1}/${answers.length}] Q${qNum} marcada com [ ${chosenLetter} ] \u2705`, "success");
        } else {
          if (onLog) onLog(`[${i + 1}/${answers.length}] Q${qNum}: Alternativa ${chosenLetter} n\xE3o encontrada na tela.`, "warning");
        }
      } else {
        if (onLog) onLog(`[${i + 1}/${answers.length}] Q${qNum}: Card n\xE3o localizado no DOM.`, "error");
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    if (onLog) {
      if (markedCount > 0) {
        onLog(`\u{1F389} Gabarito aplicado com sucesso! ${markedCount}/${answers.length} quest\xF5es marcadas na prova.`, "success");
      } else {
        onLog(`\u26A0\uFE0F Nenhuma quest\xE3o p\xF4de ser marcada na tela.`, "error");
      }
    }
    if (onGabaritoUpdated) onGabaritoUpdated();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function clearExamAnswers(onLog, onGabaritoUpdated) {
    const total = getTotalExamQuestionsCount() || 10;
    if (onLog) onLog("\u{1F9F9} Desmarcando todas as alternativas na prova e resetando gabarito...", "info");
    let uncheckedCount = 0;
    for (let qNum = 1; qNum <= total; qNum++) {
      const qCard = await navigateToQuestionCard(qNum);
      const cardEl = qCard?.element || document.querySelector(`[data-question="${qNum}"], #q${qNum}, #question-${qNum}`);
      const container = cardEl || document;
      const inputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]');
      inputs.forEach((inp) => {
        if (inp.checked) {
          inp.checked = false;
          inp.removeAttribute("checked");
          inp.dispatchEvent(new Event("change", { bubbles: true }));
          inp.dispatchEvent(new Event("input", { bubbles: true }));
          uncheckedCount++;
        }
      });
      const highlighted = (cardEl || document).querySelectorAll('.estacio-ai-marked, .selected, .active, .checked, .ant-radio-checked, .ant-radio-wrapper-checked, [aria-checked="true"], [data-checked="true"]');
      highlighted.forEach((el) => {
        el.classList.remove("estacio-ai-marked", "selected", "active", "checked", "ant-radio-checked", "ant-radio-wrapper-checked");
        el.removeAttribute("aria-checked");
        el.removeAttribute("data-checked");
        el.style.outline = "";
        el.style.borderColor = "";
        el.style.backgroundColor = "";
      });
    }
    document.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked').forEach((inp) => {
      inp.checked = false;
      inp.removeAttribute("checked");
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    });
    resetGabaritoAnswers(total);
    if (onGabaritoUpdated) onGabaritoUpdated();
    try {
      playAttentionSound();
    } catch (e) {
    }
    if (onLog) onLog(`\u{1F9F9} Prova limpa: ${total} quest\xF5es resetadas para o estado inicial!`, "success");
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
    const turmaMatch = url.match(/\/disciplinas\/(estacio_\d+|\d+)/i);
    const uuidMatch = url.match(/\/conteudos\/([a-f0-9-]{36})/i);
    const temaMatch = url.match(/[?&]tema=([A-Za-z0-9_-]+)/i) || url.match(/\/temas\/([A-Za-z0-9_-]+)/i);
    let turmaId = null;
    if (turmaMatch) {
      const raw = turmaMatch[1];
      turmaId = raw.startsWith("estacio_") ? raw : `estacio_${raw}`;
    }
    return {
      turmaId,
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
        const headers = {
          "Accept": "application/json, text/plain, */*"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await universalFetch(url, { headers });
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
    const normalizedTurmaId = turmaId && !String(turmaId).startsWith("estacio_") ? `estacio_${turmaId}` : turmaId;
    const endpointNovo = `https://apis.estudante.estacio.br/rest/me/conteudos/${conteudoUuid}/concluir`;
    const matriculaParam = matricula ? `?matricula=${matricula}` : "";
    const endpointLegado = `https://apis.estudante.estacio.br/rest/turmas/${normalizedTurmaId}/temas/${temaId}/conteudos/${conteudoUuid}/conclusoes${matriculaParam}`;
    const headersBase = {
      "Accept": "application/json, text/plain, */*"
    };
    if (token) {
      headersBase["Authorization"] = `Bearer ${token}`;
    }
    const shortUuid = conteudoUuid ? conteudoUuid.slice(0, 8) : "...";
    try {
      let res = await universalFetch(endpointNovo, {
        method: "POST",
        headers: {
          ...headersBase,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idTurma: normalizedTurmaId,
          idTema: temaId,
          idConteudo: conteudoUuid
        })
      });
      if (res.status >= 200 && res.status < 300) {
        if (onLog) onLog(`[POST Oficial] /me/conteudos/${shortUuid}... \u2192 HTTP ${res.status} OK \u2705`, "success");
        return true;
      } else if (res.status === 409) {
        if (onLog) onLog(`[POST Oficial] /me/conteudos/${shortUuid}... \u2192 HTTP 409 (J\xE1 conclu\xEDdo) \u26A1`, "info");
        return true;
      } else if (res.status === 403) {
        if (onLog) onLog(`[POST Oficial] /me/conteudos/${shortUuid}... \u2192 HTTP 403 (Aguardando 2.5s para retry)... \u23F3`, "warning");
        await new Promise((r) => setTimeout(r, 2500));
        res = await universalFetch(endpointNovo, {
          method: "POST",
          headers: {
            ...headersBase,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            idTurma: normalizedTurmaId,
            idTema: temaId,
            idConteudo: conteudoUuid
          })
        });
        if (res.status >= 200 && res.status < 300) {
          if (onLog) onLog(`[POST Oficial - Retry] /me/conteudos/${shortUuid}... \u2192 HTTP ${res.status} OK \u2705`, "success");
          return true;
        } else if (res.status === 409) {
          if (onLog) onLog(`[POST Oficial - Retry] /me/conteudos/${shortUuid}... \u2192 HTTP 409 (J\xE1 conclu\xEDdo) \u26A1`, "info");
          return true;
        } else {
          if (onLog) onLog(`[POST Oficial - Retry] /me/conteudos/${shortUuid}... \u2192 HTTP ${res.status} \u26A0\uFE0F`, "warning");
        }
      } else {
        if (onLog) onLog(`[POST Oficial] /me/conteudos/${shortUuid}... \u2192 HTTP ${res.status} \u26A0\uFE0F`, "warning");
      }
    } catch (e) {
      if (onLog) onLog(`[POST Oficial] /me/conteudos/${shortUuid}... \u2192 Erro: ${e.message}`, "warning");
    }
    await new Promise((r) => setTimeout(r, 800));
    try {
      const res = await universalFetch(endpointLegado, {
        method: "POST",
        headers: headersBase
      });
      if (res.status >= 200 && res.status < 300) {
        if (onLog) onLog(`[POST Legado] /temas/${temaId}/conteudos/${shortUuid}... \u2192 HTTP ${res.status} OK \u2705`, "success");
        return true;
      } else if (res.status === 409) {
        if (onLog) onLog(`[POST Legado] /temas/${temaId}/conteudos/${shortUuid}... \u2192 HTTP 409 (J\xE1 conclu\xEDdo) \u26A1`, "info");
        return true;
      } else {
        if (onLog) onLog(`[POST Legado] /temas/${temaId}/conteudos/${shortUuid}... \u2192 HTTP ${res.status} \u26A0\uFE0F`, "warning");
      }
    } catch (e) {
      if (onLog) onLog(`[POST Legado] /temas/${temaId}/conteudos/${shortUuid}... \u2192 Erro: ${e.message}`, "warning");
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
      try {
        playAttentionSound();
      } catch (e) {
      }
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
  function cancelAllAutomations(onLog = null) {
    isStateMachineRunning = false;
    localStorage.removeItem("estacio_catalog_queue");
    localStorage.removeItem("estacio_multi_queue");
    localStorage.removeItem("estacio_multi_materia_queue");
    sessionStorage.removeItem("estacio_catalog_queue");
    sessionStorage.removeItem("estacio_multi_queue");
    if (onLog) onLog("\u23F9\uFE0F Automa\xE7\xE3o cancelada pelo usu\xE1rio.", "info");
  }
  function isAnyAutomationRunning() {
    const q = localStorage.getItem("estacio_catalog_queue");
    if (q) {
      try {
        const parsed = JSON.parse(q);
        if (parsed && parsed.active) return true;
      } catch (e) {
      }
    }
    return isStateMachineRunning;
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
        const targetMateriaUrl = queue.conteudosUrl || `https://estudante.estacio.br/disciplinas/${turmaId}/conteudos`;
        let temaId = ids.temaId;
        const headerText = document.body.innerText;
        const headerMatch = headerText.match(/Tema\s*(\d+)/i);
        const temaNum = headerMatch ? parseInt(headerMatch[1], 10) : queue.pendingThemes?.[queue.currentPos] || 1;
        if (!temaId) temaId = `tema_${temaNum}`;
        if (onLog) onLog(`[Tema ${temaNum}] Aberto na tela! Aguardando estabiliza\xE7\xE3o da sess\xE3o... \u23F3`, "info");
        try {
          window.scrollTo({ top: Math.min(600, document.body.scrollHeight / 2), behavior: "smooth" });
        } catch (e) {
        }
        await new Promise((r) => setTimeout(r, 2200));
        if (onLog) onLog(`[Tema ${temaNum}] Coletando sub-conte\xFAdos...`, "info");
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
            await new Promise((r) => setTimeout(r, 800));
          }
        } else if (ids.conteudoUuid) {
          await postConcluir(turmaId, temaId, ids.conteudoUuid, token, matricula, onLog);
        }
        await clickConcludeButtonActiveLoop(onLog);
        if (uuidList.length > 0) {
          for (const uuid of uuidList) {
            await postConcluir(turmaId, temaId, uuid, token, matricula);
            await new Promise((r) => setTimeout(r, 800));
          }
        }
        const delayMs = Math.floor(Math.random() * (3500 - 2500 + 1)) + 2500;
        const delaySec = (delayMs / 1e3).toFixed(1);
        try {
          playSuccessSound();
        } catch (e) {
        }
        if (onLog) onLog(`[Tema ${temaNum}] Conclu\xEDdo com sucesso! Aguardando ${delaySec}s e voltando para a grade...`, "success");
        await new Promise((r) => setTimeout(r, delayMs));
        queue.completedThemes = queue.completedThemes || [];
        if (!queue.completedThemes.includes(temaNum)) {
          queue.completedThemes.push(temaNum);
        }
        queue.currentPos = (queue.currentPos || 0) + 1;
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
        await new Promise((r) => setTimeout(r, 1800));
        const gridCards = await waitForCards(15e3);
        if (gridCards.length === 0) {
          return;
        }
        const completedSet = new Set(queue.completedThemes || []);
        const pendentes = gridCards.filter((c) => !c.isConcluido && !completedSet.has(c.temaNum));
        const expectedTotal = queue.totalThemes || gridCards.length;
        if (pendentes.length === 0 && gridCards.length >= expectedTotal) {
          localStorage.removeItem("estacio_catalog_queue");
          try {
            playCelebrationFanfare();
          } catch (e) {
          }
          if (onLog) onLog(`\u{1F3C6} Todos os ${gridCards.length} temas desta mat\xE9ria est\xE3o 100% CONCLU\xCDDOS! Parab\xE9ns!`, "success");
          return;
        }
        if (pendentes.length === 0) {
          localStorage.removeItem("estacio_catalog_queue");
          try {
            playCelebrationFanfare();
          } catch (e) {
          }
          if (onLog) onLog(`\u{1F3C6} Todos os temas pendentes desta mat\xE9ria foram conclu\xEDdos!`, "success");
          return;
        }
        if (onLog) onLog(`Restam ${pendentes.length} tema(s) pendente(s) na mat\xE9ria.`, "info");
        queue.pendingThemes = pendentes.map((c) => c.temaNum);
        localStorage.setItem("estacio_catalog_queue", JSON.stringify(queue));
        const nextTema = pendentes[0];
        if (onLog) onLog(`[${pendentes.length} restantes] Abrindo Tema ${nextTema.temaNum} (${nextTema.totalItems} itens)...`, "info");
        await new Promise((r) => setTimeout(r, 1500));
        openThemeByIndex(nextTema.temaNum);
      } finally {
        isStateMachineRunning = false;
      }
    }
  }
  function startThemeCompletion(onLog) {
    const currentUrl = window.location.href;
    const turmaMatch = currentUrl.match(/\/disciplinas\/(estacio_\d+|\d+)/i);
    const turmaId = turmaMatch ? turmaMatch[1].startsWith("estacio_") ? turmaMatch[1] : `estacio_${turmaMatch[1]}` : null;
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
        try {
          playCelebrationFanfare();
        } catch (e) {
        }
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

  // src/modules/model_fetcher.js
  function getCachedModels(provider) {
    try {
      const cached = getSaved(`models_${provider}`, null);
      if (Array.isArray(cached) && cached.length > 0) return cached;
      if (typeof cached === "string") {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
    }
    return null;
  }
  function saveCachedModels(provider, modelsList) {
    try {
      if (Array.isArray(modelsList) && modelsList.length > 0) {
        setSaved(`models_${provider}`, modelsList);
        setSaved(`models_ts_${provider}`, Date.now());
      }
    } catch (e) {
    }
  }
  function isModelFree(provider, modelId, displayName = "") {
    const id = (modelId || "").toLowerCase();
    const name = (displayName || "").toLowerCase();
    if (provider === "groq") {
      return !/whisper|tts|guard|embeddings|safeguard|distilbert/i.test(id);
    }
    if (provider === "openrouter") {
      return id === "openrouter/free" || id.endsWith(":free") || id.includes(":free");
    }
    if (provider === "gemini") {
      if (/image|imagen|gemma|custom|banana|veo|lyria|aqa|embed|deep-research|live|audio/i.test(id)) {
        return false;
      }
      if (/banana|image|gemma|vision/i.test(name)) {
        return false;
      }
      return /flash/i.test(id) || !/pro/i.test(id) && /gemini-1\.5|gemini-2\.0|gemini-2\.5/i.test(id);
    }
    if (provider === "ollama") return true;
    if (provider === "mistral") {
      return /codestral|small/i.test(id) && !/large|pixtral|embed/i.test(id);
    }
    if (provider === "nous") {
      return id.endsWith(":free") || /:free$/i.test(id) || id.includes(":free");
    }
    return false;
  }
  function getModelsForProvider(provider, showPaid = null) {
    const allowPaid = showPaid !== null ? showPaid : getShowPaidModels();
    const cached = getCachedModels(provider);
    const rawList = cached && cached.length > 0 ? cached : PROVIDERS_CONFIG[provider]?.models || [];
    if (allowPaid) {
      return rawList;
    }
    const freeList = rawList.filter((m) => {
      return isModelFree(provider, m.id, m.name);
    });
    if (freeList.length > 0) return freeList;
    return rawList;
  }
  function formatDisplayName(provider, modelItem) {
    const modelId = typeof modelItem === "string" ? modelItem : modelItem.id || "";
    const rawName = typeof modelItem === "object" ? modelItem.display_name || modelItem.name || modelItem.displayName || "" : "";
    if (provider === "groq") {
      if (modelId.includes("llama-3.3-70b")) return "Llama 3.3 70B (\u{1F525} 100% Gr\xE1tis \u2022 14.4k req/dia \u2022 Recomendado)";
      if (modelId.includes("deepseek-r1-distill-llama-70b")) return "DeepSeek R1 Distill 70B (\u{1F525} 100% Gr\xE1tis \u2022 Racioc\xEDnio)";
      if (modelId.includes("llama-3.1-8b")) return "Llama 3.1 8B (\u26A1 100% Gr\xE1tis \u2022 Ultra R\xE1pido)";
      if (modelId.includes("qwen")) return `Qwen (${modelId}) (\u{1F525} 100% Gr\xE1tis)`;
      if (modelId.includes("gpt-oss-120b")) return "GPT-OSS 120B (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("gpt-oss-20b")) return "GPT-OSS 20B (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("compound")) return `Groq Compound (${modelId}) (\u{1F525} 100% Gr\xE1tis)`;
    } else if (provider === "gemini") {
      if (modelId.includes("gemini-2.5-flash")) return "Gemini 2.5 Flash (\u{1F381} Gr\xE1tis \u2022 Racioc\xEDnio & Rapidez \u2022 Recomendado)";
      if (modelId.includes("gemini-2.0-flash")) return "Gemini 2.0 Flash (\u26A1 Gr\xE1tis 1.500 req/dia \u2022 Mais R\xE1pido)";
      if (modelId.includes("gemini-1.5-flash")) return "Gemini 1.5 Flash (\u{1F381} Gr\xE1tis 1.500 req/dia \u2022 Est\xE1vel)";
      if (modelId.includes("gemini-1.5-pro")) return "Gemini 1.5 Pro (\u{1F9E0} Gr\xE1tis Cota Di\xE1ria \u2022 M\xE1ximo Racioc\xEDnio)";
      if (modelId.includes("gemini-2.0-flash-lite")) return "Gemini 2.0 Flash-Lite (\u26A1 Gr\xE1tis \u2022 Ultra R\xE1pido)";
      if (modelId.includes("gemini-2.5-pro")) return "Gemini 2.5 Pro (\u{1F48E} Pago \u2022 Frontier Reasoning)";
      if (modelId.includes("gemini-flash-latest")) return "Gemini Flash Latest (\u{1F381} Gr\xE1tis AI Studio)";
      if (modelId.includes("gemini-pro-latest")) return "Gemini Pro Latest (\u{1F48E} Pago AI Studio)";
    } else if (provider === "openrouter") {
      const isFree = modelId === "openrouter/free" || modelId.includes(":free");
      const freeBadge = isFree ? " (\u{1F525} 100% Gr\xE1tis)" : " (\u{1F48E} Pago)";
      if (modelId === "openrouter/free") return "OpenRouter Free Router (\u{1F525} 100% Gr\xE1tis \u2022 Roteamento Autom\xE1tico)";
      if (modelId.includes("gemma-4-31b")) return "Google Gemma 4 31B (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("gemma-4-26b")) return "Google Gemma 4 26B (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("nemotron-3-ultra")) return "NVIDIA Nemotron 3 Ultra (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("minimax-m3")) return "MiniMax M3 (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("glm-5.2")) return "GLM 5.2 (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("lfm-2.5")) return "Liquid LFM 2.5 (\u{1F525} 100% Gr\xE1tis)";
      if (modelId.includes("llama-3.3-70b-instruct:free")) return `Llama 3.3 70B Instruct (\u{1F525} 100% Gr\xE1tis)`;
      if (modelId.includes("deepseek-r1:free")) return `DeepSeek R1 (\u{1F525} 100% Gr\xE1tis)`;
      if (modelId.includes("gemini-2.0-flash-exp:free")) return `Gemini 2.0 Flash Exp (\u{1F525} 100% Gr\xE1tis)`;
      if (modelId.includes("qwen-2.5-72b-instruct:free")) return `Qwen 2.5 72B (\u{1F525} 100% Gr\xE1tis)`;
      if (rawName && rawName !== modelId) return `${rawName}${freeBadge}`;
      return `${modelId}${freeBadge}`;
    } else if (provider === "nous") {
      const isFree = isModelFree("nous", modelId, rawName);
      const freeBadge = isFree ? " (\u{1F525} 100% Gr\xE1tis)" : " (\u{1F48E} Pago)";
      if (modelId === "poolside/laguna-s-2.1:free") return "Poolside Laguna S 2.1 (\u{1F525} 100% Gr\xE1tis \u2022 118B Coding \u2022 Recomendado)";
      if (modelId === "poolside/laguna-xs-2.1:free") return "Poolside Laguna XS 2.1 (\u{1F525} 100% Gr\xE1tis \u2022 Leve)";
      if (modelId === "meituan/longcat-2.0:free") return "Meituan LongCat 2.0 (\u{1F525} 100% Gr\xE1tis \u2022 1.6T MoE / 1M Context)";
      if (modelId === "tencent/hy3:free") return "Tencent Hy3 (\u{1F525} 100% Gr\xE1tis \u2022 295B MoE)";
      if (modelId === "stepfun/step-3.7-flash:free") return "StepFun Step 3.7 Flash (\u{1F525} 100% Gr\xE1tis \u2022 Ultra R\xE1pido)";
      if (modelId === "upstage/solar-pro4:free") return "Upstage Solar Pro 4 (\u{1F525} 100% Gr\xE1tis \u2022 Racioc\xEDnio)";
      if (rawName && rawName !== modelId) return `${rawName}${freeBadge}`;
      return `${modelId}${freeBadge}`;
    } else if (provider === "ollama") {
      if (modelId.includes("hermes")) return `Hermes (${modelId}) (Local \u2022 Nous Research)`;
      if (modelId.includes("llama3.3") || modelId.includes("llama-3.3")) return `Llama 3.3 (${modelId}) (Local \u2022 Ilimitado)`;
      if (modelId.includes("deepseek-r1")) return `DeepSeek R1 (${modelId}) (Local \u2022 Racioc\xEDnio)`;
      if (modelId.includes("qwen")) return `Qwen (${modelId}) (Local)`;
      if (rawName && rawName !== modelId) return `${rawName} (${modelId}) (Local \u2022 Offline)`;
      return `${modelId} (Local \u2022 Offline)`;
    } else if (provider === "mistral") {
      let suffix = "";
      if (modelItem?.capabilities?.reasoning) suffix = " (\u{1F9E0} Racioc\xEDnio)";
      else if (modelItem?.capabilities?.vision) suffix = " (\u{1F441}\uFE0F Vis\xE3o)";
      if (modelId === "codestral-latest") return `Codestral Latest (\u{1F4A1} Gr\xE1tis Dev / L\xF3gica Exata)${suffix}`;
      if (modelId === "mistral-small-latest") return `Mistral Small Latest (\u26A1 Econ\xF4mico & R\xE1pido)${suffix}`;
      if (modelId === "mistral-large-latest") return `Mistral Large Latest (\u{1F48E} Pago \u2022 PhD / M\xE1xima Precis\xE3o)${suffix}`;
      if (modelId === "pixtral-large-latest") return `Pixtral Large Latest (Vis\xE3o & PhD)${suffix}`;
      if (modelId === "ministral-8b-latest") return `Ministral 8B Latest${suffix}`;
      if (modelId.startsWith("mistral-medium")) return `Mistral Medium (${modelId})${suffix}`;
    } else if (provider === "claude") {
      let suffix = "";
      if (modelItem?.capabilities?.thinking?.supported) suffix = " (\u{1F9E0} Thinking)";
      if (modelId.includes("claude-3-7-sonnet")) return `Claude 3.7 Sonnet (\u{1F48E} Pago \u2022 Racioc\xEDnio H\xEDbrido)${suffix}`;
      if (modelId.includes("claude-3-5-sonnet")) return `Claude 3.5 Sonnet (\u{1F48E} Pago \u2022 Alta Precis\xE3o)${suffix}`;
      if (modelId.includes("claude-3-5-haiku")) return `Claude 3.5 Haiku (\u{1F48E} Pago \u2022 Ultra R\xE1pido & Econ\xF4mico)${suffix}`;
      if (modelId.includes("claude-3-haiku")) return `Claude 3 Haiku (\u{1F48E} Pago \u2022 Econ\xF4mico)${suffix}`;
      if (modelId.includes("claude-3-opus")) return `Claude 3 Opus (\u{1F48E} Pago \u2022 Frontier PhD)${suffix}`;
    } else if (provider === "openai") {
      if (modelId === "gpt-4o-mini") return "GPT-4o Mini (\u{1F48E} Pago \u2022 Econ\xF4mico)";
      if (modelId === "gpt-4o") return "GPT-4o (\u{1F48E} Pago \u2022 Precis\xE3o M\xE1xima)";
      if (modelId === "o3-mini") return "o3-mini (\u{1F48E} Pago \u2022 Racioc\xEDnio)";
      if (modelId === "o1") return "o1 (\u{1F48E} Pago \u2022 Racioc\xEDnio PhD)";
    } else if (provider === "deepseek") {
      if (modelId === "deepseek-chat") return "DeepSeek V3 (\u{1F48E} Pago \u2022 Econ\xF4mico)";
      if (modelId === "deepseek-reasoner") return "DeepSeek R1 (\u{1F48E} Pago \u2022 Racioc\xEDnio Puro)";
    }
    if (rawName && rawName !== modelId) return `${rawName} (${modelId})`;
    return modelId;
  }
  var inFlightFetches = /* @__PURE__ */ new Map();
  var CACHE_TTL_MS = 60 * 60 * 1e3;
  async function fetchLiveModels(provider, apiKey, showPaid = null, force = false) {
    const allowPaid = showPaid !== null ? showPaid : getShowPaidModels();
    if (!apiKey && provider !== "ollama") return getModelsForProvider(provider, allowPaid);
    if (!force) {
      const cached = getCachedModels(provider);
      const lastFetch = Number(getSaved(`models_ts_${provider}`, 0));
      const isFresh = Date.now() - lastFetch < CACHE_TTL_MS;
      if (cached && cached.length > 0 && isFresh) {
        return allowPaid ? cached : cached.filter((m) => m.isFree !== false);
      }
    }
    if (inFlightFetches.has(provider)) {
      try {
        const list = await inFlightFetches.get(provider);
        return allowPaid ? list : list.filter((m) => m.isFree !== false);
      } catch (e) {
      }
    }
    const fetchPromise = (async () => {
      try {
        if (provider === "groq") {
          const res = await universalFetch("https://api.groq.com/openai/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            }
          });
          if (res.ok) {
            const json = await res.json();
            const rawList = Array.isArray(json) ? json : json.data || [];
            const filtered = rawList.filter((m) => isModelFree("groq", m.id, m.display_name)).map((m) => ({
              id: m.id,
              name: formatDisplayName("groq", m),
              isFree: true
            }));
            filtered.sort((a, b) => {
              const priority = (id) => {
                if (id.includes("llama-3.3-70b")) return 1;
                if (id.includes("deepseek-r1-distill-llama-70b")) return 2;
                if (id.includes("qwen")) return 3;
                if (id.includes("llama-3.1-8b")) return 4;
                if (id.includes("gpt-oss")) return 5;
                return 10;
              };
              return priority(a.id) - priority(b.id);
            });
            if (filtered.length > 0) {
              saveCachedModels(provider, filtered);
              return allowPaid ? filtered : filtered.filter((m) => m.isFree);
            }
          }
        }
        if (provider === "openrouter") {
          const res = await universalFetch("https://openrouter.ai/api/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://estudante.estacio.br",
              "X-Title": "Estacio Suite AI"
            }
          });
          if (res.ok) {
            const json = await res.json();
            const rawList = Array.isArray(json) ? json : json.data || [];
            const filtered = rawList.filter((m) => !/audio|whisper|moderation|embedding/i.test(m.id)).map((m) => {
              const isFree = isModelFree("openrouter", m.id, m.name) || m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0";
              return {
                id: m.id,
                name: formatDisplayName("openrouter", m),
                isFree
              };
            });
            filtered.sort((a, b) => {
              if (a.id === "openrouter/free") return -1;
              if (b.id === "openrouter/free") return 1;
              if (a.isFree && !b.isFree) return -1;
              if (!a.isFree && b.isFree) return 1;
              if (a.id.includes("gemma-4") && !b.id.includes("gemma-4")) return -1;
              if (a.id.includes("nemotron") && !b.id.includes("nemotron")) return -1;
              return a.id.localeCompare(b.id);
            });
            if (filtered.length > 0) {
              saveCachedModels(provider, filtered);
              return allowPaid ? filtered : filtered.filter((m) => m.isFree);
            }
          }
        }
        if (provider === "nous") {
          try {
            const res = await universalFetch("https://inference-api.nousresearch.com/v1/models", {
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              }
            });
            if (res.ok) {
              const json = await res.json();
              const rawList = Array.isArray(json) ? json : json.data || [];
              const seen = /* @__PURE__ */ new Set();
              const models = rawList.filter((m) => !/embed|moderation|audio/i.test(m.id)).filter((m) => isModelFree("nous", m.id, m.name)).filter((m) => {
                if (seen.has(m.id)) return false;
                seen.add(m.id);
                return true;
              }).map((m) => ({
                id: m.id,
                name: formatDisplayName("nous", m),
                isFree: true
              }));
              models.sort((a, b) => {
                const priority = (id) => {
                  if (id.includes("laguna-s") || id.includes("laguna_s")) return 1;
                  if (id.includes("longcat")) return 2;
                  if (id.includes("hy3")) return 3;
                  if (id.includes("step")) return 4;
                  if (id.includes("solar")) return 5;
                  if (id.includes("laguna-xs") || id.includes("laguna_xs")) return 6;
                  if (id.includes("laguna")) return 7;
                  return 20;
                };
                return priority(a.id) - priority(b.id);
              });
              if (models.length > 0) {
                saveCachedModels(provider, models);
                return models;
              }
            }
          } catch (e) {
          }
          const curatedNous = PROVIDERS_CONFIG.nous?.models || [];
          saveCachedModels(provider, curatedNous);
          return curatedNous;
        }
        if (provider === "ollama") {
          try {
            const res = await universalFetch("http://localhost:11434/v1/models");
            if (res.ok) {
              const json = await res.json();
              const rawList = Array.isArray(json) ? json : json.data || [];
              const models = rawList.map((m) => ({
                id: m.id,
                name: formatDisplayName("ollama", m),
                isFree: true
              }));
              if (models.length > 0) {
                saveCachedModels(provider, models);
                return models;
              }
            }
          } catch (e) {
            try {
              const resTags = await universalFetch("http://localhost:11434/api/tags");
              if (resTags.ok) {
                const jsonTags = await resTags.json();
                const rawModels = jsonTags.models || [];
                const models = rawModels.map((m) => ({
                  id: m.name,
                  name: formatDisplayName("ollama", { id: m.name }),
                  isFree: true
                }));
                if (models.length > 0) {
                  saveCachedModels(provider, models);
                  return models;
                }
              }
            } catch (e2) {
            }
          }
          const curatedOllama = PROVIDERS_CONFIG.ollama.models;
          saveCachedModels(provider, curatedOllama);
          return curatedOllama;
        }
        if (provider === "claude") {
          try {
            const res = await universalFetch("https://api.anthropic.com/v1/models", {
              headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true",
                "Content-Type": "application/json"
              }
            });
            if (res.ok) {
              const json = await res.json();
              const rawList = Array.isArray(json) ? json : json.data || [];
              const filtered = rawList.map((m) => ({
                id: m.id,
                name: formatDisplayName("claude", m),
                created_at: m.created_at,
                isFree: false
              }));
              filtered.sort((a, b) => {
                if (a.created_at && b.created_at) {
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                const priority = (id) => {
                  if (id.includes("opus-4")) return 1;
                  if (id.includes("3-7-sonnet")) return 2;
                  if (id.includes("3-5-sonnet")) return 3;
                  if (id.includes("3-5-haiku")) return 4;
                  if (id.includes("3-opus")) return 5;
                  return 10;
                };
                return priority(a.id) - priority(b.id);
              });
              if (filtered.length > 0) {
                saveCachedModels(provider, filtered);
                return filtered;
              }
            }
          } catch (e) {
          }
          const curatedClaude = PROVIDERS_CONFIG.claude.models;
          saveCachedModels(provider, curatedClaude);
          return curatedClaude;
        }
        if (provider === "mistral") {
          const res = await universalFetch("https://api.mistral.ai/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            }
          });
          if (res.ok) {
            const json = await res.json();
            const rawList = Array.isArray(json) ? json : json.data || [];
            const filtered = rawList.filter((m) => !m.archived && m.capabilities?.completion_chat !== false && !/embed|moderation|ocr|audio/i.test(m.id)).map((m) => ({
              id: m.id,
              name: formatDisplayName("mistral", m),
              isFree: isModelFree("mistral", m.id, m.name)
            }));
            filtered.sort((a, b) => {
              const priority = (id) => {
                if (id === "codestral-latest") return 1;
                if (id === "mistral-small-latest") return 2;
                if (id === "mistral-large-latest") return 3;
                return 10;
              };
              return priority(a.id) - priority(b.id);
            });
            if (filtered.length > 0) {
              saveCachedModels(provider, filtered);
              return allowPaid ? filtered : filtered.filter((m) => m.isFree);
            }
          }
        }
        if (provider === "gemini") {
          const res = await universalFetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
            headers: { "Content-Type": "application/json" }
          });
          if (res.ok) {
            const json = await res.json();
            const rawList = json.models || (Array.isArray(json) ? json : []);
            const filtered = rawList.filter((m) => {
              const clean = (m.name || "").replace(/^models\//, "").toLowerCase();
              const dName = (m.displayName || "").toLowerCase();
              const methods = m.supportedGenerationMethods || [];
              const isGen = methods.length === 0 || methods.includes("generateContent");
              const isGarbage = /embedding|aqa|imagen|veo|lyria|banana|robotics|audio|tts|live|translate|computer-use|deep-research|image|custom-tools/i.test(clean) || /banana|image|vision|embedding|robotics/i.test(dName);
              return isGen && !isGarbage;
            }).map((m) => {
              const cleanId = m.name.replace(/^models\//, "");
              const isFree = isModelFree("gemini", cleanId, m.displayName);
              return {
                id: cleanId,
                name: formatDisplayName("gemini", { id: cleanId, displayName: m.displayName }),
                isFree
              };
            });
            filtered.sort((a, b) => {
              const priority = (id) => {
                if (id.includes("gemini-2.5-flash")) return 1;
                if (id.includes("gemini-2.0-flash")) return 2;
                if (id.includes("gemini-1.5-flash")) return 3;
                if (id.includes("gemini-1.5-pro")) return 4;
                if (id.includes("gemini-2.0-flash-lite")) return 5;
                if (id.includes("gemini-2.5-pro")) return 6;
                if (id.includes("gemini-flash-latest")) return 7;
                if (id.includes("gemini-pro-latest")) return 8;
                return 20;
              };
              return priority(a.id) - priority(b.id);
            });
            if (filtered.length > 0) {
              saveCachedModels(provider, filtered);
              return allowPaid ? filtered : filtered.filter((m) => m.isFree);
            }
          }
        }
        if (provider === "openai") {
          const res = await universalFetch("https://api.openai.com/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            }
          });
          if (res.ok) {
            const json = await res.json();
            const rawList = Array.isArray(json) ? json : json.data || [];
            const filtered = rawList.filter((m) => /^(gpt-|o1|o3|chatgpt)/i.test(m.id) && !/realtime|audio|transcription|tts|embedding|moderation|preview-2024|instruct/i.test(m.id)).map((m) => ({
              id: m.id,
              name: formatDisplayName("openai", m),
              isFree: false
            }));
            filtered.sort((a, b) => {
              const priority = (id) => {
                if (id === "gpt-4o-mini") return 1;
                if (id === "gpt-4o") return 2;
                if (id.startsWith("o3-mini")) return 3;
                if (id.startsWith("o1")) return 4;
                return 10;
              };
              return priority(a.id) - priority(b.id);
            });
            if (filtered.length > 0) {
              saveCachedModels(provider, filtered);
              return filtered;
            }
          }
        }
        if (provider === "deepseek") {
          try {
            const res = await universalFetch("https://api.deepseek.com/models", {
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              }
            });
            if (res.ok) {
              const json = await res.json();
              const rawList = Array.isArray(json) ? json : json.data || [];
              const models = rawList.map((m) => ({
                id: m.id,
                name: formatDisplayName("deepseek", m),
                isFree: false
              }));
              if (models.length > 0) {
                saveCachedModels(provider, models);
                return models;
              }
            }
          } catch (e) {
          }
          const curatedDeepSeek = PROVIDERS_CONFIG.deepseek.models;
          saveCachedModels(provider, curatedDeepSeek);
          return curatedDeepSeek;
        }
        return getModelsForProvider(provider, allowPaid);
      } catch (e) {
        console.warn(`[ModelFetcher] Erro ao buscar modelos ao vivo de ${provider}:`, e);
        return getModelsForProvider(provider, allowPaid);
      }
    })();
    inFlightFetches.set(provider, fetchPromise);
    try {
      const result = await fetchPromise;
      return allowPaid ? result : result.filter((m) => m.isFree !== false);
    } finally {
      inFlightFetches.delete(provider);
    }
  }

  // src/modules/reviewer.js
  async function reviewSingleQuestion(qNum, targetProvider, onLog, onGabaritoUpdated) {
    if (!qNum || isNaN(qNum)) return;
    const pName = PROVIDERS_CONFIG[targetProvider]?.name || targetProvider;
    updateGabaritoQuestion(qNum, { status: "processing" });
    if (onGabaritoUpdated) onGabaritoUpdated();
    if (onLog) onLog(`[Revis\xE3o Q${qNum}] \u{1F50D} Consultando 2\xAA Opini\xE3o com ${pName}...`, "info");
    const qCard = await navigateToQuestionCard(qNum);
    if (!qCard || !qCard.element) {
      if (onLog) onLog(`[Revis\xE3o Q${qNum}] Card da quest\xE3o n\xE3o encontrado na p\xE1gina.`, "error");
      updateGabaritoQuestion(qNum, { status: "failed", error: "Card n\xE3o localizado" });
      if (onGabaritoUpdated) onGabaritoUpdated();
      return;
    }
    const statement = extractStatement(qCard.element, qNum);
    const alternatives = extractAlternatives(qCard.element);
    if (alternatives.length < 2) {
      if (onLog) onLog(`[Revis\xE3o Q${qNum}] Alternativas n\xE3o encontradas.`, "error");
      updateGabaritoQuestion(qNum, { status: "failed", error: "Alternativas insuficientes" });
      if (onGabaritoUpdated) onGabaritoUpdated();
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
      updateGabaritoQuestion(qNum, {
        status: "done",
        letter: chosenLetter,
        explanation: `[Revisado por ${pName}] ${ans.explicacao || ""}`,
        error: null
      });
      if (onGabaritoUpdated) onGabaritoUpdated();
    } catch (err) {
      if (onLog) onLog(`[Revis\xE3o Q${qNum}] Erro: ${err.message}`, "error");
      updateGabaritoQuestion(qNum, {
        status: "failed",
        error: err.message
      });
      if (onGabaritoUpdated) onGabaritoUpdated();
    }
  }

  // src/ui/widget.js
  function createSuiteWidget() {
    if (document.getElementById("estacio-suite-box")) return;
    const ALL_PROVIDERS = ["groq", "gemini", "nous", "openrouter", "ollama", "mistral", "claude", "openai", "deepseek"];
    const isExam = window.location.hostname.includes("saladeavaliacoes.com.br");
    let currentProvider = getSaved("active_provider", "groq");
    let currentModel = getSaved("active_model", PROVIDERS_CONFIG[currentProvider]?.defaultModel || "llama-3.3-70b-versatile");
    let reviewProvider = getSaved("review_provider", "claude");
    let configTargetProvider = currentProvider;
    let showPaidModels = getShowPaidModels();
    let isBusy = false;
    const savedLogsRaw = localStorage.getItem("estacio_suite_logs");
    let initialLogs = [];
    try {
      initialLogs = JSON.parse(savedLogsRaw) || [];
    } catch (e) {
    }
    const mascotUrl = getMascotUrl();
    const box = document.createElement("div");
    box.id = "estacio-suite-box";
    box.innerHTML = `
    <div class="box-inner">
      <div class="box-header" id="box-drag-handle">
        <div class="box-title">
          <img src="${mascotUrl}" id="box-header-cat" class="cat-dancing-avatar" alt="Mascote" title="Clique no gatinho para recolher para a bolinha \u{1F43E}">
          <div class="box-title-info">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="title-gradient-text">Est\xE1cio Suite AI</span>
              <span class="version-badge">v2.5.5</span>
            </div>
            <span class="box-subtitle-tip">Clique no gatinho para recolher</span>
          </div>
        </div>
        <div class="box-controls">
          <button id="btn-audio-toggle" class="box-ctrl-btn" title="Ativar/Desativar Alertas Sonoros">${isAudioMuted() ? "\u{1F507}" : "\u{1F50A}"}</button>
          <button id="btn-clear-header" class="box-ctrl-btn" title="Limpar Logs e Cache">\u{1F9F9}</button>
          <button id="btn-copy-header" class="box-ctrl-btn" title="Copiar Logs">\u{1F4CB}</button>
          <button id="btn-min" class="box-ctrl-btn" title="Minimizar (vira bolha)">_</button>
          <button id="btn-hide" class="box-ctrl-btn" title="Ocultar (bot\xE3o flutuante)">\u2715</button>
        </div>
      </div>

      <div class="box-body">
        <!-- Card 1: Sele\xE7\xE3o Inteligente de IA & Modelo -->
        <div class="ui-card">
          <div class="ui-form-row">
            <span class="ui-form-label">\u{1F916} IA Ativa:</span>
            <select id="box-ai-select" class="ui-select"></select>
          </div>
          <div class="ui-form-row">
            <span class="ui-form-label">\u{1F9E0} Modelo:</span>
            <select id="box-model-select" class="ui-select"></select>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:2px;">
            <button id="btn-toggle-free-mode" class="pill-btn pill-btn-free" title="Alternar entre modelos 100% gratuitos ou todos os modelos">
              \u{1F7E2} Apenas Free
            </button>
            <button id="btn-refresh-models" class="btn-secondary-action" title="Buscar modelos ao vivo da API">
              <span>\u{1F504}</span> Sincronizar
            </button>
          </div>
        </div>

        <!-- Card 2: Painel de Cadastro e Teste Live de Chaves -->
        <div class="ui-card">
          <div class="ui-card-header">
            <span style="color:#38bdf8; font-size:11px; font-weight:700;">\u{1F511} Chave de API:</span>
            <select id="config-target-select" class="ui-select" style="max-width:145px; padding:3px 6px; font-size:10.5px;">
              <option value="groq">Groq</option>
              <option value="gemini">Google Gemini</option>
              <option value="nous">Nous Research / Portal</option>
              <option value="openrouter">OpenRouter (Free Tier)</option>
              <option value="ollama">Ollama (Local)</option>
              <option value="mistral">Mistral AI</option>
              <option value="claude">Anthropic Claude</option>
              <option value="openai">ChatGPT (OpenAI)</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          <div class="ui-form-row">
            <input type="password" id="box-key-input" class="ui-input" placeholder="Cole sua chave aqui...">
            <button id="btn-save-key" class="btn-secondary-action" style="background:#2563eb; color:#fff; border-color:#3b82f6; font-weight:700; padding:5px 10px;">
              \u{1F9EA} Salvar
            </button>
          </div>
        </div>

        <!-- Card 3: A\xE7\xE3o Principal e Contexto da P\xE1gina -->
        ${isExam ? `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:0 2px;">
            <span style="color:#a78bfa; font-weight:700;">\u{1F4CD} Sala de Avalia\xE7\xF5es</span>
            <span style="color:#34d399; font-weight:700; background:rgba(16,185,129,0.15); padding:2px 7px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">\u{1F7E2} Pronto</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-primary">
            <span>\u{1F3AF}</span> Resolver e Marcar Prova
          </button>

          <!-- Barra de Segunda Opini\xE3o / Revis\xE3o Direta -->
          <div class="review-config-bar">
            <span style="color:#c084fc; font-weight:700; font-size:11px;">\u{1F50D} 2\xAA Opini\xE3o com:</span>
            <select id="review-ai-select" class="ui-select" style="font-size:11px; max-width:180px;"></select>
          </div>
        ` : `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:0 2px;">
            <span style="color:#38bdf8; font-weight:700;">\u{1F4CD} Portal do Aluno</span>
            <span id="badge-automator-status" style="color:#34d399; font-weight:700; background:rgba(16,185,129,0.15); padding:2px 7px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">\u26A1 Auto-Temas</span>
          </div>
          <button id="btn-action-main" class="box-btn box-btn-success">
            <span>\u{1F4DA}</span> Concluir Temas Desta Mat\xE9ria
          </button>
        `}

        <!-- Card 4: Painel Visual do Gabarito Persistente -->
        <div id="gabarito-panel" class="gabarito-container" style="display:none;">
          <div class="gabarito-header">
            <span>\u{1F4DD} Gabarito (10 Quest\xF5es)</span>
            <div class="gabarito-header-actions">
              <button id="btn-apply-gabarito" class="btn-gabarito-apply" title="Aplica todas as respostas salvas no gabarito diretamente na prova sem gastar IA">
                \u26A1 Aplicar na Prova
              </button>
              <button id="btn-copy-gabarito" class="footer-btn" style="color:#38bdf8; font-weight:700;">
                \u{1F4CB} Copiar
              </button>
            </div>
          </div>
          <div id="gabarito-badges" class="gabarito-badges"></div>
        </div>

        <!-- Card 5: Terminal de Logs -->
        <div class="box-log" id="box-log"></div>
      </div>

      <div class="box-footer">
        <div style="display:flex; align-items:center; gap:6px; min-width:0; flex:1;">
          <span id="box-footer-model" style="color:#38bdf8; font-weight:600; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:130px;"></span>
          <div class="opacity-control-bar" title="Transpar\xEAncia quando o mouse estiver fora (Passe o mouse por cima para 100%)">
            <span style="font-size:10px; opacity:0.85;">\u{1F441}\uFE0F</span>
            <input type="range" id="box-opacity-slider" min="15" max="100" value="45" class="opacity-slider">
            <span id="box-opacity-val" class="opacity-val-badge">45%</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
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
    minMascotImg.src = mascotUrl;
    minMascotImg.className = "cat-bubble-avatar";
    minMascotImg.style.display = "none";
    box.appendChild(minMascotImg);
    const toggleBtn = document.createElement("div");
    toggleBtn.id = "estacio-suite-toggle-btn";
    toggleBtn.innerHTML = `<img src="${mascotUrl}" class="cat-bubble-avatar" alt="Mascote">`;
    toggleBtn.title = "Mostrar Est\xE1cio Suite AI";
    document.body.appendChild(box);
    document.body.appendChild(toggleBtn);
    const savedDisplayState = getSaved("widget_display_state", "expanded");
    if (savedDisplayState === "minimized") {
      box.classList.add("minimized");
      minMascotImg.style.display = "block";
      toggleBtn.style.display = "none";
    } else if (savedDisplayState === "hidden") {
      box.classList.add("hidden-box");
      toggleBtn.style.display = "flex";
      minMascotImg.style.display = "none";
    } else {
      box.classList.remove("hidden-box");
      box.classList.remove("minimized");
      minMascotImg.style.display = "none";
      toggleBtn.style.display = "none";
    }
    function expandWidget() {
      box.classList.remove("hidden-box");
      box.classList.remove("minimized");
      minMascotImg.style.display = "none";
      toggleBtn.style.display = "none";
      setSaved("widget_display_state", "expanded");
      requestAnimationFrame(() => {
        clampElementToViewport(box);
      });
    }
    function toggleMinimize() {
      const isMin = box.classList.toggle("minimized");
      minMascotImg.style.display = isMin ? "block" : "none";
      setSaved("widget_display_state", isMin ? "minimized" : "expanded");
      requestAnimationFrame(() => {
        clampElementToViewport(box);
      });
    }
    setupUniversalDraggable(box, box, () => {
      if (box.classList.contains("minimized")) {
        expandWidget();
      }
    });
    setupUniversalDraggable(toggleBtn, toggleBtn, () => {
      expandWidget();
    });
    window.addEventListener("resize", () => {
      if (!box.classList.contains("minimized") && !box.classList.contains("hidden-box")) {
        clampElementToViewport(box);
      }
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
      div.textContent = `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Pronto. Su\xEDte Est\xE1cio AI v2.5.5 pronta para uso.`;
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
    async function clearAllStoredData() {
      localStorage.removeItem("estacio_suite_logs");
      localStorage.removeItem("estacio_last_gabarito");
      localStorage.removeItem("estacio_catalog_queue");
      localStorage.removeItem("estacio_multi_queue");
      sessionStorage.removeItem("estacio_catalog_queue");
      sessionStorage.removeItem("estacio_multi_queue");
      if (logBox) logBox.innerHTML = "";
      const gabaritoPanel = document.getElementById("gabarito-panel");
      const gabaritoBadges = document.getElementById("gabarito-badges");
      if (gabaritoPanel) gabaritoPanel.style.display = "none";
      if (gabaritoBadges) gabaritoBadges.innerHTML = "";
      if (isExam) {
        await clearExamAnswers((msg, type) => log(msg, type), () => refreshGabaritoUI());
      }
      log("\u{1F9F9} Todos os logs, gabaritos e filas foram limpos com sucesso!", "success");
    }
    function updateToggleBtnState() {
      const btn = document.getElementById("btn-toggle-free-mode");
      if (!btn) return;
      if (showPaidModels) {
        btn.textContent = "\u{1F48E} Free + Pagos";
        btn.className = "pill-btn pill-btn-paid";
        btn.title = "Modo Completo Ativo (Mostrando modelos Free e Pagos). Clique para restringir a apenas 100% Free.";
      } else {
        btn.textContent = "\u{1F7E2} Apenas Free";
        btn.className = "pill-btn pill-btn-free";
        btn.title = "Modo 100% Free Ativo (Modelos pagos ocultos). Clique para exibir modelos pagos.";
      }
    }
    function renderProviderOptions() {
      const aiSelect2 = document.getElementById("box-ai-select");
      const reviewSelect2 = document.getElementById("review-ai-select");
      if (aiSelect2) {
        aiSelect2.innerHTML = "";
        ALL_PROVIDERS.forEach((pKey) => {
          const pConfig = PROVIDERS_CONFIG[pKey];
          const key = getApiKeyFor(pKey);
          const hasKey = Boolean(key);
          const badge = hasKey ? "\u{1F7E2}" : "\u{1F511}";
          const opt = document.createElement("option");
          opt.value = pKey;
          opt.textContent = `${badge} ${pConfig?.name || pKey}`;
          if (pKey === currentProvider) opt.selected = true;
          aiSelect2.appendChild(opt);
        });
      }
      if (reviewSelect2) {
        reviewSelect2.innerHTML = "";
        ALL_PROVIDERS.forEach((pKey) => {
          const pConfig = PROVIDERS_CONFIG[pKey];
          const key = getApiKeyFor(pKey);
          const hasKey = Boolean(key);
          const badge = hasKey ? "\u{1F7E2}" : "\u{1F511}";
          const opt = document.createElement("option");
          opt.value = pKey;
          opt.textContent = `${badge} ${pConfig?.name || pKey}`;
          if (pKey === reviewProvider) opt.selected = true;
          reviewSelect2.appendChild(opt);
        });
      }
      renderModelOptions(currentProvider, currentModel);
      updateFooterLabel();
    }
    function renderModelOptions(providerKey, selectedModelId) {
      const modelSelect2 = document.getElementById("box-model-select");
      if (!modelSelect2) return;
      modelSelect2.innerHTML = "";
      const models = getModelsForProvider(providerKey, showPaidModels);
      models.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.name;
        if (m.id === selectedModelId) opt.selected = true;
        modelSelect2.appendChild(opt);
      });
      if (models.length > 0 && !models.some((m) => m.id === selectedModelId)) {
        currentModel = models[0].id;
        setSaved("active_model", currentModel);
        modelSelect2.value = currentModel;
      }
    }
    async function refreshDynamicModelsFromAPI(providerKey, showLogs = false, force = false) {
      const key = getApiKeyFor(providerKey);
      if (!key && providerKey !== "ollama") return;
      const pName = PROVIDERS_CONFIG[providerKey]?.name || providerKey;
      if (showLogs) log(`\u{1F50D} Consultando modelos dispon\xEDveis na API de ${pName}...`, "info");
      try {
        const liveModels = await fetchLiveModels(providerKey, key, showPaidModels, force);
        if (liveModels.length > 0 && providerKey === currentProvider) {
          renderModelOptions(currentProvider, currentModel);
          updateFooterLabel();
          if (showLogs) log(`\u2705 [Live] ${liveModels.length} modelos sincronizados diretamente da API de ${pName}!`, "success");
        }
      } catch (e) {
        if (showLogs) log(`\u26A0\uFE0F N\xE3o foi poss\xEDvel sincronizar modelos ao vivo: ${e.message}`, "warning");
      }
    }
    function updateFooterLabel() {
      const footerEl = document.getElementById("box-footer-model");
      if (!footerEl) return;
      const pName = PROVIDERS_CONFIG[currentProvider]?.name || currentProvider;
      footerEl.textContent = `\u{1F7E2} ${pName} (${currentModel})`;
    }
    function refreshGabaritoUI() {
      const container = document.getElementById("gabarito-panel");
      const badgesEl = document.getElementById("gabarito-badges");
      renderSavedGabarito(container, badgesEl, reviewProvider, async (qNum, currentStatus) => {
        if (isBusy) return;
        isBusy = true;
        try {
          if (currentStatus === "done") {
            await reviewSingleQuestion(qNum, reviewProvider, log, refreshGabaritoUI);
          } else {
            await solveSingleQuestion(qNum, currentProvider, currentModel, log, refreshGabaritoUI);
          }
        } finally {
          isBusy = false;
        }
      });
    }
    const targetSelect = document.getElementById("config-target-select");
    const keyInput = document.getElementById("box-key-input");
    const aiSelect = document.getElementById("box-ai-select");
    const modelSelect = document.getElementById("box-model-select");
    const btnSaveKey = document.getElementById("btn-save-key");
    const btnRefreshModels = document.getElementById("btn-refresh-models");
    const btnToggleFreeMode = document.getElementById("btn-toggle-free-mode");
    const btnApplyGabarito = document.getElementById("btn-apply-gabarito");
    targetSelect.value = configTargetProvider;
    keyInput.value = getApiKeyFor(configTargetProvider);
    const savedIdleOpacity = localStorage.getItem("estacio_idle_opacity") || "45";
    box.style.setProperty("--widget-idle-opacity", `${parseInt(savedIdleOpacity, 10) / 100}`);
    const opacitySlider = document.getElementById("box-opacity-slider");
    const opacityValBadge = document.getElementById("box-opacity-val");
    if (opacitySlider && opacityValBadge) {
      opacitySlider.value = savedIdleOpacity;
      opacityValBadge.textContent = `${savedIdleOpacity}%`;
      opacitySlider.addEventListener("input", (e) => {
        const val = e.target.value;
        opacityValBadge.textContent = `${val}%`;
        box.style.setProperty("--widget-idle-opacity", `${parseInt(val, 10) / 100}`);
        localStorage.setItem("estacio_idle_opacity", val);
      });
    }
    updateToggleBtnState();
    renderProviderOptions();
    refreshDynamicModelsFromAPI(currentProvider, false);
    if (isExam) {
      const totalQ = getTotalExamQuestionsCount();
      initGabaritoStructure(totalQ, PROVIDERS_CONFIG[currentProvider]?.name);
      refreshGabaritoUI();
    }
    onStorageChange(() => {
      showPaidModels = getShowPaidModels();
      updateToggleBtnState();
      currentProvider = getSaved("active_provider", "groq");
      currentModel = getSaved("active_model", PROVIDERS_CONFIG[currentProvider]?.defaultModel);
      configTargetProvider = currentProvider;
      if (targetSelect) targetSelect.value = currentProvider;
      if (keyInput) keyInput.value = getApiKeyFor(currentProvider);
      renderProviderOptions();
      refreshDynamicModelsFromAPI(currentProvider, false);
      if (isExam) refreshGabaritoUI();
    });
    if (btnToggleFreeMode) {
      btnToggleFreeMode.addEventListener("click", (e) => {
        e.preventDefault();
        showPaidModels = !showPaidModels;
        setShowPaidModels(showPaidModels);
        updateToggleBtnState();
        renderModelOptions(currentProvider, currentModel);
        updateFooterLabel();
        log(showPaidModels ? "\u{1F48E} Modo Completo: Exibindo modelos Free e Pagos/Premium." : "\u{1F7E2} Modo 100% Free: Exibindo apenas modelos gratuitos.", "info");
      });
    }
    if (btnApplyGabarito) {
      btnApplyGabarito.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (isBusy) return;
        isBusy = true;
        btnApplyGabarito.disabled = true;
        btnApplyGabarito.textContent = "\u23F3 Marcando...";
        try {
          await applySavedGabaritoToDOM(log, refreshGabaritoUI);
        } finally {
          isBusy = false;
          btnApplyGabarito.disabled = false;
          btnApplyGabarito.textContent = "\u26A1 Aplicar na Prova";
        }
      });
    }
    aiSelect.addEventListener("change", async (e) => {
      currentProvider = e.target.value;
      currentModel = PROVIDERS_CONFIG[currentProvider]?.defaultModel;
      setSaved("active_provider", currentProvider);
      setSaved("active_model", currentModel);
      configTargetProvider = currentProvider;
      targetSelect.value = currentProvider;
      keyInput.value = getApiKeyFor(currentProvider);
      renderModelOptions(currentProvider, currentModel);
      updateFooterLabel();
      log(`IA ativa alterada para: ${PROVIDERS_CONFIG[currentProvider]?.name}`, "success");
      await refreshDynamicModelsFromAPI(currentProvider, true);
    });
    targetSelect.addEventListener("change", (e) => {
      configTargetProvider = e.target.value;
      setSaved("config_target_provider", configTargetProvider);
      keyInput.value = getApiKeyFor(configTargetProvider);
    });
    modelSelect.addEventListener("change", (e) => {
      currentModel = e.target.value;
      setSaved("active_model", currentModel);
      updateFooterLabel();
      log(`\u{1F3AF} Modelo ativo definido para: ${currentModel}`, "success");
    });
    if (btnRefreshModels) {
      btnRefreshModels.addEventListener("click", async (e) => {
        e.preventDefault();
        btnRefreshModels.disabled = true;
        btnRefreshModels.textContent = "\u23F3 Buscando...";
        await refreshDynamicModelsFromAPI(currentProvider, true, true);
        btnRefreshModels.disabled = false;
        btnRefreshModels.innerHTML = "<span>\u{1F504}</span> Sincronizar";
      });
    }
    btnSaveKey.addEventListener("click", async () => {
      const p = configTargetProvider;
      const val = keyInput.value.trim();
      const pName = PROVIDERS_CONFIG[p]?.name || p;
      const selectedModelFromDom = document.getElementById("box-model-select")?.value;
      const targetModelToTest = (p === currentProvider && selectedModelFromDom ? selectedModelFromDom : null) || currentModel || PROVIDERS_CONFIG[p]?.defaultModel;
      if (!val && p !== "ollama") {
        setApiKeyFor(p, "");
        setSaved(`status_${p}`, "error");
        renderProviderOptions();
        log(`Chave do ${pName} removida.`, "warning");
        return;
      }
      btnSaveKey.disabled = true;
      btnSaveKey.textContent = "\u23F3 Testando...";
      log(`Testando chave de ${pName} (com modelo ${targetModelToTest})...`, "info");
      try {
        const testRes = await testProviderKey(p, val || "http://localhost:11434", targetModelToTest);
        setApiKeyFor(p, val || (p === "ollama" ? "http://localhost:11434" : ""));
        setSaved("active_provider", p);
        currentProvider = p;
        const dynamicModels = await fetchLiveModels(p, val, showPaidModels, true);
        if (testRes.model) {
          currentModel = testRes.model;
        } else if (dynamicModels.length > 0 && !dynamicModels.some((m) => m.id === currentModel)) {
          currentModel = dynamicModels[0]?.id || PROVIDERS_CONFIG[p]?.defaultModel;
        }
        setSaved("active_model", currentModel);
        renderProviderOptions();
        if (testRes.warning) {
          log(`\u26A0\uFE0F ${testRes.warning}`, "warning");
        }
        log(`\u2705 [Live] ${pName} configurado com sucesso e ativo! (Modelo: ${currentModel}) \u{1F7E2}`, "success");
      } catch (err) {
        log(`\u274C Falha no teste do ${pName}: ${err.message}`, "error");
      } finally {
        btnSaveKey.disabled = false;
        btnSaveKey.textContent = "\u{1F9EA} Salvar";
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
    const btnAudio = document.getElementById("btn-audio-toggle");
    if (btnAudio) {
      btnAudio.addEventListener("click", (e) => {
        e.stopPropagation();
        const isMuted = !isAudioMuted();
        setAudioMuted(isMuted);
        btnAudio.textContent = isMuted ? "\u{1F507}" : "\u{1F50A}";
        if (!isMuted) {
          try {
            playAttentionSound();
          } catch (err) {
          }
        }
        log(isMuted ? "\u{1F507} Alertas sonoros desativados." : "\u{1F50A} Alertas sonoros ativados!", "info");
      });
    }
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
    const headerCat = document.getElementById("box-header-cat");
    if (headerCat) {
      headerCat.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMinimize();
      });
    }
    document.getElementById("btn-min").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMinimize();
    });
    document.getElementById("btn-hide").addEventListener("click", (e) => {
      e.stopPropagation();
      box.classList.add("hidden-box");
      toggleBtn.style.display = "flex";
      setSaved("widget_display_state", "hidden");
      requestAnimationFrame(() => {
        clampElementToViewport(toggleBtn);
      });
    });
    const actionBtn = document.getElementById("btn-action-main");
    if (isExam) {
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
      let updateAutomatorBtn = function() {
        const isRunning = isAnyAutomationRunning();
        if (isRunning) {
          actionBtn.innerHTML = "<span>\u23F9\uFE0F</span> Parar Automa\xE7\xE3o";
          actionBtn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
          actionBtn.style.borderColor = "#ef4444";
          if (statusBadge) {
            statusBadge.textContent = "\u26A1 Concluindo...";
            statusBadge.style.color = "#fbbf24";
            statusBadge.style.background = "rgba(251,191,36,0.15)";
            statusBadge.style.borderColor = "rgba(251,191,36,0.3)";
          }
        } else {
          actionBtn.innerHTML = "<span>\u{1F4DA}</span> Concluir Temas Desta Mat\xE9ria";
          actionBtn.style.background = "";
          actionBtn.style.borderColor = "";
          if (statusBadge) {
            statusBadge.textContent = "\u26A1 Pronto";
            statusBadge.style.color = "#34d399";
            statusBadge.style.background = "rgba(16,185,129,0.15)";
            statusBadge.style.borderColor = "rgba(16,185,129,0.3)";
          }
        }
      };
      const statusBadge = document.getElementById("badge-automator-status");
      updateAutomatorBtn();
      actionBtn.addEventListener("click", () => {
        if (isAnyAutomationRunning()) {
          cancelAllAutomations(log);
          updateAutomatorBtn();
        } else {
          startThemeCompletion(log);
          updateAutomatorBtn();
        }
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
    function saveCapturedToken(token) {
      if (!token || typeof token !== "string" || token.length < 20) return;
      const clean = token.replace(/^Bearer\s+/i, "").trim();
      if (clean) {
        window.__estacio_bearer = clean;
        try {
          sessionStorage.setItem("estacio_bearer", clean);
        } catch (e) {
        }
        try {
          localStorage.setItem("estacio_bearer", clean);
        } catch (e) {
        }
      }
    }
    if (typeof window !== "undefined" && window.location.hostname.includes("estudante.estacio.br")) {
      const origFetch = window.fetch;
      window.fetch = async function(...args) {
        try {
          const headers = args[1]?.headers;
          if (headers) {
            let auth = null;
            if (typeof headers.get === "function") {
              auth = headers.get("Authorization") || headers.get("authorization");
            } else if (Array.isArray(headers)) {
              const entry = headers.find(([k]) => k.toLowerCase() === "authorization");
              if (entry) auth = entry[1];
            } else if (typeof headers === "object") {
              auth = headers["Authorization"] || headers["authorization"];
            }
            if (auth && auth.startsWith("Bearer ")) {
              saveCapturedToken(auth);
            }
          }
        } catch (e) {
        }
        return origFetch.apply(this, args);
      };
      const origXHR = window.XMLHttpRequest.prototype.setRequestHeader;
      window.XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header && header.toLowerCase() === "authorization" && value && value.startsWith("Bearer ")) {
          saveCapturedToken(value);
        }
        return origXHR.apply(this, arguments);
      };
      const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : null;
      if (pageWindow && pageWindow !== window) {
        try {
          const uFetch = pageWindow.fetch;
          if (typeof uFetch === "function") {
            pageWindow.fetch = async function(...args) {
              try {
                const headers = args[1]?.headers;
                if (headers) {
                  let auth = null;
                  if (typeof headers.get === "function") {
                    auth = headers.get("Authorization") || headers.get("authorization");
                  } else if (Array.isArray(headers)) {
                    const entry = headers.find(([k]) => k.toLowerCase() === "authorization");
                    if (entry) auth = entry[1];
                  } else if (typeof headers === "object") {
                    auth = headers["Authorization"] || headers["authorization"];
                  }
                  if (auth && auth.startsWith("Bearer ")) {
                    saveCapturedToken(auth);
                  }
                }
              } catch (e) {
              }
              return uFetch.apply(this, args);
            };
          }
          if (pageWindow.XMLHttpRequest && pageWindow.XMLHttpRequest.prototype) {
            const uXHR = pageWindow.XMLHttpRequest.prototype.setRequestHeader;
            pageWindow.XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
              if (header && header.toLowerCase() === "authorization" && value && value.startsWith("Bearer ")) {
                saveCapturedToken(value);
              }
              return uXHR.apply(this, arguments);
            };
          }
        } catch (e) {
        }
      }
      window.addEventListener("estacio_token_captured", (e) => {
        if (e.detail && e.detail.token) {
          saveCapturedToken(e.detail.token);
        }
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createSuiteWidget);
    } else {
      createSuiteWidget();
    }
  })();
})();

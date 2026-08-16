// Build script para empacotar os módulos src/ em estacio_solver.user.js e content/content.js

import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERSCRIPT_BANNER = `// ==UserScript==
// @name         Estácio Suite AI (Solver, Gabarito & Revisão Multi-IA)
// @namespace    https://github.com/m3coder/estragacio
// @version      2.5.5
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
`;

// Plugin do esbuild para embutir CSS diretamente no bundle JS
const inlineCssPlugin = {
  name: 'inline-css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const cssContent = await fs.promises.readFile(args.path, 'utf8');
      const escapedCss = JSON.stringify(cssContent);
      const jsContent = `
        if (typeof GM_addStyle !== 'undefined') {
          GM_addStyle(${escapedCss});
        } else if (typeof document !== 'undefined') {
          const styleEl = document.createElement('style');
          styleEl.textContent = ${escapedCss};
          document.head.appendChild(styleEl);
        }
      `;
      return { contents: jsContent, loader: 'js' };
    });
  }
};

async function build() {
  console.log('⚡ Empacotando Estácio Suite AI modular...');

  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.js')],
    bundle: true,
    write: false,
    format: 'iife',
    plugins: [inlineCssPlugin],
    target: ['es2020']
  });

  const bundledCode = result.outputFiles[0].text;

  // 1. Gera o Userscript do Tampermonkey com cabeçalho
  const userscriptPath = path.join(__dirname, 'estacio_solver.user.js');
  fs.writeFileSync(userscriptPath, `${USERSCRIPT_BANNER}\n${bundledCode}`, 'utf8');
  console.log(`✅ Userscript gerado com sucesso: ${userscriptPath}`);

  // 2. Gera o Content Script da Extensão Chrome
  const contentScriptPath = path.join(__dirname, 'content/content.js');
  fs.writeFileSync(contentScriptPath, `// Estácio Suite AI - Content Script Bundle (MV3)\n${bundledCode}`, 'utf8');
  console.log(`✅ Content Script gerado com sucesso: ${contentScriptPath}`);

  // 3. Compila o Interceptor Main World para MV3
  const interceptorResult = await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/interceptor.js')],
    bundle: true,
    write: false,
    format: 'iife',
    target: ['es2020']
  });
  const interceptorPath = path.join(__dirname, 'content/interceptor.js');
  fs.writeFileSync(interceptorPath, `// Estácio Suite AI - Main World Interceptor (MV3)\n${interceptorResult.outputFiles[0].text}`, 'utf8');
  console.log(`✅ Interceptor Main World gerado com sucesso: ${interceptorPath}`);

  // 4. Atualiza o overlay.css sincronizado
  const cssSource = path.join(__dirname, 'src/ui/widget.css');
  const cssTarget = path.join(__dirname, 'content/overlay.css');
  fs.copyFileSync(cssSource, cssTarget);
  console.log(`✅ CSS sincronizado com sucesso: ${cssTarget}`);

  console.log('🎉 Build completo finalizado com 100% de sucesso!');
}

build().catch((err) => {
  console.error('❌ Erro no build:', err);
  process.exit(1);
});

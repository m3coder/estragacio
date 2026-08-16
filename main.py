#!/usr/bin/env python3
"""
Script independente do projeto: automação Estácio (login Microsoft,
listagem de disciplinas, conclusões por tema via API).
Sessão persistida em ./estacio_session.

Uso:
  pip install -r requirements-estacio.txt
  playwright install chromium
  python main.py

Credenciais: variáveis de ambiente ESTACIO_EMAIL, ESTACIO_PASSWORD,
ESTACIO_MATRICULA ou um .env na mesma pasta (opcional).
"""
import asyncio
import os
import re
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

from playwright.async_api import async_playwright

try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False

# Constantes
BASE_URL = "https://estudante.estacio.br"
DISCIPLINAS_URL = f"{BASE_URL}/disciplinas"
API_BASE = "https://apis.estudante.estacio.br"
SESSION_DIR = Path(__file__).resolve().parent / "estacio_session"
MAX_DISCIPLINAS_PERIODO = 5  # só 5 disciplinas por semestre; ignora turmas de outros períodos

# --- Relação dos IDs (API/URL) ---
# Cada turma_id (ex: estacio_14226213) = 1 disciplina. Esse mesmo turma_id se repete em todos os temas
# dentro da disciplina. Cada tema tem seu próprio tema_id e conteudo_uuid, mas todos usam o mesmo turma_id.
# POST conclusão: /rest/turmas/{turma_id}/temas/{tema_id}/conteudos/{conteudo_uuid}/conclusoes
#
# --- Seletores para mapear temas (página /disciplinas/estacio_XXX/conteudos) ---
# Cada tema = card com button "Acessar [NOME]". Cards em main > article > ... > article.
SELECTOR_CARDS_TEMA = "main article article"  # um por tema (Tema 1, Tema 2, ...)
SELECTOR_BOTAO_DENTRO_CARD_TEMA = "button"  # dentro de cada card: botão "Acessar [nome do tema]"
ESPERA_APOS_POST_SEG = 2.5  # esperar 2–3 s após POST antes de reload e "Marcar como concluído"
LARGURA_BARRA = 24  # caracteres da barra de progresso no log

# Credenciais: .env > variáveis de ambiente > input no terminal (opcional fallback no .env)
def _get_email() -> str:
    return (
        os.environ.get("ESTACIO_EMAIL")
        or input("Email Estácio (ex: xxx@alunos.estacio.br): ").strip()
    )


def _get_password() -> str:
    return (
        os.environ.get("ESTACIO_PASSWORD")
        or input("Senha Estácio: ").strip()
    )


def _get_matricula(email: str) -> str:
    matricula = os.environ.get("ESTACIO_MATRICULA", "").strip()
    if matricula:
        return matricula
    if "@" in email:
        return email.split("@")[0]
    return ""


async def _login_microsoft(page, email: str, password: str) -> bool:
    """Preenche e submete o formulário de login Microsoft (email i0116; senha input name=passwd / id i0118 / aria-label / placeholder)."""
    # Email: só preenche se a tela de email estiver visível (às vezes a Microsoft já mostra a tela de senha)
    try:
        email_sel = 'input#i0116'
        await page.wait_for_selector(email_sel, timeout=15_000)
        await page.fill(email_sel, email)
        await page.click('input[type="submit"]')
        await page.wait_for_load_state("load", timeout=15_000)
    except Exception as e:
        # Pode já estar na tela de senha (campo email não aparece)
        ja_na_senha = (
            await page.locator('input[name="passwd"]').count() > 0
            or await page.locator("input[type='password']").count() > 0
        )
        if not ja_na_senha:
            print(f"[Login] Campo email não encontrado ou timeout: {e}")
            return False
        # Já estamos na tela de senha, segue para preencher senha

    try:
        # Senha: input name="passwd", id i0118
        pwd_loc = None
        for candidate in [
            page.locator('input[name="passwd"]'),
            page.locator("input#i0118"),
        ]:
            if await candidate.count() > 0:
                try:
                    await candidate.wait_for(state="visible", timeout=10_000)
                    await asyncio.sleep(1.5) # Aguarda a animação de transição da Microsoft
                    pwd_loc = candidate
                    break
                except Exception:
                    continue
        if pwd_loc is None:
            raise RuntimeError("Campo de senha não encontrado.")
            
        await pwd_loc.click() # Foca no campo
        await pwd_loc.fill(password)
        await asyncio.sleep(0.5)
        
        # Clica no botão Entrar
        btn = page.locator('#idSIButton9, input[type="submit"], button[type="submit"]').first
        await btn.click()
        
        # Aguarda a requisição de login: a URL vai mudar ou aparecerá o botão "Não" (Permanecer conectado)
        for _ in range(30):
            if "login.microsoftonline.com" not in page.url:
                break
            try:
                no_btn = page.locator('input[value="Não"]').first
                if await no_btn.count() > 0 and await no_btn.is_visible():
                    break
            except Exception:
                pass
            await asyncio.sleep(0.5)
    except Exception as e:
        print(f"[Login] Campo senha não encontrado ou timeout: {e}")
        return False

    # "Permanecer conectado?" – clicar em Não se aparecer
    try:
        no_btn = page.locator('input[value="Não"]')
        if await no_btn.count() > 0:
            await no_btn.click()
            await page.wait_for_load_state("load", timeout=10_000)
    except Exception:
        pass

    return True


def _parse_disciplina_url(href: str) -> tuple[str | None, str | None]:
    """Extrai (turma_id, conteudo_uuid) de URL tipo /disciplinas/estacio_XXX/conteudos/UUID."""
    if not href or BASE_URL not in href:
        return None, None
    path = urlparse(href).path
    # .../disciplinas/estacio_14226213/conteudos/772d7595-12f8-4b5f-b021-6f10b18c4f73
    m = re.search(r"/disciplinas/(estacio_\d+)/conteudos/([a-f0-9-]{36})", path)
    if m:
        return m.group(1), m.group(2)
    # só turma: .../disciplinas/estacio_14226213/...
    m = re.search(r"/disciplinas/(estacio_\d+)", path)
    if m:
        return m.group(1), None
    return None, None


def _parse_disciplina_url_flex(href: str) -> tuple[str | None, str | None]:
    """Aceita qualquer ID de turma após /disciplinas/ (fallback se o site mudar formato)."""
    if not href or BASE_URL not in href:
        return None, None
    path = urlparse(href).path
    m = re.search(r"/disciplinas/([a-zA-Z0-9_.-]+)/conteudos/([a-f0-9-]{36})", path)
    if m:
        return m.group(1), m.group(2)
    m = re.search(r"/disciplinas/([a-zA-Z0-9_.-]+)(?:/|$)", path)
    if m:
        return m.group(1), None
    return None, None


def _parse_tema_from_url(href: str) -> str | None:
    """Extrai tema=XXXXX da query string."""
    parsed = urlparse(href)
    qs = parse_qs(parsed.query)
    temas = qs.get("tema", [])
    return temas[0] if temas else None


def _parse_conteudo_uuid_from_path(href: str) -> str | None:
    """Extrai UUID do conteudo do path (.../conteudos/UUID?tema=...)."""
    path = urlparse(href).path
    m = re.search(r"/conteudos/([a-f0-9-]{36})", path)
    return m.group(1) if m else None


def _parse_conclusao_from_url(url: str) -> tuple[str | None, str | None, str | None]:
    """
    Extrai (turma_id, tema_id, conteudo_uuid) da URL da página de um conteúdo.
    Ex.: .../disciplinas/estacio_14226213/conteudos/d85aa8ee-...-cb66?tema=00923
    Ou path: .../temas/00923/conteudos/uuid
    """
    parsed = urlparse(url)
    path = parsed.path
    qs = parse_qs(parsed.query)
    tema_id = (qs.get("tema") or [None])[0]
    if not tema_id and path:
        m = re.search(r"/temas/([A-Za-z0-9_-]+)(?:/|$)", path)
        if m:
            tema_id = m.group(1)
    m_turma = re.search(r"/disciplinas/(estacio_\d+)", path)
    m_uuid = re.search(r"/conteudos/([a-f0-9-]{36})", path)
    turma_id = m_turma.group(1) if m_turma else None
    conteudo_uuid = m_uuid.group(1) if m_uuid else None
    return (turma_id, tema_id, conteudo_uuid)


def _progress_bar(current: int, total: int, width: int = LARGURA_BARRA) -> str:
    """Retorna string tipo [########--------] 4/8 para log de progresso."""
    if total <= 0:
        return "[] 0/0"
    filled = int(width * current / total) if total else 0
    bar = "█" * filled + "░" * (width - filled)
    return f"[{bar}] {current}/{total}"


def _extract_turma_ids_from_json(obj: object) -> list[str]:
    """Extrai IDs do tipo estacio_XXXXX de um JSON (dict/lista) recursivamente."""
    out: list[str] = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("turmaId", "turma_id", "id") and isinstance(v, str) and re.match(r"estacio_\d+", v):
                out.append(v)
            else:
                out.extend(_extract_turma_ids_from_json(v))
    elif isinstance(obj, list):
        for item in obj:
            out.extend(_extract_turma_ids_from_json(item))
    return list(dict.fromkeys(out))


def _extract_temas_conteudos_from_json(obj: object) -> list[tuple[str, str]]:
    """Extrai pares (conteudo_uuid, tema_id) de um JSON (resposta da API de temas/conteudos)."""
    pares: list[tuple[str, str]] = []
    uuid_re = re.compile(r"^[a-f0-9-]{36}$")

    def walk(o: object, tema_id: str | None = None, conteudo_uuid: str | None = None):
        nonlocal pares
        if isinstance(o, dict):
            tid = tema_id
            cid = conteudo_uuid
            if "temaId" in o and isinstance(o["temaId"], str):
                tid = o["temaId"]
            if "tema_id" in o and isinstance(o["tema_id"], str):
                tid = o["tema_id"]
            if "conteudoId" in o and isinstance(o["conteudoId"], str) and uuid_re.match(o["conteudoId"]):
                cid = o["conteudoId"]
            if "conteudo_id" in o and isinstance(o["conteudo_id"], str) and uuid_re.match(o["conteudo_id"]):
                cid = o["conteudo_id"]
            if "uuid" in o and isinstance(o["uuid"], str) and uuid_re.match(o["uuid"]):
                cid = o["uuid"]
            if "id" in o and isinstance(o["id"], str):
                if uuid_re.match(o["id"]):
                    cid = o["id"]
                elif not tid and re.match(r"^[A-Za-z0-9_-]+$", o["id"]):
                    tid = o["id"]
            for _, v in o.items():
                walk(v, tid, cid)
            if tid and cid:
                pares.append((cid, tid))
        elif isinstance(o, list):
            for item in o:
                walk(item, tema_id, conteudo_uuid)

    walk(obj)
    return list(dict.fromkeys(pares))


async def _capture_bearer(page) -> str | None:
    """Captura o Bearer token das requisições para apis.estudante.estacio.br."""
    token_holder: list[str] = []

    def handle_request(request):
        url = request.url
        if "apis.estudante.estacio.br" not in url:
            return
        auth = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            token_holder.append(auth[7:].strip())

    page.on("request", handle_request)
    # Força uma navegação que dispare chamadas à API (ex.: própria página de disciplinas)
    await page.goto(DISCIPLINAS_URL, wait_until="load", timeout=45_000)
    await asyncio.sleep(2)
    page.remove_listener("request", handle_request)

    # Também tenta pegar do localStorage (alguns SPAs guardam o token)
    try:
        storage = await page.evaluate(
            """() => {
            const keys = ['token', 'accessToken', 'access_token', 'bearer'];
            for (const k of keys) {
                const v = localStorage.getItem(k) || sessionStorage.getItem(k);
                if (v) return v;
            }
            return null;
        }"""
        )
        if storage:
            return storage.strip()
    except Exception:
        pass

    return token_holder[0] if token_holder else None


async def _need_login(page) -> bool:
    """Verifica se estamos na tela de login Microsoft (email i0116 ou campo senha passwd/password)."""
    try:
        await page.wait_for_selector("input#i0116", timeout=5_000)
        return True
    except Exception:
        pass
    try:
        for sel in ['input[name="passwd"]', 'input#i0118']:
            loc = page.locator(sel).first
            if await loc.count() > 0 and await loc.is_visible():
                return True
    except Exception:
        pass
    return False


async def _is_estacio_login_page(page) -> bool:
    """Verifica se estamos na tela de login da Estácio (botão Entrar / section#section-login)."""
    try:
        # Botão "Entrar" da tela de login Estácio (aria-label ou texto)
        btn = page.get_by_role("button", name="Entrar")
        if await btn.count() > 0 and await btn.is_visible():
            return True
    except Exception:
        pass
    try:
        if await page.locator("section#section-login").count() > 0:
            return True
    except Exception:
        pass
    return False


async def _click_estacio_entrar(page) -> bool:
    """Clica no botão Entrar da tela de login Estácio (leva ao login Microsoft)."""
    try:
        entrar = page.get_by_role("button", name="Entrar")
        # Estácio faz um AJAX antes de redirecionar para a Microsoft
        async with page.expect_navigation(timeout=30_000):
            await entrar.first.click(timeout=10_000)
        await asyncio.sleep(1)
        return True
    except Exception as e:
        print(f"[Login Estácio] Botão Entrar não navegou: {e}")
        return False


async def run():
    # Saída imediata para TUI/subprocess (antes de qualquer input)
    print("Iniciando... (carregando sessão e disciplinas)", flush=True)
    email = _get_email()
    if not email:
        print("ERRO: Defina ESTACIO_EMAIL no .env", flush=True)
        return
    password = _get_password()
    if not password:
        print("ERRO: Defina ESTACIO_PASSWORD no .env", flush=True)
        return
    matricula = _get_matricula(email)
    if not matricula:
        matricula = os.environ.get("ESTACIO_MATRICULA", "").strip()
    if not matricula:
        print("ERRO: Defina ESTACIO_MATRICULA no .env", flush=True)
        return

    SESSION_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        # Contexto persistente para manter cookies e localStorage
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            viewport={"width": 1280, "height": 800},
            locale="pt-BR",
            ignore_https_errors=True,
        )
        page = context.pages[0] if context.pages else await context.new_page()
        if not context.pages:
            await page.goto(DISCIPLINAS_URL, wait_until="domcontentloaded", timeout=60_000)
        else:
            await page.goto(DISCIPLINAS_URL, wait_until="domcontentloaded", timeout=60_000)

        # Aguarda 1–2 s para o redirect ou SPA mostrar tela de login (se sessão inválida)
        await asyncio.sleep(2)

        # 1) Tela de login Estácio (botão "Entrar" / section#section-login) – clica para ir ao Microsoft
        if await _is_estacio_login_page(page):
            print("Tela de login Estácio detectada. Clicando em Entrar...")
            if not await _click_estacio_entrar(page):
                print("Não foi possível clicar em Entrar. Verifique a página.")
                await context.close()
                return
            await asyncio.sleep(1)

        # 2) Login Microsoft (após Estracio ou redirect direto)
        if "login.microsoftonline.com" in page.url or await _need_login(page):
            print("Fazendo login Microsoft...")
            ok = await _login_microsoft(page, email, password)
            if not ok:
                print("Falha no login. Verifique email/senha.")
                await context.close()
                return
            try:
                await page.goto(DISCIPLINAS_URL, wait_until="load", timeout=60_000)
            except Exception as e:
                print(f"Aviso: goto disciplinas: {e}. Tentando continuar...")
        elif "login" in urlparse(page.url).path or await _is_estacio_login_page(page):
            # URL ainda é /login ou SPA ainda mostra login
            print("Ainda na tela de login. Clicando em Entrar...")
            await _click_estacio_entrar(page)
            if "login.microsoftonline.com" in page.url or await _need_login(page):
                ok = await _login_microsoft(page, email, password)
                if not ok:
                    await context.close()
                    return
                await page.goto(DISCIPLINAS_URL, wait_until="load", timeout=60_000)
        else:
            print("Sessão existente carregada.")

        # Garante que estamos na URL de disciplinas (não em /login)
        if "/disciplinas" not in page.url or "login" in page.url:
            try:
                await page.goto(DISCIPLINAS_URL, wait_until="load", timeout=60_000)
            except Exception:
                pass
                
        # Atualiza a página forçadamente para contornar o "bug visual" que o usuário relatou
        # e garantir que a SPA faça as chamadas de API novamente para o script capturar o token.
        try:
            await page.reload(wait_until="load", timeout=30_000)
        except Exception:
            pass
        await asyncio.sleep(2)

        # Espera a lista de disciplinas (SPA)
        try:
            await page.wait_for_selector(
                '[data-lift="lft-cardshape"], [data-testid^="card-disciplina-v2-"], '
                'main [data-lift="lft-cardbase"], article.component',
                timeout=30_000,
            )
        except Exception:
            pass
        await asyncio.sleep(2)

        # Captura Bearer para as requisições de conclusão
        bearer = await _capture_bearer(page)
        if not bearer:
            print("Aviso: Bearer não capturado. As requisições de conclusão podem falhar.")
        else:
            print("Bearer capturado com sucesso.")

        # --- Coleta IDs das turmas: priorizar SEMPRE a lista visível na página (período atual) ---
        # A API devolve turmas de todos os semestres; a página /disciplinas mostra só o período atual.
        seen_turmas: set[str] = set()
        unique_disciplines: list[tuple[str, str, str | None]] = []

        # 1) PRIORIDADE: turmas visíveis na página = período atual (links + nome da matéria)
        try:
            itens_visiveis = await page.evaluate("""
                () => {
                    const main = document.querySelector('main');
                    if (!main) return [];
                    const out = [];
                    const seen = new Set();
                    function add(href, nome) {
                        const h = (href || '').trim();
                        if (!h || seen.has(h)) return;
                        seen.add(h);
                        const full = h.startsWith('/') ? 'https://estudante.estacio.br' + h : h;
                        const title = (nome || '').trim().slice(0, 80);
                        out.push({ href: full, nome: title });
                    }
                    // Links em main: pega href e nome do card ou do link
                    main.querySelectorAll('a[href*="/disciplinas/estacio_"]').forEach(a => {
                        const h = a.getAttribute('href') || '';
                        const card = a.closest('[data-testid^="card-disciplina"], [data-lift="lft-cardbase"], [class*="card"]');
                        const nome = card ? (card.querySelector('h2, h3, [class*="title"]')?.textContent || card.textContent || a.textContent || '').trim() : (a.textContent || '').trim();
                        add(h, nome);
                    });
                    if (out.length === 0) {
                        main.querySelectorAll('[data-testid^="card-disciplina-v2-"], [data-lift="lft-cardbase"]').forEach(card => {
                            const a = card.querySelector('a[href*="/disciplinas/estacio_"]');
                            if (a) {
                                const h = a.getAttribute('href') || '';
                                const nome = (card.querySelector('h2, h3, [class*="title"]') || card).textContent || '';
                                add(h, nome);
                            }
                        });
                    }
                    return out;
                }
            """)
            for item in itens_visiveis:
                href = item.get("href") or item if isinstance(item, str) else ""
                nome = item.get("nome") if isinstance(item, dict) else None
                turma_id, _ = _parse_disciplina_url(href)
                if turma_id and turma_id not in seen_turmas:
                    seen_turmas.add(turma_id)
                    full_href = href if href.startswith("http") else f"{BASE_URL}{href}"
                    unique_disciplines.append((full_href, turma_id, nome or None))
            if unique_disciplines:
                if len(unique_disciplines) > MAX_DISCIPLINAS_PERIODO:
                    unique_disciplines = unique_disciplines[:MAX_DISCIPLINAS_PERIODO]
                    print(f"(Limitado a {MAX_DISCIPLINAS_PERIODO} disciplinas do período atual.)")
                print("(Turmas obtidas dinamicamente da lista visível na página = período atual.)")
        except Exception as e:
            print(f"(Aviso: não foi possível ler turmas da página: {e})")

        # 2) Fallback: clicar nos cards visíveis (ordem da página) e extrair turma_id da URL = 100% dinâmico
        if len(unique_disciplines) == 0:
            await page.evaluate("""() => {
                const el = document.querySelector('[data-testid="section-chat-assistente-pessoal"]');
                if (el) el.style.setProperty('display', 'none');
            }""")
            await asyncio.sleep(0.3)
            card_sel = 'main [data-testid^="card-disciplina-v2-"], main [data-lift="lft-cardbase"]'
            n_cards = await page.locator(card_sel).count()
            for i in range(n_cards):
                try:
                    await page.evaluate("""() => {
                        const el = document.querySelector('[data-testid="section-chat-assistente-pessoal"]');
                        if (el) el.style.setProperty('display', 'none');
                    }""")
                    await asyncio.sleep(0.2)
                    card = page.locator(card_sel).nth(i)
                    await card.scroll_into_view_if_needed(timeout=5000)
                    await card.click(timeout=10_000)
                    for _ in range(30):
                        await asyncio.sleep(0.5)
                        if "/disciplinas/estacio_" in page.url:
                            break
                    url_atual = page.url
                    m = re.search(r"/disciplinas/(estacio_\d+)", url_atual)
                    if m:
                        turma_id = m.group(1)
                        if turma_id not in seen_turmas:
                            nome_disc = None
                            try:
                                head = page.locator("complementary heading").first
                                if await head.count() > 0:
                                    nome_disc = (await head.text_content() or "").strip() or None
                            except Exception:
                                pass
                            seen_turmas.add(turma_id)
                            unique_disciplines.append((f"{BASE_URL}/disciplinas/{turma_id}", turma_id, nome_disc))
                    await page.goto(DISCIPLINAS_URL, wait_until="domcontentloaded", timeout=30_000)
                    await asyncio.sleep(2)
                except Exception as e:
                    print(f"  Aviso: card {i+1}: {e}")
            if unique_disciplines:
                if len(unique_disciplines) > MAX_DISCIPLINAS_PERIODO:
                    unique_disciplines = unique_disciplines[:MAX_DISCIPLINAS_PERIODO]
                    print(f"(Limitado a {MAX_DISCIPLINAS_PERIODO} disciplinas do período.)")
                print("(Turmas obtidas dinamicamente clicando nos cards visíveis = período atual.)")

        # 3) Fallback: links <a href="/disciplinas/estacio_..."> em qualquer lugar da página
        if len(unique_disciplines) == 0:
            for a in await page.locator('a[href*="/disciplinas/estacio_"]').all():
                href = await a.get_attribute("href")
                if not href:
                    continue
                if href.startswith("/"):
                    href = BASE_URL + href
                turma_id, _ = _parse_disciplina_url(href)
                if turma_id and turma_id not in seen_turmas:
                    seen_turmas.add(turma_id)
                    unique_disciplines.append((href, turma_id, None))

        # 4) Fallback: API (pode incluir semestres antigos — usar só se a página não tiver cards/links)
        captured_turmas: list[str] = []
        if len(unique_disciplines) == 0:
            async def _on_response_turmas(response):
                if "apis.estudante.estacio.br" not in response.url:
                    return
                try:
                    body = await response.json()
                    ids = _extract_turma_ids_from_json(body)
                    captured_turmas.extend(ids)
                except Exception:
                    pass

            page.on("response", _on_response_turmas)
            await page.goto(DISCIPLINAS_URL, wait_until="load", timeout=45_000)
            await asyncio.sleep(4)
            page.remove_listener("response", _on_response_turmas)

            for tid in captured_turmas:
                if tid not in seen_turmas:
                    seen_turmas.add(tid)
                    unique_disciplines.append((f"{BASE_URL}/disciplinas/{tid}", tid, None))
            if unique_disciplines:
                print("(Turmas obtidas da API — pode incluir semestres antigos.)")
                if len(unique_disciplines) > MAX_DISCIPLINAS_PERIODO:
                    unique_disciplines = unique_disciplines[:MAX_DISCIPLINAS_PERIODO]
                    print(f"(Limitado a {MAX_DISCIPLINAS_PERIODO} disciplinas.)")

        # 5) Último recurso: GET /rest/aluno/turmas (ou similar)
        if len(unique_disciplines) == 0 and bearer:
            for candidate in ["/rest/aluno/turmas", "/rest/turmas", "/api/turmas"]:
                try:
                    r = await page.request.get(
                        f"{API_BASE}{candidate}",
                        headers={"Authorization": f"Bearer {bearer}"},
                        timeout=15_000,
                    )
                    if r.ok:
                        body = await r.json()
                        ids = _extract_turma_ids_from_json(body)
                        for tid in ids:
                            if tid not in seen_turmas:
                                seen_turmas.add(tid)
                                unique_disciplines.append((f"{BASE_URL}/disciplinas/{tid}", tid, None))
                        if unique_disciplines:
                            print(f"(Turmas obtidas via GET {candidate}.)")
                            if len(unique_disciplines) > MAX_DISCIPLINAS_PERIODO:
                                unique_disciplines = unique_disciplines[:MAX_DISCIPLINAS_PERIODO]
                            break
                except Exception:
                    pass

        print(f"Disciplinas encontradas: {len(unique_disciplines)}")
        # Preencher nomes das matérias quando ainda estiver turma_id (ex.: veio de clique nos cards)
        if unique_disciplines and any(n is None for _, _, n in unique_disciplines):
            filled: list[tuple[str, str, str | None]] = []
            for href, tid, nome in unique_disciplines:
                if nome is None:
                    try:
                        await page.goto(href, wait_until="load", timeout=20_000)
                        await asyncio.sleep(2)
                        head = page.locator("complementary heading").first
                        if await head.count() > 0:
                            nome = (await head.text_content() or "").strip() or tid
                        else:
                            nome = tid
                    except Exception:
                        nome = tid
                filled.append((href, tid, nome))
            unique_disciplines = filled
            await page.goto(DISCIPLINAS_URL, wait_until="domcontentloaded", timeout=25_000)
            await asyncio.sleep(1)
        if unique_disciplines:
            print("Matérias a concluir:")
            for idx, (_, __, nome) in enumerate(unique_disciplines, 1):
                print(f"  {idx}. {nome}")

        # Debug: se não encontrou disciplinas, salva screenshot e lista links para inspecionar
        if len(unique_disciplines) == 0:
            debug_dir = Path(__file__).resolve().parent / "debug"
            debug_dir.mkdir(exist_ok=True)
            screenshot_path = debug_dir / "disciplinas_tela.png"
            await page.screenshot(path=str(screenshot_path))
            print(f"[Debug] Screenshot salvo em: {screenshot_path}")
            all_links = await page.evaluate("""
                () => {
                    const links = Array.from(document.querySelectorAll('a[href]'));
                    return links.map(a => ({ href: a.getAttribute('href'), text: (a.textContent || '').trim().slice(0, 60) }));
                }
            """)
            disciplina_links = [x for x in all_links if x.get("href") and ("disciplina" in (x.get("href") or "").lower() or "estacio_" in (x.get("href") or ""))]
            print(f"[Debug] Total de links <a> na página: {len(all_links)}")
            print(f"[Debug] Links com 'disciplina' ou 'estacio_': {len(disciplina_links)}")
            for i, lnk in enumerate(disciplina_links[:25]):
                print(f"  {i+1}. {lnk.get('href')}  |  {lnk.get('text')}")
            if len(disciplina_links) > 25:
                print(f"  ... e mais {len(disciplina_links) - 25}")

        # Para cada disciplina: abrir Conteúdos, por cada tema: POST → esperar → reload → Marcar como concluído
        conclusoes_enviadas = 0
        disciplinas_total = len(unique_disciplines)
        disciplinas_concluidas = 0

        for idx_disc, (href, turma_id, nome_lista) in enumerate(unique_disciplines):
            if not bearer:
                continue
            await page.goto(href, wait_until="load", timeout=25_000)
            await asyncio.sleep(2)

            # Card "Conteúdos" na sidebar (listitem com "Conteúdos" e "Concluídos")
            conteudo_card = page.get_by_role("listitem").filter(has_text="Conteúdos").first
            if await conteudo_card.count() == 0:
                conteudo_card = page.get_by_text("Conteúdos").first
            if await conteudo_card.count() == 0:
                conteudo_card = page.locator('a[href*="/conteudos/"]').first
            if await conteudo_card.count() == 0:
                print(f"  [{turma_id}] Card Conteúdos não encontrado.")
                continue
            await conteudo_card.scroll_into_view_if_needed()
            await conteudo_card.click(timeout=10_000)
            await page.wait_for_load_state("load", timeout=20_000)
            await asyncio.sleep(2)

            # Nome da disciplina para log (sidebar ou nome já vindo da lista)
            nome_disciplina = nome_lista or turma_id
            try:
                heading = page.locator("complementary heading").first
                if await heading.count() > 0:
                    nome_disciplina = (await heading.text_content() or turma_id).strip() or turma_id
            except Exception:
                pass

            # Mapear temas: priorizar botões "Acessar X" (estável); fallback = cards main article article
            botoes_tema = await page.locator("main").get_by_role("button", name=re.compile(r"^Acessar (?!Conteúdos)(?!Lista)", re.I)).all()
            n_itens = len(botoes_tema)
            use_cards_tema = False
            if n_itens == 0:
                try:
                    await page.locator(SELECTOR_CARDS_TEMA).first.wait_for(state="visible", timeout=6_000)
                except Exception:
                    pass
                theme_cards = await page.locator(SELECTOR_CARDS_TEMA).all()
                n_itens = len(theme_cards)
                use_cards_tema = n_itens > 0
            if n_itens == 0:
                print(f"  [{nome_disciplina}] Nenhum tema encontrado na lista.")
                continue

            # Detectar quais temas já estão "Concluído" na lista (evita abrir e conta no progresso)
            ja_concluido: list[bool] = []
            for i in range(n_itens):
                try:
                    if use_cards_tema:
                        card = page.locator(SELECTOR_CARDS_TEMA).nth(i)
                        done = await card.evaluate("el => (el?.textContent || '').includes('Concluído')")
                    else:
                        btn = page.locator("main").get_by_role("button", name=re.compile(r"^Acessar (?!Conteúdos)(?!Lista)", re.I)).nth(i)
                        done = await btn.evaluate(
                            "el => { const p = el.closest('article, section, [class*=\"card\"], div'); return p ? p.textContent.includes('Concluído') : false; }"
                        )
                except Exception:
                    done = False
                ja_concluido.append(done)
            n_ja_concluidos = sum(ja_concluido)
            if n_ja_concluidos:
                print(f"  ({n_ja_concluidos} tema(s) já concluído(s) na lista — serão pulados)")

            # Log por matéria e barra de progresso
            print(f"\n--- Concluindo disciplina: {nome_disciplina} (turma_id={turma_id}, {n_itens} temas) ---")
            print(f"  Progresso temas: {_progress_bar(n_ja_concluidos, n_itens)}")

            temas_ok_desta_disciplina = n_ja_concluidos
            for i in range(n_itens):
                if ja_concluido[i]:
                    done_ate_agora = sum(1 for j in range(i + 1) if ja_concluido[j])
                    print(f"  [ Tema {i+1}/{n_itens} ] já concluído (pulado) | {_progress_bar(done_ate_agora, n_itens)}")
                    continue
                try:
                    clicked = False
                    for _tent in range(2):
                        try:
                            if use_cards_tema:
                                cards = await page.locator(SELECTOR_CARDS_TEMA).all()
                                if i >= len(cards):
                                    break
                                card = cards[i]
                                btn = card.locator(SELECTOR_BOTAO_DENTRO_CARD_TEMA).first
                                await btn.scroll_into_view_if_needed(timeout=8_000)
                            else:
                                btn = page.locator("main").get_by_role("button", name=re.compile(r"^Acessar (?!Conteúdos)(?!Lista)", re.I)).nth(i)
                                await btn.scroll_into_view_if_needed(timeout=8_000)
                            await btn.click(timeout=10_000)
                            clicked = True
                            break
                        except Exception as e:
                            if "not attached" in str(e).lower() or "timeout" in str(e).lower():
                                await asyncio.sleep(2)
                                continue
                            raise
                    if not clicked:
                        continue
                    for _ in range(30):
                        await asyncio.sleep(0.5)
                        url_atual = page.url
                        if "/conteudos/" in url_atual and ("tema=" in url_atual or "/temas/" in url_atual):
                            break
                    url_atual = page.url
                    t_id, tema_id, conteudo_uuid = _parse_conclusao_from_url(url_atual)
                    if not (tema_id and conteudo_uuid):
                        continue
                    t_id = t_id or turma_id
                    url_conclusao = (
                        f"{API_BASE}/rest/turmas/{t_id}/temas/{tema_id}"
                        f"/conteudos/{conteudo_uuid}/conclusoes?matricula={matricula}"
                    )
                    if HAS_HTTPX:
                        async with httpx.AsyncClient() as client:
                            resp = await client.post(
                                url_conclusao,
                                headers={"Authorization": f"Bearer {bearer}"},
                                timeout=30.0,
                            )
                        # 200 OK ou 201 Created = sucesso
                        resp_ok = 200 <= resp.status_code < 300
                    else:
                        resp = await page.request.post(
                            url_conclusao,
                            headers={"Authorization": f"Bearer {bearer}"},
                            timeout=30_000,
                        )
                        resp_ok = resp.ok
                    if resp_ok:
                        conclusoes_enviadas += 1
                        temas_ok_desta_disciplina += 1
                        # API já registrou; tentar clicar "Marcar como concluído" só se o botão estiver habilitado (timeout curto)
                        await asyncio.sleep(ESPERA_APOS_POST_SEG)
                        await page.reload(wait_until="load", timeout=20_000)
                        await asyncio.sleep(1)
                        try:
                            # Botão pode vir disabled quando a API já concluiu — clicar só se estiver habilitado
                            btn_concluir = page.get_by_role("button", name=re.compile(r"Marcar como concluído", re.I)).first
                            if await btn_concluir.get_attribute("aria-disabled") != "true":
                                await btn_concluir.scroll_into_view_if_needed(timeout=2_000)
                                await btn_concluir.click(timeout=3_000)
                                await asyncio.sleep(0.5)
                        except Exception:
                            pass  # Conclusão já está na API; botão desabilitado ou indisponível é esperado
                        uuid_short = (conteudo_uuid or "")[:8] + "..." if conteudo_uuid else ""
                        print(f"  [ Tema {i+1}/{n_itens} ] turma={t_id} tema_id={tema_id} uuid={uuid_short} → POST OK | {_progress_bar(temas_ok_desta_disciplina, n_itens)}")
                    else:
                        status_code = getattr(resp, "status_code", None) or getattr(resp, "status", 0)
                        print(f"  [ Tema {i+1}/{n_itens} ] turma={t_id} tema_id={tema_id} → Falha POST {status_code} | {_progress_bar(temas_ok_desta_disciplina, n_itens)}")
                except Exception as e:
                    print(f"  [ Tema {i+1}/{n_itens} ] Erro: {e} | {_progress_bar(temas_ok_desta_disciplina, n_itens)}")
                # Volta para a lista de conteúdos (próximo tema)
                await page.goto(href, wait_until="load", timeout=25_000)
                await asyncio.sleep(1)
                cc = page.get_by_role("listitem").filter(has_text="Conteúdos").first
                if await cc.count() > 0:
                    await cc.click()
                else:
                    alink = page.locator('a[href*="/conteudos/"]').first
                    if await alink.count() > 0:
                        await alink.click()
                await page.wait_for_load_state("load", timeout=20_000)
                await asyncio.sleep(1)

            disciplinas_concluidas += 1
            print(f"  >>> Disciplina concluída: {nome_disciplina} ({temas_ok_desta_disciplina}/{n_itens} temas)")
            print(f"  Progresso geral: {_progress_bar(disciplinas_concluidas, disciplinas_total)} disciplinas | {conclusoes_enviadas} conclusões enviadas")

        print(f"\n--- Resumo final ---")
        print(f"  Total de conclusões enviadas: {conclusoes_enviadas}")
        print(f"  Disciplinas processadas: {disciplinas_concluidas}/{disciplinas_total} | {_progress_bar(disciplinas_concluidas, disciplinas_total)}")
        await asyncio.sleep(2)
        await context.close()


if __name__ == "__main__":
    print("Script carregado.", flush=True)
    asyncio.run(run())

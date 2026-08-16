#!/usr/bin/env python3
"""
Conclui temas a partir de URLs específicas (ex.: temas que ficaram de fora em um run anterior).

Uso:
  python concluir_urls.py "URL1" "URL2"
  python concluir_urls.py "https://estudante.estacio.br/disciplinas/estacio_14226247/conteudos/fb6d6f07-87d4-4068-8be9-059a2c3320d4?tema=00565"

Usa a mesma sessão (estacio_session) e .env (ESTACIO_MATRICULA) do main.py.
Abre o navegador para capturar o Bearer e envia o POST via httpx.
"""
import asyncio
import sys
from pathlib import Path

# Carrega .env
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

import os

# Importa do main o que for necessário
from main import (
    API_BASE,
    DISCIPLINAS_URL,
    SESSION_DIR,
    _capture_bearer,
    _get_matricula,
    _parse_conclusao_from_url,
)
from playwright.async_api import async_playwright

try:
    import httpx
except ImportError:
    httpx = None


async def run(urls: list[str]) -> None:
    if not urls:
        print("Uso: python concluir_urls.py <url1> [url2] ...")
        return
    if not httpx:
        print("Instale httpx: pip install httpx")
        return

    matricula = _get_matricula(os.environ.get("ESTACIO_EMAIL") or "")
    if not matricula:
        matricula = os.environ.get("ESTACIO_MATRICULA", "").strip()
    if not matricula:
        print("Defina ESTACIO_MATRICULA no .env")
        return

    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            viewport={"width": 1280, "height": 800},
            timeout=60_000,
        )
        page = context.pages[0] if context.pages else await context.new_page()
        if not context.pages:
            await page.goto(DISCIPLINAS_URL, wait_until="load", timeout=45_000)
        await asyncio.sleep(2)

        bearer = await _capture_bearer(page)
        if not bearer:
            print("Não foi possível obter o Bearer. Faça login no navegador e tente de novo.")
            await context.close()
            return
        print("Bearer obtido.")

        ok = 0
        for url in urls:
            url = url.strip()
            if not url or not url.startswith("http"):
                continue
            t_id, tema_id, conteudo_uuid = _parse_conclusao_from_url(url)
            if not (t_id and tema_id and conteudo_uuid):
                print(f"  [ignorado] Não foi possível extrair IDs: {url[:60]}...")
                continue
            post_url = (
                f"{API_BASE}/rest/turmas/{t_id}/temas/{tema_id}"
                f"/conteudos/{conteudo_uuid}/conclusoes?matricula={matricula}"
            )
            try:
                async with httpx.AsyncClient() as client:
                    r = await client.post(
                        post_url,
                        headers={"Authorization": f"Bearer {bearer}"},
                        timeout=30.0,
                    )
                if 200 <= r.status_code < 300:
                    ok += 1
                    print(f"  [OK] {t_id} tema={tema_id} uuid={conteudo_uuid[:8]}...")
                else:
                    print(f"  [Falha {r.status_code}] tema={tema_id}")
            except Exception as e:
                print(f"  [Erro] tema={tema_id}: {e}")

        print(f"\nConcluídos: {ok}/{len(urls)}")
        await context.close()


def main() -> None:
    urls = [u for u in sys.argv[1:] if u.strip().startswith("http")]
    if not urls:
        print("Passe as URLs como argumentos.")
        print("Ex.: python concluir_urls.py \"https://estudante.estacio.br/disciplinas/estacio_14226247/conteudos/fb6d6f07-87d4-4068-8be9-059a2c3320d4?tema=00565\"")
        return
    asyncio.run(run(urls))


if __name__ == "__main__":
    main()

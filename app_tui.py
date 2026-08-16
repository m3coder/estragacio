#!/usr/bin/env python3
"""
TUI (Textual) para a automação Estácio.
Mostra lista de matérias, barra de progresso e log em tempo real.
Subprocess roda em thread para não bloquear a UI.
"""
import os
import subprocess
import sys
import threading
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / ".env")
except ImportError:
    pass

from textual.app import App, ComposeResult
from textual.containers import Container
from textual.widgets import Header, Footer, Static, RichLog, ProgressBar
from textual.binding import Binding


PROJECT_DIR = Path(__file__).resolve().parent


class EstacioTUI(App[None]):
    TITLE = "Estácio — Conclusão de temas"
    BINDINGS = [
        Binding("q", "quit", "Sair"),
        Binding("r", "run_script", "Executar"),
    ]

    def __init__(self) -> None:
        super().__init__()
        self._process: subprocess.Popen | None = None
        self._running = False

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Container():
            yield Static(
                "Pressione [bold cyan]R[/] para executar. Os primeiros segundos podem demorar (sessão + nomes das matérias).",
                id="info",
                classes="box",
            )
            yield Static("Progresso:", id="progress-label")
            yield ProgressBar(total=100, show_eta=False, id="progress-bar")
            yield Static("Log:", id="log-label")
            yield RichLog(highlight=True, markup=True, id="log")
        yield Footer()

    def on_mount(self) -> None:
        self.query_one("#progress-bar", ProgressBar).update(progress=0)

    def _append_log(self, text: str) -> None:
        if not text:
            return
        try:
            log = self.query_one("#log", RichLog)
            log.write(text + "\n" if not text.endswith("\n") else text)
            log.scroll_end()
        except Exception:
            pass

    def _run_subprocess_in_thread(self) -> None:
        env = os.environ.copy()
        env["PYTHONUNBUFFERED"] = "1"
        env.setdefault("ESTACIO_EMAIL", "")
        env.setdefault("ESTACIO_PASSWORD", "")
        env.setdefault("ESTACIO_MATRICULA", "")
        try:
            self.call_from_thread(self._append_log, "Iniciando main.py...")
            proc = subprocess.Popen(
                [sys.executable, "-u", str(PROJECT_DIR / "main.py")],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                stdin=subprocess.DEVNULL,
                cwd=str(PROJECT_DIR),
                env=env,
                bufsize=0,
            )
            self._process = proc
            assert proc.stdout
            for line in iter(proc.stdout.readline, b""):
                text = line.decode("utf-8", errors="replace").rstrip()
                if text:
                    self.call_from_thread(self._append_log, text)
                    if "Progresso geral:" in text and "disciplinas |" in text:
                        try:
                            parts = text.split("disciplinas |")
                            if parts and "/" in parts[0]:
                                frac = parts[0].strip().split()[-1]
                                a, b = frac.split("/")
                                if b and int(b) > 0:
                                    pct = 100 * int(a) / int(b)
                                    self.call_from_thread(
                                        lambda p=pct: self.query_one("#progress-bar", ProgressBar).update(progress=p)
                                    )
                        except Exception:
                            pass
            proc.wait()
            if proc.returncode == 0:
                self.call_from_thread(
                    lambda: self.query_one("#info", Static).update("[bold green]Concluído.[/] Pressione R para rodar de novo.")
                )
                self.call_from_thread(lambda: self.query_one("#progress-bar", ProgressBar).update(progress=100))
            else:
                self.call_from_thread(
                    lambda: self.query_one("#info", Static).update(f"[bold red]Script encerrou com código {proc.returncode}[/]")
                )
        except Exception as e:
            self.call_from_thread(self._append_log, f"[red]Erro: {e}[/]")
            self.call_from_thread(self.notify, str(e), severity="error")
        finally:
            self._process = None
            self._running = False

    def action_run_script(self) -> None:
        if self._running:
            self.notify("Aguarde o término ou pressione Q para sair.", severity="warning")
            return
        self._running = True
        self.query_one("#info", Static).update(
            "Executando... (saída em tempo real)"
        )
        self.query_one("#log", RichLog).clear()
        self._append_log("Iniciando...")
        t = threading.Thread(target=self._run_subprocess_in_thread, daemon=True)
        t.start()

    def action_quit(self) -> None:
        if self._process and self._process.poll() is None:
            self._process.terminate()
        self.exit()


def main() -> None:
    app = EstacioTUI()
    app.run()


if __name__ == "__main__":
    main()

"""
Gera docs/documentacao/changelog.md a partir dos PRs mesclados na main, pela API do GitHub.
Roda no deploy, antes do mkdocs build; não faz commit (a main só aceita PR com aprovação).

    GITHUB_TOKEN=... GITHUB_REPOSITORY=GovHub-br/gov-hub-io python3 .github/scripts/gera_changelog.py

Ficam de fora os PRs do painel de publicações (branches cms/), os do robô antigo de
changelog e os marcados com o rótulo skip-changelog. Se a API falhar, o arquivo
versionado (um aviso de "gerado no deploy") fica como está e o deploy segue.
"""
import html
import json
import os
import re
import sys
import urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

DESTINO = Path("docs/documentacao/changelog.md")
BRANCH = "main"
IGNORAR_BRANCHES = ("cms/", "chore/update-changelog-")
IGNORAR_ROTULO = "skip-changelog"
FUSO = ZoneInfo("America/Sao_Paulo")
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
         "agosto", "setembro", "outubro", "novembro", "dezembro"]


def _prs(repo, token):
    """Todos os PRs fechados contra a main, seguindo a paginação da API."""
    url = f"https://api.github.com/repos/{repo}/pulls?state=closed&base={BRANCH}&per_page=100"
    while url:
        pedido = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        })
        with urllib.request.urlopen(pedido, timeout=30) as resposta:
            yield from json.load(resposta)
            proxima = re.search(r'<([^>]+)>;\s*rel="next"', resposta.headers.get("Link", ""))
            url = proxima.group(1) if proxima else None


def _texto(titulo):
    """Título do PR como texto literal no Markdown."""
    return re.sub(r"([\\`*_\[\]])", r"\\\1", html.escape(titulo.strip(), quote=False))


def main():
    repo, token = os.environ.get("GITHUB_REPOSITORY"), os.environ.get("GITHUB_TOKEN")
    if not repo or not token:
        print("::warning::Changelog não gerado: faltam GITHUB_REPOSITORY e GITHUB_TOKEN")
        return
    try:
        prs = list(_prs(repo, token))
    except Exception as erro:  # rede, limite da API: o deploy não pode parar por isso
        print(f"::warning::Changelog não gerado: {erro}")
        return

    meses = defaultdict(list)
    for pr in prs:
        if not pr.get("merged_at") or pr["head"]["ref"].startswith(IGNORAR_BRANCHES):
            continue
        if any(r["name"] == IGNORAR_ROTULO for r in pr.get("labels", [])):
            continue
        quando = datetime.fromisoformat(pr["merged_at"].replace("Z", "+00:00")).astimezone(FUSO)
        meses[(quando.year, quando.month)].append((quando, pr))

    linhas = [
        "# Histórico de mudanças",
        "",
        "O que entrou no site e na documentação do Gov Hub, um item por pull request mesclado,",
        "do mais recente ao mais antigo. As publicações feitas pelo painel não entram aqui:",
        "estão em [Publicações](/publicacoes/).",
        "",
    ]
    for (ano, mes) in sorted(meses, reverse=True):
        linhas += [f"## {MESES[mes - 1].capitalize()} de {ano}", ""]
        for quando, pr in sorted(meses[(ano, mes)], key=lambda item: item[0], reverse=True):
            linhas.append(f"- {quando:%d/%m}: {_texto(pr['title'])} "
                          f"([#{pr['number']}](https://github.com/{repo}/pull/{pr['number']}))")
        linhas.append("")
    if not meses:
        linhas += ["Nenhuma mudança registrada ainda.", ""]

    DESTINO.write_text("\n".join(linhas), encoding="utf-8")
    print(f"✅ Changelog com {sum(map(len, meses.values()))} PRs em {DESTINO}")


if __name__ == "__main__":
    sys.exit(main())

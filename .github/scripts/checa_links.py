"""
Confere os links internos do site gerado: cada href/src/url() local precisa levar a um
arquivo que existe e, quando tem #âncora, a um id que existe na página.

    python3 .github/scripts/checa_links.py site            # sai com erro se achar link quebrado
    python3 .github/scripts/checa_links.py site --avisar   # só avisa (anotação no Actions)

O endereço do site vem de SITE_URL (padrão https://gov-hub.io/), o mesmo do mkdocs.yml.
Rodar depois de copiar a capacitação para site/capacitacao/.
"""
import html
import os
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

ATRIBUTO = re.compile(r"""(?:href|src|action)=["']([^"']+)["']""")
URL_CSS = re.compile(r"""url\(["']?([^"')]+)["']?\)""")
EXTERNOS = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:", "#", "//", "{", "$")
# Redirecionamentos dos endereços antigos e bundles do tema
IGNORAR = ("govhub/", "assets/")


def main():
    site = Path(sys.argv[1])
    avisar = "--avisar" in sys.argv
    prefixo = urlparse(os.environ.get("SITE_URL") or "https://gov-hub.io/").path.rstrip("/") + "/"

    ids = {}

    def tem_id(arquivo, frag):
        if arquivo not in ids:
            ids[arquivo] = set(re.findall(r"""\bid=["']([^"']+)["']""", arquivo.read_text(encoding="utf-8", errors="ignore")))
        return frag in ids[arquivo]

    quebrados, total = Counter(), 0
    for arq in sorted(site.rglob("*")):
        rel = arq.relative_to(site).as_posix()
        if arq.suffix not in (".html", ".css") or rel.startswith(IGNORAR):
            continue
        texto = arq.read_text(encoding="utf-8", errors="ignore")
        refs = (ATRIBUTO.findall(texto) if arq.suffix == ".html" else []) + URL_CSS.findall(texto)
        for ref in map(html.unescape, refs):
            if ref.startswith(EXTERNOS) or "${" in ref:
                continue
            total += 1
            url = urlparse(urljoin("https://site" + prefixo + rel, ref))
            caminho = unquote(url.path)
            if not caminho.startswith(prefixo):
                quebrados[(rel, ref, "fora do site")] += 1
                continue
            alvo = site / caminho[len(prefixo):]
            alvo = alvo if alvo.is_file() else alvo / "index.html"
            if not alvo.is_file():
                quebrados[(rel, ref, "não existe")] += 1
            elif url.fragment and alvo.suffix == ".html" and not tem_id(alvo, unquote(url.fragment)):
                quebrados[(rel, ref, "sem âncora")] += 1

    print(f"{total} links internos, {sum(quebrados.values())} quebrados")
    nivel = "warning" if avisar else "error"
    for (rel, ref, motivo), n in sorted(quebrados.items()):
        vezes = f" ({n}x)" if n > 1 else ""
        print(f"::{nivel} title=Link quebrado ({motivo})::{ref} em {rel}{vezes}")
    if quebrados and not avisar:
        sys.exit(1)


if __name__ == "__main__":
    main()

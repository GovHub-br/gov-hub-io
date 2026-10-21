"""
Hook que deixa o site funcionar fora da raiz do domínio e mantém os endereços antigos /govhub/.

Os links do site são escritos a partir da raiz (/land/dist/..., /publicacoes/). No ar, em
gov-hub.io, o site fica na raiz e o HTML sai como está. Num preview do GitHub Pages
(ex.: egewarth.github.io/gov-hub-io/), o site_url traz um caminho, e os links absolutos do
HTML, CSS e JS gerados ganham esse prefixo. O deploy.yml passa o site_url de cada ambiente
pela variável SITE_URL.

Até 2025 o site morava em /govhub/. Para não quebrar links já compartilhados, cada página
ganha um redirecionamento em /govhub/<caminho da página>.

Precisa ser o último hook da lista: corrige também o que os outros hooks escrevem.
"""
import html
import re
from pathlib import Path
from urllib.parse import quote, urlparse

from mkdocs.config.defaults import MkDocsConfig

ANTIGO = "govhub"
# A capacitação é copiada para site/capacitacao/ pelo deploy.yml, depois do build.
RAIZES_EXTRAS = {"capacitacao"}
# Bundles do próprio tema: já usam caminhos relativos, e é melhor não mexer neles.
NAO_TOCAR = ("assets/javascripts/", "assets/stylesheets/")
EXTENSOES = {".html", ".css", ".js", ".webmanifest"}


def _prefixa_links(site_dir: Path, prefixo: str):
    """Põe o prefixo nos caminhos absolutos que apontam para pastas do próprio site."""
    raizes = {p.name for p in site_dir.iterdir() if p.name != ANTIGO} | RAIZES_EXTRAS
    nomes = "|".join(sorted((re.escape(r) for r in raizes), key=len, reverse=True))
    # "/land/dist/x.png", '/publicacoes/', url(/global-assets/...), e o "/" sozinho dos href
    caminho = re.compile(r"""(?P<antes>["'(])/(?=(?:%s)(?:[/"'?#)]|$))""" % nomes)
    raiz = re.compile(r"""(?P<antes>(?:href|action)=["'])/(?=["'#?])""")

    alterados = 0
    for arquivo in site_dir.rglob("*"):
        rel = arquivo.relative_to(site_dir).as_posix()
        if arquivo.suffix not in EXTENSOES or rel.startswith(NAO_TOCAR) or not arquivo.is_file():
            continue
        texto = arquivo.read_text(encoding="utf-8")
        novo = caminho.sub(lambda m: m["antes"] + prefixo + "/", texto)
        novo = raiz.sub(lambda m: m["antes"] + prefixo + "/", novo)
        if novo != texto:
            arquivo.write_text(novo, encoding="utf-8")
            alterados += 1
    print(f"✅ Links prefixados com {prefixo}/ em {alterados} arquivos")


def _redireciona_antigos(site_dir: Path, site_url: str):
    """Cria /govhub/<página> apontando para o endereço novo de cada página."""
    destino_dir = site_dir / ANTIGO
    paginas = [p for p in site_dir.rglob("*.html")
               if p.relative_to(site_dir).parts[0] != ANTIGO and p.name != "404.html"]
    for pagina in paginas:
        rel = pagina.relative_to(site_dir).as_posix()
        endereco = rel[: -len("index.html")] if rel.endswith("index.html") else rel
        alvo = html.escape(site_url + quote(endereco))
        stub = destino_dir / rel
        stub.parent.mkdir(parents=True, exist_ok=True)
        stub.write_text(
            '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8">\n'
            '<title>Redirecionando…</title><meta name="robots" content="noindex">\n'
            f'<link rel="canonical" href="{alvo}">\n'
            f'<meta http-equiv="refresh" content="0; url={alvo}">\n'
            f'<script>location.replace("{alvo}" + location.search + location.hash)</script>\n'
            f'</head><body><a href="{alvo}">Esta página mudou de endereço.</a></body></html>\n',
            encoding="utf-8",
        )
    print(f"✅ {len(paginas)} redirecionamentos de /{ANTIGO}/ criados")


def on_post_build(config: MkDocsConfig, **kwargs):
    site_dir = Path(config.site_dir)
    site_url = (config.site_url or "/").rstrip("/") + "/"
    prefixo = urlparse(site_url).path.rstrip("/")
    if prefixo:
        _prefixa_links(site_dir, prefixo)
    _redireciona_antigos(site_dir, site_url)

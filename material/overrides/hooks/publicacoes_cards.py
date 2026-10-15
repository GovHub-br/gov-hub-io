"""
Hook que gera os cards de publicações a partir dos posts do blog (docs/blog/posts/*.md).

Basta subir o .md do post: no build, os cards da página Publicações e da home
são reescritos entre os marcadores

    <!-- publicacoes:inicio -->            todos os posts, do mais recente ao mais antigo
    <!-- publicacoes:inicio limite=3 -->   só os 3 mais recentes
    ...
    <!-- publicacoes:fim -->

Campos opcionais no cabeçalho (front matter) do post:

    card_image: /govhub/land/dist/images/publicacoes/dbt.svg   # imagem do card
    card_label: Tutorial                                         # etiqueta sobre a imagem
    description: Resumo curto que aparece no card.

Sem eles, o card usa a imagem padrão, a primeira categoria e o primeiro
parágrafo depois do título.

Roda em on_post_build e precisa vir depois de copy_static_assets.py e
copy_index.py na lista de hooks, porque reescreve também as cópias que eles fazem.
"""
import html
import re
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

from mkdocs.config.defaults import MkDocsConfig

IMAGEM_PADRAO = "/govhub/land/dist/images/publicacoes/paper.svg"
MARCADOR = re.compile(
    r"<!-- publicacoes:inicio(?:\s+limite=(\d+))?\s*-->.*?<!-- publicacoes:fim -->",
    re.S,
)

_posts = []


def on_pre_build(config: MkDocsConfig, **kwargs):
    _posts.clear()


def _data(valor):
    """O front matter traz date como data, texto ou {created: ...}."""
    if isinstance(valor, dict):
        valor = valor.get("created")
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    try:
        return date.fromisoformat(str(valor)[:10])
    except ValueError:
        return date.min


def _texto_simples(md):
    """Tira a marcação de Markdown de um parágrafo para usar como resumo."""
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md)          # imagens
    md = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", md)      # links
    md = re.sub(r"[*_`]+", "", md)                         # ênfase e código
    return " ".join(md.split())


def _resumo(markdown):
    """Primeiro parágrafo depois do título (até o <!-- more -->)."""
    corpo = markdown.split("<!-- more -->", 1)[0]
    for bloco in re.split(r"\n\s*\n", corpo):
        bloco = bloco.strip()
        if bloco and not bloco.startswith(("#", "<", "```", "---")):
            return _texto_simples(bloco)
    return ""


def on_page_markdown(markdown, page, config: MkDocsConfig, files, **kwargs):
    if not page.file.src_uri.startswith("blog/posts/"):
        return markdown
    meta = page.meta or {}
    titulo = page.title
    m = re.search(r"^#\s+(.+)$", markdown, re.M)
    if m:
        titulo = m.group(1).strip()
    categorias = meta.get("categories") or []
    _posts.append({
        "titulo": titulo,
        "url": page.url,
        "data": _data(meta.get("date")),
        "rotulo": meta.get("card_label") or (categorias[0] if categorias else "Publicação"),
        "imagem": meta.get("card_image") or IMAGEM_PADRAO,
        "resumo": meta.get("description") or _resumo(markdown),
    })
    return markdown


def _card(post, base):
    e = html.escape
    href = f"{base}/{post['url']}".replace("//", "/")
    return f"""
                <div class="col-12 col-sm-6 col-lg-4 mb-4">
                    <div class="publication-card" onclick="location.href='{e(href)}'" style="cursor: pointer;">
                        <div class="publication-image">
                            <img src="{e(post['imagem'])}" alt="" class="card-image">
                            <div class="publication-category">{e(str(post['rotulo']).upper())}</div>
                        </div>
                        <div class="publication-content">
                            <h3 class="publication-title">{e(post['titulo'])}</h3>
                            <p class="publication-caption">{e(post['resumo'])}</p>
                            <div class="publication-arrow">→</div>
                        </div>
                    </div>
                </div>"""


def on_post_build(config: MkDocsConfig, **kwargs):
    base = urlparse(config.site_url or "").path.rstrip("/")
    posts = sorted(_posts, key=lambda p: (p["data"], p["titulo"]), reverse=True)

    def preencher(m):
        lista = posts[: int(m.group(1))] if m.group(1) else posts
        inicio = m.group(0).split("-->", 1)[0] + "-->"
        return inicio + "".join(_card(p, base) for p in lista) + "\n                <!-- publicacoes:fim -->"

    alterados = 0
    for arquivo in Path(config.site_dir).rglob("*.html"):
        texto = arquivo.read_text(encoding="utf-8")
        if "<!-- publicacoes:inicio" not in texto:
            continue
        arquivo.write_text(MARCADOR.sub(preencher, texto), encoding="utf-8")
        alterados += 1
    print(f"✅ Cards de publicações gerados ({len(posts)} posts) em {alterados} páginas")

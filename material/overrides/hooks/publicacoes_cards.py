"""
Hook que gera os cards de publicações a partir dos posts do blog (docs/blog/posts/*.md).

Basta subir o .md do post: no build, os cards da página Publicações e da home
são reescritos entre os marcadores

    <!-- publicacoes:inicio -->            todos os posts, do mais recente ao mais antigo
    <!-- publicacoes:inicio limite=3 -->   só os 3 mais recentes
    ...
    <!-- publicacoes:fim -->

Campos opcionais no cabeçalho (front matter) do post:

    card_image: /land/dist/images/publicacoes/dbt.svg   # imagem do card
    card_label: Tutorial                                         # etiqueta sobre a imagem
    description: Resumo curto que aparece no card.
    tipo: pesquisa                                               # filtro da página: produto (padrão), evento ou pesquisa
    pdf: /publicacoes/pdf/artigo.pdf                             # artigo em PDF, linkado na página do post

Com pdf, a capa do artigo entra no card no lugar da ilustração: a folha sobre fundo
branco, cortada embaixo. O build gera a capa a partir da 1ª página do PDF, direto em
site/ (artigo.webp ao lado do PDF), então ela não fica no repositório nem aparece no
painel. Uma capa feita à mão em docs/, com o mesmo nome (artigo.webp, .png ou .jpg),
tem preferência. A geração usa pypdfium2 e Pillow (requirements.txt); sem eles, ou com
o PDF ilegível, o card fica com a ilustração.

Sem eles, o card usa a imagem padrão, a primeira categoria e o primeiro
parágrafo depois do título.

Roda em on_post_build e precisa vir depois de copy_index.py na lista de hooks,
porque reescreve também a cópia da home que ele faz, e antes de caminho_base.py,
que prefixa os links quando o site não está na raiz do domínio.
"""
import html
import re
from datetime import date, datetime
from pathlib import Path

from mkdocs.config.defaults import MkDocsConfig

IMAGEM_PADRAO = "/land/dist/images/publicacoes/paper.svg"
MARCADOR = re.compile(
    r"<!-- publicacoes:inicio(?:\s+limite=(\d+))?\s*-->.*?<!-- publicacoes:fim -->",
    re.S,
)

CAPA_LARGURA = 480  # px; a folha aparece com ~290 px no card, em 2x fica nítida

_posts = []
_capas = {}  # capa a gerar em site/ -> PDF em docs/


def on_pre_build(config: MkDocsConfig, **kwargs):
    _posts.clear()
    _capas.clear()


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


def _capa(pdf, config):
    """Capa do PDF: a feita à mão ao lado dele em docs/ ou, sem ela, a gerada no build."""
    if not pdf:
        return None
    base = Path(pdf.lstrip("/")).with_suffix("")
    for ext in (".webp", ".png", ".jpg"):
        if (Path(config.docs_dir) / base.with_suffix(ext)).is_file():
            return "/" + base.with_suffix(ext).as_posix()
    origem = Path(config.docs_dir) / base.with_suffix(".pdf")
    if not origem.is_file():
        return None
    _capas[base.with_suffix(".webp").as_posix()] = origem
    return "/" + base.with_suffix(".webp").as_posix()


def _gera_capa(pdf: Path, destino: Path):
    """Renderiza a 1ª página do PDF em WebP."""
    import pypdfium2 as pdfium

    documento = pdfium.PdfDocument(pdf)
    try:
        pagina = documento[0]
        imagem = pagina.render(scale=CAPA_LARGURA / pagina.get_width()).to_pil()
        destino.parent.mkdir(parents=True, exist_ok=True)
        imagem.convert("RGB").save(destino, "WEBP", quality=85)
    finally:
        documento.close()


def _gera_capas(site_dir: Path):
    """Gera as capas pendentes; a que falhar volta o card para a ilustração."""
    falharam = set()
    for capa, pdf in _capas.items():
        try:
            _gera_capa(pdf, site_dir / capa)
        except Exception as erro:  # sem pypdfium2/Pillow, ou PDF ilegível
            print(f"⚠️  Capa de {pdf.name} não gerada ({erro}); o card fica com a ilustração")
            falharam.add("/" + capa)
    for post in _posts:
        if post["capa"] in falharam:
            post["capa"] = None
    if _capas:
        print(f"✅ Capas de PDF geradas: {len(_capas) - len(falharam)} de {len(_capas)}")


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
        "capa": _capa(meta.get("pdf"), config),
        "tipo": meta.get("tipo") or "produto",
        "data": _data(meta.get("date")),
        "rotulo": meta.get("card_label") or (categorias[0] if categorias else "Publicação"),
        "imagem": meta.get("card_image") or IMAGEM_PADRAO,
        "resumo": meta.get("description") or _resumo(markdown),
    })
    return markdown


def _card(post):
    e = html.escape
    href = "/" + post["url"].lstrip("/")
    if post["capa"]:
        # capa do PDF sobre fundo branco, no lugar da ilustração
        card, imagem, classe = "publication-card publication-card--capa", post["capa"], "cover-image"
    else:
        card, imagem, classe = "publication-card", post["imagem"], "card-image"
    return f"""
                <div class="col-12 col-sm-6 col-lg-4 mb-4" data-tipo="{e(str(post['tipo']))}">
                    <div class="{card}" onclick="location.href='{e(href)}'" style="cursor: pointer;">
                        <div class="publication-image">
                            <img src="{e(imagem)}" alt="" class="{classe}">
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
    _gera_capas(Path(config.site_dir))
    posts = sorted(_posts, key=lambda p: (p["data"], p["titulo"]), reverse=True)

    def preencher(m):
        lista = posts[: int(m.group(1))] if m.group(1) else posts
        inicio = m.group(0).split("-->", 1)[0] + "-->"
        return inicio + "".join(_card(p) for p in lista) + "\n                <!-- publicacoes:fim -->"

    alterados = 0
    for arquivo in Path(config.site_dir).rglob("*.html"):
        texto = arquivo.read_text(encoding="utf-8")
        if "<!-- publicacoes:inicio" not in texto:
            continue
        arquivo.write_text(MARCADOR.sub(preencher, texto), encoding="utf-8")
        alterados += 1
    print(f"✅ Cards de publicações gerados ({len(posts)} posts) em {alterados} páginas")

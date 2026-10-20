#!/usr/bin/env python3
"""
Gera os PDFs das aulas e das trilhas, na identidade visual Gov Hub, com WeasyPrint.

Adaptado de `scripts/build_doc.py` da skill govhub-visual-identity: a mesma receita de capa
(print-cover), faixa de capítulo (print-header), rodapé (print-footer) e tabela (print-table),
com a convenção editorial sem travessão. Aqui a entrada não é um markdown com `## N.`, e sim as
trilhas (docs/trilhas/*.json) e as aulas que elas listam.

Saídas, em --saida (padrão: pdf/, fora do git; o workflow de publicação gera no deploy):
  aulas/<id da aula>.pdf   uma aula (o id é o caminho do doc sem docs/ e .md)
  trilhas/<slug>.pdf       a trilha inteira: capa, sumário e um capítulo por nível

Diagramas Mermaid viram PNG com o mermaid-cli quando a variável MMDC aponta para ele
(ex.: MMDC="npx -y @mermaid-js/mermaid-cli@11"; MMDC_PUPPETEER = config do puppeteer). Sem
MMDC, o bloco vira um aviso apontando para a versão on-line da aula.

Uso:  python3 tools/gen_pdf.py [--saida pdf] [--trilha <slug>] [--aula <id>] [--so-html]
Dependências: markdown, beautifulsoup4, lxml, weasyprint.
"""
import argparse, html, json, os, re, shlex, subprocess, sys, tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PDF_DIR = REPO / "tools" / "pdf"
SITE = "https://gov-hub.io/capacitacao/"
NAVY, PURPLE, SOFT = "#0A005A", "#613EFF", "#F2F1F6"
AUTORES = ["Marina Alves", "Pedro Vieira", "João Egewarth"]
CONTATO = ("gov-hub.io", "govhub@unb.br")
# Contracapa: Lab Livre e UnB (realização) e os projetos, na ordem da skill (partners.md):
# Ipea, depois os ministérios. Período de defeso eleitoral: logos `-defeso`.
REALIZACAO = [("lab-livre-black.svg", "Lab Livre"), ("unb-dark-outlined.svg", "UnB")]
PROJETOS = [("ipea_positivo.png", "Ipea"), ("cultura_positivo-defeso.svg", "Ministério da Cultura (MinC)"),
            ("mir_positivo-defeso.svg", "Ministério da Igualdade Racial (MIR)"), ("cidades_positivo-defeso.svg", "Ministério das Cidades (MCID)"),
            ("mgi_positivo-defeso.svg", "Ministério da Gestão e da Inovação em Serviços Públicos (MGI)")]
PAPEL = {"core": "Essencial", "support": "Apoio", "optional": "Apoio", "advanced": "Apoio", "capstone": "Marco"}


# ---------------------------------------------------------------------------
# Caminhos
# ---------------------------------------------------------------------------
def pdf_da_aula(aula_id):
    """Caminho do PDF de uma aula, relativo à pasta de saída (e à raiz do site publicado)."""
    return "aulas/%s.pdf" % aula_id


def pdf_da_trilha(slug):
    return "trilhas/%s.pdf" % slug


# ---------------------------------------------------------------------------
# Markdown da aula -> HTML
# ---------------------------------------------------------------------------
def fix_dashes(text):
    """Convenção editorial Gov Hub (build_doc.py): sem travessão no texto corrido."""
    out = []
    for sent in re.split(r"(?<=[.!?])\s+(?=[A-ZÀ-Ú*`(])", text):
        n = sent.count(" — ")
        if n >= 2 and n % 2 == 0:
            sent = re.sub(r" — (.*?) — ", r", \1, ", sent)
        sent = sent.replace(" — ", ": ")
        out.append(sent)
    return " ".join(out)


AVISO_DIAGRAMA = "> **Diagrama.** Este diagrama aparece na versão on-line da aula."


def preparar_markdown(src):
    """Tira o título (devolvido à parte) e a linha `> Tipo:`, e aplica a convenção sem travessão
    fora dos blocos de código. Devolve (título, markdown)."""
    titulo = None
    m = re.search(r"^# (.+)$", src, flags=re.M)
    if m:
        titulo = m.group(1).strip()
        src = src[:m.start()] + src[m.end():]
    src = re.sub(r"^> Tipo:.*\n", "", src, count=1, flags=re.M)
    linhas, em_codigo = [], False
    for ln in src.split("\n"):
        if ln.startswith("```"):
            em_codigo = not em_codigo
            linhas.append(ln)
            continue
        if em_codigo:
            linhas.append(ln)
        elif ln.startswith("#"):
            linhas.append(ln.replace(" — ", " · "))
        else:
            linhas.append(fix_dashes(ln.replace("| — |", "| não se aplica |")))
    return titulo, "\n".join(linhas).strip() + "\n"


def tem_mermaid(src):
    return "```mermaid" in src


def sem_mermaid(src):
    """Sem mermaid-cli: cada bloco vira um aviso."""
    return re.sub(r"^```mermaid\n.*?^```$", AVISO_DIAGRAMA, src, flags=re.M | re.S)


def renderizar_mermaid(src, pasta, nome):
    """Renderiza os blocos Mermaid com o mermaid-cli (MMDC). Devolve o markdown com as imagens,
    ou None se não houver MMDC ou a renderização falhar."""
    cmd = os.environ.get("MMDC")
    if not cmd:
        return None
    entrada = Path(pasta) / (nome + ".md")
    saida = Path(pasta) / (nome + ".out.md")
    entrada.write_text(src, encoding="utf-8")
    args = shlex.split(cmd) + ["-i", str(entrada), "-o", str(saida), "-e", "png", "-s", "2",
                               "-b", "white", "-c", str(PDF_DIR / "mermaid.json")]
    if os.environ.get("MMDC_PUPPETEER"):
        args += ["-p", os.environ["MMDC_PUPPETEER"]]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0 or not saida.exists():
        print("  aviso: mermaid-cli falhou em %s; o diagrama vira aviso.\n%s" % (nome, r.stderr[-400:]))
        return None
    # o mermaid-cli escreve ![diagram](./<nome>.out-N.png) ao lado do .md de saída
    return saida.read_text(encoding="utf-8").replace("](./", "](%s/" % Path(pasta).as_uri())


FONT_RE = re.compile(r"^\s*(?:(normal|bold|[1-9]00)\s+)?([\d.]+px)\s+(.+)$")
_svgs = {}
_svg_tmp = None


def svg_achatado(texto):
    """O SVG das ilustrações estiliza o texto por classe (`.rot{font:600 12px ...;fill:...}`), e o
    renderizador de SVG do WeasyPrint não aplica <style> nem o atalho `font:`: o texto sai preto e
    enorme. Aqui cada regra vira atributo de apresentação nos elementos da classe."""
    m = re.search(r"<style>(.*?)</style>", texto, flags=re.S)
    if not m:
        return texto
    regras = {}
    for nome, corpo in re.findall(r"\.([\w-]+)\s*\{([^}]*)\}", m.group(1)):
        attrs = {}
        for decl in corpo.split(";"):
            if ":" not in decl:
                continue
            prop, val = (x.strip() for x in decl.split(":", 1))
            if prop == "font":
                f = FONT_RE.match(val)
                if f:
                    if f.group(1):
                        attrs["font-weight"] = f.group(1)
                    attrs["font-size"] = f.group(2)
                    attrs["font-family"] = f.group(3).replace('"', "'")
            else:
                attrs[prop] = val.replace('"', "'")
        regras[nome] = attrs
    texto = texto[:m.start()] + texto[m.end():]

    def aplicar(t):
        tag = t.group(0)
        c = re.search(r'\sclass="([^"]*)"', tag)
        extras = {}
        for nome in c.group(1).split():
            for k, v in regras.get(nome, {}).items():
                if not re.search(r"\s%s=" % re.escape(k), tag):
                    extras[k] = v
        novo = "".join(' %s="%s"' % kv for kv in extras.items())
        return tag[:c.start()] + novo + tag[c.start():]
    return re.sub(r'<[a-zA-Z]+\b[^>]*\sclass="[^"]*"[^>]*>', aplicar, texto)


def svg_para_pdf(caminho):
    """Caminho (file URI) de uma cópia do SVG que o WeasyPrint desenha direito."""
    global _svg_tmp
    if caminho not in _svgs:
        if _svg_tmp is None:
            _svg_tmp = Path(tempfile.mkdtemp(prefix="svg-pdf-"))
        destino = _svg_tmp / ("%d-%s" % (len(_svgs), caminho.name))
        destino.write_text(svg_achatado(caminho.read_text(encoding="utf-8")), encoding="utf-8")
        _svgs[caminho] = destino.as_uri()
    return _svgs[caminho]


def url_do_site(caminho_repo, base):
    """Link para a versão on-line: .md vira doc.html?path=...; o resto, o próprio arquivo."""
    if caminho_repo.endswith(".md"):
        return base + "doc.html?path=" + caminho_repo
    return base + caminho_repo


def aula_para_html(md, doc, base=SITE, deslocar=1):
    """Markdown da aula (já preparado) -> fragmento HTML. `doc` é o caminho da aula no repositório
    (docs/...): links e imagens relativos se resolvem a partir dele. Títulos descem `deslocar`
    níveis (o título da aula é a faixa ou o h2 do capítulo)."""
    import markdown
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(markdown.markdown(md, extensions=["tables", "fenced_code", "sane_lists"]), "lxml")
    corpo = soup.body or soup
    pasta = (REPO / doc).parent
    for a in corpo.find_all("a", href=True):
        href = a["href"]
        if re.match(r"^[a-z]+:", href, flags=re.I) or href.startswith("#"):
            continue
        alvo, _, frag = href.partition("#")
        rel = os.path.relpath((pasta / alvo).resolve(), REPO).replace(os.sep, "/")
        if rel.startswith(".."):
            continue
        a["href"] = url_do_site(rel, base) + ("#" + frag if frag else "")
    for img in corpo.find_all("img", src=True):
        s = img["src"]
        if not re.match(r"^[a-z]+:", s, flags=re.I):
            local = (pasta / s).resolve()
            img["src"] = svg_para_pdf(local) if local.suffix == ".svg" and local.exists() else local.as_uri()
        if not img.get("alt") or img.get("alt") == "diagram":
            img["alt"] = "Diagrama"
    for p in corpo.find_all("p"):
        img = p.find("img")
        if img is not None and p.get_text().strip() == "" and len(p.find_all("img")) == 1:
            fig = soup.new_tag("figure", attrs={"class": "gh-figure"})
            fig.append(img.extract())
            p.replace_with(fig)
    for t in corpo.find_all("table"):
        t["class"] = "gh-print-table"
        for c in t.find_all(["td", "th"]):
            for attr in ("align", "style"):
                if c.has_attr(attr):
                    del c[attr]
    if deslocar:
        for n in (5, 4, 3, 2):
            for h in corpo.find_all("h%d" % n):
                h.name = "h%d" % min(6, n + deslocar)
    return "".join(str(e) for e in corpo.contents)


# ---------------------------------------------------------------------------
# Documento
# ---------------------------------------------------------------------------
def fonte_css():
    return "".join(
        "@font-face { font-family: 'Reddit Sans'; font-weight: %d; src: url('%s'); }\n"
        % (peso, (PDF_DIR / "fontes" / ("RedditSans-%d.ttf" % peso)).as_uri()) for peso in (400, 700, 800))


CSS = fonte_css() + """
@page { size: A4; margin: 0; }
@page content {
  size: A4; margin: 20mm 20mm 32mm 20mm;
  @bottom-center { content: element(gh-footer); width: 100%; vertical-align: top; padding: 0; margin: 0; }
}
@page cover { size: A4; margin: 0; }
:root { --primary-purple: #613EFF; --dark-navy: #0A005A; --bg-soft: #F2F1F6; --border-soft: #E9DFFF;
  --text-strong: #202020; --text-body: #2D3748; --text-muted: #666666; --section-color: #0A005A; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Reddit Sans', sans-serif; color: var(--text-body); background: #fff; }
a { color: #3F28A6; }
code { font-family: 'DejaVu Sans Mono', monospace; font-size: 88%; color: var(--dark-navy); }
pre { font-family: 'DejaVu Sans Mono', monospace; font-size: 8.5pt; line-height: 1.35; color: var(--text-body);
  background: var(--bg-soft); border: 1px solid var(--border-soft); border-radius: 6px; padding: 10px 12px;
  white-space: pre-wrap; margin: 0 0 14px; }
pre code { font-size: inherit; }
strong { color: var(--text-strong); }

/* capa (print-cover.md) */
.gh-page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page: cover; }
.gh-shape { position: absolute; display: block; }
.gh-cover__logo { position: absolute; left: 20mm; top: 20mm; height: 12mm; width: auto; }
.gh-cover__content { position: absolute; left: 20mm; right: 20mm; top: 32%; }
.gh-cover__eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 11px; font-weight: 700; color: var(--dark-navy); opacity: .7; margin: 0 0 12px; }
.gh-cover__title { font-weight: 800; font-size: 44px; line-height: 1.06; letter-spacing: -0.025em; color: var(--dark-navy); margin: 0 0 18px; max-width: 16ch; }
.gh-cover__subtitle { font-size: 14px; line-height: 1.55; max-width: 46ch; color: var(--text-body); margin: 0; }
.gh-cover__footer { position: absolute; left: 20mm; bottom: 16mm; }
.gh-cover__footer img { height: 34px; width: auto; vertical-align: middle; margin-right: 36px; }

/* contracapa (encerramento da skill, em A4) */
.gh-back__block { position: absolute; left: 20mm; right: 60mm; bottom: 112mm; }
.gh-back__label { text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: var(--dark-navy); opacity: .7; margin: 0 0 6px; }
.gh-back__autores { font-size: 15px; line-height: 1.6; font-weight: 700; color: var(--dark-navy); margin: 0 0 10mm; }
.gh-back__contato { font-size: 14px; line-height: 1.6; color: var(--text-body); margin: 0; }
.gh-back__contato strong { color: var(--dark-navy); }
.gh-back__logos { position: absolute; left: 20mm; bottom: 16mm; }
.gh-back__row { margin: 0 0 9mm; }
.gh-back__row:last-child { margin: 0; }
.gh-back__row img { height: 22px; width: auto; vertical-align: middle; margin-right: 26px; }
.gh-back__row--projetos img { height: 40px; margin: 0 18px 10px 0; }
.gh-back__row--projetos img.gh-back__ipea { height: 26px; }

/* sumário */
.gh-toc { page: content; break-before: page; }
.gh-toc h2 { color: var(--primary-purple); font-size: 22pt; font-weight: 800; margin: 0 0 10mm; }
.gh-toc ol { list-style: none; margin: 0; padding: 0; }
.gh-toc > ol > li { margin: 0 0 6mm; }
.gh-toc__nivel { font-weight: 800; color: var(--dark-navy); font-size: 12pt; }
.gh-toc ol ol { margin-top: 2mm; }
.gh-toc ol ol li { font-size: 10.5pt; margin: 0 0 1.5mm 6mm; }
.gh-toc a { color: var(--text-body); text-decoration: none; }
.gh-toc a::after { content: leader('.') target-counter(attr(href), page); color: var(--text-muted); }

/* capítulo = nível (print-header.md) */
.gh-chapter { page: content; break-before: page; }
.gh-band { padding: 2mm 0 9mm; border-bottom: 2px solid var(--border-soft); color: var(--dark-navy); margin-bottom: 10mm; }
.gh-band__row { display: flex; align-items: center; }
.gh-band__num { font-size: 56px; font-weight: 800; line-height: 1; color: var(--dark-navy); opacity: .45; min-width: 34mm; margin-right: 8mm; }
.gh-band__eyebrow { text-transform: uppercase; letter-spacing: 2px; font-size: 11px; font-weight: 700; color: var(--dark-navy); opacity: .7; margin-bottom: 7px; }
.gh-band__title { color: var(--primary-purple); font-size: 22pt; font-weight: 800; line-height: 1.2; margin: 0; bookmark-level: 1; }
.gh-band__desc { font-size: 11.5pt; line-height: 1.5; margin: 6mm 0 0; }

/* aula */
.gh-aula { break-before: page; }
.gh-chapter > .gh-aula:first-of-type { break-before: auto; }
.gh-aula__eyebrow { text-transform: uppercase; letter-spacing: 1.5px; font-size: 9.5pt; font-weight: 700; color: var(--dark-navy); opacity: .75; margin: 0 0 4px; }
.gh-aula__title { color: var(--dark-navy); font-size: 18pt; font-weight: 800; line-height: 1.2; margin: 0 0 4mm; bookmark-level: 2; }
.gh-aula__link { font-size: 9pt; color: var(--text-muted); margin: 0 0 8mm; }
.gh-aula--sozinha .gh-aula__title { color: var(--primary-purple); font-size: 22pt; bookmark-level: 1; }
.gh-aula--sozinha { page: content; }

/* corpo (escala print-header.md) */
.gh-body h3 { font-size: 15pt; color: var(--primary-purple); margin: 16px 0 8px; bookmark-level: 3; break-after: avoid; }
.gh-aula--sozinha .gh-body h3 { bookmark-level: 2; }
.gh-body h4 { font-size: 12.5pt; color: var(--dark-navy); margin: 14px 0 6px; break-after: avoid; }
.gh-body h5, .gh-body h6 { font-size: 11.5pt; color: var(--dark-navy); margin: 12px 0 6px; break-after: avoid; }
.gh-body p  { font-size: 11pt; line-height: 1.5; margin: 0 0 10px; }
.gh-body li { font-size: 11pt; line-height: 1.5; margin-bottom: 3px; }
.gh-body ul, .gh-body ol { margin: 0 0 10px; padding-left: 22px; }
.gh-body blockquote { margin: 0 0 12px; padding: 10px 14px; border-left: 3px solid var(--primary-purple); background: var(--bg-soft); break-inside: avoid; }
.gh-body blockquote p { margin: 0 0 4px; font-size: 10.5pt; }
.gh-body blockquote p:last-child { margin: 0; }
.gh-body hr { border: 0; border-top: 1px solid var(--border-soft); margin: 14px 0; }
.gh-figure { margin: 6px 0 14px; text-align: center; break-inside: avoid; }
.gh-figure img { max-width: 100%; max-height: 125mm; height: auto; }

/* tabela (print-table.md) */
.gh-print-table { width: 100%; border-collapse: collapse; margin: 0 0 14px; }
.gh-print-table thead { display: table-header-group; }
.gh-print-table thead th { background: var(--section-color); color: #fff; font-weight: 700; font-size: 9.5pt; text-align: left; padding: 6pt 8pt; }
.gh-print-table tbody td { padding: 5pt 8pt; font-size: 9.5pt; border-bottom: 1px solid var(--border-soft); vertical-align: top; line-height: 1.35; }
.gh-print-table tbody tr { break-inside: avoid; }
.gh-print-table tbody tr:nth-child(even) td { background: var(--bg-soft); }
.gh-print-table td code { font-size: 8.6pt; overflow-wrap: anywhere; }

/* rodapé (print-footer.md) */
.gh-footer-run { position: running(gh-footer); height: 32mm; }
.gh-footer-bar { margin-top: 9mm; height: 2px; background: var(--border-soft); }
.gh-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6.5mm; height: 9.5mm; }
.gh-footer__text { font-size: 9pt; color: var(--text-muted); }
.gh-footer__page { font-size: 9pt; font-weight: 800; color: var(--dark-navy); margin-right: 10px; }
.gh-footer__page::before { content: counter(page); }
.gh-footer__logo { height: 9.5mm; width: auto; }
"""


def logo(nome):
    return (PDF_DIR / "logo" / nome).as_uri()


def rodape(texto):
    return ('<div class="gh-footer-run"><div class="gh-footer-bar"></div><div class="gh-footer">'
            '<span class="gh-footer__text"><span class="gh-footer__page"></span>%s &middot; Trilhas de capacitação '
            '&middot; Gov Hub &middot; Lab Livre - UnB</span><img class="gh-footer__logo" alt="" src="%s"></div></div>'
            % (html.escape(texto), logo("icone-none-navy.svg")))


def capa(eyebrow, titulo, subtitulo):
    return """
<div class="gh-page">
  <svg class="gh-shape" viewBox="0 0 100 100" style="right:-1px; bottom:-1px; width:104mm; height:104mm"><path fill="%(p)s" d="M100 100H0A100 100 0 0 1 100 0z"/></svg>
  <svg class="gh-shape" viewBox="0 0 266 100" style="left:-26mm; top:64mm; width:74mm; height:27.8mm"><rect width="266" height="100" rx="50" fill="%(s)s"/></svg>
  <svg class="gh-shape" viewBox="0 0 100 100" style="right:-12mm; top:22mm; width:40mm; height:40mm"><path fill="%(n)s" fill-rule="evenodd" d="M50 0a50 50 0 1 0 0 100a50 50 0 1 0 0-100zM50 25.6a24.4 24.4 0 1 1 0 48.8a24.4 24.4 0 1 1 0-48.8z"/></svg>
  <img class="gh-cover__logo" src="%(logo)s" alt="Gov Hub">
  <div class="gh-cover__content">
    <p class="gh-cover__eyebrow">%(eyebrow)s</p>
    <h1 class="gh-cover__title">%(titulo)s</h1>
    <p class="gh-cover__subtitle">%(sub)s</p>
  </div>
  <div class="gh-cover__footer"><img src="%(lab)s" alt="Lab Livre"><img src="%(unb)s" alt="UnB"></div>
</div>""" % {"p": PURPLE, "s": SOFT, "n": NAVY, "logo": logo("logomarca-horizontal-navy.svg"),
             "eyebrow": html.escape(eyebrow), "titulo": html.escape(titulo), "sub": html.escape(subtitulo),
             "lab": logo("parceiros/lab-livre-black.svg"), "unb": logo("parceiros/unb-dark-outlined.svg")}


def contracapa():
    def linha(classe, rotulo, logos):
        imgs = []
        for i, (f, a) in enumerate(logos):
            extra = ' class="gh-back__ipea"' if f.startswith("ipea") else ""
            imgs.append('<img%s src="%s" alt="%s">' % (extra, logo("parceiros/" + f), html.escape(a)))
            if classe and i == 2:
                imgs.append("<br>")   # projetos em duas linhas: Ipea, MinC, MIR / MCID, MGI
        return '<div class="gh-back__row %s"><p class="gh-back__label">%s</p>%s</div>' % (classe, rotulo, "".join(imgs))
    return """
<div class="gh-page">
  <svg class="gh-shape" viewBox="0 0 100 100" style="right:-1px; bottom:-1px; width:60mm; height:60mm"><path fill="%(p)s" d="M100 100H0A100 100 0 0 1 100 0z"/></svg>
  <svg class="gh-shape" viewBox="0 0 100 100" style="right:-12mm; top:22mm; width:40mm; height:40mm"><path fill="%(n)s" fill-rule="evenodd" d="M50 0a50 50 0 1 0 0 100a50 50 0 1 0 0-100zM50 25.6a24.4 24.4 0 1 1 0 48.8a24.4 24.4 0 1 1 0-48.8z"/></svg>
  <svg class="gh-shape" viewBox="0 0 266 100" style="left:-26mm; top:64mm; width:74mm; height:27.8mm"><rect width="266" height="100" rx="50" fill="%(s)s"/></svg>
  <img class="gh-cover__logo" src="%(logo)s" alt="Gov Hub">
  <div class="gh-back__block">
    <p class="gh-back__label">Autoria</p>
    <p class="gh-back__autores">%(autores)s</p>
    <p class="gh-back__label">Contato</p>
    <p class="gh-back__contato"><strong>%(site)s</strong><br>%(email)s</p>
  </div>
  <div class="gh-back__logos">%(real)s%(proj)s</div>
</div>""" % {"p": PURPLE, "s": SOFT, "n": NAVY, "logo": logo("logomarca-horizontal-navy.svg"),
             "autores": "<br>".join(html.escape(a) for a in AUTORES), "site": CONTATO[0], "email": CONTATO[1],
             "real": linha("", "Realização", REALIZACAO), "proj": linha("gh-back__row--projetos", "Projetos", PROJETOS)}


def documento(titulo, partes):
    return ('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>%s · Gov Hub</title>'
            '<style>%s</style></head><body>%s</body></html>' % (html.escape(titulo), CSS, "".join(partes)))


def ancora(aula_id):
    return "aula-" + re.sub(r"[^a-z0-9]+", "-", aula_id.lower()).strip("-")


def bloco_aula(item, corpo_html, base, sozinha=False):
    eyebrow = item["tipo_nome"] + ("" if item["papel"] == "core" else " · " + PAPEL.get(item["papel"], ""))
    url = url_do_site(item["doc"], base)
    return ('<section class="gh-aula%s" id="%s"><p class="gh-aula__eyebrow">%s</p><h2 class="gh-aula__title">%s</h2>'
            '<p class="gh-aula__link"><a href="%s">Abrir esta aula no site</a></p><div class="gh-body">%s</div></section>'
            % (" gh-aula--sozinha" if sozinha else "", ancora(item["id"]), html.escape(eyebrow),
               html.escape(item["titulo"]), html.escape(url), corpo_html))


def html_da_aula(item, corpo_html, base):
    return documento(item["titulo"], [rodape(item["titulo"]), bloco_aula(item, corpo_html, base, sozinha=True)])


def html_da_trilha(trilha, corpos, base):
    """`corpos`: {id da aula: fragmento HTML}."""
    partes = [capa("Trilha de capacitação", trilha["titulo"], trilha.get("chamada") or trilha["descricao"])]
    toc = ['<section class="gh-toc">', rodape(trilha["titulo"]), "<h2>Sumário</h2><ol>"]
    for n in [x for x in trilha["niveis"] if x.get("status") != "em-breve"]:
        toc.append('<li><span class="gh-toc__nivel">Nível %d · %s</span><ol>' % (n["numero"], html.escape(n["titulo"])))
        for it in n["itens"]:
            toc.append('<li><a href="#%s">%s</a></li>' % (ancora(it["id"]), html.escape(it["titulo"])))
        toc.append("</ol></li>")
    toc.append("</ol></section>")
    partes.append("".join(toc))
    for n in [x for x in trilha["niveis"] if x.get("status") != "em-breve"]:
        sec = ['<section class="gh-chapter">', rodape(trilha["titulo"]),
               '<div class="gh-band"><div class="gh-band__row"><div class="gh-band__num">%02d</div><div>'
               '<div class="gh-band__eyebrow">Nível %d%s</div><h2 class="gh-band__title">%s</h2></div></div>%s</div>'
               % (n["numero"], n["numero"], (" · " + html.escape(n["etapa"])) if n.get("etapa") else "",
                  html.escape(n["titulo"]),
                  ('<p class="gh-band__desc">%s</p>' % html.escape(n["descricao"])) if n.get("descricao") else "")]
        for it in n["itens"]:
            sec.append(bloco_aula(it, corpos[it["id"]], base))
        sec.append("</section>")
        partes.append("".join(sec))
    partes.append(contracapa())
    return documento(trilha["titulo"], partes)


# ---------------------------------------------------------------------------
# Execução
# ---------------------------------------------------------------------------
def carregar_trilhas(slug=None):
    cat = json.loads((REPO / "docs" / "trilhas" / "index.json").read_text(encoding="utf-8"))
    slugs = [t["slug"] for t in cat["trilhas"] if not slug or t["slug"] == slug]
    if slug and not slugs:
        sys.exit("trilha não encontrada: %s" % slug)
    return [json.loads((REPO / "docs" / "trilhas" / (s + ".json")).read_text(encoding="utf-8")) for s in slugs]


def escrever(html_txt, destino, so_html):
    destino.parent.mkdir(parents=True, exist_ok=True)
    if so_html:
        destino.with_suffix(".html").write_text(html_txt, encoding="utf-8")
        return
    from weasyprint import HTML
    HTML(string=html_txt, base_url=str(REPO)).write_pdf(str(destino))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--saida", default=str(REPO / "pdf"))
    ap.add_argument("--trilha", help="só esta trilha (e as aulas dela)")
    ap.add_argument("--aula", help="só esta aula (id), sem PDF de trilha")
    ap.add_argument("--base", default=SITE, help="endereço do site, para os links das aulas")
    ap.add_argument("--so-html", action="store_true", help="escreve o HTML em vez do PDF (para conferir)")
    a = ap.parse_args(argv)
    saida = Path(a.saida).resolve()
    trilhas = carregar_trilhas(a.trilha)
    itens = {}
    for t in trilhas:
        for n in t["niveis"]:
            for it in n["itens"]:
                itens.setdefault(it["id"], it)
    if a.aula:
        if a.aula not in itens:
            sys.exit("aula não encontrada: %s" % a.aula)
        itens = {a.aula: itens[a.aula]}
    corpos = {}
    with tempfile.TemporaryDirectory() as tmp:
        for i, (aula_id, it) in enumerate(itens.items(), 1):
            _titulo, md = preparar_markdown((REPO / it["doc"]).read_text(encoding="utf-8"))
            if tem_mermaid(md):
                pasta = Path(tmp) / ("m%d" % i)
                pasta.mkdir()
                md = renderizar_mermaid(md, pasta, "aula") or sem_mermaid(md)
            corpos[aula_id] = aula_para_html(md, it["doc"], a.base)
            escrever(html_da_aula(it, corpos[aula_id], a.base), saida / pdf_da_aula(aula_id), a.so_html)
            print("[%d/%d] %s" % (i, len(itens), pdf_da_aula(aula_id)))
        if not a.aula:
            for t in trilhas:
                escrever(html_da_trilha(t, corpos, a.base), saida / pdf_da_trilha(t["slug"]), a.so_html)
                print("trilha:", pdf_da_trilha(t["slug"]))


if __name__ == "__main__":
    main()

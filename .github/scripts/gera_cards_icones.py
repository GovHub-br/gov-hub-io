"""
Gera as imagens de card das publicações a partir dos ícones do Gov Hub
(GovHub-br/skills-assets, pasta gov-hub/icons): cada ícone entra no molde dos cards
atuais (fundo navy 388 × 307, círculo branco ao centro) e vira
docs/land/dist/images/publicacoes/icone-<nome>.svg, que o painel /admin/ lista na
escolha da imagem do card. Também refaz config.svg, contributing.svg e paper.svg (ver SUBSTITUI).

    python3 .github/scripts/gera_cards_icones.py

Rodar de novo quando entrarem ícones novos: recria os icone-*.svg e apaga os que saíram
do repositório de ícones. Ícones de controle de interface (setas, negrito, play...) ficam
de fora, e o que tiver script ou link externo é recusado (o SVG é servido no domínio do site).
"""
import io
import re
import sys
import tarfile
import urllib.request
from pathlib import Path

ORIGEM = "https://codeload.github.com/GovHub-br/skills-assets/tar.gz/main"
PASTA_ICONES = "/gov-hub/icons/"
DESTINO = Path("docs/land/dist/images/publicacoes")

DE_FORA = re.compile(
    r"^(arrow|chevron|bars|ellipsis|x-mark|minus|plus|battery|signal|pause|play|stop|backspace|"
    r"backward|forward|cursor|currency|document-currency)(-|$)|"
    r"^(bold|italic|underline|strikethrough|h1|h2|h3|divide|equals|slash|sort|percent-badge|gif|"
    r"list-bullet|numbered-list|view-columns|speaker-x-mark|bell-slash|bookmark-slash|bolt-slash|"
    r"eye-slash|link-slash|video-camera-slash|phone-x-mark|archive-box-x-mark|no-symbol|logout|login)$"
)
# Setas que funcionam como ilustração (indicadores, atualização)
MANTER = {"arrow-trending-up", "arrow-trending-down", "arrow-path"}
# Ilustrações antigas, já usadas pelo site e pelos posts, refeitas a partir dos ícones (nome do arquivo: ícone)
SUBSTITUI = {"config": "settings", "contributing": "pessoal", "paper": "paper"}
PERIGOSO = re.compile(r"<script|<foreignObject|\son\w+\s*=|(?:xlink:)?href\s*=\s*[\"'](?!#)", re.I)

# Molde dos cards (o mesmo de compras.svg): o ícone ocupa 96 px no círculo de 168 px
MOLDE = """<svg width="388" height="307" viewBox="0 0 388 307" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="388" height="307" fill="#0A005A"/>
<rect x="110" y="70" width="168" height="168" rx="84" fill="white"/>
<g transform="translate(146 106) scale({escala})">
{conteudo}
</g>
</svg>
"""


def _icones():
    """(nome, svg) de cada ícone do pacote, lidos direto do .tar.gz, sem extrair."""
    with urllib.request.urlopen(ORIGEM, timeout=60) as resposta:
        pacote = tarfile.open(fileobj=io.BytesIO(resposta.read()), mode="r:gz")
    for membro in pacote.getmembers():
        if membro.isfile() and PASTA_ICONES in membro.name and membro.name.endswith(".svg"):
            nome = re.sub(r"(-sober)?\.svg$", "", membro.name.rsplit("/", 1)[1])
            yield nome, pacote.extractfile(membro).read().decode("utf-8")


def _card(svg):
    raiz = re.search(r"<svg\b[^>]*>", svg)
    lado = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', raiz.group(0))
    conteudo = svg[raiz.end():svg.rindex("</svg>")].strip()
    escala = round(96 / max(float(lado.group(1)), float(lado.group(2))), 3)
    return MOLDE.format(escala=escala, conteudo=conteudo)


def main():
    feitos, recusados = set(), []
    for nome, svg in sorted(_icones()):
        if PERIGOSO.search(svg):
            recusados.append(nome)
            continue
        for antigo in (a for a, icone in SUBSTITUI.items() if icone == nome):
            (DESTINO / f"{antigo}.svg").write_text(_card(svg), encoding="utf-8")
        if DE_FORA.search(nome) and nome not in MANTER:
            continue
        arquivo = DESTINO / f"icone-{nome}.svg"
        arquivo.write_text(_card(svg), encoding="utf-8")
        feitos.add(arquivo.name)
    antigos = [p for p in DESTINO.glob("icone-*.svg") if p.name not in feitos]
    for p in antigos:
        p.unlink()
    print(f"✅ {len(feitos)} cards de ícone em {DESTINO}, {len(antigos)} removidos")
    if recusados:
        print(f"⚠️ Recusados (script ou link externo): {', '.join(recusados)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

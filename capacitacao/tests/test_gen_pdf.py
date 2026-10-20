import importlib.util, os, tempfile, unittest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("gen_pdf", os.path.join(REPO, "tools", "gen_pdf.py"))
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)

try:
    import markdown, bs4  # noqa: F401
    TEM_MARKDOWN = True
except ImportError:
    TEM_MARKDOWN = False
try:
    import weasyprint  # noqa: F401
    TEM_WEASYPRINT = True
except Exception:
    TEM_WEASYPRINT = False

DOC = "docs/explicacao/por-que-fazer-um-dashboard.md"


class Caminhos(unittest.TestCase):
    def test_pdf_da_aula_e_da_trilha(self):
        # o site monta estes mesmos caminhos (assets/leitor.js e assets/mapa.js)
        self.assertEqual(gen.pdf_da_aula("explicacao/hierarquia-visual"), "aulas/explicacao/hierarquia-visual.pdf")
        self.assertEqual(gen.pdf_da_trilha("dashboards"), "trilhas/dashboards.pdf")

    def test_url_do_site(self):
        self.assertEqual(gen.url_do_site("docs/a/b.md", "https://x/"), "https://x/doc.html?path=docs/a/b.md")
        self.assertEqual(gen.url_do_site("assets/x.png", "https://x/"), "https://x/assets/x.png")


class Svg(unittest.TestCase):
    def test_estilo_de_classe_vira_atributo(self):
        svg = ('<svg><defs><style>.rot{font:600 12.5px Reddit Sans,sans-serif;fill:#202020}'
               '.cam{stroke:#613EFF;fill:none}</style></defs>'
               '<text class="rot" x="1">A</text><text class="rot" fill="#fff">B</text><path class="cam" d="M0 0"/></svg>')
        out = gen.svg_achatado(svg)
        self.assertNotIn("<style>", out)
        self.assertIn('<text font-weight="600" font-size="12.5px" font-family="Reddit Sans,sans-serif" fill="#202020" class="rot" x="1">', out)
        self.assertIn('<text font-weight="600" font-size="12.5px" font-family="Reddit Sans,sans-serif" class="rot" fill="#fff">', out)   # o atributo do elemento vence
        self.assertIn('<path stroke="#613EFF" fill="none" class="cam"', out)

    def test_as_ilustracoes_do_site_ficam_sem_style(self):
        pasta = os.path.join(REPO, "assets", "ilustracoes")
        for nome in os.listdir(pasta):
            with open(os.path.join(pasta, nome), encoding="utf-8") as f:
                self.assertNotIn("<style>", gen.svg_achatado(f.read()), nome)


class Markdown(unittest.TestCase):
    def test_tira_titulo_e_tipo_e_travessao_fora_do_codigo(self):
        titulo, md = gen.preparar_markdown(
            "# Título\n\n> Tipo: **Explicação**\n\nUm — dois — três.\n\n```\na — b\n```\n")
        self.assertEqual(titulo, "Título")
        self.assertNotIn("Tipo:", md)
        self.assertIn("Um, dois, três.", md)
        self.assertIn("a — b", md)   # código fica como está

    def test_sem_mermaid_vira_aviso(self):
        md = "Antes\n\n```mermaid\ngraph TD\nA-->B\n```\n\nDepois\n"
        self.assertTrue(gen.tem_mermaid(md))
        saida = gen.sem_mermaid(md)
        self.assertNotIn("graph TD", saida)
        self.assertIn("versão on-line", saida)

    def test_sem_mmdc_nao_renderiza(self):
        antigo = os.environ.pop("MMDC", None)
        try:
            self.assertIsNone(gen.renderizar_mermaid("x", tempfile.mkdtemp(), "a"))
        finally:
            if antigo is not None:
                os.environ["MMDC"] = antigo


@unittest.skipUnless(TEM_MARKDOWN, "markdown e beautifulsoup4 não instalados")
class Html(unittest.TestCase):
    def test_links_imagens_e_titulos(self):
        md = ("## Seção\n\nVeja [outra](../referencia/glossario.md#termos), [site](https://exemplo.gov.br) "
              "e [âncora](#secao).\n\n![Figura](../../assets/diagramas/x.png)\n\n| a | b |\n|---|---|\n| 1 | 2 |\n")
        h = gen.aula_para_html(md, DOC, base="https://site/")
        self.assertIn('href="https://site/doc.html?path=docs/referencia/glossario.md#termos"', h)
        self.assertIn('href="https://exemplo.gov.br"', h)
        self.assertIn('href="#secao"', h)
        self.assertIn('<figure class="gh-figure"><img alt="Figura" src="file://', h)
        self.assertIn("/assets/diagramas/x.png", h)
        self.assertIn('<table class="gh-print-table">', h)
        self.assertIn("<h3>Seção</h3>", h)   # o título da aula ocupa o nível de cima

    def test_trilha_tem_capa_sumario_e_um_capitulo_por_nivel(self):
        trilha = {"slug": "t", "titulo": "Trilha T", "descricao": "D", "niveis": [
            {"numero": 0, "titulo": "Base", "descricao": "Abre.", "itens": [
                {"id": "explicacao/a", "titulo": "Aula A", "doc": "docs/explicacao/a.md", "tipo_nome": "Explicação", "papel": "core"}]},
            {"numero": 1, "titulo": "Prática", "descricao": "", "itens": [
                {"id": "guias/b", "titulo": "Aula B", "doc": "docs/guias/b.md", "tipo_nome": "Guia", "papel": "support"}]},
            {"numero": 2, "titulo": "Vídeos", "descricao": "Em breve.", "status": "em-breve", "itens": []}]}
        h = gen.html_da_trilha(trilha, {"explicacao/a": "<p>a</p>", "guias/b": "<p>b</p>"}, "https://s/")
        self.assertEqual(h.count('class="gh-chapter"'), 2)   # o nível em breve não entra
        self.assertNotIn("Vídeos", h)
        self.assertIn('href="#aula-explicacao-a"', h)
        self.assertIn('id="aula-guias-b"', h)
        self.assertIn("Guia · Apoio", h)
        self.assertIn(">00<", h)
        # contracapa no fim: autoria e parceiros na ordem Lab Livre, UnB, Ipea, ministérios
        fim = h[h.rindex('class="gh-page"'):]
        for nome in gen.AUTORES:
            self.assertIn(nome, fim)
        ordem = [fim.index(f) for f in ("lab-livre", "unb-dark", "ipea_", "cultura_", "mir_", "cidades_", "mgi_")]
        self.assertEqual(ordem, sorted(ordem))


@unittest.skipUnless(TEM_MARKDOWN and TEM_WEASYPRINT, "weasyprint não instalado")
class Pdf(unittest.TestCase):
    def test_gera_pdf_de_uma_aula(self):
        saida = tempfile.mkdtemp()
        gen.main(["--saida", saida, "--trilha", "dashboards", "--aula", "explicacao/por-que-fazer-um-dashboard"])
        with open(os.path.join(saida, "aulas", "explicacao", "por-que-fazer-um-dashboard.pdf"), "rb") as f:
            self.assertEqual(f.read(5), b"%PDF-")


if __name__ == "__main__":
    unittest.main()

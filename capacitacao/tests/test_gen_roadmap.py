import importlib.util, json, os, tempfile, unittest, zipfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("gen", os.path.join(REPO, "tools", "gen_roadmap.py"))
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)

CABECALHO = "---\nslug: teste\ntitulo: Trilha teste\ndescricao: Uma trilha.\ncategoria: negocial\n---\n"
CORPO = ("# Trilha\n\n## Nível 0 · Base\nAbertura do nível.\n\n"
         "- [explanation] **Por que** — core — `docs/explicacao/por-que-fazer-um-dashboard.md`\n"
         "- [reference] **Glossário** — support — `docs/referencia/glossario.md`\n")


class Cabecalho(unittest.TestCase):
    def test_le_campos(self):
        meta, corpo = gen.ler_cabecalho(CABECALHO + CORPO, "t.md")
        self.assertEqual(meta["slug"], "teste")
        self.assertEqual(meta["titulo"], "Trilha teste")
        self.assertEqual(corpo[0], "# Trilha")

    def test_exige_cabecalho(self):
        with self.assertRaises(SystemExit):
            gen.ler_cabecalho(CORPO, "t.md")

    def test_exige_campos_obrigatorios(self):
        with self.assertRaises(SystemExit):
            gen.ler_cabecalho("---\nslug: x\ntitulo: X\n---\n" + CORPO, "t.md")

    def test_slug_valido(self):
        with self.assertRaises(SystemExit):
            gen.ler_cabecalho(CABECALHO.replace("teste", "Teste Ruim"), "t.md")

    def test_diagrama_exige_alt(self):
        cab = "---\nslug: teste\ntitulo: T\ndescricao: D\ncategoria: negocial\ndiagrama: assets/x.png\n---\n"
        with self.assertRaises(SystemExit):
            gen.ler_cabecalho(cab + CORPO, "t.md")

    def test_exige_categoria_conhecida(self):
        with self.assertRaises(SystemExit):
            gen.ler_cabecalho(CABECALHO.replace("categoria: negocial\n", ""), "t.md")
        with self.assertRaises(SystemExit):
            gen.ler_cabecalho(CABECALHO.replace("negocial", "outra"), "t.md")


class Validacoes(unittest.TestCase):
    def test_documento_repetido_na_mesma_trilha(self):
        levels, _ = gen.parse((CORPO + "- [reference] **De novo** — core — `docs/referencia/glossario.md`\n").split("\n"))
        with self.assertRaises(SystemExit):
            gen.validar_repetidos(levels, "t.md")


class Geracao(unittest.TestCase):
    def gerar(self, arquivos):
        trilhas = tempfile.mkdtemp()
        saida = tempfile.mkdtemp()
        for nome, texto in arquivos.items():
            open(os.path.join(trilhas, nome), "w", encoding="utf-8").write(texto)
        return gen.gerar(trilhas, saida), saida

    def test_json_da_trilha_e_catalogo(self):
        metas, saida = self.gerar({"teste.md": CABECALHO + CORPO})
        self.assertEqual([m["slug"] for m in metas], ["teste"])
        trilha = json.load(open(os.path.join(saida, "teste.json"), encoding="utf-8"))
        itens = trilha["niveis"][0]["itens"]
        self.assertEqual([i["id"] for i in itens], ["explicacao/por-que-fazer-um-dashboard", "referencia/glossario"])
        self.assertEqual(itens[1]["papel"], "support")
        self.assertEqual(trilha["categoria"], "negocial")
        catalogo = json.load(open(os.path.join(saida, "index.json"), encoding="utf-8"))
        self.assertEqual(catalogo["trilhas"][0]["categoria"], "negocial")
        self.assertEqual(catalogo["trilhas"][0]["aulas"], [i["id"] for i in itens])
        self.assertEqual(catalogo["trilhas"][0]["niveis"], 1)
        for nome in ("teste.md", "teste.xmind", "index.md"):
            self.assertTrue(os.path.exists(os.path.join(saida, nome)), nome)

    def test_catalogo_poe_negociais_antes_das_tecnicas(self):
        tecnica = CABECALHO.replace("teste", "aaa").replace("negocial", "tecnica")
        metas, saida = self.gerar({"teste.md": CABECALHO + CORPO, "aaa.md": tecnica + CORPO})
        self.assertEqual([m["slug"] for m in metas], ["teste", "aaa"])
        catalogo = json.load(open(os.path.join(saida, "index.json"), encoding="utf-8"))
        self.assertEqual([t["slug"] for t in catalogo["trilhas"]], ["teste", "aaa"])

    def test_nome_do_arquivo_igual_ao_slug(self):
        # os links gerados apontam para trilhas/<slug>.md
        with self.assertRaises(SystemExit) as cm:
            self.gerar({"outro-nome.md": CABECALHO + CORPO})
        self.assertIn("teste.md", str(cm.exception.code))
        with self.assertRaises(SystemExit):
            self.gerar({"a.md": CABECALHO + CORPO, "b.md": CABECALHO + CORPO})

    def test_caminho_do_doc_validado(self):
        for ruim in ("explicacao/x.md", "docs/explicacao/x.txt", "docs/../README.md",
                     "docs/explicacao/../../x.md", "docs\\explicacao\\x.md", "/docs/x.md"):
            corpo = CORPO + "- [reference] **Ruim** — core — `%s`\n" % ruim
            with self.assertRaises(SystemExit, msg=ruim) as cm:
                self.gerar({"teste.md": CABECALHO + corpo})
            msg = str(cm.exception.code)
            self.assertIn("trilhas/teste.md", msg)
            self.assertIn("linha 14", msg)   # 6 linhas de cabeçalho + 8 do corpo

    def test_apaga_saidas_de_trilha_removida(self):
        trilhas = tempfile.mkdtemp()
        saida = tempfile.mkdtemp()
        open(os.path.join(trilhas, "teste.md"), "w", encoding="utf-8").write(CABECALHO + CORPO)
        for nome in ("velha.json", "velha.md", "velha.xmind", "leia-me.txt"):
            open(os.path.join(saida, nome), "w").write("x")
        gen.gerar(trilhas, saida)
        self.assertEqual(sorted(os.listdir(saida)),
                         ["index.json", "index.md", "leia-me.txt", "teste.json", "teste.md", "teste.xmind"])

    def test_xmind_deterministico(self):
        _, s1 = self.gerar({"teste.md": CABECALHO + CORPO})
        _, s2 = self.gerar({"teste.md": CABECALHO + CORPO})
        self.assertEqual(open(os.path.join(s1, "teste.xmind"), "rb").read(),
                         open(os.path.join(s2, "teste.xmind"), "rb").read())
        with zipfile.ZipFile(os.path.join(s1, "teste.xmind")) as z:
            for info in z.infolist():
                self.assertEqual(info.date_time, (1980, 1, 1, 0, 0, 0))
                self.assertEqual(info.compress_type, zipfile.ZIP_STORED)


class Etapas(unittest.TestCase):
    """Lógica da trilha (etapas), etapa e ícone de cada nível, chamada e status."""
    CAB = ("---\nslug: teste\ntitulo: T\ndescricao: D\ncategoria: negocial\n"
           "chamada: Frase do mapa.\nstatus: em-breve\n"
           "etapas: Por quê=Fundamentos | Como=Execução\n"
           "etapas_subtitulo: Duas etapas\netapas_nota: **Nota** com destaque.\n---\n")
    CORPO = ("# T\n\n## Nível 0 · Base\nEtapa: Por quê · Ícone: light-bulb\nAbertura.\n\n"
             "- [explanation] **A** — core — `docs/explicacao/por-que-fazer-um-dashboard.md`\n\n"
             "## Nível 1 · Prática\nEtapa: Como · Ícone: wrench\n\n"
             "- [reference] **B** — capstone — `docs/referencia/glossario.md`\n")

    def gerar(self, texto):
        trilhas, saida = tempfile.mkdtemp(), tempfile.mkdtemp()
        open(os.path.join(trilhas, "teste.md"), "w", encoding="utf-8").write(texto)
        gen.gerar(trilhas, saida)
        return (json.load(open(os.path.join(saida, "teste.json"), encoding="utf-8")),
                json.load(open(os.path.join(saida, "index.json"), encoding="utf-8")))

    def test_campos_no_json(self):
        trilha, catalogo = self.gerar(self.CAB + self.CORPO)
        self.assertEqual(trilha["chamada"], "Frase do mapa.")
        self.assertEqual(trilha["status"], "em-breve")
        self.assertEqual(catalogo["trilhas"][0]["status"], "em-breve")
        self.assertEqual(trilha["etapas"], [{"rotulo": "Por quê", "caixa": "Fundamentos"},
                                            {"rotulo": "Como", "caixa": "Execução"}])
        self.assertEqual(trilha["etapas_subtitulo"], "Duas etapas")
        self.assertEqual(trilha["etapas_nota"], "**Nota** com destaque.")
        n0, n1 = trilha["niveis"]
        self.assertEqual((n0["etapa"], n0["icone"]), ("Por quê", "assets/icones/light-bulb-sober.svg"))
        self.assertEqual(n0["descricao"], "Abertura.")   # a linha de etapa não entra na abertura
        self.assertEqual(n1["etapa"], "Como")

    def test_campos_opcionais(self):
        trilha, catalogo = self.gerar(CABECALHO + CORPO)
        for campo in ("chamada", "status", "etapas", "etapas_subtitulo", "etapas_nota"):
            self.assertNotIn(campo, trilha)
        self.assertNotIn("etapa", trilha["niveis"][0])
        self.assertNotIn("status", catalogo["trilhas"][0])

    def test_etapa_do_nivel_precisa_existir(self):
        with self.assertRaises(SystemExit):
            self.gerar(self.CAB + self.CORPO.replace("Etapa: Como", "Etapa: Outra"))

    def test_icone_precisa_existir(self):
        with self.assertRaises(SystemExit):
            self.gerar(self.CAB + self.CORPO.replace("Ícone: wrench", "Ícone: nao-existe"))

    def test_status_oculta(self):
        trilha, catalogo = self.gerar(self.CAB.replace("em-breve", "oculta") + self.CORPO)
        self.assertEqual(catalogo["trilhas"][0]["status"], "oculta")

    def test_status_conhecido(self):
        with self.assertRaises(SystemExit):
            self.gerar(self.CAB.replace("em-breve", "talvez") + self.CORPO)


class NivelEmBreve(unittest.TestCase):
    """Nível anunciado, ainda sem aulas (ex.: os vídeos de mão na massa)."""
    def gerar(self, corpo):
        trilhas, saida = tempfile.mkdtemp(), tempfile.mkdtemp()
        open(os.path.join(trilhas, "teste.md"), "w", encoding="utf-8").write(CABECALHO + corpo)
        gen.gerar(trilhas, saida)
        return (json.load(open(os.path.join(saida, "teste.json"), encoding="utf-8")),
                json.load(open(os.path.join(saida, "index.json"), encoding="utf-8")))

    def test_nivel_em_breve_sem_aulas(self):
        trilha, catalogo = self.gerar(CORPO + "\n## Nível 1 · Mão na massa\nStatus: em-breve\nVídeos no Superset e no Power BI.\n")
        n1 = trilha["niveis"][1]
        self.assertEqual((n1["status"], n1["itens"], n1["descricao"]), ("em-breve", [], "Vídeos no Superset e no Power BI."))
        self.assertNotIn("status", trilha["niveis"][0])
        self.assertEqual(catalogo["trilhas"][0]["niveis"], 1)   # o catálogo conta os níveis abertos

    def test_nivel_em_breve_nao_tem_aulas(self):
        with self.assertRaises(SystemExit):
            self.gerar(CORPO.replace("## Nível 0 · Base\n", "## Nível 0 · Base\nStatus: em-breve\n"))

    def test_nivel_aberto_precisa_de_aula(self):
        with self.assertRaises(SystemExit):
            self.gerar(CORPO + "\n## Nível 1 · Vazio\nSó a abertura.\n")

    def test_status_de_nivel_conhecido(self):
        with self.assertRaises(SystemExit):
            self.gerar(CORPO + "\n## Nível 1 · X\nStatus: depois\n")
        with self.assertRaises(SystemExit):   # oculta vale para a trilha, não para o nível
            self.gerar(CORPO + "\n## Nível 1 · X\nStatus: oculta\n")


if __name__ == "__main__":
    unittest.main()

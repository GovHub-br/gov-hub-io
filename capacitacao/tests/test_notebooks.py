"""Executa os notebooks do nível 0 de Engenharia de Dados (dados sintéticos, sem internet).

Cada notebook roda duas vezes: como o aluno recebe, com as células "Sua vez" em branco, e com as
respostas guardadas nos metadados dessas células. Nas duas, nada pode quebrar; com as respostas,
toda conferência precisa passar. O único quadro [ERRO] permitido é o da célula marcada "falhar",
que faz um teste falhar de propósito.

Precisa de: duckdb, httpx, pandas, matplotlib, nbclient, nbformat e ipykernel. Sem eles, os testes
são pulados (`pip install duckdb httpx pandas matplotlib nbclient nbformat ipykernel`).
"""
import importlib.util
import os
import shutil
import tempfile
import unittest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(REPO, "notebooks")
NOTEBOOKS = sorted(n for n in os.listdir(PASTA) if n.startswith("engenharia-fundamentos-") and n.endswith(".ipynb"))
FALTAM = [m for m in ("duckdb", "httpx", "pandas", "matplotlib", "nbclient", "nbformat", "ipykernel")
          if importlib.util.find_spec(m) is None]


def executar(nome, com_respostas):
    import nbformat
    from nbclient import NotebookClient

    nb = nbformat.read(os.path.join(PASTA, nome), as_version=4)
    for c in nb.cells:
        if c.cell_type == "code" and c.source.startswith("%pip"):
            c.source = "pass  # pacotes já instalados no ambiente de teste"
        resposta = c.metadata.get("govhub", {}).get("resposta")
        if com_respostas and resposta:
            c.source = resposta
    pasta = tempfile.mkdtemp()
    try:
        NotebookClient(nb, timeout=180, kernel_name="python3", resources={"metadata": {"path": pasta}}).execute()
    finally:
        shutil.rmtree(pasta, ignore_errors=True)
    return nb


def saida(celula):
    partes = []
    for o in celula.get("outputs", []):
        if o.get("output_type") == "stream":
            partes.append(o["text"])
        elif "data" in o:
            partes.append(o["data"].get("text/html", o["data"].get("text/plain", "")))
    return "".join(partes)


@unittest.skipIf(FALTAM, "faltam pacotes para executar os notebooks: " + ", ".join(FALTAM))
class NotebooksDoNivel0(unittest.TestCase):
    def test_ha_seis_notebooks(self):
        self.assertEqual(len(NOTEBOOKS), 6, NOTEBOOKS)

    def test_rodam_como_o_aluno_recebe(self):
        for nome in NOTEBOOKS:
            with self.subTest(nome=nome):
                nb = executar(nome, com_respostas=False)
                pendentes = sum("Ainda sem resposta" in saida(c) for c in nb.cells if c.cell_type == "code")
                self.assertGreaterEqual(pendentes, 1, "a conferência deve pedir a resposta que falta")

    def test_respostas_passam_nas_conferencias(self):
        for nome in NOTEBOOKS:
            with self.subTest(nome=nome):
                nb = executar(nome, com_respostas=True)
                for c in nb.cells:
                    if c.cell_type != "code":
                        continue
                    texto = saida(c)
                    self.assertNotIn("Ainda sem resposta", texto)
                    if "falhar" not in c.metadata.get("tags", []):
                        self.assertNotIn("[ERRO]", texto, c.source[:80])


if __name__ == "__main__":
    unittest.main()

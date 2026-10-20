#!/usr/bin/env python3
"""
Gera os artefatos de todas as trilhas a partir de trilhas/*.md.

Entrada: cada trilhas/<slug>.md começa com um cabeçalho `---` (slug, titulo, descricao,
categoria e, opcionalmente, chamada, status, etapas + etapas_subtitulo + etapas_nota,
diagrama + diagrama_alt) seguido do corpo em Markdown com níveis (`## Nível N · Título`,
seguido opcionalmente de `Etapa: <rótulo> · Ícone: <nome>`) e itens
(`- [tipo] **Título** — papel — `docs/....md``).

Saídas, em docs/trilhas/:
  <slug>.json   a trilha para o mapa, o leitor e o catálogo
  <slug>.md     a versão em texto
  <slug>.xmind  o mapa mental (determinístico: data fixa no zip)
  index.json    o catálogo das trilhas (negociais antes das técnicas; dentro delas, ordem de slug)
  index.md      o catálogo em texto
Saídas de trilhas que não existem mais em trilhas/ são apagadas. O arquivo da trilha
precisa se chamar <slug>.md, e cada doc precisa ser docs/<...>.md (sem .. nem \\).

Regra de ids: id da aula = caminho do doc sem `docs/` e sem `.md`. Vale em todas as
trilhas e é a chave do progresso; por isso um doc não pode se repetir na mesma trilha.
Todo .md referenciado que ainda não existe ganha um esqueleto (nunca se sobrescreve).

Uso:  python3 tools/gen_roadmap.py
"""
import re, os, json, zipfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRILHAS_DIR = os.path.join(REPO, "trilhas")
OUT_DIR = os.path.join(REPO, "docs", "trilhas")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
AVISO = "Gerado por tools/gen_roadmap.py a partir de trilhas/ - nao edite a mao."
CAMPOS_OBRIGATORIOS = ("slug", "titulo", "descricao", "categoria")
# categoria -> posição no catálogo. Negocial: para quem usa os dados; técnica: para quem opera a plataforma.
CATEGORIAS = {"negocial": 0, "tecnica": 1}
STATUS = ("em-breve", "oculta")   # trilha: em-breve = card desabilitado; oculta = fora da lista (o link direto ainda abre)
STATUS_NIVEL = ("em-breve",)       # nível anunciado, ainda sem aulas
ICONES_DIR = os.path.join(REPO, "assets", "icones")
QUIZ_DIR = os.path.join(REPO, "quiz")   # quiz/<slug>.json, editado à mão: o JSON da trilha aponta para ele   # ícone do nível: assets/icones/<nome>-sober.svg
XMIND_DATA = (1980, 1, 1, 0, 0, 0)   # data fixa e sem compressão (ZIP_STORED): o .xmind só muda com o conteúdo e é idêntico em qualquer
                                      # versão do zlib (a saída do deflate varia entre builds)

# tipo -> (rótulo, classe CSS, pasta padrão, slug/template do esqueleto, ícone do tipo)
# O ícone é um ícone de produto Gov Hub (variante -sober) copiado para assets/icones/:
# os tipos se distinguem por ícone e nome, não por cor (ADR 0003).
TYPE_INFO = {
    "tutorial":    ("Tutorial",   "t-tut", "tutoriais",  "tutorial",   "assets/icones/book-open-sober.svg"),
    "how-to":      ("Guia",       "t-gui", "guias",      "guia",       "assets/icones/wrench-sober.svg"),
    "reference":   ("Referência", "t-ref", "referencia", "referencia", "assets/icones/document-text-sober.svg"),
    "explanation": ("Explicação", "t-exp", "explicacao", "explicacao", "assets/icones/light-bulb-sober.svg"),
    "challenge":   ("Desafio",    "t-des", "desafios",   "desafio",    "assets/icones/trophy-sober.svg"),
    "research":    ("Pesquisa",   "t-res", "pesquisa",   "pesquisa",   "assets/icones/beaker-sober.svg"),
}
ROLE_DISPLAY = {"core": "Essencial", "support": "Apoio", "capstone": "Capstone",
                "optional": "Opcional", "advanced": "Avançado"}
SUPPORT_ROLES = ("support", "optional")

ITEM_RE  = re.compile(r'^- \[([^\]]+)\]\s+\*\*(.+?)\*\*\s+—\s+(.+?)\s+—\s+`([^`]+)`\s*$')
LEVEL_RE = re.compile(r'^##\s+Nível\s+(\d+)\s+·\s+(.+)$')
STATUS_NIVEL_RE = re.compile(r'^Status:\s*(\S+)$')
ETAPA_RE = re.compile(r'^Etapa:\s*(.+?)\s*·\s*Ícone:\s*([a-z0-9-]+)$')

def parse(lines, inicio=0):
    """`inicio`: quantas linhas do arquivo vêm antes de `lines` (o cabeçalho), para as mensagens."""
    levels, cur, dropped = [], None, []
    for idx, raw in enumerate(lines, start=inicio):
        s = raw.strip()
        m = LEVEL_RE.match(s)
        if m:
            cur = {"num": int(m.group(1)), "title": m.group(2).strip(), "desc": "", "items": [], "linha": idx + 1}
            levels.append(cur)
            continue
        if cur is None:
            continue
        em = ETAPA_RE.match(s)
        if em and not cur["items"]:
            cur["etapa"], cur["icone"] = em.group(1), em.group(2)
            continue
        sm = STATUS_NIVEL_RE.match(s)
        if sm and not cur["items"]:
            if sm.group(1) not in STATUS_NIVEL:
                raise SystemExit("Status de nível inválido %r (linha %d): use %s" % (sm.group(1), idx + 1, " ou ".join(STATUS_NIVEL)))
            cur["status"] = sm.group(1)
            continue
        if s.startswith("- ["):
            im = ITEM_RE.match(s)
            if not im:
                raise SystemExit("Item malformado (linha %d):\n  %s" % (idx + 1, s))
            typ, title, role, doc = (g.strip() for g in im.groups())
            if typ not in TYPE_INFO:
                raise SystemExit("Tipo inválido %r (linha %d): %s" % (typ, idx + 1, s))
            if role not in ROLE_DISPLAY:
                raise SystemExit("Papel inválido %r (linha %d): %s" % (role, idx + 1, s))
            cur["items"].append({"type": typ, "title": title, "role": role, "doc": doc, "linha": idx + 1})
        elif s.startswith("- ") or s == "-":
            dropped.append((idx + 1, raw))      # bullet que NÃO é um item válido
        elif s and not s.startswith("#") and not s.startswith(">") and not cur["items"]:
            # acumula o parágrafo de abertura do nível até o primeiro item
            cur["desc"] = (cur["desc"] + " " + s).strip()
    if not levels:
        raise SystemExit("Nenhum nível encontrado")
    return levels, dropped


STUB_BODY = {
    "tutorial":   "## O que você vai construir\n_A definir._\n\n## Pré-requisitos\n- _A definir._\n\n## Passos\n1. _A definir._\n\n## O que você aprendeu\n- _A definir._\n",
    "guia":       "## Objetivo\n_A definir._\n\n## Antes de começar\n- _A definir._\n\n## Passos\n1. _A definir._\n\n## Pronto\n_Como verificar que funcionou._\n",
    "referencia": "## Resumo\n_A definir._\n\n## Detalhes\n_A definir._\n\n## Observações\n_A definir._\n",
    "explicacao": "## Contexto\n_Por que isso importa._\n\n## A ideia\n_A definir._\n\n## Trade-offs e alternativas\n_A definir._\n",
    "desafio":    "## O desafio\n_A definir._\n\n## Público real\n_Para quem este painel existe._\n\n## O que entregar\n- _A definir._\n\n## Critérios de aceitação\n- _A definir._\n",
    "pesquisa":   "## Pergunta de pesquisa\n_A definir._\n\n## Metodologia\n_A definir._\n\n## Resultados\n_A definir._\n\n## Conclusão\n_A definir._\n",
}


def scaffold_missing(levels):
    created = []
    for lv in levels:
        for it in lv["items"]:
            full = os.path.join(REPO, it["doc"])
            if os.path.exists(full):
                continue
            label, _cls, _folder, tpl, _icone = TYPE_INFO[it["type"]]
            os.makedirs(os.path.dirname(full), exist_ok=True)
            content = ("# %s\n\n> Rascunho — a escrever. Tipo: %s · "
                       "Template: ../../templates/%s.md\n\n%s"
                       "\n## Saiba mais\n- _A definir._\n\n## Conteúdo relacionado\n- _A definir._\n"
                       % (it["title"], label, tpl, STUB_BODY[tpl]))
            with open(full, "w", encoding="utf-8") as f:
                f.write(content)
            created.append(it["doc"])
    return created


def data_id(doc):
    d = doc
    if d.startswith("docs/"):
        d = d[len("docs/"):]
    if d.endswith(".md"):
        d = d[:-len(".md")]
    return d



def ler_cabecalho(texto, origem):
    """Lê o bloco `---` do topo (linhas `chave: valor`). Devolve (meta, linhas do corpo)."""
    linhas = texto.split("\n")
    if not linhas or linhas[0].strip() != "---":
        raise SystemExit("%s: falta o cabeçalho (--- slug, titulo, descricao, categoria ---) no topo" % origem)
    meta, fim = {}, None
    for i in range(1, len(linhas)):
        l = linhas[i].strip()
        if l == "---":
            fim = i
            break
        if not l:
            continue
        if ":" not in l:
            raise SystemExit("%s: linha de cabeçalho inválida: %r" % (origem, linhas[i]))
        chave, valor = l.split(":", 1)
        meta[chave.strip()] = valor.strip()
    if fim is None:
        raise SystemExit("%s: cabeçalho sem o --- de fechamento" % origem)
    for campo in CAMPOS_OBRIGATORIOS:
        if not meta.get(campo):
            raise SystemExit("%s: cabeçalho sem %r" % (origem, campo))
    if not SLUG_RE.match(meta["slug"]):
        raise SystemExit("%s: slug inválido %r (use letras minúsculas, números e hífen)" % (origem, meta["slug"]))
    if meta["categoria"] not in CATEGORIAS:
        raise SystemExit("%s: categoria inválida %r (use %s)" % (origem, meta["categoria"], " ou ".join(CATEGORIAS)))
    if meta.get("status") and meta["status"] not in STATUS:
        raise SystemExit("%s: status inválido %r (use %s, ou omita)" % (origem, meta["status"], " ou ".join(STATUS)))
    if meta.get("etapas"):
        meta["etapas"] = ler_etapas(meta["etapas"], origem)
    if bool(meta.get("diagrama")) != bool(meta.get("diagrama_alt")):
        raise SystemExit("%s: diagrama e diagrama_alt andam juntos" % origem)
    return meta, linhas[fim + 1:]


def ler_etapas(texto, origem):
    """`Rótulo=Caixa | Rótulo=Caixa` -> [{"rotulo", "caixa"}], na ordem."""
    etapas = []
    for parte in texto.split("|"):
        if "=" not in parte:
            raise SystemExit("%s: etapa sem '=' em %r (use Rótulo=Descrição | ...)" % (origem, parte.strip()))
        rotulo, caixa = (x.strip() for x in parte.split("=", 1))
        if not rotulo or not caixa:
            raise SystemExit("%s: etapa incompleta %r" % (origem, parte.strip()))
        etapas.append({"rotulo": rotulo, "caixa": caixa})
    return etapas


def validar_niveis(levels, origem):
    """Nível em breve é só anúncio (sem aulas); nível aberto precisa de pelo menos uma aula."""
    for lv in levels:
        if lv.get("status") == "em-breve" and lv["items"]:
            raise SystemExit("%s (linha %d): o nível %d está em breve e não pode ter aulas"
                             % (origem, lv["linha"], lv["num"]))
        if not lv.get("status") and not lv["items"]:
            raise SystemExit("%s (linha %d): o nível %d não tem aulas (se ele ainda vai chegar, "
                             "use a linha `Status: em-breve`)" % (origem, lv["linha"], lv["num"]))


def validar_etapas(meta, levels, origem):
    """A etapa de cada nível precisa estar nas etapas do cabeçalho; o ícone precisa existir."""
    rotulos = [e["rotulo"] for e in meta.get("etapas") or []]
    for lv in levels:
        if "etapa" not in lv:
            continue
        if lv["etapa"] not in rotulos:
            raise SystemExit("%s (linha %d): etapa %r não está em `etapas:` do cabeçalho"
                             % (origem, lv["linha"], lv["etapa"]))
        if not os.path.exists(os.path.join(ICONES_DIR, lv["icone"] + "-sober.svg")):
            raise SystemExit("%s (linha %d): ícone %r não existe em assets/icones/ (baixe %s-sober.svg da "
                             "biblioteca GovHub-br/skills-assets)" % (origem, lv["linha"], lv["icone"], lv["icone"]))


def validar_caminhos(levels, origem):
    """O doc precisa ser um .md dentro de docs/: é o que o leitor abre e o que vira o id da aula."""
    for lv in levels:
        for it in lv["items"]:
            doc = it["doc"]
            if ("\\" in doc or not doc.startswith("docs/") or not doc.endswith(".md")
                    or ".." in doc.split("/")):
                raise SystemExit("%s (linha %s): caminho de doc inválido %r — use docs/<pasta>/<nome>.md, "
                                 "sem .. nem barra invertida" % (origem, it.get("linha", "?"), doc))


def validar_repetidos(levels, origem):
    """O id da aula é o caminho do doc: o mesmo doc duas vezes na trilha teria um só progresso."""
    vistos = {}
    for lv in levels:
        for it in lv["items"]:
            if it["doc"] in vistos:
                raise SystemExit("%s: %s aparece duas vezes na trilha (níveis %d e %d)"
                                 % (origem, it["doc"], vistos[it["doc"]], lv["num"]))
            vistos[it["doc"]] = lv["num"]


def json_da_trilha(meta, levels):
    niveis = []
    for lv in levels:
        itens = []
        for it in lv["items"]:
            label, _cls, _pasta, slug_tipo, icone = TYPE_INFO[it["type"]]
            itens.append({
                "id": data_id(it["doc"]), "titulo": it["title"], "doc": it["doc"],
                "tipo": slug_tipo, "tipo_nome": label,
                "papel": it["role"], "papel_nome": ROLE_DISPLAY[it["role"]],
                "icone": icone,
            })
        nivel = {"numero": lv["num"], "titulo": lv["title"], "descricao": lv["desc"]}
        if "etapa" in lv:
            nivel["etapa"] = lv["etapa"]
            nivel["icone"] = "assets/icones/%s-sober.svg" % lv["icone"]
        if lv.get("status"):
            nivel["status"] = lv["status"]
        nivel["itens"] = itens
        niveis.append(nivel)
    dados = {"_aviso": AVISO, "slug": meta["slug"], "titulo": meta["titulo"], "descricao": meta["descricao"],
             "categoria": meta["categoria"]}
    for campo in ("chamada", "status", "etapas", "etapas_subtitulo", "etapas_nota"):
        if meta.get(campo):
            dados[campo] = meta[campo]
    if os.path.exists(os.path.join(QUIZ_DIR, meta["slug"] + ".json")):
        dados["quiz"] = "quiz/%s.json" % meta["slug"]
    if meta.get("diagrama"):
        dados["diagrama"] = meta["diagrama"]
        dados["diagrama_alt"] = meta["diagrama_alt"]
    dados["niveis"] = niveis
    return dados


def escrever_json(caminho, dados):
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(json.dumps(dados, ensure_ascii=False, indent=2) + "\n")


def gen_xmind(meta, levels, caminho):
    _c = [0]
    def nid():
        _c[0] += 1
        return "n%03d" % _c[0]

    def topic(title, role=None, note=None, children=None):
        t = {"id": nid(), "class": "topic", "title": title}
        if role:
            t["labels"] = [role]
        if note:
            t["notes"] = {"plain": {"content": note}}
        if children:
            t["children"] = {"attached": children}
        return t

    level_topics = []
    for lv in levels:
        kids = [topic(it["title"], role=ROLE_DISPLAY[it["role"]], note=it["doc"]) for it in lv["items"]]
        titulo = "Nível %d · %s" % (lv["num"], lv["title"]) + (" (em breve)" if lv.get("status") else "")
        level_topics.append(topic(titulo, note=lv["desc"], children=kids))

    root = topic(meta["titulo"],
                 note="Faça os itens essenciais de cada nível primeiro, de cima para baixo; "
                      "os itens de apoio e opcionais vêm depois.",
                 children=level_topics)
    sheet_id = nid()
    content  = [{"id": sheet_id, "class": "sheet", "title": "Trilha de aprendizagem", "rootTopic": root}]
    metadata = {"creator": {"name": "XMind", "version": "12.0.0"}, "activeSheetId": sheet_id}
    manifest = {"file-entries": {"content.json": {}, "metadata.json": {}}}

    dump = lambda o: json.dumps(o, ensure_ascii=False).encode("utf-8")
    if os.path.exists(caminho):
        os.remove(caminho)
    with zipfile.ZipFile(caminho, "w") as z:
        for nome, obj in (("content.json", content), ("metadata.json", metadata), ("manifest.json", manifest)):
            z.writestr(zipfile.ZipInfo(nome, date_time=XMIND_DATA), dump(obj), compress_type=zipfile.ZIP_STORED)


def gen_texto(meta, levels, caminho):
    def line(it):
        label = TYPE_INFO[it["type"]][0]
        rel   = "../" + (it["doc"][len("docs/"):] if it["doc"].startswith("docs/") else it["doc"])
        role  = ("**%s**" % ROLE_DISPLAY[it["role"]]) if it["role"] in ("core", "capstone") else ROLE_DISPLAY[it["role"]]
        return "- [%s](%s) — *%s* · %s" % (it["title"], rel, label, role)

    out = ["# %s\n" % meta["titulo"], meta["descricao"] + "\n",
           "> Versão visual, com progresso: **[mapa da trilha](../../mapa.html?trilha=%s)**" % meta["slug"],
           "> Gerado a partir de **[trilhas/%s.md](../../trilhas/%s.md)** por `tools/gen_roadmap.py` — não edite à mão.\n"
           % (meta["slug"], meta["slug"]),
           "---\n"]
    for lv in levels:
        out.append("### Nível %d · %s" % (lv["num"], lv["title"]) + (" (em breve)" if lv.get("status") else ""))
        out.append("*%s*" % lv["desc"])
        for it in lv["items"]:
            out.append(line(it))
        out.append("")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


def gen_catalogo_texto(metas_e_levels, caminho):
    out = ["# Trilhas\n"]
    for meta, _levels in metas_e_levels:
        out.append("- [%s](%s.md) — %s" % (meta["titulo"], meta["slug"], meta["descricao"]))
    with open(caminho, "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


def warnings(levels):
    msgs = []
    nums = [lv["num"] for lv in levels]
    for n in sorted(set(x for x in nums if nums.count(x) > 1)):
        msgs.append("número de nível duplicado: %d" % n)
    return msgs


def carregar(trilhas_dir):
    """Lê e valida todas as trilhas. Devolve [(meta, levels, dropped, origem)] na ordem do catálogo."""
    trilhas = []
    for nome in sorted(os.listdir(trilhas_dir)):
        if not nome.endswith(".md"):
            continue
        origem = os.path.join("trilhas", nome)
        with open(os.path.join(trilhas_dir, nome), encoding="utf-8") as f:
            texto = f.read()
        meta, corpo = ler_cabecalho(texto, origem)
        if nome != meta["slug"] + ".md":
            raise SystemExit("%s: o arquivo deve se chamar %s.md (o slug do cabeçalho); "
                             "os links gerados apontam para trilhas/<slug>.md" % (origem, meta["slug"]))
        levels, dropped = parse(corpo, inicio=len(texto.split("\n")) - len(corpo))
        validar_caminhos(levels, origem)
        validar_repetidos(levels, origem)
        validar_niveis(levels, origem)
        validar_etapas(meta, levels, origem)
        trilhas.append((meta, levels, dropped, origem))
    slugs = [m["slug"] for m, _l, _d, _o in trilhas]
    repetidos = sorted(set(s for s in slugs if slugs.count(s) > 1))
    if repetidos:
        raise SystemExit("slug repetido entre trilhas: %s" % ", ".join(repetidos))
    if not trilhas:
        raise SystemExit("nenhuma trilha em %s" % trilhas_dir)
    trilhas.sort(key=lambda t: (CATEGORIAS[t[0]["categoria"]], t[0]["slug"]))
    return trilhas


def gerar(trilhas_dir, out_dir):
    """Gera tudo de todas as trilhas. Devolve as metas na ordem do catálogo."""
    trilhas = carregar(trilhas_dir)
    os.makedirs(out_dir, exist_ok=True)
    catalogo = []
    for meta, levels, _dropped, _origem in trilhas:
        dados = json_da_trilha(meta, levels)
        escrever_json(os.path.join(out_dir, meta["slug"] + ".json"), dados)
        gen_texto(meta, levels, os.path.join(out_dir, meta["slug"] + ".md"))
        gen_xmind(meta, levels, os.path.join(out_dir, meta["slug"] + ".xmind"))
        catalogo.append({
            "slug": meta["slug"], "titulo": meta["titulo"], "descricao": meta["descricao"], "categoria": meta["categoria"],
            **({"status": meta["status"]} if meta.get("status") else {}),
            "niveis": len([lv for lv in levels if not lv.get("status")]), "aulas": [i["id"] for n in dados["niveis"] for i in n["itens"]],
        })
    escrever_json(os.path.join(out_dir, "index.json"), {"_aviso": AVISO, "trilhas": catalogo})
    gen_catalogo_texto([(m, l) for m, l, _d, _o in trilhas], os.path.join(out_dir, "index.md"))
    apagar_orfaos(out_dir, {m["slug"] for m, _l, _d, _o in trilhas})
    return [t[0] for t in trilhas]


def apagar_orfaos(out_dir, slugs):
    """Apaga <slug>.json|.md|.xmind de trilhas que não existem mais (nunca o index.*)."""
    apagados = []
    for nome in sorted(os.listdir(out_dir)):
        base, ext = os.path.splitext(nome)
        if ext in (".json", ".md", ".xmind") and base != "index" and base not in slugs:
            os.remove(os.path.join(out_dir, nome))
            apagados.append(nome)
            print("  - apagado (trilha não existe mais): docs/trilhas/%s" % nome)
    return apagados


def main():
    trilhas = carregar(TRILHAS_DIR)
    criados = {}
    for meta, levels, _d, _o in trilhas:          # esqueletos antes dos JSONs, como sempre
        criados[meta["slug"]] = scaffold_missing(levels)
    gerar(TRILHAS_DIR, OUT_DIR)

    for meta, levels, dropped, origem in trilhas:
        aulas = sum(len(lv["items"]) for lv in levels)
        print("%s: %d nível(is), %d aula(s)" % (meta["slug"], len(levels), aulas))
        if dropped:
            print("  AVISO: %d linha(s) de bullet IGNORADA(S) em %s — não são itens válidos" % (len(dropped), origem))
            print("    formato esperado:  - [tipo] **Título** — papel — `caminho`")
            for n, raw in dropped:
                print("     L%-3d %r" % (n, raw))
        for c in criados[meta["slug"]]:
            print("  + esqueleto criado: %s" % c)
        for w in warnings(levels):
            print("  - %s" % w)
    print("-> docs/trilhas/: <slug>.json|.md|.xmind, index.json, index.md")


if __name__ == "__main__":
    main()

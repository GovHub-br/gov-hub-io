// Regras do mapa da trilha, da busca e do quiz: puras, sem DOM — testadas em tests/hub-nucleo.test.js.
// `niveis` vem de docs/trilhas/<slug>.json; `feitos` é o mapa {id da aula: true}.

// Nível que o mapa abre quando o link não diz qual: o primeiro com aula pendente.
export function nivelPadrao(feitos, niveis) {
  const pendente = niveis.find((n) => !emBreve(n) && n.itens.some((i) => !feitos[i.id]));
  return pendente ? pendente.numero : (niveis[0] ? niveis[0].numero : 0);
}

// Nível anunciado, ainda sem aulas (`Status: em-breve` em trilhas/<slug>.md).
export const emBreve = (nivel) => nivel.status === 'em-breve';

// Os cinco papéis da trilha viram três marcações no mapa: essencial, apoio e marco.
export function papelVisual(papel) {
  if (papel === 'core') return 'essencial';
  if (papel === 'capstone') return 'marco';
  return 'apoio';
}

export function normalizarBusca(texto) {
  return String(texto).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// Aulas cujo título contém o termo, na ordem das trilhas e dos níveis.
export function buscarAulas(trilhas, termo, limite = 8) {
  const t = normalizarBusca(termo);
  if (!t) return [];
  const achados = [];
  for (const trilha of trilhas) {
    for (const nivel of trilha.niveis) {
      for (const item of nivel.itens) {
        if (!normalizarBusca(item.titulo).includes(t)) continue;
        achados.push({ trilha: trilha.slug, trilhaTitulo: trilha.titulo, nivel: nivel.numero, nivelTitulo: nivel.titulo, item });
        if (achados.length >= limite) return achados;
      }
    }
  }
  return achados;
}

// Perguntas do quiz/<slug>.json na ordem da trilha; aula sem pergunta fica de fora.
export function perguntasDaTrilha(niveis, banco) {
  const lista = [];
  for (const nivel of niveis) {
    for (const item of nivel.itens) {
      const p = banco[item.id];
      if (p) lista.push({ id: item.id, titulo: item.titulo, nivel: nivel.numero, nivelTitulo: nivel.titulo, ...p });
    }
  }
  return lista;
}

export function corrigirQuiz(perguntas, respostas) {
  const acertos = perguntas.filter((p) => respostas[p.id] === p.correta).length;
  const completo = perguntas.every((p) => respostas[p.id] !== undefined);
  return { acertos, total: perguntas.length, completo };
}

// Andamento da trilha em níveis: um nível conta quando todas as suas aulas estão feitas.
export function niveisConcluidos(feitos, niveis) {
  const abertos = niveis.filter((n) => !emBreve(n));
  const feitosN = abertos.filter((n) => n.itens.length > 0 && n.itens.every((i) => feitos[i.id])).length;
  return { feitos: feitosN, total: abertos.length, percentual: abertos.length ? Math.round((feitosN / abertos.length) * 100) : 0 };
}

// PDFs gerados por tools/gen_pdf.py no deploy (pasta pdf/ do site publicado).
export const pdfDaAula = (id) => 'pdf/aulas/' + id + '.pdf';
export const pdfDaTrilha = (slug) => 'pdf/trilhas/' + encodeURIComponent(slug) + '.pdf';

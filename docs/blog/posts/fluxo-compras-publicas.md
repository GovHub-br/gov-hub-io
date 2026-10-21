---
date: 2026-10-16
# Escondida por enquanto: rascunho não entra no build (nem nos cards de Publicações e da home).
draft: true
categories:
  - Políticas públicas
  - Compras públicas
card_image: /land/dist/images/publicacoes/compras.svg
card_label: Políticas públicas
description: Como uma necessidade dentro de um órgão público vira compra. O fluxo da Lei nº 14.133/2021, lido bloco a bloco.
---

# Do pedido ao contrato: o fluxo das compras públicas

Como uma necessidade dentro de um órgão público vira compra. O fluxo operacional da Lei nº 14.133/2021, lido bloco a bloco, com os conceitos que ajudam a enxergar a política por trás do procedimento.

<!-- more -->

<!-- Guia interativo (lupas com rolagem, explorador e glossário). Estilo e script em
     docs/global-assets/fluxo-compras/ (IDV do Gov Hub). -->
<div class="fc">
<link rel="stylesheet" href="/global-assets/fluxo-compras/fluxo.css?v=20261016c">

<div class="fc-intro wrap">
  <svg class="hero-mark" viewBox="0 0 560 44" aria-hidden="true">
    <line x1="18" y1="22" x2="540" y2="22" stroke="var(--edge)" stroke-width="2"/>
    <circle cx="18" cy="22" r="13" fill="var(--orgao)"/>
    <rect x="58" y="8" width="84" height="28" rx="3" fill="var(--orgao)"/>
    <polygon points="196,2 222,22 196,42 170,22" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.6" stroke-dasharray="5 3"/>
    <rect x="250" y="8" width="84" height="28" rx="3" fill="var(--lic)"/>
    <rect x="350" y="8" width="60" height="28" rx="3" fill="var(--forn)"/>
    <rect x="426" y="8" width="72" height="28" rx="3" fill="var(--dir)"/>
    <circle cx="530" cy="22" r="13" fill="var(--fora)"/>
  </svg>
  <p class="meta"><span><b>2</b> atores com raias próprias</span><span><b>4</b> pontos de decisão</span><span><b>5</b> lupas</span><a href="#explore">Ir direto ao explorador</a></p>
</div>

<section class="wrap" id="legenda" style="padding-block:28px 8px">
  <h2 style="font-size:clamp(24px,3vw,32px)">Como ler o desenho</h2>
  <ul class="legend">
    <li><svg viewBox="0 0 52 32"><circle cx="16" cy="16" r="11" fill="var(--orgao)"/><circle cx="38" cy="16" r="11" fill="var(--rosa)"/></svg><div><b>Início</b><span>do órgão (roxo) e do fornecedor (rosa)</span></div></li>
    <li><svg viewBox="0 0 52 32"><circle cx="26" cy="16" r="12" fill="var(--fora)"/><path d="M19 16h12m-5-5 5 5-5 5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>Fim</b><span>com seta, liga a outro subprocesso</span></div></li>
    <li><svg viewBox="0 0 52 32"><rect x="4" y="5" width="44" height="22" rx="3" fill="var(--orgao)"/><rect x="4" y="21" width="44" height="6" fill="var(--paper)" fill-opacity=".9"/></svg><div><b>Etapa do órgão</b><span>faixa inferior: norma da etapa</span></div></li>
    <li><svg viewBox="0 0 52 32"><rect x="4" y="5" width="44" height="22" rx="3" fill="var(--forn)"/></svg><div><b>Etapa do fornecedor</b></div></li>
    <li><svg viewBox="0 0 52 32"><rect x="4" y="5" width="44" height="22" rx="3" fill="var(--lic)"/></svg><div><b>Etapa da licitação</b></div></li>
    <li><svg viewBox="0 0 52 32"><rect x="4" y="5" width="44" height="22" rx="3" fill="var(--dir)"/></svg><div><b>Etapa da contratação direta</b></div></li>
    <li><svg viewBox="0 0 52 32"><rect x="4" y="5" width="44" height="22" rx="3" fill="var(--fora)"/><rect x="20" y="20" width="12" height="12" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.2"/><path d="M26 22.5v7M22.5 26h7" stroke="var(--ink)" stroke-width="1.5"/></svg><div><b>Subprocesso</b><span>ícone + remete a outro desenho</span></div></li>
    <li><svg viewBox="0 0 52 32"><polygon points="26,2 46,16 26,30 6,16" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.4" stroke-dasharray="4 3"/></svg><div><b>Decisão</b><span>pergunta com “sim” ou “não”</span></div></li>
    <li><svg viewBox="0 0 52 32"><rect x="4" y="6" width="44" height="20" rx="2" fill="var(--paper)" stroke="var(--muted)" stroke-width="1.3" stroke-dasharray="4 3"/></svg><div><b>Instrumento</b><span>documento ou mecanismo da etapa</span></div></li>
    <li><svg viewBox="0 0 52 32"><rect x="3" y="9" width="28" height="14" rx="7" fill="var(--fora)"/><rect x="33" y="9" width="17" height="14" rx="7" fill="var(--rosa)"/></svg><div><b>Sistema</b><span>onde a etapa é registrada: PNCP, Sicaf, Sicx</span></div></li>
  </ul>
</section>

<section class="wrap scrolly" id="lupas" aria-label="O fluxo bloco a bloco">
  <div class="stage-wrap">
    <div class="stage">
      <svg class="dg interactive" id="stageSvg" role="group" aria-label="Fluxo da política de compras públicas, em duas raias: fornecedor e órgão público; cada etapa é um botão"></svg>
      <div class="stage-cap" id="stageCap">Visão geral</div>
      <div class="minimap" aria-hidden="true"><svg class="dg mini" id="miniSvg"></svg></div>
      <div class="pz" role="group" aria-label="Navegar no desenho">
        <button type="button" class="pz-b" id="stOut" aria-label="Afastar">−</button>
        <button type="button" class="pz-b" id="stIn" aria-label="Aproximar">+</button>
        <button type="button" class="pz-b pz-reset" id="stReset" hidden>Voltar à lupa</button>
      </div>
      <p class="pz-dica" aria-hidden="true">Arraste para mover · Ctrl + rolagem para zoom · toque numa etapa</p>
      <aside class="stage-card" id="stageCard" aria-live="polite" hidden></aside>
    </div>
  </div>

  <div class="steps" id="steps">
    <div class="steps-head">
      <p class="kicker">Lupas</p>
      <h2>O fluxo bloco a bloco</h2>
    </div>

    <article class="step" data-view="all" data-cap="Visão geral">
      <div class="card">
        <h3>O desenho inteiro</h3>
        <p>O fluxo acompanha a primeira etapa da política de compras: da identificação da necessidade até a formalização da contratação. Tem duas raias separadas por uma linha tracejada: em cima, o <b>fornecedor</b>; embaixo, o <b>órgão público</b>.</p>
        <p class="tip"><b>Dica de leitura:</b> siga primeiro a raia do órgão, da esquerda para a direita, e só depois volte à raia do fornecedor. As duas se encontram em um único ponto: a análise de propostas.</p>
        <p class="small">Role a página: cada lupa aproxima um trecho do desenho.</p>
      </div>
    </article>

    <article class="step" data-view="l1" data-focus="lupa1" data-cap="Lupa 1 · Necessidade e ata">
      <div class="card">
        <div class="lupa-head"><span class="lupa-badge">1</span><p class="kicker">Lupa 1</p></div>
        <h3>Necessidade e ata de registro de preço</h3>
        <p>Tudo começa quando o órgão identifica a <b>necessidade de comprar um produto ou contratar um serviço</b>. A primeira pergunta do fluxo não é <i>como licitar</i>, e sim se já existe uma ata compatível com a demanda.</p>
        <div class="decide">
          <div class="q">Existe ata de registro de preço (ARP) compatível?</div>
          <p><span class="yes">Sim</span> O órgão faz a <b>adesão à ata existente</b> e segue direto para o contrato, sem planejar uma licitação própria. A ata pode ser do próprio órgão ou de outro (a “carona”), sempre dentro das regras da lei.</p>
          <p><span class="no">Não</span> O órgão inicia o <b>planejamento</b> de uma nova contratação.</p>
        </div>
        <p class="small">O círculo rosa “Contrato”, com ícone de saída, indica que dali o caminho continua no subprocesso de gestão do contrato.</p>
        <div class="gloss"><span class="lbl">Glossário</span><b>Ata de registro de preço (ARP).</b> Documento vinculativo, com caráter de compromisso para contratação futura, em que ficam registrados o objeto, os preços, os fornecedores, os órgãos participantes e as condições da contratação, conforme o edital.</div>
        <div class="gloss"><span class="lbl">Glossário</span><b>Carona (adesão à ata).</b> Uso, por um órgão que não participou da licitação, de uma ata gerenciada por outro órgão. Aproveita um processo já feito, desde que a demanda seja compatível e os limites legais sejam respeitados.</div>
      </div>
    </article>

    <article class="step" data-view="l2" data-focus="lupa2" data-cap="Lupa 2 · Planejamento">
      <div class="card">
        <div class="lupa-head"><span class="lupa-badge">2</span><p class="kicker">Lupa 2</p></div>
        <h3>Planejamento e procedimentos auxiliares</h3>
        <p>Na <b>fase preparatória</b>, o órgão produz estudos e documentos e decide quais procedimentos e instrumentos vai usar. Duas entradas condicionam essa fase: o <b>orçamento</b> e o <b>plano de contratações anual</b>. A compra deve conversar com o planejamento estratégico e com os recursos disponíveis.</p>
        <div class="decide">
          <div class="q">O órgão vai usar um procedimento auxiliar?</div>
          <p><span class="yes">Sim</span> <b>Credenciamento via comércio eletrônico</b>, contratação direta por inexigibilidade feita no Sistema de Compras Expressas (<span class="sys p">Sicx</span>), ou <b>pré-qualificação</b>, em que itens e fornecedores aprovados passam a integrar o <a href="https://catalogo.compras.gov.br/cnbs-web/busca" target="_blank" rel="noopener">Catálogo de Bens e Serviços</a>.</p>
          <p><span class="no">Não</span> O órgão segue para os instrumentos de planejamento da contratação.</p>
        </div>
        <div class="alert"><b>O Sicx foi regulamentado, mas ainda não está operando.</b> A lei que incorporou o comércio eletrônico como forma de credenciamento foi sancionada em novembro de 2025, e o decreto que a regulamenta saiu em agosto de 2026. O sistema depende do Registro Cadastral Unificado, com lançamento previsto para o último trimestre de 2026.</div>
        <div class="gloss"><span class="lbl">Glossário</span><b>Procedimentos auxiliares.</b> Ferramentas da Lei nº 14.133/2021 para dar mais eficiência, agilidade e economia às contratações. Não são modalidades de licitação.
          <ul><li><b>Credenciamento</b>: interessados que cumprem os requisitos se credenciam para executar o objeto quando convocados.</li><li><b>Pré-qualificação</b>: seleção prévia, por edital, das condições de habilitação dos interessados ou do objeto.</li><li><b>PMI</b>: a administração pede à iniciativa privada estudos e projetos de soluções inovadoras.</li><li><b>Sistema de registro de preços (SRP)</b>: registra formalmente preços para contratações futuras.</li><li><b>Registro cadastral</b>: cadastro unificado de fornecedores.</li></ul>
        </div>
        <div class="gloss"><span class="lbl">Glossário</span><b>Plano de contratações anual (PCA).</b> Documento em que o órgão consolida as compras e contratações que pretende fazer no ano seguinte. Liga cada compra ao planejamento e ao orçamento.</div>
      </div>
    </article>

    <article class="step" data-view="l3" data-focus="lupa3" data-cap="Lupa 3 · Instrumentos de planejamento">
      <div class="card">
        <div class="lupa-head"><span class="lupa-badge">3</span><p class="kicker">Lupa 3</p></div>
        <h3>Instrumentos de planejamento da contratação</h3>
        <p>O bloco central, cercado por uma linha pontilhada, reúne os documentos e decisões que estruturam a contratação, na ordem das setas:</p>
        <ol>
          <li><b>Estudo técnico preliminar (ETP)</b>: evidencia o problema e a melhor solução, para avaliar a viabilidade técnica e econômica.</li>
          <li><b>Definição dos itens</b>: decide se cabe a <b>margem de preferência</b> (art. 26 da Lei nº 14.133/2021).</li>
          <li><b>Termo de referência (TR)</b> <span class="sys">PNCP</span>: objeto, fundamentação, solução, requisitos e critérios.</li>
          <li><b>Definição da modalidade</b>: a mais adequada ao valor, à natureza e à complexidade do objeto.</li>
          <li><b>Análise de riscos</b>, com medidas de mitigação.</li>
          <li><b>Estimativa de preço</b> <span class="sys">PNCP</span>: pesquisa de mercado para o valor de referência.</li>
          <li><b>Edital ou aviso de contratação</b>: regras, objeto, condições de participação, critérios de julgamento.</li>
        </ol>
        <details>
          <summary>Modalidades e hipóteses de contratação direta</summary>
          <dl class="mods">
            <dt>Pregão</dt><dd>Obrigatório para bens e serviços comuns, preferencialmente eletrônico, com disputa por lances.</dd>
            <dt>Concorrência</dt><dd>Bens e serviços especiais e obras e serviços comuns e especiais de engenharia.</dd>
            <dt>Concurso</dt><dd>Escolha de trabalho técnico, científico ou artístico, com prêmio ou remuneração.</dd>
            <dt>Leilão</dt><dd>Venda de bens inservíveis ou apreendidos, ou alienação de imóveis, a quem der o maior lance.</dd>
            <dt>Diálogo competitivo</dt><dd>A administração dialoga com licitantes selecionados para desenvolver alternativas quando o mercado não tem uma pronta.</dd>
            <dt>Dispensa de licitação</dt><dd>A licitação é viável, mas a lei permite dispensá-la (valores baixos, emergências).</dd>
            <dt>Inexigibilidade</dt><dd>A competição é inviável: fornecedor exclusivo ou objeto singular.</dd>
          </dl>
        </details>
        <div class="gloss"><span class="lbl">Glossário</span><b>ETP e TR.</b> O ETP pergunta “qual é o problema e qual a melhor solução?”; o TR responde “como essa solução será contratada?”.</div>
        <div class="gloss"><span class="lbl">Glossário</span><b>Margem de preferência.</b> Vantagem concedida, no julgamento das propostas, a bens manufaturados e serviços nacionais que atendam a normas técnicas brasileiras e a bens reciclados, recicláveis ou biodegradáveis. Instrumento de incentivo ao desenvolvimento nacional sustentável.</div>
      </div>
    </article>

    <article class="step" data-view="l4" data-focus="lupa4" data-phase="1" data-cap="Lupa 4 · Publicação e desdobramentos">
      <div class="card">
        <div class="lupa-head"><span class="lupa-badge">4</span><p class="kicker">Lupa 4</p></div>
        <h3>Publicação e desdobramentos</h3>
        <p>Com o edital pronto, o órgão o publica no <a href="https://www.gov.br/pncp/pt-br" target="_blank" rel="noopener">Portal Nacional de Contratações Públicas</a>. É a virada da <b>fase interna</b> para a <b>fase externa</b>: a intenção de contratar se torna pública. Daqui o fluxo se divide em licitação (concorrência ou pregão) e contratação direta.</p>
        <p>Na via licitatória entra a <b>raia do fornecedor</b>: o <b>registro cadastral</b> no <span class="sys p">Sicaf</span> <span class="sys">PNCP</span>, com as habilitações jurídica, técnica, fiscal, social e trabalhista e econômico-financeira; depois, a <b>apresentação de propostas e lances</b>. As raias se encontram na <b>análise de propostas e seleção do fornecedor</b>.</p>
        <div class="decide">
          <div class="q">É sistema de registro de preços (SRP)?</div>
          <p><span class="yes">Sim</span> Formaliza-se a <b>ata de registro de preço</b>. O círculo “ARP” fecha esse caminho; a ata passa a gerar contratos por adesão.</p>
          <p><span class="no">Não</span> <b>Homologação</b>, depois <b>contrato</b> e <b>gestão do contrato</b>.</p>
        </div>
        <div class="gloss"><span class="lbl">Glossário</span><b>Habilitação.</b> Verificação de que o fornecedor tem condições jurídicas, técnicas, fiscais, trabalhistas e financeiras de cumprir o contrato. Fica registrada no Sicaf (Sistema de Cadastramento Unificado de Fornecedores).</div>
        <div class="gloss"><span class="lbl">Glossário</span><b>Homologação.</b> Ato em que a autoridade competente confirma a regularidade dos atos, ratifica o resultado e autoriza a assinatura do contrato.</div>
        <div class="gloss"><span class="lbl">Glossário</span><b>PNCP.</b> Portal oficial criado pela Lei nº 14.133/2021 para divulgar os atos das contratações de todos os entes federativos: planos, editais, atas, contratos e notas fiscais.</div>
      </div>
    </article>

    <article class="step" data-view="l5" data-focus="lupa5" data-cap="Lupa 5 · Contratação direta">
      <div class="card">
        <div class="lupa-head"><span class="lupa-badge">5</span><p class="kicker">Lupa 5</p></div>
        <h3>Contratação direta</h3>
        <p>Quando não há disputa entre fornecedores, depois da publicação percorrem-se as opções de contratação direta: <b>dispensa</b> ou <b>inexigibilidade</b>. O rito é mais simples e tem uma única decisão.</p>
        <div class="decide">
          <div class="q">O valor está abaixo de R$ 65 mil?</div>
          <p><span class="yes">Sim</span> A compra pode ser paga com <b>cartão de pagamento</b>, com posterior <b>extrato</b> registrado no PNCP.</p>
          <p><span class="no">Não</span> Celebra-se o <b>contrato</b>, que segue para a gestão do contrato, como na via licitatória.</p>
        </div>
        <p class="small">O limite de R$ 65 mil arredonda o valor da dispensa para compras e serviços em geral (art. 75, II, da Lei nº 14.133/2021), atualizado todo ano por decreto. Em 2026, é de R$ 65.492,11 (Decreto nº 12.807/2025).</p>
        <div class="gloss"><span class="lbl">Glossário</span><b>Dispensa × inexigibilidade.</b> Na dispensa, a competição seria possível, mas a lei autoriza não licitar. Na inexigibilidade, a competição é impossível. Nos dois casos há contratação sem licitação, mas não sem processo: o planejamento continua obrigatório.</div>
        <div class="gloss"><span class="lbl">Glossário</span><b>Cartão de pagamento.</b> Meio de pagamento para despesas de pequeno valor, que dispensa a formalização de um contrato e exige prestação de contas.</div>
      </div>
    </article>

    <div class="achados-head">
      <p class="kicker">Achados</p>
      <h2>Como as coisas se conectam</h2>
      <p>Alguns padrões só aparecem quando se ligam pontos distantes do desenho.</p>
    </div>

    <article class="step ach" data-view="all" data-focus="ach-arp" data-cycle="1" data-cap="Achado · O ciclo da ata">
      <div class="card"><h3>A ata de registro de preço fecha um ciclo</h3>
        <p>Ela aparece três vezes: no começo (“existe ARP compatível?”), como resultado do SRP e como adesão. A licitação de um órgão pode abastecer as compras de muitos outros, e o fim de um processo vira o atalho de outro.</p></div>
    </article>
    <article class="step ach" data-view="all" data-focus="ach-fim" data-cap="Achado · Os fins do fluxo">
      <div class="card"><h3>Nem todo fim é um contrato</h3>
        <p>Há círculos de fim com destinos diferentes: “ARP” e “Contrato”. Uma licitação por SRP termina num compromisso para o futuro, não numa compra imediata.</p></div>
    </article>
    <article class="step ach" data-view="forn" data-focus="ach-forn" data-cap="Achado · A raia do fornecedor">
      <div class="card"><h3>O fornecedor tem um caminho próprio</h3>
        <p>O registro cadastral pode acontecer antes e independentemente de qualquer licitação. A raia de cima só encosta na de baixo na análise de propostas.</p></div>
    </article>
    <article class="step ach" data-view="all" data-focus="ach-pncp" data-cap="Achado · Onde o PNCP aparece">
      <div class="card"><h3>O PNCP é a espinha dorsal da transparência</h3>
        <p>Ele aparece no termo de referência, na estimativa de preço, na publicação do edital, no cadastro do fornecedor e no extrato do cartão de pagamento, além da nota fiscal. Quase todo passo relevante deixa rastro público no mesmo portal.</p></div>
    </article>
    <article class="step ach" data-view="all" data-focus="ach-plan" data-cap="Achado · Planejamento comum">
      <div class="card"><h3>Contratar sem licitação não é contratar sem planejamento</h3>
        <p>A bifurcação entre licitação e contratação direta só acontece depois da publicação. Até ali, dispensa e inexigibilidade passam pelos mesmos instrumentos: ETP, termo de referência, análise de riscos, estimativa de preço.</p></div>
    </article>
    <article class="step ach" data-view="l3" data-focus="ach-margem" data-cap="Achado · A compra como estratégia">
      <div class="card"><h3>A compra pública também é estratégica</h3>
        <p>A margem de preferência, indicada na definição dos itens, usa o poder de compra do Estado para favorecer produtos nacionais e bens reciclados ou biodegradáveis. É o ponto em que o fluxo deixa de ser só administrativo.</p></div>
    </article>
  </div>
</section>

<section class="wrap" id="conceitos">
  <p class="kicker">Leitura crítica</p>
  <h2>O fluxo como política pública</h2>
  <p class="read" style="margin:12px 0 0">Os conceitos abaixo ajudam a ler o desenho como uma <b>política pública</b>, e não só como um procedimento administrativo. Cada miniatura mostra onde o conceito toca o fluxo.</p>
  <div class="concepts" id="concepts"></div>
</section>

<section class="explore" id="explore">
  <div class="wrap">
    <p class="kicker">Explore</p>
    <h2>Percorra o fluxo</h2>
    <p class="intro">Responda às perguntas do desenho e veja o caminho que uma compra faz. Toque em qualquer etapa para ler o que acontece nela.</p>
    <div class="ex-bar">
      <div class="seg" role="group" aria-label="Modo do explorador">
        <button type="button" id="mPath" aria-pressed="true">Simule um caminho</button>
        <button type="button" id="mConc" aria-pressed="false">Conceitos</button>
      </div>
      <div class="zoom" role="group" aria-label="Tamanho do desenho"><span>Desenho:</span>
        <button type="button" id="zOut" aria-label="Afastar">−</button>
        <button type="button" id="zIn" aria-label="Aproximar">+</button>
        <button type="button" id="zFit">Inteiro</button>
        <span class="pz-dica-ex">arraste para mover · Ctrl + rolagem para zoom</span>
      </div>
    </div>
    <div class="ex-panel" id="exPanel"></div>
    <div class="ex-body">
      <div class="ex-canvas" id="exCanvas"><svg class="dg interactive" id="exSvg" role="group" aria-label="Fluxo interativo; cada etapa é um botão"></svg></div>
      <aside class="detail" id="detail" aria-live="polite"></aside>
    </div>
  </div>
</section>

<section class="wrap" id="glossario">
  <p class="kicker">Glossário</p>
  <h2>Termos de compras</h2>
  <div class="gfilter"><label for="gq">Buscar</label><input id="gq" type="search" placeholder="ata, pregão, PNCP…" autocomplete="off"></div>
  <div class="glist" id="glist"></div>
  <p class="gempty" id="gempty" hidden>Nenhum termo encontrado.</p>
</section>

<section class="wrap method" id="metodologia">
  <div class="read">
    <p class="kicker">Metodologia</p>
    <h2 style="font-size:clamp(24px,3vw,32px)">De onde vem este desenho</h2>
    <p>O fluxo da política de compras públicas e seu documento descritivo foram elaborados a partir de três bases: a Lei nº 14.133/2021, a Nova Lei de Licitações e Contratos Administrativos, que estrutura etapas, instrumentos e atores; pesquisas em fontes oficiais do governo federal, que complementaram a lei com normas infralegais, sistemas e procedimentos adotados na prática; e cursos sobre procedimentos licitatórios da Escola Virtual da Enap, que apoiaram a interpretação das etapas.</p>
    <p>Esta versão interativa redesenha o fluxo a partir do guia de leitura; posições e ligações seguem a descrição textual de cada lupa. Conceitos e valores sujeitos a atualização periódica, como o limite da dispensa e a situação do Sistema de Compras Expressas, foram conferidos em fontes atualizadas até outubro de 2026.</p>
    <ul class="sources">
      <li><a href="https://www.gov.br/pncp/pt-br" target="_blank" rel="noopener">Portal Nacional de Contratações Públicas (PNCP)</a></li>
      <li><a href="https://catalogo.compras.gov.br/cnbs-web/busca" target="_blank" rel="noopener">Catálogo de Bens e Serviços</a></li>
    </ul>
  </div>
</section>
<footer class="wrap">Guia de leitura do fluxo da política de compras públicas · versão interativa</footer>

<script src="/global-assets/fluxo-compras/fluxo.js?v=20261016c"></script>
</div>

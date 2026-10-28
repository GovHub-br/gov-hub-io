---
title: 'Datathon: Jornada de dados do plano nacional de cultura'
date: 2026-09-14
description: A Jornada de Dados do Plano Nacional de Cultura foi promovida pelo Gov Hub em parceria com o Ministério da Cultura.
tipo: evento
categories: []
card_label: Evento
card_image: /land/dist/images/publicacoes/paper.svg
pdf: ''
draft: false
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@300;400;500;600;700;800;900&display=swap');
.dtp{--primary-purple:#613EFF; --dark-navy:#0A005A; --bg-soft:#F2F1F6; --accent-rose:#BE006E;
--text-white:#FFFFFF; --purple-600:#5235D9; --purple-700:#3F28A6;
--text-strong:#202020; --text-body:#2D3748; --text-muted:#666666;
--bg-white:#FFFFFF; --border-soft:#E9DFFF;
--font-family-base:'Reddit Sans','Open Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
--shadow-md:0 2px 10px rgba(10,0,90,.10); --shadow-lg:0 4px 20px rgba(10,0,90,.12); --shadow-xl:0 8px 30px rgba(10,0,90,.16);
--radius-sm:6px; --radius-md:10px; --radius-lg:16px;
--gutter:clamp(20px,5cqw,56px);}
.dtp \*{box-sizing:border-box;margin:0;padding:0}
.dtp{font-family:var(--font-family-base);color:var(--text-body);background:var(--bg-white);line-height:1.6;-webkit-font-smoothing:antialiased}
.dtp img{display:block;max-width:100%}
.dtp .wrap{max-width:1180px;margin:0 auto;padding:0 var(--gutter)}
.dtp h1,.dtp h2,.dtp h3{font-weight:800;letter-spacing:-0.025em;line-height:1.06;color:var(--dark-navy)}
.dtp .eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--dark-navy)}
.dtp .eyebrow::before{content:"";width:10px;height:10px;border-radius:50%;background:var(--accent-rose)}
.dtp .eyebrow.on-dark{color:#fff}
.dtp .hero{position:relative;overflow:hidden;background:#fff}
.dtp .hero .wrap{position:relative;z-index:2}
.dtp .hero-grid{padding:36px 0 56px;max-width:820px}
.dtp .hero .lead{font-size:clamp(18px,2cqw,22px);max-width:620px;color:var(--text-body)}
.dtp .meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.dtp .pill{font-size:15px;font-weight:600;padding:10px 20px;border-radius:999px;background:var(--bg-soft);color:var(--dark-navy)}
.dtp .pill.solid{background:var(--primary-purple);color:#fff}
.dtp .hero-photo{position:relative;z-index:2;margin:0 auto;max-width:1180px;padding:0 var(--gutter)}
.dtp .hero-photo img{width:100%;aspect-ratio:16/8;object-fit:cover;border-radius:var(--radius-lg);box-shadow:var(--shadow-xl)}
.dtp .hero-photo figcaption{font-size:14px;color:var(--text-muted);margin-top:12px}
.dtp .stats{background:var(--dark-navy);color:#fff;position:relative;overflow:hidden;margin-top:-48px;padding-top:48px}
.dtp .stats .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:64px 0}
.dtp .stat .n{font-size:clamp(48px,6cqw,80px);font-weight:800;letter-spacing:-0.03em;line-height:1;color:#fff}
.dtp .stat .l{margin-top:10px;font-size:16px;color:#fff;opacity:.88;max-width:200px}
.dtp .stat{border-top:2px solid rgba(255,255,255,.28);padding-top:20px}
.dtp .blk{position:relative;overflow:hidden}
.dtp .sec{padding:clamp(64px,9cqw,112px) 0}
.dtp .sec.soft{background:var(--bg-soft)}
.dtp .sec h2{font-size:clamp(34px,4.6cqw,56px);margin:16px 0 24px}
.dtp .sec h2 .light{font-weight:400}
.dtp .two{display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(32px,5cqw,72px);align-items:center}
.dtp .prose p{font-size:18px;margin-bottom:18px}
.dtp .prose strong{color:var(--dark-navy);font-weight:700}
.dtp .photo{border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg);background:var(--bg-soft)}
.dtp .photo img{width:100%;height:100%;object-fit:cover}
.dtp .photo.tall img{aspect-ratio:4/4.4}
.dtp .steps-head{max-width:760px;margin-bottom:48px}
.dtp .steps-head p{font-size:19px}
.dtp .steps{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.dtp .step{background:#fff;border-radius:var(--radius-lg);padding:34px 34px 38px;box-shadow:var(--shadow-md);position:relative;overflow:hidden}
.dtp .step .num{width:56px;height:56px;border-radius:50%;background:var(--primary-purple);color:#fff;font-weight:800;font-size:26px;display:grid;place-items:center;margin-bottom:22px}
.dtp .step:nth-child(2) .num{background:var(--dark-navy)}
.dtp .step:nth-child(3) .num{background:var(--dark-navy)}
.dtp .step .k{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--purple-700)}
.dtp .step h3{font-size:28px;margin:6px 0 14px}
.dtp .step .q{font-size:19px;font-weight:600;color:var(--dark-navy);line-height:1.35;padding-left:16px;border-left:3px solid var(--accent-rose);margin-bottom:14px}
.dtp .step p{font-size:16px;color:var(--text-body)}
.dtp .band{position:relative}
.dtp .band img{width:100%;height:clamp(280px,42cqw,520px);object-fit:cover;object-position:center 40%}
.dtp .eixos-head{max-width:780px;margin-bottom:44px}
.dtp .eixos-head p{font-size:19px}
.dtp .eixos{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.dtp .eixo{background:var(--bg-soft);border-radius:var(--radius-lg);padding:30px 32px 32px}
.dtp .eixo .tag{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--primary-purple);padding:5px 14px;border-radius:999px;margin-bottom:16px}
.dtp .eixo h3{font-size:22px;line-height:1.2;margin-bottom:12px}
.dtp .eixo p{font-size:15.5px;line-height:1.6;margin-bottom:10px}
.dtp .eixo p:last-child{margin-bottom:0}
.dtp .eixo strong{color:var(--dark-navy)}
.dtp .bandeira{background:var(--dark-navy);color:#fff}
.dtp .bandeira h2{color:#fff}
.dtp .bandeira .lead{font-size:19px;max-width:720px;color:#fff;opacity:.92;margin-bottom:44px}
.dtp .flag{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.dtp .flag .c{background:var(--bg-soft);color:var(--dark-navy);border-radius:var(--radius-lg);padding:32px 30px 34px}
.dtp .flag .n{width:44px;height:44px;border-radius:50%;background:var(--primary-purple);color:#fff;font-weight:800;font-size:20px;display:grid;place-items:center;margin-bottom:18px}
.dtp .flag h3{font-size:22px;line-height:1.2;margin-bottom:14px}
.dtp .flag p{font-size:15.5px;line-height:1.6;color:var(--text-body)}
.dtp .flag strong{color:var(--dark-navy);font-weight:700}
.dtp .flag-close{margin-top:32px;font-size:18px;max-width:760px;color:#fff;opacity:.92}
.dtp .frentes{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px}
.dtp .frente{background:#fff;border-radius:var(--radius-lg);padding:30px 28px 28px;box-shadow:var(--shadow-md);display:flex;flex-direction:column}
.dtp .frente .n{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--purple-700);margin-bottom:8px}
.dtp .frente h3{font-size:21px;line-height:1.2;margin-bottom:12px}
.dtp .frente p{font-size:15.5px;line-height:1.6;margin-bottom:18px;flex:1}
.dtp .frente .orgs-l{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px}
.dtp .orgs{display:flex;flex-wrap:wrap;gap:6px}
.dtp .orgs span{font-size:13px;font-weight:600;padding:5px 12px;border-radius:999px;background:var(--bg-soft);color:var(--dark-navy)}
.dtp .quadro{font-size:14px;color:var(--text-muted);margin-top:18px}
.dtp .horizontes{margin-top:56px;max-width:820px}
.dtp .horizontes h3{font-size:26px;margin-bottom:14px}
.dtp .horizontes p{font-size:17px;margin-bottom:14px}
.dtp .gal-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:36px}
.dtp .gal-head h2{margin-bottom:0}
.dtp .gallery{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}
.dtp .gallery a{all:unset;cursor:zoom-in;display:block;overflow:hidden;border-radius:var(--radius-md);height:300px;background:var(--bg-soft);box-shadow:var(--shadow-md);transition:transform .3s ease,box-shadow .3s ease}
.dtp .gallery a:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg)}
.dtp .gallery a:focus-visible{outline:3px solid var(--primary-purple);outline-offset:3px}
.dtp .gallery img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.dtp .gallery a:hover img{transform:scale(1.04)}
.dtp .gallery .s2{grid-column:span 2}
.dtp .gallery .s3{grid-column:span 3}
.dtp .gallery .s4{grid-column:span 4}
.dtp .rede{background:var(--dark-navy);color:#fff;overflow:hidden}
.dtp .rede h2{color:#fff}
.dtp .rede .prose p{color:#fff;opacity:.93}
.dtp .rede .prose strong{color:#fff}
.dtp .rede .photo{box-shadow:var(--shadow-xl)}
.dtp .chips{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 28px}
.dtp .chip{font-size:14px;font-weight:600;padding:8px 16px;border-radius:999px;background:var(--bg-soft);color:var(--dark-navy)}
.dtp .next{margin-top:28px;background:var(--primary-purple);color:#fff;border-radius:var(--radius-lg);padding:26px 30px}
.dtp .next .t{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;color:#fff}
.dtp .next p{font-size:19px;font-weight:500;margin:0;color:#fff;opacity:1}
.dtp .gh .box{background:var(--bg-soft);border-radius:var(--radius-lg);padding:clamp(32px,5cqw,64px);display:grid;grid-template-columns:auto 1fr;gap:clamp(24px,4cqw,56px);align-items:center;position:relative;overflow:hidden}
.dtp .gh .box .logo{height:58px;width:auto}
.dtp .gh .box p{font-size:20px;color:var(--dark-navy);font-weight:500;line-height:1.5;position:relative;z-index:1}
.dtp .lb.open{display:flex}
@container (max-width:760px){.dtp .stats .grid{grid-template-columns:repeat(2,1fr)}
.dtp .two{grid-template-columns:1fr}
.dtp .steps,.dtp .eixos,.dtp .flag,.dtp .frentes{grid-template-columns:1fr}
.dtp .frentes{grid-template-columns:1fr}
.dtp .gallery{grid-template-columns:repeat(2,1fr)}
.dtp .gallery a,.dtp .gallery .s2,.dtp .gallery .s3,.dtp .gallery .s4{grid-column:span 1;height:220px}
.dtp .gh .box{grid-template-columns:1fr}
.dtp .hero-photo img{aspect-ratio:4/3}}
@container (max-width:520px){.dtp .gallery{grid-template-columns:1fr}
.dtp .gallery a{height:240px}
.dtp .stats .grid{grid-template-columns:1fr 1fr;gap:20px}}
@media (prefers-reduced-motion:reduce){.dtp \*{transition:none!important;scroll-behavior:auto!important}}
.dtp{container-type:inline-size;font-family:var(--font-family-base);color:var(--text-body);line-height:1.6;font-size:16px;text-align:left;margin:0 0 32px}
.dtp \*,.dtp \*::before,.dtp \*::after{box-sizing:border-box}
.dtp img{max-width:100%;height:auto;display:block;margin:0;border:0}
.dtp .photo img,.dtp .band img,.dtp .gallery img{height:100%}
.dtp .blk{margin:0 0 24px;border-radius:20px}
.dtp .hero{margin-bottom:24px;overflow:visible}
.dtp .stats{margin-top:0;padding-top:0}
.dtp .hero-grid{padding:8px 0 28px}
.dtp .hero-photo{padding:0}
.dtp .hero .wrap{padding:0}
.dtp .band{margin:0 0 24px;border-radius:20px;overflow:hidden}
.dtp .gallery a{text-decoration:none;border:0;cursor:zoom-in}
.dtp a{text-decoration:none}
.dtp p{margin:0 0 18px}
.dtp h1,.dtp h2,.dtp h3{margin:0;padding:0;border:0;font-family:var(--font-family-base)}
.dtp ul,.dtp ol{margin:0;padding:0;list-style:none}
.dtp .gh .box .logo{height:58px;width:58px;flex:none;color:var(--dark-navy)}
.dtp .sec:not(.soft):not(.rede):not(.bandeira) .wrap{padding:0}
@container (max-width:900px){.dtp .two{grid-template-columns:1fr}.dtp .flag{grid-template-columns:1fr}.dtp .frentes{grid-template-columns:repeat(2,1fr)}}
@container (max-width:620px){.dtp .frentes,.dtp .eixos,.dtp .steps{grid-template-columns:1fr}.dtp .gh .box{grid-template-columns:1fr}}
</style>
<div class="dtp">
<div class="blk hero">
<div class="wrap">
<div class="hero-grid">
<span class="eyebrow">9 e 10 de setembro · Brasília</span>
<p class="lead">Dois dias de trabalho coletivo para construir, com a sociedade civil, soluções para monitorar as metas do PNC.</p>
<div class="meta">
<span class="pill solid">104 participantes</span>
<span class="pill">35 organizações</span>
<span class="pill">4 etapas</span>
</div>
</div>
</div>
<figure class="hero-photo">
<img src="/blog/images/dsc08821.webp" alt="Foto de grupo dos participantes do Datathon, reunidos no hall de um edifício de concreto em Brasília" style="object-position:center 62%">
<figcaption>Participantes do Datathon reunidos em Brasília.</figcaption>
</figure>
</div>
<div class="blk stats" aria-label="O Datathon em números">
<div class="wrap">
<div class="grid">
<div class="stat"><div class="n">104</div><div class="l">participantes</div></div>
<div class="stat"><div class="n">35</div><div class="l">organizações da sociedade civil</div></div>
<div class="stat"><div class="n">2</div><div class="l">dias de trabalho em Brasília</div></div>
<div class="stat"><div class="n">4</div><div class="l">etapas, cada uma guiada por uma pergunta</div></div>
</div>
</div>
</div>
<div class="blk sec" id="o-evento">
<div class="wrap two">
<div class="prose">
<span class="eyebrow">O encontro</span>
<h2><span class="light">Construir juntos</span> como acompanhar o PNC</h2>
<p>Nos dias 9 e 10 de setembro, aconteceu em Brasília o <strong>Datathon</strong>, a nossa “Jornada de Dados do Plano Nacional de Cultura”. O evento foi promovido pelo <strong>Gov Hub</strong> em parceria com o <strong>Ministério da Cultura</strong>.</p>
<p>O encontro reuniu 104 participantes de 35 organizações da sociedade civil que toparam o desafio de construir, de forma coletiva, soluções para os desafios de monitorar as metas do Plano Nacional de Cultura (PNC).</p>
<p>A ideia central foi <strong>fortalecer a rede de quem gera, qualifica e utiliza esses dados.</strong></p>
<p>A proposta foi experimentar uma forma de colaboração que parte dos conhecimentos e recursos já existentes para avançar na construção de uma <strong>agenda comum de monitoramento das políticas culturais pelos próximos 10 anos</strong>. Os participantes foram convidados a conectar visão, informação, dados e ação, identificando onde estão as capacidades, as lacunas e as possibilidades de colaboração.</p>
</div>
<div class="photo tall"><img src="/blog/images/vec-09070.webp" alt="Mulher de vermelho fala ao microfone diante do banner do Datathon e de um telão com o título Plano Nacional de Cultura" style="object-position:38% center"></div>
</div>
</div>
<div class="blk sec soft" id="etapas">
<div class="wrap">
<div class="steps-head">
<span class="eyebrow">Como funcionou</span>
<h2>Quatro etapas, <span class="light">quatro perguntas</span></h2>
<p>O trabalho seguiu quatro etapas, cada uma guiada por uma pergunta. Os dois dias foram organizados como uma jornada em quatro sprints, e cada um aprofundava o anterior.</p>
</div>
<div class="steps">
<article class="step">
<div class="num">1</div>
<div class="k">Sprint 1 · Do sentido ao resultado</div>
<h3>O que queremos monitorar?</h3>
<div class="q">O que motivou essa meta e que resultado ela busca?</div>
<p>Os grupos discutiram quais informações são necessárias para acompanhar os resultados que queremos alcançar com o Plano em 10 anos.</p>
</article>
<article class="step">
<div class="num">2</div>
<div class="k">Sprint 2 · Quais dados precisamos</div>
<h3>Quais dados nos ajudam a responder essas perguntas?</h3>
<div class="q">Esses dados servem para acompanhar o Plano, ou é preciso criar novos, e por quem?</div>
<p>Os participantes mapearam quais dados existem, quem os produz ou produziu e o que ainda falta, visualizando tanto os recursos disponíveis quanto as lacunas de informação.</p>
</article>
<article class="step">
<div class="num">3</div>
<div class="k">Sprint 3 · Como vamos acompanhar</div>
<h3>Que indicadores podem nos ajudar?</h3>
<div class="q">Que indicadores são possíveis, mensuráveis e viáveis de manter atualizados?</div>
<p>Com as informações e dados levantados, os grupos avançaram na construção de possíveis indicadores, relacionando o que queremos observar aos dados que tornam o acompanhamento possível.</p>
</article>
<article class="step">
<div class="num">4</div>
<div class="k">Sprint 4 · O que podemos fazer coletivamente</div>
<h3>Como transformar informação em ação da rede?</h3>
<div class="q">Como a sua organização pode se envolver no monitoramento do novo PNC?</div>
<p>No último sprint, o olhar se ampliou do eixo para a rede: o que une as organizações e pessoas em torno do monitoramento do Plano, as capacidades e as possibilidades de colaboração.</p>
</article>
</div>
</div>
</div>
<div class="band">
<img src="/blog/images/vec-09468.webp" alt="Mesa de trabalho com participantes discutindo sobre um grande painel impresso do Datathon" style="object-position:center 55%">
</div>
<div class="blk sec" id="eixos">
<div class="wrap">
<div class="eixos-head">
<span class="eyebrow">Resultados por eixo</span>
<h2>Oito eixos, <span class="light">oito conversas</span></h2>
<p>O grupo do Datathon foi dividido em 8 eixos, que sustentam o Plano Nacional de Cultura. Estas são as principais reflexões trazidas por cada grupo em relação ao conteúdo do seu eixo.</p>
</div>
<div class="eixos">
<article class="eixo"><span class="tag">Eixo 1</span><h3>Gestão e Participação Social</h3><p>A discussão girou em torno da consolidação do Sistema Nacional de Cultura e do desafio de produzir dados que acompanhem não só a existência de seus componentes, mas sua implementação e efetividade nos territórios.</p><p>Ganhou força a ideia de <strong>começar pelos indicadores mais básicos e estruturantes</strong> e de fazer a produção e a atualização das informações parte da própria gestão das políticas culturais, e não uma tarefa adicional de prestação de informações.</p></article>
<article class="eixo"><span class="tag">Eixo 2</span><h3>Fomento à Cultura</h3><p>O grupo debateu como combinar ampliação do acesso ao fomento, permanência dos agentes culturais e descentralização territorial, e a necessidade de definir com mais precisão conceitos como território e território vulnerabilizado.</p><p>Entre as ideias discutidas, apareceu a proposta de uma espécie de <strong>“Carteirinha da Cultura”</strong>, além da maior visibilidade do fomento indireto, incluindo as emendas parlamentares nas três esferas.</p></article>
<article class="eixo"><span class="tag">Eixo 3</span><h3>Patrimônio e Memória</h3><p>A dispersão das fontes e a ausência de dados estruturados em escala subnacional foram os desafios centrais. O grupo destacou informações produzidas por instituições como Ibram, Iphan e Funai e apontou lacunas em áreas como arquivos, Biblioteca Nacional e Palmares.</p><p>Foram levantadas novas fontes possíveis, como cartórios, diários oficiais, registros de IPTU e fundos de direitos, e discutidas as dificuldades de acompanhar <strong>mestres e saberes tradicionais</strong> diante da inexistência de um cadastro específico.</p></article>
<article class="eixo"><span class="tag">Eixo 4</span><h3>Formação</h3><p>O foco foi a relação entre cultura e educação, com quatro resultados: oferta regular de disciplinas de arte nas escolas de educação básica, mais matrículas e concluintes em cursos de artes e cultura, reconhecimento de espaços culturais como ambientes de aprendizagem e ampliação da certificação de mestres e mestras.</p><p>Entre as fontes para uma linha de base estão o Censo Escolar e o Censo da Educação Superior do Inep. Surgiu a proposta de uma <strong>malha georreferenciada</strong> de equipamentos, espaços, comunidades e organizações próximos às escolas, em diálogo com o Eixo 5.</p></article>
<article class="eixo"><span class="tag">Eixo 5</span><h3>Infraestrutura, equipamentos e espaços culturais</h3><p>Os debates se concentraram em três direcionamentos: a ampliação da frequência, a universalização da acessibilidade e a garantia da presença de equipamentos culturais multiuso nos municípios, com prioridade para periferias e territórios vulnerabilizados.</p><p>O grupo identificou a pesquisa Munic, do IBGE, e diferentes cadastros do Sistema MinC como fontes, e foi consensual a importância de um <strong>cadastro centralizado e integrado, com geolocalização</strong>. Sobre acessibilidade, foi indicada a NBR 9050 como parâmetro.</p></article>
<article class="eixo"><span class="tag">Eixo 6</span><h3>Economia criativa, economia solidária, trabalho, emprego, renda e proteção social</h3><p>A discussão se centrou na escassez e na fragmentação dos dados e nas dificuldades de mensurar a produção da economia solidária e da economia criativa e o seu impacto no PIB do país.</p><p>O grupo reconheceu bases relevantes, como as pesquisas do IBGE e a PNAD Contínua, mas apontou que nem sempre captam a informalidade e a escala municipal. Foram citados o <strong>cruzamento de bases existentes</strong> e o aproveitamento de registros como MEIs, notas fiscais e contratações culturais no setor público.</p></article>
<article class="eixo"><span class="tag">Eixo 7</span><h3>Cultura, bem viver e ação climática</h3><p>Uma questão que atravessou as discussões foi a dificuldade de produzir informações estruturadas sobre a relação entre cultura, territórios e vulnerabilidade climática, diante da fragmentação das bases existentes.</p><p>O grupo discutiu qualificar os registros sobre povos indígenas e comunidades tradicionais, articular Pontos de Cultura e Pontos de Memória e, na adaptação e na resiliência, a <strong>digitalização preventiva de acervos</strong>, protocolos de emergência e articulação com a Defesa Civil.</p></article>
<article class="eixo"><span class="tag">Eixo 8</span><h3>Cultura digital e direitos digitais</h3><p>O desafio foi acompanhar como a cultura brasileira é produzida, disponibilizada, preservada e acessada no ambiente digital, a partir dos cinco resultados priorizados em Cultura Digital.</p><p>Entre as fontes foram citadas TIC Domicílios, TIC Cultura/Cetic.br, Hábitos Culturais e Retratos da Leitura. Foi proposta a <strong>inclusão de novas perguntas em pesquisas já existentes</strong> e ficou evidente a diferença de maturidade entre os níveis federativos.</p></article>
</div>
</div>
</div>
<div class="blk sec bandeira" id="bandeira">
<div class="wrap">
<span class="eyebrow on-dark">Resultados para a rede</span>
<h2><span class="light">Nossa</span> bandeira</h2>
<p class="lead">O último momento do encontro foi reservado para refletir sobre a continuidade das atividades desse grupo. O primeiro passo foi a construção coletiva de uma bandeira.</p>
<div class="flag">
<div class="c"><div class="n">1</div><h3>Queremos que o monitoramento do PNC seja…</h3>
<p><strong>Contínuo, possível e compartilhado</strong>, capaz de produzir evidências para orientar decisões e aprimorar as políticas culturais. Um monitoramento <strong>territorializado, federativo e participativo</strong>, com dados estruturados, comparáveis e acessíveis, construído com <strong>cooperação entre poder público, sociedade civil e diferentes setores</strong> e sustentado por responsabilidades pactuadas.</p></div>
<div class="c"><div class="n">2</div><h3>Isso é importante porque…</h3>
<p><strong>Monitorar é dar condições para o PNC acontecer.</strong> Precisamos acompanhar sua execução, evidenciar resultados, aprender com a implementação e subsidiar decisões e recursos para garantir os direitos culturais. Assim, fortalecemos o <strong>SNC, reduzimos desigualdades territoriais e de acesso à cultura e consolidamos a cultura como política de Estado</strong>, capaz de produzir transformação social.</p></div>
<div class="c"><div class="n">3</div><h3>Juntando nossas forças, podemos…</h3>
<p><strong>Construir uma rede permanente de monitoramento e defesa do PNC</strong>, conectando gestores, sociedade civil, pesquisadores e territórios. Podemos qualificar e integrar dados, conceitos e indicadores; formar e apoiar quem produz e utiliza essas informações; fortalecer o controle social; produzir e disseminar conhecimento; e comunicar o plano de forma acessível e mobilizadora.</p></div>
</div>
<p class="flag-close">A construção dessa bandeira aponta para um horizonte comum e compartilhado em que o PNC tem capacidade de transformar a realidade social e cultural, a partir do envolvimento de diferentes atores.</p>
</div>
</div>
<div class="blk sec soft" id="frentes">
<div class="wrap">
<div class="eixos-head" style="margin-bottom:0">
<span class="eyebrow">O que podemos fazer juntos</span>
<h2>Seis frentes <span class="light">de contribuição</span></h2>
<p>As contribuições foram sistematizadas por frente, junto com as organizações envolvidas em cada uma.</p>
</div>
<div class="frentes">
<article class="frente"><div class="n">Frente 1</div><h3>Articulação e governança da rede</h3><p>Construir uma rede permanente de monitoramento; articular atores e instituições; criar pontos focais, comitê gestor e redes por eixo/território; fortalecer a articulação federativa e a coalizão.</p><div class="orgs-l">Organizações envolvidas</div><div class="orgs"><span>MinC · SGE</span><span>Fundação Itaú</span><span>C de Cultura</span></div></article>
<article class="frente"><div class="n">Frente 2</div><h3>Dados, integração e infraestrutura</h3><p>Integrar bases e fontes; estruturar e qualificar dados; automatizar a ingestão e a gestão; garantir disponibilidade e qualidade; adequar ferramentas para o monitoramento.</p><div class="orgs-l">Organizações envolvidas</div><div class="orgs"><span>MinC · SGE</span><span>UnB</span><span>LabCD</span><span>Escult/MinC</span><span>Fundação Palmares</span><span>Funai</span><span>PROSAS</span><span>Inep</span></div></article>
<article class="frente"><div class="n">Frente 3</div><h3>Indicadores, metodologias e avaliação</h3><p>Sistematizar indicadores; desenvolver metodologias de coleta, análise e avaliação; discutir conceitos, padrões e taxonomias; avaliar a execução do PNC e produzir evidências.</p><div class="orgs-l">Organizações envolvidas</div><div class="orgs"><span>LabCD</span><span>INCT</span><span>Cetic.br · TIC Cultura</span><span>OBEC-Bahia</span><span>UECE</span><span>IDCULT</span><span>UnB</span><span>Fundação Itaú</span></div></article>
<article class="frente"><div class="n">Frente 4</div><h3>Pesquisa e produção de conhecimento</h3><p>Produzir pesquisas aplicadas; realizar estudos, encontros e seminários; analisar marcos legais e políticas; produzir conhecimento sobre a implementação do PNC e os territórios.</p><div class="orgs-l">Organizações envolvidas</div><div class="orgs"><span>FCRB</span><span>UECE</span><span>OBEC-Bahia</span><span>Observatório Baixada Cultural</span><span>Fundação Itaú</span><span>C de Cultura</span><span>INCT</span><span>IDCULT</span></div></article>
<article class="frente"><div class="n">Frente 5</div><h3>Formação, apropriação e controle social</h3><p>Formar gestores, pesquisadores e sociedade; ampliar a capacidade de produzir e interpretar dados; facilitar o acesso às informações do PNC; fortalecer a participação e o acompanhamento social.</p><div class="orgs-l">Organizações envolvidas</div><div class="orgs"><span>Cetic.br</span><span>Cetic.br · TIC Cultura</span><span>Fundação Itaú</span><span>OBEC-Bahia</span><span>Sesc SP</span><span>SNIC</span><span>Funai</span></div></article>
<article class="frente"><div class="n">Frente 6</div><h3>Comunicação, narrativas e mobilização</h3><p>Transformar dados em narrativas acessíveis; desenvolver visualizações e dashboards; comunicar resultados; sensibilizar e mobilizar diferentes públicos; aproximar o PNC dos territórios e ampliar seu reconhecimento.</p><div class="orgs-l">Organizações envolvidas</div><div class="orgs"><span>data_labe</span><span>MinC · SGE</span><span>C de Cultura</span><span>Funai</span><span>Bloco do Beco</span></div></article>
</div>
<p class="quadro">Quadro 1: sistematização das contribuições por frente e organizações.</p>
<div class="horizontes">
<h3>Horizontes para os dados culturais</h3>
<p>O Datathon mostrou que construir um monitoramento possível do Plano Nacional de Cultura é também construir condições para que diferentes atores possam produzir, compartilhar e utilizar informações de forma articulada. Ao longo dos dois dias, apareceram desafios comuns aos diferentes eixos, como a fragmentação das bases, a dificuldade de produzir dados territorializados e federativos, a necessidade de qualificar indicadores e a importância de partir do que já existe para avançar gradualmente.</p>
<p>A partir daqui, permanece aberta a oportunidade de transformar essa rede de conhecimentos, dados e experiências em novas formas de acompanhar o PNC: cada organização contribuindo a partir de seu lugar, mas buscando fazer com que essas contribuições se encontrem e ganhem força coletivamente.</p>
</div>
</div>
</div>
<div class="blk sec" id="galeria">
<div class="wrap">
<div class="gal-head">
<div>
<span class="eyebrow">Nas mesas</span>
<h2 style="margin-top:16px">Dois dias <span class="light">em imagens</span></h2>
</div>
<p style="max-width:380px;font-size:16px;color:var(--text-muted)">Clique em uma foto para abrir em tamanho maior.</p>
</div>
<div class="gallery" id="gallery">
<a class="s4" href="/blog/images/vec-09349.webp" target="\_blank" rel="noopener"><img src="/blog/images/vec-09349.webp" alt="Participante fala durante a discussão em grupo" style="object-position:center 38%"></a>

![Participante acompanha com atenção a conversa da mesa](images/vec-09380.webp)


<a class="s2" href="/blog/images/vec-09399.webp" target="\_blank" rel="noopener"><img src="/blog/images/vec-09399.webp" alt="Participante sorri durante o trabalho em grupo, com o banner do Datathon ao fundo" style="object-position:center 45%"></a>
<a class="s2" href="/blog/images/vec-09454.webp" target="\_blank" rel="noopener"><img src="/blog/images/vec-09454.webp" alt="Participante gesticula ao contribuir com a discussão" style="object-position:center 45%"></a>
<a class="s2" href="/blog/images/vec-09457.webp" target="\_blank" rel="noopener"><img src="/blog/images/vec-09457.webp" alt="Participante apresenta ao grupo sobre o painel de trabalho" style="object-position:center 40%"></a>
<a class="s4" href="/blog/images/vec-09485.webp" target="\_blank" rel="noopener"><img src="/blog/images/vec-09485.webp" alt="Grupo reunido em torno do painel do Datathon, em sala com janelas amplas" style="object-position:center 50%"></a>
<a class="s2" href="/blog/images/162a2398.webp" target="\_blank" rel="noopener"><img src="/blog/images/162a2398.webp" alt="Mesa de trabalho com post-its coloridos sobre o painel" style="object-position:center 50%"></a>
<a class="s3" href="/blog/images/vec-09521-1.webp" target="\_blank" rel="noopener"><img src="/blog/images/vec-09521-1.webp" alt="Facilitador de camisa rosa conduz a conversa em uma das mesas" style="object-position:center 40%"></a>
<a class="s3" href="/blog/images/vec-09523.webp" target="\_blank" rel="noopener"><img src="/blog/images/vec-09523.webp" alt="Mesa em debate com participantes atentos à fala do facilitador" style="object-position:center 45%"></a>
<a class="s4" href="/blog/images/162a2401.webp" target="\_blank" rel="noopener"><img src="/blog/images/162a2401.webp" alt="Salão com várias mesas trabalhando ao mesmo tempo, com painéis de post-its" style="object-position:center 55%"></a>
<a class="s2" href="/blog/images/162a2433.webp" target="\_blank" rel="noopener"><img src="/blog/images/162a2433.webp" alt="Facilitadora circula pelo salão com microfone" style="object-position:center 38%"></a>
</div>
</div>
</div>
<div class="blk sec rede" id="rede">
<div class="wrap two">
<div class="photo"><img src="/blog/images/93c8f474-706a-42ed-966c-725e9de492f8.webp" alt="Equipe organizadora sorrindo em frente ao banner do Datathon, com um telão de avaliação e certificado ao fundo" style="aspect-ratio:1/1;object-position:center 40%"></div>
<div class="prose">
<span class="eyebrow on-dark">Rede e próximos passos</span>
<h2><span class="light">Uma rede</span> que se fortalece</h2>
<p>Esse processo também ajudou a estruturar e fortalecer a rede de produtores e curadores de dados do setor da cultura no Brasil.</p>
<p>Essa estrutura reúne:</p>
<div class="chips">
<span class="chip">Governo</span>
<span class="chip">Sociedade civil</span>
<span class="chip">Academia</span>
<span class="chip">Outros parceiros do SNIIC</span>
</div>
<p style="font-size:15px;opacity:.8">SNIIC: Sistema Nacional de Informações e Indicadores Culturais.</p>
<div class="next">
<div class="t">Próximo passo</div>
<p>Transformar esse trabalho em recomendações práticas, com responsáveis definidos para a coleta, a integração e a transparência dos dados.</p>
</div>
</div>
</div>
</div>
<div class="blk sec gh">
<div class="wrap">
<div class="box">
<svg class="logo" aria-hidden="true" viewBox="19 -2 295 337" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M118.755 191.493C122.559 228 154.892 254.63 195.634 254.813L195.727 234.308C165.16 234.17 141.894 215.689 139.15 189.366C138.424 182.403 138.797 175.437 140.26 168.662L120.218 164.331C118.295 173.229 117.803 182.369 118.755 191.493Z" fill="#0A005A"/>
<path d="M31.2178 175.943L188.234 176.37L188.291 155.863L31.2727 155.439L31.2178 175.943Z" fill="#0A005A"/>
<path d="M192.062 0.00668335C140.306 1.3731 94.1959 22.1872 62.2258 58.6195C31.1227 94.0632 16.8527 141.019 22.0454 190.838C26.4376 232.97 46.9738 270.869 79.8727 297.555C108.394 320.692 143.251 333 179.478 333C185.032 333 190.619 332.709 196.22 332.125C266.922 324.753 318.447 261.237 311.075 190.535C305.487 136.925 260.341 96.8276 207.687 96.2551V15.217C207.687 11.1394 206.011 7.16829 203.088 4.32062C200.271 1.57613 196.441 0 192.513 0C192.363 0 192.212 0.00169035 192.062 0.00668335ZM92.7896 281.629C64.1447 258.393 46.2648 225.396 42.4402 188.711C37.8466 144.642 50.3474 103.244 77.6392 72.1439C104.685 41.3254 143.42 23.1891 187.182 20.7309V312.281C184.616 312.422 182.058 312.492 179.505 312.492C147.971 312.49 117.621 301.772 92.7896 281.629ZM207.687 116.763C249.973 117.346 286.19 149.584 290.681 192.662C296.396 247.483 260.005 297.169 207.687 309.438V116.763Z" fill="#0A005A"/>
</svg>
<p style="max-width:760px">O Gov Hub trabalha com integração de dados públicos. Participar dessa construção coletiva em prol do PNC reforça a qualidade da metodologia desenvolvida internamente e aproxima os ganhos empíricos de outras experiências de monitoramento baseadas em dados.</p>
</div>
</div>
</div>
</div>

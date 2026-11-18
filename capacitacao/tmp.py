import json
t=json.load(open('docs/trilhas/seguranca-dags.json'))
q=json.load(open('quiz/seguranca-dags.json'))
ids=[i['id'] for n in t['niveis'] for i in n['itens']]
p=q.get('perguntas',{})
print('trilha.quiz =',t.get('quiz'))
print('aulas na trilha:',len(ids),'| perguntas no quiz:',len(p))
print('aulas com pergunta:',sum(i in p for i in ids))
print('chaves do quiz sem aula na trilha:',[k for k in p if k not in ids])
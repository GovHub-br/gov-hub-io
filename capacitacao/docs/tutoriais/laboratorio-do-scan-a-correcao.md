# Laboratório: do scan à correção

> Tipo: **Tutorial** · Trilha: `Do scan à correção`

Você vai pegar uma DAG insegura de propósito, escaneá-la com Bandit e Trivy, corrigi-la e, no fim, descobrir o que as ferramentas deixaram passar.

> **Atenção.** Tudo aqui é fictício e intencionalmente inseguro. Faça o laboratório numa pasta **fora de qualquer repositório real** e nunca faça commit nem push desses arquivos.

## O que você vai construir

Duas versões da mesma DAG (`exemplo_inseguro.py` e `exemplo_seguro.py`) e quatro relatórios (`bandit-antes`, `trivy-antes`, `bandit-depois`, `trivy-depois`) para comparar o antes e o depois.

## O que você vai aprender

- Rodar o Bandit e o Trivy e reconhecer os achados mais comuns.
- Corrigir credencial no código, SQL por f-string, MD5, requisição sem timeout, `yaml.load` e `pickle`.
- Atualizar dependências e usar um Dockerfile sem root.
- Ver o limite do SAST: dado pessoal em log e em XCom.

## Pré-requisitos

- Cerca de 90 minutos.
- Python 3.11, Git e acesso à internet (o Trivy baixa a base de vulnerabilidades na primeira execução).
- Docker, se você não tiver o Trivy instalado.

## Passo 1 — Preparar o ambiente

```bash
mkdir -p ~/lab-seguranca/dags ~/lab-seguranca/reports
cd ~/lab-seguranca
python3 -m venv .venv && source .venv/bin/activate
pip install bandit
bandit --version
```

Para o Trivy, siga a página oficial de instalação (o pacote não vem nos repositórios padrão do Ubuntu; o método via apt exige adicionar antes o repositório da Aqua Security). Se preferir não instalar, use o contêiner:

```bash
alias trivy='docker run --rm -v $PWD:/work -w /work aquasec/trivy'
trivy --version
```

**Resultado esperado:** `bandit --version` e `trivy --version` imprimem uma versão.

## Passo 2 — Criar a DAG insegura

Crie o arquivo `dags/exemplo_inseguro.py`. O token é fictício e tem o formato de um token do GitHub de propósito, para o Trivy reconhecer.

```python
import hashlib
import pickle
from datetime import datetime

import requests
import yaml
from airflow.decorators import dag, task
from airflow.providers.postgres.hooks.postgres import PostgresHook

DB_PASSWORD = 'Minc@2026'                                   # (1) senha no código
API_TOKEN = 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789'      # (2) token no código (fictício)

@dag(schedule='@daily', start_date=datetime(2026, 1, 1), catchup=False)
def exemplo_inseguro(ano: int = 2025):
    @task
    def extrair(ano):
        hook = PostgresHook(postgres_conn_id='dw_homolog')
        sql = f'SELECT cpf, nome FROM agentes WHERE ano = {ano}'   # (3) SQL por f-string
        rows = hook.get_records(sql)
        print(rows[:5])                                            # (4) dado pessoal no log
        return rows                                                # (5) linhas inteiras no XCom

    @task
    def pseudonimizar(rows):
        return [(hashlib.md5(cpf.encode()).hexdigest(), nome) for cpf, nome in rows]  # (6) MD5

    @task
    def enriquecer(rows):
        r = requests.get('https://api.exemplo.gov.br/dados', verify=False)  # (7) sem timeout, sem TLS
        cfg = yaml.load(open('/opt/airflow/config.yml'), Loader=yaml.Loader)  # (8) yaml.load
        modelo = pickle.load(open('/opt/airflow/modelo.pkl', 'rb'))          # (9) pickle.load
        return len(rows)

    enriquecer(pseudonimizar(extrair(ano)))

exemplo_inseguro()
```

Agora o `requirements.txt` (versões antigas de propósito):

```text
pyyaml==5.3
requests==2.19.0
```

E o `Dockerfile`:

```dockerfile
FROM python:3.11
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
CMD python dags/exemplo_inseguro.py
```

## Passo 3 — Rodar o Bandit (SAST)

```bash
bandit -r dags/ -f txt -o reports/bandit-antes.txt
cat reports/bandit-antes.txt
```

**Resultado esperado.** Achados com estes identificadores, entre outros:

- **B105**: senha e token em variável;
- **B608**: SQL montado por string;
- **B324**: MD5;
- **B501** e **B113**: requisição sem validação de certificado e sem timeout;
- **B506**: `yaml.load`;
- **B301**: `pickle` (mais o **B403**, de baixa severidade, no `import pickle`).

O Bandit sai com código diferente de zero quando encontra problemas; é isso que permite barrar um PR. Se a sua versão do Bandit mostrar um conjunto ligeiramente diferente, consulte a página da regra na documentação.

## Passo 4 — Rodar o Trivy (SCA, segredos e misconfiguration)

```bash
trivy fs . --scanners vuln,secret,misconfig --format table -o reports/trivy-antes.txt
cat reports/trivy-antes.txt
```

**Resultado esperado.**

1. Vulnerabilidades conhecidas em `pyyaml` e `requests`, com a coluna **Fixed Version** indicando a versão corrigida.
2. Um segredo detectado no arquivo da DAG: o token fictício.
3. Uma configuração insegura no Dockerfile: ausência de `USER`, ou seja, o contêiner roda como root (regra DS002), entre outras.

O escopo `misconfig` é o nome atual; versões antigas usavam `config`.

## Passo 5 — Triar

Preencha uma tabela com uma linha por achado: o que é, onde está, decisão (corrigir, mitigar ou aceitar) e porquê. Neste laboratório a decisão é sempre **corrigir**; no mundo real, veja [Decidir o que fazer com um achado](../guias/decidir-o-que-fazer-com-um-achado.md).

## Passo 6 — Corrigir

Crie `dags/exemplo_seguro.py` (os números batem com os comentários da versão insegura):

```python
import hashlib
import hmac
import logging
import pickle  # nosec B403 - usado só com artefato interno, verificado por hash
from datetime import datetime

import requests
import yaml
from airflow.decorators import dag, task   # no Airflow 3, os imports vêm de airflow.sdk
from airflow.models import Variable
from airflow.providers.postgres.hooks.postgres import PostgresHook

log = logging.getLogger(__name__)

@dag(schedule='@daily', start_date=datetime(2026, 1, 1), catchup=False)
def exemplo_seguro(ano: int = 2025):
    @task
    def extrair_e_pseudonimizar(ano: int) -> str:
        hook = PostgresHook(postgres_conn_id='dw_homolog')      # (1)(2) segredos ficam na Connection
        rows = hook.get_records(
            'SELECT cpf FROM agentes WHERE ano = %s',            # (3) parametrizada; só a coluna necessária
            parameters=(ano,),
        )
        # nome com "secret": a interface do Airflow mascara o valor
        chave = Variable.get('pseudonimizacao_secret_key').encode()   # chave fora do código
        saida = [(hmac.new(chave, cpf.encode(), hashlib.sha256).hexdigest(),) for (cpf,) in rows]  # (6)
        hook.insert_rows('staging.agentes_pseudo', saida, target_fields=['cpf_pseudo'])
        log.info('registros processados: %d', len(saida))        # (4) conta, não valores
        return 'staging.agentes_pseudo'                          # (5) o XCom leva só a referência

    @task
    def enriquecer(tabela: str) -> None:
        r = requests.get('https://api.exemplo.gov.br/dados', timeout=10)   # (7) timeout e TLS padrão
        r.raise_for_status()
        with open('/opt/airflow/config.yml', encoding='utf-8') as f:
            cfg = yaml.safe_load(f)                                         # (8) safe_load
        with open('/opt/airflow/modelo.pkl', 'rb') as f:
            blob = f.read()
        if hashlib.sha256(blob).hexdigest() != Variable.get('modelo_sha256'):
            raise ValueError('modelo não confere com o hash aprovado')
        modelo = pickle.loads(blob)  # nosec B301 - artefato interno, hash verificado acima   # (9)

    enriquecer(extrair_e_pseudonimizar(ano))

exemplo_seguro()
```

No `requirements.txt`, troque as versões pelas indicadas na coluna **Fixed Version** do relatório do Trivy. No `Dockerfile`, crie e use um usuário sem privilégios:

```dockerfile
FROM python:3.11
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt && useradd -m app
USER app
CMD python dags/exemplo_seguro.py
```

## Passo 7 — Rodar de novo e comparar

```bash
bandit -r dags/exemplo_seguro.py -f txt -o reports/bandit-depois.txt
trivy fs . --scanners vuln,secret,misconfig --format table -o reports/trivy-depois.txt
```

**Resultado esperado.**

- O Bandit não aponta mais os padrões corrigidos, e as linhas com `# nosec` aparecem como suprimidas (veja a contagem de `nosec` nas métricas do relatório).
- O Trivy não lista mais as vulnerabilidades das dependências atualizadas (versões novas de outras bibliotecas podem trazer achados novos).
- O segredo some do relatório da DAG segura e a regra do `USER` deixa de disparar.

Lembre-se de remover ou ignorar o arquivo `exemplo_inseguro.py`, que continua na pasta e continuará gerando achados.

## Passo 8 — Ver o que nenhuma ferramenta apontou

Volte à DAG insegura. Os itens **(4)** e **(5)**, o `print` de linhas com CPF e o `return rows` que grava dado pessoal no XCom, **não geraram achado** de Bandit nem de Trivy.

Na versão segura eles foram corrigidos por decisão de projeto: logar contagem em vez de valores, devolver só a referência da tabela de staging e selecionar apenas a coluna necessária (minimização). Esse é o limite do SAST e a razão do guia [Manter dado pessoal fora de logs, XCom e repositório](../guias/manter-dado-pessoal-fora-de-logs-xcom-e-repositorio.md).

## O que você aprendeu

- Cada ferramenta responde a uma pergunta diferente: Bandit olha o código, Trivy olha dependências, segredos e configuração.
- Os padrões mais comuns de uma DAG têm correção conhecida (parâmetros, `safe_load`, `timeout`, HMAC, `USER`).
- Zero achados não é o mesmo que código seguro: dado pessoal em log e XCom passou despercebido.

**Pergunta de verificação.** Por que usar HMAC com chave em vez de MD5 para pseudonimizar CPF?

> Porque CPF tem cerca de um bilhão de combinações válidas, então um hash sem chave é desfeito por força bruta em minutos. Com chave secreta guardada fora do banco, quem não a possui não consegue gerar a tabela de correspondência. Mesmo assim o resultado é dado pseudonimizado, e continua sendo dado pessoal pela LGPD.

## Próximos passos

- Faça os guias do nível 4, começando por [Rodar Bandit e Trivy e ler o relatório](../guias/rodar-bandit-e-trivy-e-ler-o-relatorio.md).
- Aplique tudo numa DAG real no [exercício final](../desafios/triagem-de-uma-dag-real.md).

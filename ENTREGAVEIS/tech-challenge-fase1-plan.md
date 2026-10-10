# Tech Challenge – Fase 1: ToggleMaster na AWS

## Visão Geral

**Objetivo:** Colocar no ar a aplicação monolítica `toggle-master-monolith` na AWS, provisionando manualmente a infraestrutura necessária, seguindo boas práticas de segurança e arquitetura cloud.

**Stack real da aplicação (confirmada no repositório):**
- Python 3 + Flask 2.2 + Gunicorn
- Banco de dados: PostgreSQL (via `psycopg2-binary`)
- Porta padrão: **5000**
- Tabela criada automaticamente em `init_db()` no primeiro acesso
- Variáveis de ambiente necessárias: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Modo de inicialização na EC2: `gunicorn --bind 0.0.0.0:5000 app:app`

**Entregáveis exigidos:**
1. Vídeo de demonstração (até 15 min)
2. Documentação: link do diagrama de arquitetura + análise dos 12-Factor App
3. Relatório de Entrega (`ENTREGA.pdf` ou `ENTREGA.txt`) com nomes, links, desafios e print de custos

---

## Divisão de Responsabilidades – Grupo de 5 Pessoas

| Pessoa | Papel Principal | Sub-Tarefas |
|---|---|---|
| **Pessoa 1** | Líder Técnico / Deploy AWS | ST-5 (conta AWS), ST-6 (infraestrutura), ST-7 (deploy EC2) |
| **Pessoa 2** | Engenheiro de Infraestrutura | ST-6 (apoio), ST-7 (apoio SSH), ST-9 (vídeo) |
| **Pessoa 3** | Arquiteto de Soluções | ST-3 (diagrama AWS padrão oficial), ST-4 (estimativa de custo) |
| **Pessoa 4** | Analista DevOps / Documentação | ST-2 (análise 12 Fatores), ST-8 (documentação e relatório) |
| **Pessoa 5** (você) | Coordenador + Execução Local | ST-1 (rodar localmente), ST-8 (revisão geral), ST-9 (gravação) |

> **Atividades que todos participam:** ST-1 (entendimento inicial da aplicação) e ST-9 (gravação do vídeo)

---

## Sub-Tarefas

---

### ST-1 — Executar e entender a aplicação localmente

**Responsável:** Pessoa 5 (coordena) — todos devem executar em suas máquinas
**Status:** `[ ] pending`

**Intent:** Rodar a aplicação localmente via Docker Compose para entender o que o ToggleMaster faz, sua estrutura de código e por que é classificado como "monolito". É a base para todas as decisões de arquitetura e análise.

**Expected Outcomes:**
- Aplicação rodando localmente em `http://localhost:5000`
- CRUD de feature flags testado e funcionando
- Anotações sobre: o que é um monolito, vantagens e desvantagens para MVP

**Todo List:**
1. Clonar o repositório:
   ```bash
   git clone https://github.com/dougls/toggle-master-monolith
   cd toggle-master-monolith
   ```
2. Subir com Docker Compose (não requer Python instalado localmente):
   ```bash
   docker compose up --build
   ```
3. Verificar que a aplicação está no ar:
   ```bash
   curl http://localhost:5000/health
   # Esperado: {"status": "ok"}
   ```
4. Testar os endpoints CRUD conforme a tabela do README:
   - `POST /flags` — criar flag
   - `GET /flags` — listar flags
   - `GET /flags/<nome>` — consultar flag
   - `PUT /flags/<nome>` — atualizar flag
5. Ler e analisar o `app.py` e o `Dockerfile`: identificar por que a aplicação é um monolito
6. Encerrar os contêineres: `docker compose down`

**Relevant Context:**
- Repositório: https://github.com/dougls/toggle-master-monolith
- Stack: Flask + PostgreSQL + Gunicorn
- A tabela `flags` é criada automaticamente pelo `init_db()` na primeira chamada
- O `docker-compose.yaml` sobe automaticamente um PostgreSQL local para desenvolvimento
- Amazon Linux 2023 usa `yum` (não `dnf`), conforme o README oficial do projeto

---

### ST-2 — Análise dos 12 Fatores (12-Factor App)

**Responsável:** Pessoa 4
**Status:** `[ ] pending`

**Intent:** Produzir análise documentada dos 12 fatores aplicados ao `toggle-master-monolith`. Este conteúdo vai compor a documentação oficial da entrega.

**Expected Outcomes:**
- Documento estruturado com os 12 fatores avaliados, cada um com: status (✅ / ⚠️ / ❌), justificativa baseada no código real, e sugestão de melhoria quando aplicável

**Todo List:**
1. Estudar os 12 Fatores em https://12factor.net/pt_br/
2. Para cada fator, analisar o `app.py`, `requirements.txt`, `Dockerfile` e `docker-compose.yaml`:
   - **I. Codebase** — único repositório Git? ✅ (há um repo GitHub)
   - **II. Dependencies** — `requirements.txt` declara Flask, psycopg2, gunicorn ✅
   - **III. Config** — `os.getenv("DB_HOST")` etc. — lê do ambiente ✅ (quando na EC2); ⚠️ sem `.env` padrão
   - **IV. Backing services** — PostgreSQL externo via host/port ✅
   - **V. Build, release, run** — `Dockerfile` separa build; release/run manuais ⚠️
   - **VI. Processes** — Flask é stateless? Analisar se há estado em memória ⚠️
   - **VII. Port binding** — `gunicorn --bind 0.0.0.0:5000` ✅
   - **VIII. Concurrency** — Gunicorn com workers? Verificar se está configurado ⚠️
   - **IX. Disposability** — shutdown gracioso? Gunicorn tem, mas `Ctrl+C` mata sem cleanup ⚠️
   - **X. Dev/prod parity** — Docker local vs. EC2 sem Docker ❌ (diferença de ambiente)
   - **XI. Logs** — `print()` direto; sem estrutura de logs ❌
   - **XII. Admin processes** — `flask init-db` é um processo admin ✅
3. Redigir o documento final em formato adequado para incluir na documentação (markdown ou HTML)

**Relevant Context:**
- O código usa `print()` para logs — não usa `logging` nem streams estruturados (Fator XI)
- As variáveis de ambiente **não** têm valores padrão no código (se não definidas, a app falha com None)
- O `docker-compose.yaml` define `DB_HOST`, `DB_NAME`, etc. para dev — boa base para análise do Fator X

---

### ST-3 — Criar Diagrama de Arquitetura AWS com Ícones Oficiais

**Responsável:** Pessoa 3
**Status:** `[ ] pending`

**Intent:** Criar um diagrama de arquitetura usando os ícones oficiais da AWS, exportável como imagem de alta qualidade para inclusão no documento PDF com formatação ABNT. O diagrama deve representar fielmente a infraestrutura provisionada.

**Expected Outcomes:**
- Diagrama finalizado com ícones oficiais AWS (não genéricos)
- Exportado como PNG de alta resolução (mínimo 300 DPI) para inserção no PDF ABNT
- Link compartilhável do diagrama publicado online
- Todos os componentes obrigatórios presentes e rotulados

**Todo List:**

**Configuração da ferramenta:**
1. Acessar https://app.diagrams.net (draw.io) — gratuito e suporta ícones AWS oficiais nativamente
2. No draw.io: menu **Extras → Edit Diagram** ou **Search Shapes → "AWS"** para ativar a biblioteca de ícones AWS
3. Alternativa: Importar o kit oficial da AWS em https://aws.amazon.com/architecture/icons/ — baixar o pacote para draw.io

**Componentes a inserir no diagrama:**
4. Criar o canvas com os seguintes elementos, usando os ícones oficiais da categoria correta:

   | Componente | Ícone AWS Oficial | Categoria |
   |---|---|---|
   | VPC | Amazon VPC | Networking & Content Delivery |
   | Internet Gateway | Internet Gateway | Networking |
   | Sub-rede Pública (10.0.1.0/24) | Public Subnet | Networking |
   | Sub-rede Privada (10.0.2.0/24) | Private Subnet | Networking |
   | EC2 Instance | Amazon EC2 | Compute |
   | RDS PostgreSQL | Amazon RDS | Database |
   | Security Group EC2 | Security Group | Security |
   | Security Group RDS | Security Group | Security |
   | Usuário / Internet | User / Internet | General |

5. Organizar o layout:
   - Retângulo externo: **AWS Region (us-east-1)**
   - Dentro: retângulo **VPC (10.0.0.0/16)**
   - Dentro da VPC: dois retângulos lado a lado — **Public Subnet** e **Private Subnet**
   - EC2 na Public Subnet, RDS na Private Subnet
   - Internet Gateway acima/fora da VPC, com seta para a sub-rede pública
   - Setas de fluxo: Usuário → IGW → EC2 → RDS

6. Adicionar labels a cada componente:
   - EC2: `togglemaster-ec2 | t3.micro | Amazon Linux 2023 | Flask:5000`
   - RDS: `togglemaster-db | db.t3.micro | PostgreSQL 15 | porta: 5432`
   - SG-EC2: `TCP 22 (SSH), TCP 5000 (HTTP)`
   - SG-RDS: `TCP 5432 somente de SG-EC2`

7. Exportar como PNG: **File → Export As → PNG** — marcar "High Resolution" (300+ DPI)
8. Publicar online: **Extras → Edit Diagram → Share** ou salvar no Google Drive
9. Copiar o link compartilhável para a documentação

**Relevant Context:**
- Ícones AWS oficiais para draw.io: https://aws.amazon.com/architecture/icons/
- A aplicação roda na porta **5000** (não 80 nem 8080) — confirmar isso no diagrama e no Security Group
- O draw.io possui suporte nativo a ícones AWS via Search Shapes → "AWS19" (kit 2019+)

---

### ST-4 — Estimativa de Custo na AWS Pricing Calculator

**Responsável:** Pessoa 3
**Status:** `[ ] pending`

**Intent:** Calcular o custo mensal estimado da arquitetura usando a calculadora oficial da AWS. O print é entregável obrigatório no relatório.

**Expected Outcomes:**
- Estimativa de custo mensal calculada com serviços EC2 + RDS
- Print tirado e salvo em alta resolução
- Link compartilhável da estimativa (a calculadora gera URL pública)

**Todo List:**
1. Acessar https://calculator.aws/pricing/2/en/
2. Clicar em **Create estimate** → selecionar região: **US East (N. Virginia)**
3. Adicionar **EC2**:
   - Search: "EC2" → Add to estimate
   - OS: Linux
   - Instance type: `t3.micro`
   - Usage: 100% (730 horas/mês)
   - Pricing model: On-Demand
4. Adicionar **RDS for PostgreSQL**:
   - Search: "RDS" → Amazon RDS for PostgreSQL → Add
   - Instance class: `db.t3.micro`
   - Deployment: Single-AZ
   - Storage: 20 GB gp2
   - Usage: 730 horas/mês
5. Adicionar **Data Transfer** (estimativa básica: 1 GB outbound/mês)
6. (Opcional) Adicionar **Elastic IP** se for usar IP fixo: $0.005/hora quando associado a instância stopped
7. Salvar e exportar:
   - Clicar em **Save and share** → copiar o link público
   - Tirar print da tela com o resumo de custos (incluindo a tabela de serviços)
8. Anotar: custo real ≈ $0 no Free Tier (primeiros 12 meses); custo sem Free Tier ≈ $25–40/mês

**Relevant Context:**
- Free Tier AWS cobre: 750h/mês de `t3.micro` EC2 + 750h/mês de `db.t3.micro` RDS por 12 meses em contas novas
- O print deve aparecer no relatório ABNT — salvar em alta resolução (PNG ou PDF)

---

### ST-5 — Criar Conta AWS e Configurar Acesso

**Responsável:** Pessoa 1
**Status:** `[ ] pending`

**Intent:** Definir e criar a conta AWS que o grupo usará. Isso precisa ser resolvido antes do início do provisionamento.

**Expected Outcomes:**
- Conta AWS ativa com Free Tier habilitado
- MFA ativo no root
- Usuário IAM com `AdministratorAccess` criado para uso nos próximos passos
- Região padrão definida: `us-east-1`

**Todo List:**
1. Decidir em grupo: criar conta nova (recomendado para Free Tier) ou usar conta existente
2. Acessar https://aws.amazon.com/pt/ → **Criar conta gratuita**
   - Necessário: e-mail, cartão de crédito (cobrança mínima de $1 para validar, estornada)
3. Habilitar MFA no usuário root:
   - IAM → Security credentials → Multi-factor authentication → Add MFA
4. Criar usuário IAM para o grupo:
   - IAM → Users → Create user
   - Tipo de acesso: Console + Programmatic
   - Política: `AdministratorAccess`
   - Anotar e compartilhar com o grupo: URL de login, usuário e senha temporária
5. Fazer login com o usuário IAM (nunca usar root para operações)
6. Definir região padrão no console: canto superior direito → **US East (N. Virginia)**
7. Verificar se o Free Tier está ativo: AWS Console → Billing → Free Tier

**Relevant Context:**
- **AWS Academy:** O README menciona que o curso pode ter acesso via AWS Academy (https://awsacademy.instructure.com/) — verificar com os professores se há créditos disponíveis antes de criar conta pessoal
- ATENÇÃO pós-entrega: **parar EC2** (não deletar — só parar, para manter configuração) e **deletar RDS** (RDS continua cobrando quando parado após 7 dias)

---

### ST-6 — Provisionar Infraestrutura Manualmente no Console AWS

**Responsável:** Pessoas 1 e 2
**Status:** `[ ] pending`
**Depende de:** ST-5 (conta AWS criada)

**Intent:** Criar toda a infraestrutura AWS conforme o diagrama (ST-3) usando o Console Web da AWS. Esta é a etapa prática central do desafio.

**Expected Outcomes:**
- VPC com sub-redes pública e privada configuradas
- Internet Gateway e Route Table funcionando
- EC2 acessível via SSH
- RDS PostgreSQL disponível e acessível apenas pela EC2 via Security Group

**Todo List:**

**Etapa A — VPC e Rede:**
1. Console AWS → **VPC** → Create VPC
   - Name: `togglemaster-vpc` | CIDR: `10.0.0.0/16` | Tenancy: Default
2. Criar sub-rede pública:
   - VPC → Subnets → Create subnet
   - Nome: `togglemaster-public` | VPC: togglemaster-vpc | AZ: `us-east-1a` | CIDR: `10.0.1.0/24`
   - Após criar: Actions → **Edit subnet settings → Enable auto-assign public IPv4** ✅
3. Criar sub-rede privada:
   - Nome: `togglemaster-private` | VPC: togglemaster-vpc | AZ: `us-east-1b` | CIDR: `10.0.2.0/24`
   - Auto-assign public IP: **NÃO habilitar** ✅
4. Criar Internet Gateway:
   - VPC → Internet gateways → Create → Nome: `togglemaster-igw`
   - Actions → **Attach to VPC** → selecionar `togglemaster-vpc`
5. Criar Route Table para a sub-rede pública:
   - VPC → Route tables → Create → Nome: `togglemaster-rt-public` | VPC: togglemaster-vpc
   - Routes → Edit routes → Add route: Destination `0.0.0.0/0` | Target: `togglemaster-igw`
   - Subnet associations → Edit → Associar `togglemaster-public`

**Etapa B — Security Groups:**
6. EC2 → Security Groups → Create security group:
   - Nome: `sg-ec2-togglemaster` | VPC: `togglemaster-vpc`
   - Inbound rules:
     - SSH (22) | Source: **IP do grupo** (ex: `203.0.113.0/32` ou `0.0.0.0/0` para teste)
     - Custom TCP (5000) | Source: `0.0.0.0/0` — porta da aplicação Flask/Gunicorn
   - Outbound: All traffic (padrão)
7. Criar segundo Security Group:
   - Nome: `sg-rds-togglemaster` | VPC: `togglemaster-vpc`
   - Inbound rules:
     - PostgreSQL (5432) | Source: **`sg-ec2-togglemaster`** (selecionar pelo ID do SG, não por IP)
   - Outbound: All traffic (padrão)

**Etapa C — EC2:**
8. EC2 → Launch Instances:
   - Name: `togglemaster-ec2`
   - AMI: **Amazon Linux 2023** (Free tier eligible)
   - Instance type: `t3.micro`
   - Key pair: **Create new key pair** → Nome: `togglemaster-key` → tipo RSA → formato `.pem` → **Baixar e guardar em local seguro**
   - Network: `togglemaster-vpc` | Subnet: `togglemaster-public` | Auto-assign public IP: Enable
   - Security group: `sg-ec2-togglemaster`
9. Anotar o **IP público** ou **DNS público** da instância após ela ficar no estado `running`

**Etapa D — RDS:**
10. RDS → Create database:
    - Creation method: Standard create
    - Engine: **PostgreSQL** | Version: 15.x
    - Template: **Free tier**
    - DB instance identifier: `togglemaster-db`
    - Master username: `postgres` (ou `admin`)
    - Master password: definir uma senha forte → **anotar com segurança (não comitar no Git)**
    - Instance class: `db.t3.micro`
    - Storage: 20 GiB gp2 | Storage autoscaling: **desabilitar**
    - VPC: `togglemaster-vpc`
    - Subnet group: criar novo ou usar padrão privado
    - Public access: **No** ← crítico para segurança
    - VPC Security group: `sg-rds-togglemaster`
    - Database name (Initial): `togglemaster`
11. Aguardar status `Available` (5–15 min) → anotar o **Endpoint** do RDS (ex: `togglemaster-db.xxxxxx.us-east-1.rds.amazonaws.com`)

**Relevant Context:**
- A porta da aplicação é **5000** (Flask/Gunicorn) — não 80; o SG-EC2 deve abrir a porta 5000
- O Subnet Group do RDS requer pelo menos **2 AZs** — criar sub-rede privada adicional em `us-east-1b` se necessário
- O endpoint do RDS será usado como `DB_HOST` na ST-7

---

### ST-7 — Deploy da Aplicação na EC2

**Responsável:** Pessoas 1 e 2
**Status:** `[ ] pending`
**Depende de:** ST-6 (EC2 e RDS provisionados)

**Intent:** Instalar dependências, configurar variáveis de ambiente com as credenciais do RDS e executar a aplicação na EC2 com Gunicorn.

**Expected Outcomes:**
- Aplicação acessível publicamente em `http://<IP-EC2>:5000/health`
- Endpoints CRUD funcionando e persistindo dados no RDS
- Credenciais do banco nunca expostas em código ou Git — apenas em variáveis de ambiente na sessão

**Todo List:**
1. Conectar à EC2 via SSH (terminal do computador local):
   ```bash
   chmod 400 togglemaster-key.pem
   ssh -i togglemaster-key.pem ec2-user@<IP-PUBLICO-EC2>
   ```
2. Atualizar pacotes e instalar dependências (Amazon Linux 2023 usa `yum`):
   ```bash
   sudo yum update -y
   sudo yum install -y git python3 python3-pip
   ```
3. Clonar o repositório:
   ```bash
   git clone https://github.com/dougls/toggle-master-monolith
   cd toggle-master-monolith
   ```
4. Criar ambiente virtual Python e ativar:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
5. Instalar dependências:
   ```bash
   pip install -r requirements.txt
   ```
6. Configurar variáveis de ambiente (substituir pelos dados reais do RDS):
   ```bash
   export DB_HOST='<endpoint-do-rds>'
   export DB_NAME='togglemaster'
   export DB_USER='postgres'
   export DB_PASSWORD='<senha-do-rds>'
   ```
7. Inicializar o banco de dados (cria a tabela `flags`):
   ```bash
   flask init-db
   # ou: python -c "from app import init_db; init_db()"
   ```
8. Iniciar a aplicação com Gunicorn:
   ```bash
   gunicorn --bind 0.0.0.0:5000 app:app
   ```
9. Testar externamente (do computador local ou browser):
   ```bash
   curl http://<IP-PUBLICO-EC2>:5000/health
   # Esperado: {"status": "ok"}
   ```
10. Testar criação de feature flag:
    ```bash
    curl -X POST -H "Content-Type: application/json" \
      -d '{"name": "nova-feature", "is_enabled": true}' \
      http://<IP-PUBLICO-EC2>:5000/flags
    ```

**Relevant Context:**
- O `init_db()` cria a tabela `flags` automaticamente — precisa ser executado uma vez antes de usar a API
- Gunicorn roda no foreground — se fechar o SSH, a app para; para o desafio isso é suficiente
- Se quiser manter rodando após fechar SSH: usar `nohup gunicorn --bind 0.0.0.0:5000 app:app &`
- O SG da EC2 **deve ter a porta 5000 aberta** — verificar antes de testar

---

### ST-8 — Preparar Documentação e Relatório de Entrega (Formato ABNT em PDF)

**Responsável:** Pessoa 4 (redação) + Pessoa 5 (revisão e coordenação)
**Status:** `[x] done — template HTML gerado em ENTREGA.html (preencher prints e links)`
**Depende de:** ST-2, ST-3, ST-4, ST-7 (conteúdo gerado)

**Contexto pós-execução:** O arquivo `ENTREGA.html` contém o documento completo no formato ABNT,
com diagrama AWS SVG inline (ícones com gradientes oficiais), análise dos 12 Fatores, tabelas de
custos e estrutura de referências. Para finalizar, o grupo deve:
1. Substituir os nomes/RMs na capa
2. Inserir os prints da calculadora AWS na Seção 5
3. Inserir prints do terminal/browser na Seção 6
4. Preencher o link da calculadora AWS e do vídeo
5. Abrir no Chrome → Imprimir → Salvar como PDF (tamanho A4, sem cabeçalho/rodapé do browser)

**Intent:** Consolidar todos os artefatos em um documento de entrega profissional, em formato ABNT, exportado como PDF. O diagrama será gerado em HTML+CSS usando bibliotecas com ícones AWS oficiais para garantir qualidade de impressão.

**Expected Outcomes:**
- Relatório `ENTREGA.pdf` pronto para submissão com formatação ABNT
- Análise dos 12 Fatores incluída no documento
- Diagrama de arquitetura com ícones AWS oficiais inserido em alta resolução
- Print da estimativa de custos incluído
- Todos os campos obrigatórios preenchidos

**Todo List:**

**Estrutura do documento ABNT:**
1. Criar o documento com as seguintes seções:
   - **Capa:** Nome da instituição (FIAP), curso, título ("Tech Challenge – Fase 1: ToggleMaster"), nomes dos integrantes, data
   - **Sumário**
   - **1. Introdução:** Contexto do desafio e do projeto ToggleMaster
   - **2. Análise da Aplicação Monolítica:** O que é o monolito, vantagens/desvantagens para MVP
   - **3. Análise dos 12 Fatores (12-Factor App):** Conteúdo da ST-2
   - **4. Arquitetura na AWS:** Diagrama (da ST-3) + descrição dos componentes + decisões tomadas
   - **5. Estimativa de Custos:** Print da calculadora AWS + análise (da ST-4)
   - **6. Execução e Validação:** Evidências do deploy (prints de terminal e do browser)
   - **7. Gerenciamento de Credenciais:** Como as credenciais foram geridas (variáveis de ambiente)
   - **8. Desafios Encontrados e Decisões Tomadas**
   - **Referências**

**Ferramenta de criação (HTML → PDF):**
2. Usar HTML + CSS com a biblioteca **`@aws-amplify/ui`** ou SVGs do kit oficial AWS para o diagrama, garantindo qualidade vetorial para impressão
3. Aplicar formatação ABNT via CSS:
   - Fonte: Times New Roman 12pt (ou Arial 12pt)
   - Espaçamento: 1,5 linha
   - Margens: Superior 3cm, Inferior 2cm, Esquerda 3cm, Direita 2cm
   - Numeração de páginas no rodapé
4. Exportar para PDF via **browser → Imprimir → Salvar como PDF** ou usando a ferramenta `wkhtmltopdf`
5. Verificar se o diagrama aparece nítido e todos os textos estão legíveis no PDF

**Relevant Context:**
- O diagrama de alta resolução (PNG 300DPI) da ST-3 pode ser inserido diretamente no documento HTML/Word
- Alternativa mais simples: criar o documento no Google Docs com formatação ABNT → Arquivo → Baixar como PDF
- Os ícones SVG oficiais da AWS estão disponíveis em https://awsicons.dev/ (open source, baseado no kit oficial)

---

### ST-9 — Gravar Vídeo de Demonstração

**Responsável:** Pessoa 2 (operação de gravação) + todos presentes
**Status:** `[ ] pending`
**Depende de:** ST-1, ST-3, ST-7 (tudo funcionando)

**Intent:** Gravar o vídeo de demonstração de até 15 minutos com todos os pontos exigidos pelo desafio.

**Expected Outcomes:**
- Vídeo de até 15 minutos publicado com link compartilhável
- Todos os 5 pontos obrigatórios cobertos no vídeo

**Todo List:**
1. Roteiro sugerido (15 min total):
   - **[0:00–1:30] Apresentação do grupo** — nomes, contexto do desafio
   - **[1:30–4:00] App rodando localmente** — `docker compose up`, testar endpoints CRUD no terminal
   - **[4:00–7:00] Diagrama de arquitetura** — explicar VPC, sub-redes, EC2, RDS, Security Groups
   - **[7:00–11:00] Demo na EC2** — conectar via SSH, mostrar Gunicorn rodando, testar API pelo browser/curl
   - **[11:00–13:30] Security Groups e credenciais** — mostrar SG no console AWS, explicar variáveis de ambiente
   - **[13:30–15:00] Conclusão** — resumo, desafios encontrados, próximos passos
2. Ferramentas de gravação: OBS Studio (gratuito), Loom, ou Zoom (gravar reunião)
3. Fazer upload para YouTube (não listado) ou Google Drive
4. Testar o link antes de incluir no relatório — verificar se está acessível por pessoas fora do grupo

---

## Ordem de Execução e Dependências

```
ST-1 (rodar local) ─────────────────────────────────────────┐
ST-2 (12 Fatores)  ──────────────────────────────────────── │
ST-3 (Diagrama)    ──────────────────────────────────────── │
ST-4 (Custo)       ──────────────────────────────────────── │
ST-5 (Conta AWS)   ──────────────────────────────────────── │
       │                                                     │
       ▼                                                     │
ST-6 (Infraestrutura AWS)                                    │
       │                                                     │
       ▼                                                     │
ST-7 (Deploy EC2)                                            │
       │                                                     │
       ▼                                                     │
ST-8 (Documentação) ◄────────────────────────────────────── ┘
       │
       ▼
ST-9 (Vídeo) ──► ENTREGA FINAL
```

> ST-1 a ST-5 podem ser executadas **em paralelo** pelo grupo.
> ST-6, ST-7, ST-8 e ST-9 são **sequenciais**.

---

## Riscos e Pontos de Atenção

| Risco | Mitigação |
|---|---|
| Conta AWS não definida a tempo | Resolver ST-5 nos primeiros dias |
| Aplicação não conecta ao RDS | Verificar Security Group SG-RDS e variáveis de ambiente |
| Porta 5000 não acessível | Confirmar que SG-EC2 abre TCP 5000 (não 80) |
| Cobrança inesperada da AWS | Verificar Free Tier + parar EC2 + deletar RDS após entrega |
| Credenciais expostas no Git | Nunca usar `git add .env` ou credenciais hardcoded no código |
| Gunicorn para quando fecha SSH | Usar `nohup ... &` ou gravar o vídeo sem fechar o terminal |
| Diagrama sem ícones oficiais AWS | Usar draw.io com biblioteca AWS19 ou awsicons.dev SVGs |

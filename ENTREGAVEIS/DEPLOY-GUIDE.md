# 🚀 Deploy: Plano de Entrega → GitHub Pages + Notificação WhatsApp

## Visão geral

```
GitHub Pages (grátis)          AWS Free Tier (grátis)
┌─────────────────────┐        ┌────────────────────────────┐
│  plano-de-entrega   │──POST──▶  API Gateway → Lambda      │
│  .html              │        │  → CallMeBot → WhatsApp    │
└─────────────────────┘        └────────────────────────────┘
```

---

## PARTE 1 — GitHub Pages (0 custo, sempre grátis)

### 1.1 Criar repositório no GitHub pessoal

```bash
# No terminal, dentro da pasta ENTREGAVEIS/
cd "/Users/johnlennonfernandesdasilva/Library/CloudStorage/OneDrive-IBM/Learning/FIAP/Pós Tech/Fase 1/Tech Challenge/ENTREGAVEIS"

git init
git add plano-de-entrega-tech-challenge-fase-1.html
git commit -m "feat: plano de entrega Tech Challenge Fase 1 – Grupo 20"
```

Acesse **github.com** (conta pessoal, NÃO o GHE) e crie:
- Novo repositório: `tc-fase1-grupo20` (pode ser público ou privado)
- **NÃO** inicialize com README

```bash
git remote add origin https://github.com/SEU_USUARIO/tc-fase1-grupo20.git
git branch -M main
git push -u origin main
```

### 1.2 Ativar GitHub Pages

1. No repositório → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / pasta: `/ (root)`
4. Clique **Save**

Após ~1 min o site estará em:
```
https://SEU_USUARIO.github.io/tc-fase1-grupo20/plano-de-entrega-tech-challenge-fase-1.html
```

> **Importante:** Se o repositório for privado, GitHub Pages só funciona com GitHub Pro/Team.
> Para repo público, Pages funciona 100% no plano gratuito.

---

## PARTE 2 — Backend WhatsApp (AWS Free Tier)

### 2.1 Ativar CallMeBot (0 custo, gratuito para sempre)

No WhatsApp de QUALQUER membro do grupo, envie para **+34 644 59 76 07**:

```
I allow callmebot to send me messages
```

Você receberá uma mensagem com sua **apikey** (ex: `1234567`).

> 📌 Cada membro precisa fazer isso se quiser receber individualmente.
> Para o grupo funcionar, use um número central (ex: o seu) e depois repasse para um grupo do WhatsApp.
> Alternativamente, use o endpoint de grupos: veja docs em callmebot.com.

### 2.2 Criar a Lambda no AWS Console

1. Acesse **AWS Console → Lambda → Create function**
2. Nome: `tc-fase1-notify`
3. Runtime: **Node.js 20.x**
4. Architecture: `arm64` (mais barato, mais rápido)
5. Clique **Create function**

### 2.3 Fazer upload do código

```bash
# Compactar o arquivo da Lambda
zip lambda-notify.zip lambda-notify.mjs
```

No Console:
- **Code → Upload from → .zip file** → selecione `lambda-notify.zip`
- **Handler:** `lambda-notify.handler`
- **Clique Deploy**

### 2.4 Configurar variáveis de ambiente

Em **Configuration → Environment variables → Edit → Add**:

| Key | Value |
|---|---|
| `WA_PHONE` | `5511999999999` (seu número com DDI, sem +) |
| `WA_APIKEY` | `1234567` (apikey recebida do CallMeBot) |

### 2.5 Criar API Gateway

1. **AWS Console → API Gateway → Create API**
2. Escolha **HTTP API** (mais barato que REST)
3. Add integration: **Lambda** → selecione `tc-fase1-notify`
4. Route: `POST /notify`
5. Habilite CORS: Origins `*`, Methods `POST, OPTIONS`
6. Clique **Create**

Copie a URL gerada (ex: `https://abc123.execute-api.us-east-1.amazonaws.com/notify`)

### 2.6 Configurar a URL no HTML

Abra `plano-de-entrega-tech-challenge-fase-1.html` e localize:

```javascript
const NOTIFY_URL = ''; // linha ~linha 500
```

Substitua por:

```javascript
const NOTIFY_URL = 'https://abc123.execute-api.us-east-1.amazonaws.com/notify';
```

Salve e faça novo push:

```bash
git add plano-de-entrega-tech-challenge-fase-1.html
git commit -m "feat: conectar notificação WhatsApp via API Gateway"
git push
```

---

## PARTE 3 — Custos estimados (FREE TIER)

| Serviço | Free Tier | Estimativa mensal |
|---|---|---|
| GitHub Pages | Ilimitado (repo público) | **$0,00** |
| AWS Lambda | 1M requests/mês grátis para sempre | **$0,00** |
| AWS API Gateway (HTTP) | 1M requests/mês por 12 meses | **$0,00** |
| CallMeBot WhatsApp | Gratuito (sem limites declarados) | **$0,00** |
| **TOTAL** | | **$0,00/mês** |

---

## PARTE 4 — Fluxo de uso para o grupo

1. John compartilha o link do GitHub Pages no grupo do WhatsApp
2. Cada membro abre no browser (funciona no celular também — responsivo)
3. Ao concluir uma tarefa, clica no checkbox ✅
4. Seleciona o próprio nome no modal
5. Clica "Confirmar & Notificar"
6. **Todo o grupo recebe mensagem no WhatsApp** com nome, tarefa e horário

> ⚠️ O estado do checklist é salvo no `localStorage` do browser de cada pessoa.
> Isso significa que cada um vê o estado das próprias marcações.
> Para estado compartilhado real, seria necessário um banco de dados (DynamoDB) —
> o que ainda cabe no free tier mas adiciona complexidade.
> **Recomendação atual:** use o WhatsApp como fonte de verdade para saber o que foi feito.

---

## Estrutura final do repositório

```
tc-fase1-grupo20/
└── plano-de-entrega-tech-challenge-fase-1.html   ← GitHub Pages
```

O `lambda-notify.mjs` fica apenas na AWS (não precisa estar no repo público).

---

## PARTE 5 — Firebase Realtime Database (sincronização em tempo real)

### 5.1 Visão geral

O portal agora usa **Firebase Realtime Database** para sincronizar o estado do checklist entre todos os membros em tempo real (~200ms). O localStorage continua funcionando como fallback offline.

```
Browser (membro A)          Firebase RTDB               Browser (membro B)
┌──────────────────┐        ┌─────────────────────┐     ┌──────────────────┐
│  marca checkbox  │──set──▶│  tc-g20/state       │     │  vê checkbox     │
│                  │        │  tc-g20/tasks       │──▶  │  atualizar       │
└──────────────────┘        └─────────────────────┘     │  automaticamente │
                              onValue() listener         └──────────────────┘
```

### 5.2 Projeto Firebase criado

| Campo | Valor |
|---|---|
| **Projeto** | `fiap-postech-devops-grupo20` |
| **Database URL** | `https://fiap-postech-devops-grupo20-default-rtdb.firebaseio.com` |
| **Região** | `us-central1` (free tier) |
| **Plano** | Spark (sem custo) |

### 5.3 Regras de segurança (atualizar em 30 dias)

O banco foi criado em **modo de teste** (expira em 30 dias). Antes do vencimento, acesse:

**Firebase Console → Realtime Database → Regras** e substitua por:

```json
{
  "rules": {
    "tc-g20": {
      ".read": true,
      ".write": true
    }
  }
}
```

Clique **Publicar**. Isso mantém o acesso livre permanentemente (adequado para uso interno do grupo).

### 5.4 Estrutura dos dados no Firebase

```
tc-g20/
├── state/          ← { "t1": { by: "JL", by_name: "John", at: "10/10/2026 18:30" }, ... }
└── tasks/          ← [ { id: "t1", title: "...", owner: "CT", status: "todo" }, ... ]
```

### 5.5 Comportamento do portal

| Situação | Comportamento |
|---|---|
| Online (primeira abertura) | Carrega localStorage → Firebase substitui em ~200ms → badge "🔥 Firebase sincronizado" |
| Outro membro marca tarefa | Checklist atualiza automaticamente sem F5 |
| Offline / Firebase indisponível | Continua funcionando com localStorage local → badge "⚠️ Offline — dados locais" |
| Painel de configuração salvo | Persiste tasks no Firebase + localStorage |

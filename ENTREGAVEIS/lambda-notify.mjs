// ══════════════════════════════════════════════════════════════
// AWS Lambda — Notificação WhatsApp via CallMeBot
// Deploy: AWS Lambda (Node.js 20.x) + API Gateway HTTP API
// Custo: FREE TIER — 1M invocações/mês grátis para sempre
//
// SETUP (5 min):
//   1. Adicione seu número ao CallMeBot:
//      Envie no WhatsApp para +34 644 59 76 07:
//      "I allow callmebot to send me messages"
//      Você receberá um apikey (ex: 1234567)
//
//   2. Configure as variáveis de ambiente na Lambda:
//      WA_PHONE  = 5511999999999   (DDI+DDD+número, sem +)
//      WA_APIKEY = 1234567          (apikey recebida)
//
//   3. No API Gateway, crie uma rota POST /notify
//      com permissão para invocar esta Lambda.
//      Habilite CORS para *.
//
//   4. Cole a URL do endpoint em NOTIFY_URL no HTML.
// ══════════════════════════════════════════════════════════════

export const handler = async (event) => {
  // Parse do body
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { task, member, at } = body || {};
  if (!task || !member) {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'task e member são obrigatórios' }) };
  }

  const phone  = process.env.WA_PHONE;
  const apikey = process.env.WA_APIKEY;

  if (!phone || !apikey) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Variáveis de ambiente não configuradas' }) };
  }

  // Mensagem formatada para WhatsApp
  const msg = `✅ *Tech Challenge Fase 1 – Grupo 20*\n\n` +
              `*${member}* marcou como concluído:\n` +
              `📋 ${task}\n\n` +
              `🕐 ${at}`;

  // Chamada à API CallMeBot (gratuita, sem servidor próprio)
  const url = `https://api.callmebot.com/whatsapp.php` +
              `?phone=${encodeURIComponent(phone)}` +
              `&text=${encodeURIComponent(msg)}` +
              `&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ ok: true, callmebot: text }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: cors(),
      body: JSON.stringify({ error: 'Falha ao chamar CallMeBot', detail: err.message }),
    };
  }
};

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

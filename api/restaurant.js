function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.redirect('/');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let restaurante = null;
  try {
    const r = await fetch(
      `${supabaseUrl}/rest/v1/restaurantes?id=eq.${encodeURIComponent(id)}&select=nombre,descripcion,por_que_ir,foto_url,ciudad,barrio`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const data = await r.json();
    restaurante = data[0] ?? null;
  } catch (_) {}

  const ua = req.headers['user-agent'] ?? '';
  const esBot = /facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|applebot|iframely/i.test(ua);

  if (!esBot) return res.redirect(`/?r=${id}`);

  const nombre = esc(restaurante?.nombre ?? 'Trovi');
  const descripcion = esc(restaurante?.por_que_ir ?? restaurante?.descripcion ?? 'Descubre dónde comer en España.');
  const imagen = esc(restaurante?.foto_url ?? '');
  const ubicacion = [restaurante?.barrio, restaurante?.ciudad].filter(Boolean).join(', ');
  const titulo = esc(ubicacion ? `${restaurante?.nombre} · ${ubicacion}` : (restaurante?.nombre ?? 'Trovi'));
  const host = `https://${req.headers.host}`;
  const url = esc(`${host}/r/${id}`);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${titulo}</title>
  <meta name="description" content="${descripcion}" />
  <meta property="og:site_name" content="Trovi" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${titulo}" />
  <meta property="og:description" content="${descripcion}" />
  ${imagen ? `<meta property="og:image" content="${imagen}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ''}
  <meta name="twitter:card" content="${imagen ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${titulo}" />
  <meta name="twitter:description" content="${descripcion}" />
  ${imagen ? `<meta name="twitter:image" content="${imagen}" />` : ''}
</head>
<body>
  <script>window.location.href = "/?r=${id}";</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).send(html);
}

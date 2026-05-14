function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  const { id } = req.query;

  let nombre = 'Trovi — Descubre dónde comer';
  let descripcion = 'Filtra por ciudad, tipo de cocina y precio. Trovi hace el resto.';
  let imagen = '';

  if (id) {
    try {
      const r = await fetch(
        `${process.env.VITE_SUPABASE_URL}/rest/v1/restaurantes?id=eq.${encodeURIComponent(id)}&select=nombre,emoji,descripcion,ciudad,barrio,foto_url,por_que_ir`,
        {
          headers: {
            apikey: process.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );
      const [restaurante] = await r.json();
      if (restaurante) {
        nombre = `${restaurante.emoji || '🍽️'} ${restaurante.nombre} — Trovi`;
        const zona = restaurante.barrio
          ? `${restaurante.barrio}, ${restaurante.ciudad}`
          : restaurante.ciudad;
        descripcion = [zona, restaurante.por_que_ir || restaurante.descripcion]
          .filter(Boolean)
          .join(' · ');
        imagen = restaurante.foto_url || '';
      }
    } catch (_) {
      // fall through to defaults
    }
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const canonical = `${proto}://${host}/r/${id}`;
  const appUrl = `${proto}://${host}/?r=${id}`;

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(nombre)}</title>
  <meta name="description" content="${esc(descripcion)}" />
  <meta property="og:title" content="${esc(nombre)}" />
  <meta property="og:description" content="${esc(descripcion)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:site_name" content="Trovi" />
  ${imagen ? `<meta property="og:image" content="${esc(imagen)}" />` : ''}
  <meta name="twitter:card" content="${imagen ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${esc(nombre)}" />
  <meta name="twitter:description" content="${esc(descripcion)}" />
  ${imagen ? `<meta name="twitter:image" content="${esc(imagen)}" />` : ''}
  <meta http-equiv="refresh" content="0;url=${esc(appUrl)}" />
</head>
<body>
  <script>window.location.replace(${JSON.stringify(appUrl)});</script>
  <p>Redirigiendo a <a href="${esc(appUrl)}">${esc(nombre)}</a>&hellip;</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}

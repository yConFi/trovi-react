export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, ciudad, barrio, tipo, descripcion, direccion, fotos_urls, user_email } = req.body;

  const filas = [
    ['Restaurante', nombre],
    ['Provincia', ciudad],
    ['Barrio / zona', barrio || '—'],
    ['Tipo de cocina', tipo],
    ['Dirección', direccion || '—'],
    ['Descripción', descripcion || '—'],
    ['Propuesto por', user_email],
  ];

  const tabla = filas.map(([k, v]) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#6b7280;white-space:nowrap;vertical-align:top">${k}</td>
      <td style="padding:8px 12px;color:#111827">${v}</td>
    </tr>`).join('');

  const fotos = fotos_urls?.length
    ? fotos_urls.map(u => `<img src="${u}" style="width:140px;height:100px;object-fit:cover;border-radius:8px;margin:4px" />`).join('')
    : '';

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto">
      <div style="background:#ff5c3a;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:1.3rem">Nueva propuesta en Trovi</h1>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px">
        <table style="width:100%;border-collapse:collapse">
          ${tabla}
        </table>
        ${fotos ? `<div style="margin-top:16px">${fotos}</div>` : ''}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6">
          <a href="https://trovi.vercel.app" style="background:#ff5c3a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem">
            Ver panel de admin →
          </a>
        </div>
      </div>
    </div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Trovi <onboarding@resend.dev>',
      to: 'rickyhidalgobejarano99@gmail.com',
      subject: `Nueva propuesta: ${nombre} (${ciudad})`,
      html,
    }),
  });

  if (!r.ok) return res.status(500).json({ error: 'Email no enviado' });
  res.status(200).json({ ok: true });
}

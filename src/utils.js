export function mapearRestaurante(r) {
  return {
    id: r.id,
    nombre: r.nombre,
    emoji: r.emoji,
    tipo: Array.isArray(r.tipo) ? r.tipo : (r.tipo ?? '').split(',').map(t => t.trim()).filter(Boolean),
    valoracion: r.valoracion,
    numValoraciones: r.num_valoraciones,
    ciudad: r.ciudad,
    barrio: r.barrio,
    direccion: r.direccion,
    horario: r.horario,
    descripcion: r.descripcion,
    porQueIr: r.por_que_ir,
    precioMedio: r.precio_medio,
    precio: r.precio,
    fotoUrl: r.foto_url,
    fotosUrls: Array.isArray(r.fotos_urls) ? r.fotos_urls.filter(Boolean) : [],
    creadoEn: r.created_at,
    destacado: r.destacado ?? false,
  };
}

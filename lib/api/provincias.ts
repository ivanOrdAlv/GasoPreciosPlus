// lib/api/provincias.ts
const BASE_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes'

export interface Provincia {
  IDProvincia: string  // así lo devuelve la API, con errata incluida
  Provincia: string
}

export async function getProvincias(): Promise<Provincia[]> {
  const res = await fetch(`${BASE_URL}/Listados/Provincias/`, {
    next: { revalidate: 86400 } // cachear 24h, las provincias no cambian
  })
  return res.json()
}
// lib/api/municipios.ts
const BASE_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes'


export interface Municipio {
  IDMunicipio: string
  Municipio: string
  IDProvincia: string
}

export async function getMunicipiosByProvincia(idProvincia: string): Promise<Municipio[]> {
  const res = await fetch(`${BASE_URL}/Listados/MunicipiosPorProvincia/${idProvincia}`, {
    next: { revalidate: 86400 } // cachear 24h
  })
  return res.json()
}
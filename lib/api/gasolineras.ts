// lib/api/gasolineras.ts
const BASE_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes'

export async function getGasolinerasByMunicipio(idMunicipio: string) {
  const res = await fetch(`${BASE_URL}/EstacionesTerrestres/FiltroMunicipio/${idMunicipio}`, {
    next: { revalidate: 3600 } // cachear 1h, los precios sí cambian
  })
  const data = await res.json()
  return data.ListaEESSPrecio // la API devuelve el array dentro de esta clave
}
// hooks/useMunicipios.ts
import { useState, useEffect } from 'react'
import { getMunicipiosByProvincia, Municipio } from '@/lib/api/municipios'

export function useMunicipios(idProvincia: string | null) {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!idProvincia) return
    setCargando(true)
    getMunicipiosByProvincia(idProvincia)
      .then(setMunicipios)
      .finally(() => setCargando(false))
  }, [idProvincia]) // se vuelve a llamar cada vez que cambia la provincia

  return { municipios, cargando }
}
// hooks/useProvincias.ts
import { useState, useEffect } from 'react'
import { getProvincias, Provincia } from '@/lib/api/provincias'

export function useProvincias() {
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getProvincias()
      .then(setProvincias)
      .finally(() => setCargando(false))
  }, [])

  return { provincias, cargando }
}
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Fuel, TrendingDown, TrendingUp, MapPin, Loader2 } from "lucide-react"
import municipiosBadajoz from "@/data/municipiosBadajoz.json"
import municipiosCaceres from "@/data/municipiosCaceres.json"

type ProvinciaId = "badajoz" | "caceres"

const MUNICIPIOS_POR_PROVINCIA: Record<ProvinciaId, Record<string, number>> = {
  badajoz: municipiosBadajoz as Record<string, number>,
  caceres: municipiosCaceres as Record<string, number>,
}

interface Gasolinera {
  precio: number
  direccion: string
  nombre: string
  latitud: string
  longitud: string
  horario: string
}

export default function GasoPrecios() {
  const [selectedProvincia, setSelectedProvincia] = useState<ProvinciaId>("badajoz")
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("")
  const [selectedProducto, setSelectedProducto] = useState<string>("1")
  const [gasolineras, setGasolineras] = useState<Gasolinera[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const municipios = useMemo(
    () =>
      Object.entries(MUNICIPIOS_POR_PROVINCIA[selectedProvincia]).sort(([a], [b]) => a.localeCompare(b)),
    [selectedProvincia],
  )

  const onProvinciaChange = (value: ProvinciaId) => {
    setSelectedProvincia(value)
    setSelectedMunicipio("")
  }
  const productos = [
    { id: "1", nombre: "Gasolina 95 E5" },
    { id:"23",nombre:"Gasolina 95 E10" },
    { id: "24", nombre: "Gasolina 95 E25" },
    {id:"25", nombre:"Gasolina 95 E85"},
    {id:"20", nombre:"Gasolina 95 E5 Premium"},
    { id: "3", nombre: "Gasolina 98 E5" },
    {id:"21", nombre: "Gasolina 98 E10"},
    { id: "4", nombre: "Gasóleo A Habitual" },
    { id: "5", nombre: "Gasóleo Premium" },
    { id: "6", nombre: "Gasóleo B" },
    {id: "7", nombre: "Gasóleo C"},
    { id: "16", nombre: "Bioetanol" },
    {id: "8", nombre: "Biodiésel"},
    {id: "17", nombre: "Gases Licuados del Petróleo(GLP)"},
    { id: "18", nombre: "Gas Natural Comprimido(GNC)" },
    {id:"19", nombre:"Gas Natural Licuado(GNL)"},
    {id:"22", nombre:"Hidrógeno"},
    {id:"26", nombre:"AdBlue"},
    {id: "27", nombre:"Diésel Renovable"},
    {id:"28", nombre:"Gasolina renovable"}
  ]

  const buscarGasolineras = async () => {
    if (!selectedMunicipio || !selectedProducto) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipioProducto/${selectedMunicipio}/${selectedProducto}`,
      )

      if (!response.ok) {
        throw new Error("Error al obtener los datos")
      }

      const data = await response.json()
      const listaGasolineras: Gasolinera[] = []

      data.ListaEESSPrecio?.forEach((gasolinera: any) => {
        const precio = gasolinera["PrecioProducto"]
        const direccion = gasolinera["Dirección"]
        const nombre = gasolinera["Rótulo"] || "Sin nombre"
        const latitud = gasolinera["Latitud"]
        const longitud = gasolinera["Longitud (WGS84)"]
        const horario = gasolinera["Horario"]

        if (precio && precio !== "") {
          const precioParsed = Number.parseFloat(precio.replace(/,/g, "."))
          listaGasolineras.push({
            precio: precioParsed,
            direccion,
            nombre,
            latitud,
            longitud,
            horario,
          })
        }
      })

      listaGasolineras.sort((a, b) => a.precio - b.precio)
      setGasolineras(listaGasolineras)
    } catch (err) {
      setError("No se pudieron cargar las gasolineras. Intenta de nuevo.")
      setGasolineras([])
    } finally {
      setLoading(false)
    }
  }

  const getPriceColor = (precio: number, index: number, total: number) => {
    if (index === 0) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
    if (index === total - 1) return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
    if (precio < 1.55) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
    if (precio > 1.80) return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
    return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
  }

  const abrirEnMaps = (latitud: string, longitud: string, nombre: string) => {
    const lat = latitud.replace(",", ".")
    const lng = longitud.replace(",", ".") 
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(mapsUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <img src="/img/gaslylogo.png" alt="Logo de Gas.ly" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gas.ly</h1>
              <p className="text-sm text-muted-foreground">Compara precios de gasolineras en toda <b>Extremadura</b></p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Card */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Provincia, municipio y producto
            </CardTitle>
            <CardDescription>
              Elige provincia, municipio y tipo de carburante (los IDs del ministerio son distintos por municipio y se actualizan cada 30 minutos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Select value={selectedProvincia} onValueChange={(v) => onProvinciaChange(v as ProvinciaId)}>
                <SelectTrigger className="w-full sm:max-w-xs">
                  <SelectValue placeholder="Elige una provincia..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="badajoz">Badajoz</SelectItem>
                  <SelectItem value="caceres">Cáceres</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedMunicipio} onValueChange={setSelectedMunicipio}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Elige un municipio..." />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.map(([nombre, id]) => (
                      <SelectItem key={`${selectedProvincia}-${id}`} value={id.toString()}>
                        {nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedProducto} onValueChange={setSelectedProducto}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Elige un producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        {producto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={buscarGasolineras}
                  disabled={!selectedMunicipio || !selectedProducto || loading}
                  size="lg"
                  className="sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Fuel className="mr-2 h-4 w-4" />
                      Buscar precios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-center text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {gasolineras.length > 0 && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card className="border-2 border-emerald-500/20 bg-emerald-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-emerald-600" />
                    Más barata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                    {gasolineras[0].precio.toFixed(3)}€
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{gasolineras[0].nombre}</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Precio medio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(gasolineras.reduce((acc, g) => acc + g.precio, 0) / gasolineras.length).toFixed(3)}€
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{gasolineras.length} gasolineras encontradas</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-rose-500/20 bg-rose-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-rose-600" />
                    Más cara
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">
                    {gasolineras[gasolineras.length - 1].precio.toFixed(3)}€
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {gasolineras[gasolineras.length - 1].nombre}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* List of Gas Stations */}
            <Card>
              <CardHeader>
                <CardTitle>Todas las gasolineras</CardTitle>
                <CardDescription>Ordenadas de más barata a más cara</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gasolineras.map((gasolinera, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getPriceColor(
                        gasolinera.precio,
                        index,
                        gasolineras.length,
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {index === 0 && <TrendingDown className="h-4 w-4 flex-shrink-0" />}
                            {index === gasolineras.length - 1 && <TrendingUp className="h-4 w-4 flex-shrink-0" />}
                            <h3 className="font-semibold truncate">{gasolinera.nombre}</h3>
                          </div>
                          <p className="text-sm opacity-90">
                            <MapPin className="inline h-3 w-3 mr-1" />
                            {gasolinera.direccion}
                          </p>
                          <p className="text-sm opacity-90">
                            {gasolinera.horario}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            onClick={() => abrirEnMaps(gasolinera.latitud, gasolinera.longitud, gasolinera.nombre)}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Ver en Google Maps
                          </Button>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold">{gasolinera.precio.toFixed(3)}€</div>
                          <div className="text-xs opacity-75">/ litro</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!loading && gasolineras.length === 0 && !error && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Fuel className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Provincia, municipio y producto</h3>
              <p className="text-muted-foreground max-w-md">
                Selecciona provincia (Badajoz o Cáceres), un municipio y el carburante para ver precios en tiempo real.
                
              </p>
              <p className="text-muted-foreground max-w-md">Si no puede visualizar nada, es debido a que no hay ninguna gasolinera en el municipio seleccionado.</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Datos proporcionados por el{" "}
            <a
              href="https://sedeaplicaciones.minetur.gob.es"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Ministerio de Industria, Comercio y Turismo
            </a>
          </p>

          <p>Creado por: <a href="https://github.com/ivanOrdAlv"><b>Iván Ordóñez Álvarez</b></a>, en Mérida, Extremadura</p>
          <p className="mt-2 text-xs">
           Gas.ly(GasoPrecios) &copy; 2026<span className="align-super text-xs ml-1">&reg;</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

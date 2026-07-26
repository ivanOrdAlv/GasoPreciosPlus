"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  MapPin,
  Loader2,
  Star,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTheme } from "next-themes";

interface Gasolinera {
  precio: number;
  direccion: string;
  nombre: string;
  latitud: string;
  longitud: string;
  horario: string;
}

interface Provincia {
  IDPovincia: string; // ojo: typo de la API del Ministerio, sin la 'r'
  Provincia: string;
}

interface Municipio {
  IDMunicipio: string;
  Municipio: string;
}

type CombustibleDisponible = {
  id: string;
  nombre: string;
  precio: number;
};

interface GasolineraMunicipio {
  id: string;
  direccion: string;
  nombre: string;
  latitud: string;
  longitud: string;
  horario: string;
  combustibles: CombustibleDisponible[];
  municipioId?: string;
}

function toTitleCase(str: string): string {
  // Palabras que deben ir en minúscula (preposiciones y artículos)
  const minusculas = new Set([
    "de",
    "del",
    "la",
    "las",
    "los",
    "el",
    "y",
    "e",
    "o",
    "u",
    "a",
    "en",
    "con",
    "por",
    "para",
    "al",
    "las",
    "un",
    "una",
  ]);

  return str
    .toLowerCase()
    .split(" ")
    .map((palabra, index) => {
      // La primera palabra siempre en mayúscula
      if (index === 0) return capitalizar(palabra);
      // El resto, solo si no está en la lista de minúsculas
      return minusculas.has(palabra) ? palabra : capitalizar(palabra);
    })
    .join(" ");
}

function capitalizar(palabra: string): string {
  if (!palabra) return "";
  // Maneja casos como "ÁLAVA" → "Álava" correctamente con tildes
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

function RepostajeCalculator({ precioPorLitro }: { precioPorLitro: number }) {
  const [litros, setLitros] = useState<string>("");
  const [total, setTotal] = useState<number | null>(null);

  const calcular = () => {
    const l = Number.parseFloat(litros.replace(/,/g, "."));
    if (!Number.isFinite(l) || l <= 0) {
      setTotal(null);
      return;
    }
    setTotal(precioPorLitro * l);
  };

  return (
    <div className="mt-4 rounded-lg border bg-background/40 p-3">
      <p className="text-xs text-muted-foreground mb-3">
        Calculadora de repostaje
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="litros">Litros</Label>
          <Input
            id="litros"
            inputMode="decimal"
            placeholder="Ej. 35"
            value={litros}
            onChange={(e) => {
              setLitros(e.target.value);
              setTotal(null);
            }}
          />
        </div>
        <Button
          type="button"
          onClick={calcular}
          className="bg-[#16A34A] text-white hover:bg-[#22C55E] transition-all duration-150 ease-out hover:translate-y hover:shadow-md"
        >
          Calcular
        </Button>
      </div>

      <div className="mt-3 text-sm">
        Total:{" "}
        <span className="font-semibold">
          {total == null ? "—" : `${total.toFixed(2).replace(".", ",")}€`}
        </span>
      </div>
    </div>
  );
}

export default function GasoPrecios() {
  const interactiveHover =
    "transition-all duration-150 ease-out hover:translate-y-[-1px] hover:shadow-md focus-visible:translate-y-[-1px]";
  const [selectedProvincia, setSelectedProvincia] = useState<string>("");
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("");
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<string>("1");
  const [gasolineras, setGasolineras] = useState<Gasolinera[]>([]);
  const [gasolinerasMunicipio, setGasolinerasMunicipio] = useState<
    GasolineraMunicipio[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorblindMode, setColorblindMode] = useState(false);
  const [favoritos, setFavoritos] = useState<GasolineraMunicipio[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { theme, setTheme } = useTheme();
  const [municipioOpen, setMunicipioOpen] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const raw = localStorage.getItem("gp_colorblind");
    const enabled = raw === "1";
    setColorblindMode(enabled);
    document.documentElement.toggleAttribute("data-colorblind", enabled);
  }, []);

  useEffect(() => {
    localStorage.setItem("gp_colorblind", colorblindMode ? "1" : "0");
    document.documentElement.toggleAttribute("data-colorblind", colorblindMode);
  }, [colorblindMode]);

  useEffect(() => {
    setLoadingProvincias(true);
    fetch(
      "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/Provincias/",
    )
      .then((r) => r.json())
      .then((data: Provincia[]) => {
        const sorted = [...data].sort((a, b) =>
          a.Provincia.localeCompare(b.Provincia, "es"),
        );
        setProvincias(sorted);
      })
      .catch(() => {})
      .finally(() => setLoadingProvincias(false));
  }, []);

  // useEffect de carga — llamar a refreshFavoritos tras cargar del localStorage
  useEffect(() => {
    const favs = localStorage.getItem("gp_favoritos");
    if (favs) {
      try {
        const parsed = JSON.parse(favs);
        setFavoritos(parsed);
        refreshFavoritos(parsed); // <-- actualizar precios al arrancar
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    // En el primer render los valores están vacíos — saltamos el guardado
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (selectedProvincia)
      localStorage.setItem("gp_last_provincia", selectedProvincia);
    if (selectedMunicipio) {
      localStorage.setItem("gp_last_municipio", selectedMunicipio);
    } else {
      localStorage.removeItem("gp_last_municipio");
    }
    localStorage.setItem("gp_last_producto", selectedProducto);
  }, [selectedProvincia, selectedMunicipio, selectedProducto]);

  useEffect(() => {
    const provincia = localStorage.getItem("gp_last_provincia");
    const municipio = localStorage.getItem("gp_last_municipio");
    const producto = localStorage.getItem("gp_last_producto");

    if (producto) setSelectedProducto(producto);
    if (!provincia) return;

    // Restaurar provincia y cargar sus municipios
    setSelectedProvincia(provincia);
    setLoadingMunicipios(true);

    fetch(
      `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/MunicipiosPorProvincia/${provincia}`,
    )
      .then((r) => r.json())
      .then((data: Municipio[]) => {
        const sorted = [...data].sort((a, b) =>
          a.Municipio.localeCompare(b.Municipio, "es"),
        );
        setMunicipios(sorted);
        // Restaurar municipio solo después de que estén cargados los municipios
        if (municipio) setSelectedMunicipio(municipio);
      })
      .catch(() => {})
      .finally(() => setLoadingMunicipios(false));
  }, []);

  // useEffect de guardado — persiste favoritos en localStorage
  useEffect(() => {
    localStorage.setItem("gp_favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  const onProvinciaChange = async (idProvincia: string) => {
    setSelectedProvincia(idProvincia);
    setSelectedMunicipio("");
    setMunicipios([]);
    if (!idProvincia) return;

    setLoadingMunicipios(true);
    try {
      const res = await fetch(
        `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/MunicipiosPorProvincia/${idProvincia}`,
      );
      const data: Municipio[] = await res.json();
      const sorted = [...data].sort((a, b) =>
        a.Municipio.localeCompare(b.Municipio, "es"),
      );
      setMunicipios(sorted);
    } catch {
      // ignore
    } finally {
      setLoadingMunicipios(false);
    }
  };

  const productos = [
    { id: "1", nombre: "Gasolina 95 E5" },
    { id: "23", nombre: "Gasolina 95 E10" },
    { id: "24", nombre: "Gasolina 95 E25" },
    { id: "25", nombre: "Gasolina 95 E85" },
    { id: "20", nombre: "Gasolina 95 E5 Premium" },
    { id: "3", nombre: "Gasolina 98 E5" },
    { id: "21", nombre: "Gasolina 98 E10" },
    { id: "4", nombre: "Gasóleo A Habitual" },
    { id: "5", nombre: "Gasóleo Premium" },
    { id: "6", nombre: "Gasóleo B" },
    { id: "7", nombre: "Gasóleo C" },
    { id: "16", nombre: "Bioetanol" },
    { id: "8", nombre: "Biodiésel" },
    { id: "17", nombre: "Gases Licuados del Petróleo(GLP)" },
    { id: "18", nombre: "Gas Natural Comprimido(GNC)" },
    { id: "19", nombre: "Gas Natural Licuado(GNL)" },
    { id: "22", nombre: "Hidrógeno" },
    { id: "26", nombre: "AdBlue" },
    { id: "27", nombre: "Diésel Renovable" },
    { id: "28", nombre: "Gasolina renovable" },
  ];

  const PRODUCTO_A_CAMPO_API: Record<string, string> = {
    "1": "Precio Gasolina 95 E5",
    "23": "Precio Gasolina 95 E10",
    "24": "Precio Gasolina 95 E25",
    "25": "Precio Gasolina 95 E85",
    "20": "Precio Gasolina 95 E5 Premium",
    "3": "Precio Gasolina 98 E5",
    "21": "Precio Gasolina 98 E10",
    "4": "Precio Gasoleo A",
    "5": "Precio Gasoleo Premium",
    "6": "Precio Gasoleo B",
    "7": "Precio Gasoleo C",
    "16": "Precio Bioetanol",
    "8": "Precio Biodiesel",
    "17": "Precio Gases licuados del petróleo",
    "18": "Precio Gas Natural Comprimido",
    "19": "Precio Gas Natural Licuado",
    "22": "Precio Hidrogeno",
    "26": "Precio AdBlue",
    "27": "Precio Diesel Renovable",
    "28": "Precio Gasolina renovable",
  };

  const parsePrecio = (raw: unknown) => {
    if (typeof raw !== "string") return null;
    if (!raw.trim()) return null;
    const n = Number.parseFloat(raw.replace(/,/g, "."));
    return Number.isFinite(n) ? n : null;
  };

  const buscarGasolineras = async () => {
    if (!selectedMunicipio || !selectedProducto) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipioProducto/${selectedMunicipio}/${selectedProducto}`,
      );

      if (!response.ok) {
        throw new Error("Error al obtener los datos");
      }

      const data = await response.json();
      const listaGasolineras: Gasolinera[] = [];

      data.ListaEESSPrecio?.forEach((gasolinera: any) => {
        const precio = gasolinera["PrecioProducto"];
        const direccion = gasolinera["Dirección"];
        const nombre = gasolinera["Rótulo"] || "Sin nombre";
        const latitud = gasolinera["Latitud"];
        const longitud = gasolinera["Longitud (WGS84)"];
        const horario = gasolinera["Horario"];

        if (precio && precio !== "") {
          const precioParsed = Number.parseFloat(precio.replace(/,/g, "."));
          listaGasolineras.push({
            precio: precioParsed,
            direccion,
            nombre,
            latitud,
            longitud,
            horario,
          });
        }
      });

      listaGasolineras.sort((a, b) => a.precio - b.precio);
      setGasolineras(listaGasolineras);
      setGasolinerasMunicipio([]);
    } catch (err) {
      setError("No se pudieron cargar las gasolineras. Intenta de nuevo.");
      setGasolineras([]);
      setGasolinerasMunicipio([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarGasolinerasMunicipio = async () => {
    if (!selectedMunicipio) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/${selectedMunicipio}`,
      );

      if (!response.ok) {
        throw new Error("Error al obtener los datos");
      }

      const data = await response.json();
      // Asumir que la API tiene un campo Fecha, sino usar ahora
      const fechaStr =
        data.Fecha || data.UltimaActualizacion || data["Última Actualización"];
      setLastUpdate(fechaStr ? new Date(fechaStr) : new Date());

      const lista: GasolineraMunicipio[] = [];

      data.ListaEESSPrecio?.forEach((eess: any) => {
        const idRaw =
          eess["IDEESS"] ??
          eess["IDEEESS"] ??
          eess["IdEESS"] ??
          eess["ID"] ??
          eess["Id"];
        const id = idRaw != null && `${idRaw}`.trim() ? `${idRaw}`.trim() : "";
        const direccion = eess["Dirección"];
        const nombre = eess["Rótulo"] || "Sin nombre";
        const latitud = eess["Latitud"];
        const longitud = eess["Longitud (WGS84)"];
        const horario = eess["Horario"];

        const combustibles: CombustibleDisponible[] = productos
          .map((p) => {
            const campo = PRODUCTO_A_CAMPO_API[p.id];
            const precio = campo ? parsePrecio(eess[campo]) : null;
            if (precio == null) return null;
            return { id: p.id, nombre: p.nombre, precio };
          })
          .filter(Boolean) as CombustibleDisponible[];

        const key = id || `${nombre}__${direccion}__${latitud}__${longitud}`;
        if (combustibles.length === 0) return;

        lista.push({
          id: key,
          direccion,
          nombre,
          latitud,
          longitud,
          horario,
          combustibles,
        });
      });

      lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setGasolinerasMunicipio(lista);
      setGasolineras([]);
    } catch (err) {
      setError("No se pudieron cargar las gasolineras. Intenta de nuevo.");
      setGasolineras([]);
      setGasolinerasMunicipio([]);
    } finally {
      setLoading(false);
    }
  };

  const gasolinerasMunicipioOrdenadas = useMemo(() => {
    const enriched = gasolinerasMunicipio
      .map((g) => {
        const key = g.id;
        const selected =
          g.combustibles.find((c) => c.id === selectedProducto) ?? null;
        return selected ? { g, key, selected } : null;
      })
      .filter(Boolean) as {
      g: GasolineraMunicipio;
      key: string;
      selected: CombustibleDisponible;
    }[];

    enriched.sort((a, b) => a.selected.precio - b.selected.precio);
    return enriched;
  }, [gasolinerasMunicipio, selectedProducto]);

  const getPriceColor = (precio: number, index: number, total: number) => {
    if (colorblindMode) {
      if (index === 0)
        return "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300";
      if (index === total - 1)
        return "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300";
      if (precio < 1.55)
        return "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300";
      if (precio > 1.8)
        return "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300";
      return "bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300";
    }
    if (index === 0)
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
    if (index === total - 1)
      return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300";
    if (precio < 1.55)
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
    if (precio > 1.8)
      return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300";
    return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300";
  };

  const abrirEnMaps = (latitud: string, longitud: string, nombre: string) => {
    const lat = latitud.replace(",", ".");
    const lng = longitud.replace(",", ".");
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(mapsUrl, "_blank");
  };

  const compartirWhatsApp = (
    nombre: string,
    direccion: string,
    precio: number,
    combustible: string,
    municipio: string,
  ) => {
    const municipioNombre =
      municipios.find((m) => m.IDMunicipio === municipio)?.Municipio ?? "";
    const texto = `⛽ *${nombre}*\n📍 ${direccion} (${toTitleCase(municipioNombre)})\n💰 ${combustible}: *${precio.toFixed(3)}€/L*\n\n🔍 Compara precios en: https://gaso-precios-plus.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const [loadingFavoritos, setLoadingFavoritos] = useState(false);

  // toggleFavorito — guardar el municipioId al añadir favorita
  const toggleFavorito = (g: GasolineraMunicipio) => {
    setFavoritos((prev) => {
      const isFav = prev.some((f) => f.id === g.id);
      if (isFav) {
        return prev.filter((f) => f.id !== g.id);
      } else {
        return [...prev, { ...g, municipioId: selectedMunicipio }]; // <-- añadir municipioId
      }
    });
  };

  const refreshFavoritos = async (favs: GasolineraMunicipio[]) => {
    const favsConMunicipio = favs.filter((f) => f.municipioId);
    if (favsConMunicipio.length === 0) return;

    setLoadingFavoritos(true);

    // Agrupar favoritas por municipioId para no llamar varias veces al mismo municipio
    const municipioMap = new Map<string, GasolineraMunicipio[]>();
    for (const fav of favsConMunicipio) {
      const lista = municipioMap.get(fav.municipioId!) ?? [];
      lista.push(fav);
      municipioMap.set(fav.municipioId!, lista);
    }

    const favoritasActualizadas = [...favs];

    for (const [municipioId] of municipioMap) {
      try {
        const res = await fetch(
          `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/${municipioId}`,
        );
        const data = await res.json();

        for (const eess of data.ListaEESSPrecio ?? []) {
          const idRaw =
            eess["IDEESS"] ??
            eess["IDEEESS"] ??
            eess["IdEESS"] ??
            eess["ID"] ??
            eess["Id"];
          const idActual =
            idRaw != null && `${idRaw}`.trim() ? `${idRaw}`.trim() : "";

          const idx = favoritasActualizadas.findIndex((f) => f.id === idActual);
          if (idx === -1) continue;

          // Reconstruir combustibles con precios frescos
          const combustiblesActualizados: CombustibleDisponible[] = productos
            .map((p) => {
              const campo = PRODUCTO_A_CAMPO_API[p.id];
              const precio = campo ? parsePrecio(eess[campo]) : null;
              if (precio == null) return null;
              return { id: p.id, nombre: p.nombre, precio };
            })
            .filter(Boolean) as CombustibleDisponible[];

          favoritasActualizadas[idx] = {
            ...favoritasActualizadas[idx],
            combustibles: combustiblesActualizados,
          };
        }
      } catch {
        // Si falla, se quedan los precios anteriores
      }
    }

    setFavoritos(favoritasActualizadas);
    setLoadingFavoritos(false);
  };

  const isGasolineraAbierta = (horario: string): boolean => {
    if (!horario || horario.trim() === "") return false;

    const now = new Date();
    const day = now.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    // Mapear días: L=lunes(1), M=martes(2), X=miércoles(3), J=jueves(4), V=viernes(5), S=sábado(6), D=domingo(0)
    const dayMap: Record<string, number> = {
      L: 1,
      M: 2,
      X: 3,
      J: 4,
      V: 5,
      S: 6,
      D: 0,
    };

    const parseTime = (timeStr: string): number => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + (m || 0);
    };

    const parts = horario.split(";").map((p) => p.trim());

    for (const part of parts) {
      const colonIndex = part.indexOf(":");
      if (colonIndex === -1) continue;

      const daysPart = part.substring(0, colonIndex).trim();
      const timePart = part.substring(colonIndex + 1).trim();

      if (timePart === "24H") {
        // Siempre abierto para estos días
        if (daysPart === "L-D") return true;
        // Parsear días específicos
        const dayRanges = daysPart.split("-");
        if (dayRanges.length === 2) {
          const startDay = dayMap[dayRanges[0]];
          const endDay = dayMap[dayRanges[1]];
          if (startDay !== undefined && endDay !== undefined) {
            if (startDay <= endDay) {
              if (day >= startDay && day <= endDay) return true;
            } else {
              // Cruza domingo
              if (day >= startDay || day <= endDay) return true;
            }
          }
        } else if (dayRanges.length === 1) {
          const singleDay = dayMap[daysPart];
          if (singleDay !== undefined && day === singleDay) return true;
        }
      } else {
        // Parsear rango de tiempo
        const timeRange = timePart.split("-");
        if (timeRange.length === 2) {
          const startTime = parseTime(timeRange[0]);
          const endTime = parseTime(timeRange[1]);

          // Verificar si el día actual está en el rango de días
          const dayRanges = daysPart.split("-");
          let dayMatches = false;
          if (dayRanges.length === 2) {
            const startDay = dayMap[dayRanges[0]];
            const endDay = dayMap[dayRanges[1]];
            if (startDay !== undefined && endDay !== undefined) {
              if (startDay <= endDay) {
                dayMatches = day >= startDay && day <= endDay;
              } else {
                dayMatches = day >= startDay || day <= endDay;
              }
            }
          } else if (dayRanges.length === 1) {
            const singleDay = dayMap[daysPart];
            dayMatches = singleDay !== undefined && day === singleDay;
          }

          if (dayMatches) {
            if (startTime <= endTime) {
              if (currentTime >= startTime && currentTime <= endTime)
                return true;
            } else {
              // Cruza medianoche
              if (currentTime >= startTime || currentTime <= endTime)
                return true;
            }
          }
        }
      }
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-[#16A34A] text-white shadow-sm transition-colors duration-150 hover:bg-[#22C55E]">
                <img
                  src="https://raw.githubusercontent.com/ivanOrdAlv/GasoPreciosPlus/refs/heads/main/img/gaslylogo.png"
                  alt="Logo de Gas.ly"
                  width={115}
                  height={115}
                  style={{
                    maxWidth: "115px",
                    maxHeight: "115px",
                    marginTop: "20px",
                  }}
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">Gas.ly</h1>
                <p className="text-sm text-muted-foreground">
                  Compara precios de gasolineras en toda <b>España</b>
                </p>
              </div>
            </div>

            {/*
              =========================
              SELECTOR DE TEMA (fácil de comentar)
              Claro / Oscuro / Daltónicos
              =========================
            */}
            <div className="w-44">
              <Select
                value={
                  colorblindMode
                    ? "colorblind"
                    : theme === "dark"
                      ? "dark"
                      : "light"
                }
                onValueChange={(v) => {
                  if (v === "dark") {
                    setColorblindMode(false);
                    setTheme("dark");
                    return;
                  }
                  if (v === "colorblind") {
                    setTheme("light");
                    setColorblindMode(true);
                    return;
                  }
                  setColorblindMode(false);
                  setTheme("light");
                }}
              >
                <SelectTrigger className={`w-full ${interactiveHover}`}>
                  <SelectValue placeholder="Modo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="colorblind">Daltónicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/*lastUpdate && (
          <p className="text-center text-sm text-muted-foreground mb-4">
            Datos actualizados hace {Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60))} horas
          </p>
        )*/}
        {/*
          =========================
          LEGACY (comentado a propósito)
          Búsqueda por: provincia + municipio + producto.
          Motivo: desactivar este flujo para evitar interferencias con el modo "solo municipio".
          =========================
        */}
        {/*
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
        */}

        {/* Extra: All fuels per station (municipio) */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Provincia, municipio y producto
            </CardTitle>
            <CardDescription>
              Elige provincia, municipio y carburante. En cada gasolinera verás
              los productos disponibles y se ordena por el precio del producto
              seleccionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Select
                value={selectedProvincia}
                onValueChange={onProvinciaChange}
                disabled={loadingProvincias}
              >
                <SelectTrigger
                  className={`w-full sm:max-w-xs ${interactiveHover}`}
                >
                  <SelectValue
                    placeholder={
                      loadingProvincias
                        ? "Cargando provincias..."
                        : "Elige una provincia..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {provincias.map((p) => (
                    <SelectItem key={p.IDPovincia} value={p.IDPovincia}>
                      {toTitleCase(p.Provincia)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover open={municipioOpen} onOpenChange={setMunicipioOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={municipioOpen}
                    disabled={!selectedProvincia || loadingMunicipios}
                    className={`w-full sm:max-w-lg justify-between font-normal ${interactiveHover}`}
                  >
                    <span className="truncate">
                      {loadingMunicipios
                        ? "Cargando municipios..."
                        : selectedMunicipio
                          ? toTitleCase(
                              municipios.find(
                                (m) => m.IDMunicipio === selectedMunicipio,
                              )?.Municipio ?? "",
                            )
                          : "Elige un municipio..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full sm:max-w-lg p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Buscar municipio..." />
                    <CommandList>
                      <CommandEmpty>
                        No se encontró ningún municipio.
                      </CommandEmpty>
                      <CommandGroup>
                        {municipios.map((m) => (
                          <CommandItem
                            key={m.IDMunicipio}
                            value={m.Municipio}
                            onSelect={() => {
                              {
                                toTitleCase(m.Municipio);
                              }
                              setSelectedMunicipio(m.IDMunicipio);
                              setMunicipioOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedMunicipio === m.IDMunicipio
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {m.Municipio}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Select
                value={selectedProducto}
                onValueChange={setSelectedProducto}
              >
                <SelectTrigger
                  className={`w-full sm:max-w-lg ${interactiveHover}`}
                >
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

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={buscarGasolinerasMunicipio}
                  disabled={!selectedMunicipio || !selectedProducto || loading}
                  size="lg"
                  className={`sm:w-auto bg-[#16A34A] text-white hover:bg-[#22C55E] ${interactiveHover}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
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
              <p className="text-center text-destructive font-medium">
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/*
          =========================
          LEGACY (comentado a propósito)
          Resultados del modo "municipio + producto".
          =========================
        */}
        {/*
        {gasolineras.length > 0 && (
          <>
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
                          <p className="text-sm opacity-90">{gasolinera.horario}</p>
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
        */}

        {gasolinerasMunicipioOrdenadas.length > 0 && (
          <>
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
                    {gasolinerasMunicipioOrdenadas[0].selected.precio.toFixed(
                      3,
                    )}
                    €
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {gasolinerasMunicipioOrdenadas[0].g.nombre} ·{" "}
                    {gasolinerasMunicipioOrdenadas[0].selected.nombre}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Precio medio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(
                      gasolinerasMunicipioOrdenadas.reduce(
                        (acc, x) => acc + x.selected.precio,
                        0,
                      ) / gasolinerasMunicipioOrdenadas.length
                    ).toFixed(3)}
                    €
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {gasolinerasMunicipioOrdenadas.length} gasolineras
                    encontradas
                  </p>
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
                    {gasolinerasMunicipioOrdenadas[
                      gasolinerasMunicipioOrdenadas.length - 1
                    ].selected.precio.toFixed(3)}
                    €
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {
                      gasolinerasMunicipioOrdenadas[
                        gasolinerasMunicipioOrdenadas.length - 1
                      ].g.nombre
                    }{" "}
                    ·{" "}
                    {
                      gasolinerasMunicipioOrdenadas[
                        gasolinerasMunicipioOrdenadas.length - 1
                      ].selected.nombre
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gasolineras del municipio</CardTitle>
                <CardDescription>
                  Ordenadas de más barata a más cara (según el combustible
                  seleccionado)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gasolinerasMunicipioOrdenadas.map(
                    ({ g, key, selected }, index) => (
                      <div
                        key={`${key}__${index}`}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getPriceColor(
                          selected.precio,
                          index,
                          gasolinerasMunicipioOrdenadas.length,
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {index === 0 && (
                                <TrendingDown className="h-4 w-4 shrink-0" />
                              )}
                              {index ===
                                gasolinerasMunicipioOrdenadas.length - 1 && (
                                <TrendingUp className="h-4 w-4 shrink-0" />
                              )}
                              <h3 className="font-semibold truncate">
                                {g.nombre}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${isGasolineraAbierta(g.horario) ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                              >
                                {isGasolineraAbierta(g.horario)
                                  ? "Abierto"
                                  : "Cerrado"}
                              </span>
                            </div>
                            <p className="text-sm opacity-90">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              {g.direccion}
                            </p>
                            <p className="text-sm opacity-90">{g.horario}</p>

                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2">
                                Combustibles disponibles
                              </p>
                              <div className="space-y-1">
                                {g.combustibles.map((c) => (
                                  <div
                                    key={`${key}__${c.id}`}
                                    className={`flex items-center justify-between text-xs ${
                                      c.id === selected.id
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <span className="truncate pr-3">
                                      {c.nombre}
                                    </span>
                                    <span>{c.precio.toFixed(3)}€</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/*
                            =========================
                            CALCULADORA (fácil de comentar)
                            Descomenta/comenta este bloque para activar/desactivar la calculadora por gasolinera.
                            =========================
                          */}
                            <RepostajeCalculator
                              precioPorLitro={selected.precio}
                            />

                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button
                                variant={
                                  favoritos.some((f) => f.id === g.id)
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleFavorito(g)}
                              >
                                <Star
                                  className={`h-3 w-3 mr-1 ${favoritos.some((f) => f.id === g.id) ? "fill-current" : ""}`}
                                />
                                {favoritos.some((f) => f.id === g.id)
                                  ? "Quitar favorito"
                                  : "Añadir favorito"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  abrirEnMaps(g.latitud, g.longitud, g.nombre)
                                }
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                Ver en Google Maps
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  compartirWhatsApp(
                                    g.nombre,
                                    g.direccion,
                                    selected.precio,
                                    selected.nombre,
                                    selectedMunicipio,
                                  )
                                }
                              >
                                <svg
                                  className="h-3 w-3 mr-1"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.103 1.508 5.83L.057 23.077a.75.75 0 0 0 .866.866l5.247-1.451A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.52-5.163-1.426l-.371-.22-3.844 1.063 1.029-3.948-.242-.393A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                </svg>
                                Compartir
                              </Button>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-bold">
                              {selected.precio.toFixed(3)}€
                            </div>
                            <div className="text-xs opacity-75">
                              {selected.nombre}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {/*
        {!loading && gasolinerasMunicipioOrdenadas.length === 0 && !error && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Fuel className="h-16 w-16 text-muted-foreground/50 mb-4" />

              {gasolinerasMunicipio.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Busca precios por municipio</h3>
                  <p className="text-muted-foreground max-w-md">
                    Elige provincia, municipio y producto para ver las gasolineras disponibles en tiempo real.
                  </p>
                </>
              ) : (
                <>
                  {(() => {
                    const municipioNombre =
                      Object.entries(MUNICIPIOS_POR_PROVINCIA[selectedProvincia]).find(([, id]) => id.toString() === selectedMunicipio)?.[0] ??
                      ""
                    const productoNombre = productos.find((p) => p.id === selectedProducto)?.nombre ?? ""
                    return (
                      <>
                        <h3 className="text-lg font-semibold mb-2">Sin gasolineras con ese combustible</h3>
                        <p className="text-muted-foreground max-w-md">
                          En <b>{municipioNombre || "el municipio seleccionado"}</b> no encontramos gasolineras con{" "}
                          <b>{productoNombre}</b>.
                        </p>
                        <p className="text-muted-foreground max-w-md mt-2">
                          Prueba con otro producto para ver precios.
                        </p>
                      </>
                    )
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        )}
        */}

        {/* Favoritas cuando no hay búsqueda */}
        {!loading &&
          gasolinerasMunicipioOrdenadas.length === 0 &&
          !error &&
          favoritos.length > 0 &&
          gasolinerasMunicipio.length === 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Tus gasolineras favoritas
                </CardTitle>
                <CardDescription>
                  {loadingFavoritos
                    ? "Actualizando precios..."
                    : "Aquí tienes tus gasolineras guardadas como favoritas."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favoritos.map((g, index) => {
                    const selected =
                      g.combustibles.find((c) => c.id === selectedProducto) ??
                      g.combustibles[0];
                    return (
                      <div
                        key={`${g.id}__fav__${index}`}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">
                                {g.nombre}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${isGasolineraAbierta(g.horario) ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                              >
                                {isGasolineraAbierta(g.horario)
                                  ? "Abierto"
                                  : "Cerrado"}
                              </span>
                            </div>
                            <p className="text-sm opacity-90">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              {g.direccion}
                            </p>
                            <p className="text-sm opacity-90">{g.horario}</p>

                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2">
                                Combustibles disponibles
                              </p>
                              <div className="space-y-1">
                                {g.combustibles.map((c) => (
                                  <div
                                    key={`${g.id}__${c.id}__fav`}
                                    className={`flex items-center justify-between text-xs ${
                                      c.id === selected.id
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <span className="truncate pr-3">
                                      {c.nombre}
                                    </span>
                                    <span>{c.precio.toFixed(3)}€</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <RepostajeCalculator
                              precioPorLitro={selected.precio}
                            />

                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleFavorito(g)}
                              >
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Quitar favorito
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  abrirEnMaps(g.latitud, g.longitud, g.nombre)
                                }
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                Ver en Google Maps
                              </Button>
                               <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  compartirWhatsApp(
                                    g.nombre,
                                    g.direccion,
                                    selected.precio,
                                    selected.nombre,
                                    selectedMunicipio,
                                  )
                                }
                              >
                                <svg
                                  className="h-3 w-3 mr-1"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.103 1.508 5.83L.057 23.077a.75.75 0 0 0 .866.866l5.247-1.451A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.52-5.163-1.426l-.371-.22-3.844 1.063 1.029-3.948-.242-.393A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                </svg>
                                Compartir
                              </Button>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-bold">
                              {selected.precio.toFixed(3)}€
                            </div>
                            <div className="text-xs opacity-75">
                              {selected.nombre}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Empty State cuando no hay favoritas ni búsqueda */}
        {!loading &&
          gasolinerasMunicipioOrdenadas.length === 0 &&
          !error &&
          favoritos.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Fuel className="h-16 w-16 text-muted-foreground/50 mb-4" />

                {gasolinerasMunicipio.length === 0 ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">
                      Busca precios por municipio
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Elige provincia, municipio y producto para ver las
                      gasolineras disponibles en tiempo real.
                    </p>
                  </>
                ) : (
                  <>
                    {(() => {
                      const municipioNombre =
                        municipios.find(
                          (m) => m.IDMunicipio === selectedMunicipio,
                        )?.Municipio ?? "";
                      const productoNombre =
                        productos.find((p) => p.id === selectedProducto)
                          ?.nombre ?? "";
                      return (
                        <>
                          <h3 className="text-lg font-semibold mb-2">
                            Sin gasolineras con ese combustible
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            En{" "}
                            <b>
                              {municipioNombre || "el municipio seleccionado"}
                            </b>{" "}
                            no encontramos gasolineras con{" "}
                            <b>{productoNombre}</b>.
                          </p>
                          <p className="text-muted-foreground max-w-md mt-2">
                            Prueba con otro producto para ver precios.
                          </p>
                        </>
                      );
                    })()}
                  </>
                )}
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

          <p>
            Creado por:{" "}
            <a href="https://github.com/ivanOrdAlv">
              <b>Iván Ordóñez Álvarez</b>
            </a>
            , en Mérida, Extremadura
          </p>
          <p className="mt-2 text-xs">
            Gas.ly(GasoPrecios) &copy; 2026
            <span className="align-super text-xs ml-1">&reg;</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

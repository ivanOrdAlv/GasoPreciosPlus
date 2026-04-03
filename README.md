# ⛽ Gas.ly — Precios de Gasolineras en Extremadura

> Consulta y compara en tiempo real los precios de combustible de todas las gasolineras de los municipios de Extremadura.

[![Vercel](https://img.shields.io/badge/Desplegado%20en-Vercel-black?logo=vercel)](https://gaso-precios-plus.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)

---

## 📸 Vista previa

<!-- Sustituye esta línea por una captura de pantalla de la app -->
![Vista previa de Gas.ly](https://github.com/ivanOrdAlv/GasoPreciosPlus/blob/main/img/gaslylogo.png)

---

## ✨ Funcionalidades

### 🔍 Búsqueda y filtrado
- Filtra gasolineras por **provincia** (Cáceres / Badajoz)
- Filtra por **municipio** dentro de la provincia seleccionada
- Selecciona el **tipo de combustible**: Gasolina 95, Gasolina 98, Diésel, Diésel+, GLP, etc.

### 🏆 Comparativa de precios
- Muestra destacadas la **gasolinera más barata** y la **más cara** del municipio seleccionado
- Listado completo de todas las gasolineras del municipio ordenadas de **menor a mayor precio**
- Indicador visual de precio por colores:
  
  - 🟢 **Verde** — precio más económico
  - 🟡 **Amarillo** — precio intermedio
  - 🔴 **Rojo** — precio más elevado

### ⛽ Detalle por gasolinera
- Visualiza los **precios de todos los combustibles** disponibles en cada gasolinera
- Pulsa en el botón de **ubicación en Google Maps** para llegar directamente a la gasolinera
- **Calculadora de repostaje**: Introduce los litros que quieres echar y calcula al instante cuánto te costará repostar.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework principal (App Router) |
| [Turbopack](https://turbo.build/pack) | Bundler de desarrollo y producción |
| [React](https://react.dev) | Interfaz de usuario |
| [Tailwind CSS](https://tailwindcss.com) | Estilos |
| [Node.js 24](https://nodejs.org) | Entorno de ejecución |
| [Vercel](https://vercel.com) | Despliegue y hosting |
| [API GEOPORTAL](https://geoportalgasolineras.es) | Datos oficiales del Ministerio de Industria |

---

## 🚀 Instalación y uso local

### Requisitos previos
- Node.js 18 o superior
- npm o yarn

### Pasos
- Abre tu navegador preferido.
- Busca https://gaso-precios-plus.vercel.app/
- Y ¡Listo!

## 📡 Fuente de datos

Los precios se obtienen de la **API pública del Geoportal de Gasolineras** del Ministerio para la Transición Ecológica y el Reto Demográfico del Gobierno de España. Los datos se actualizan cada cierto tiempo por parte del Ministerio.

---

## 🌐 Demo en producción

La aplicación está desplegada y disponible en:

👉 **[gaso-precios-plus.vercel.app](https://gaso-precios-plus.vercel.app)**

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT** y está realizada íntegramente por mí (Iván Ordóñez Álvarez). Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">Hecho con ❤️ para los conductores de Extremadura</p>


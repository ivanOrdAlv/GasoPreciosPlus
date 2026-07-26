# ⛽ Gas.ly — Precios de Gasolineras en España

> Consulta y compara en tiempo real los precios de combustible de todas las gasolineras de cualquier municipio de España.

[![Vercel](https://img.shields.io/badge/Desplegado%20en-Vercel-black?logo=vercel)](https://gaso-precios-plus.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)

---

## 📸 Vista previa

![Vista previa de Gas.ly](https://github.com/ivanOrdAlv/GasoPreciosPlus/blob/main/img/gaslylogo.png)

---

## ✨ Funcionalidades

### 🔍 Búsqueda y filtrado
- Filtra gasolineras por **provincia** — todas las provincias de España disponibles
- **Buscador de municipio** con filtrado en tiempo real: escribe las primeras letras y encuentra tu municipio al instante
- Selecciona el **tipo de combustible**: Gasolina 95 E5, Gasolina 98, Gasóleo A, Gasóleo Premium, GLP, GNC, GNL, Hidrógeno, AdBlue y más
- Esta aplicación, es capaz de **guardar tu última búsqueda**, así, nada más entrar en la aplicación, sólo tendrás que darle al botón de **Buscar precios**.
- También incluye un botón para poder buscar **gasolineras cercanas** en torno a **10 km** gracias a la geolocalización.

### 🏆 Comparativa de precios
- Muestra destacadas la **gasolinera más barata** y la **más cara** del municipio para el combustible seleccionado
- **Precio medio** del municipio con el número de gasolineras encontradas
- Listado completo de todas las gasolineras ordenadas de **menor a mayor precio**
- Indicador visual de precio por colores:
  - 🟢 **Verde** — precio más económico
  - 🟡 **Amarillo** — precio intermedio
  - 🔴 **Rojo** — precio más elevado

### ⛽ Detalle por gasolinera
- **Horario** con indicador en tiempo real de si la gasolinera está **abierta o cerrada** ahora mismo
- Visualiza los **precios de todos los combustibles** disponibles en cada gasolinera
- Botón de **ubicación en Google Maps** para llegar directamente
- Botón de **compartir por WhatsApp** para enviar las mejores gasolineras, o tus gasolineras preferidas, a tus contactos.
- **Calculadora de repostaje**: introduce los litros que vas a echar y calcula al instante cuánto te va a costar

### ⭐ Gasolineras favoritas
- Guarda tus gasolineras habituales como **favoritas** con un solo clic
- Tus favoritas se muestran directamente al abrir la app, sin necesidad de buscar
- Los **precios se actualizan automáticamente** cada vez que abres la app, para que nunca veas datos desfasados

### 🎨 Personalización
- Modo **claro**, **oscuro** y modo **daltónico** para una mejor accesibilidad

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework principal (App Router) |
| [Turbopack](https://turbo.build/pack) | Bundler de desarrollo y producción |
| [React](https://react.dev) | Interfaz de usuario |
| [Tailwind CSS](https://tailwindcss.com) | Estilos |
| [shadcn/ui](https://ui.shadcn.com) | Componentes de interfaz |
| [Node.js 24](https://nodejs.org) | Entorno de ejecución |
| [Vercel](https://vercel.com) | Despliegue y hosting |
| [API GEOPORTAL](https://geoportalgasolineras.es) | Datos oficiales del Ministerio de Industria |

---

## 🌐 Demo en producción

La aplicación está desplegada y disponible en:

👉 **[gaso-precios-plus.vercel.app](https://gaso-precios-plus.vercel.app)**

---

## 🚀 Uso

No necesitas instalar nada. Abre tu navegador y accede directamente a:

**[https://gaso-precios-plus.vercel.app](https://gaso-precios-plus.vercel.app)**

Si quieres ejecutarlo en local:

```bash
# 1. Clona el repositorio
git clone https://github.com/ivanOrdAlv/GasoPreciosPlus.git
cd GasoPreciosPlus

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con Turbopack
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

---

## 📡 Fuente de datos

Los precios se obtienen de la **API pública del Geoportal de Gasolineras** del Ministerio para la Transición Ecológica y el Reto Demográfico del Gobierno de España. Los datos se actualizan periódicamente por parte del Ministerio.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT** y está realizado íntegramente por mí (Iván Ordóñez Álvarez). Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">Hecho con ❤️ por <a href="https://github.com/ivanOrdAlv">Iván Ordóñez Álvarez</a> — Mérida, Extremadura</p>

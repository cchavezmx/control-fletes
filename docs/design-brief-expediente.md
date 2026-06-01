## Brief de Diseño UI/UX — Expediente por Empresa + Creación de Documentos

### Persona Usuario
**Coordinador de Logística / Admin de Flotilla** — Usuario frecuente, necesita velocidad. Crea 10-30 documentos diarios. Necesita ver estado de todo rápido sin perder contexto.

---

### Pantalla Principal: Expediente por Empresa (`/[empresaId]`)

**Objetivo:** Dashboard operativo de una empresa-cliente. Ver, filtrar y operar todos los documentos logísticos (Traslados, Fletes, Rentas).

#### Jerarquía Visual Sugerida
1. **Header fijo** — Nombre empresa + acción primaria ("Nuevo documento")
2. **Barra de estado / KPIs** (no existe hoy, oportunidad) — Count de activos, cancelados, pendientes
3. **Filtros rápidos** — Por tipo, por fecha, por vehículo
4. **Tabla principal** — Documentos con columnas clave: Folio, Tipo, Asunto, Vehículo, Fecha, Estatus
5. **Barra de acciones contextual** — Aparece al seleccionar 1 fila (sticky bottom o inline toolbar)

#### Estados de la Tabla
- **Vacio** — Primera vez empresa. Placeholder con CTA "Crear primer documento"
- **Con datos** — Lista scrolleable, sorting, búsqueda global
- **Row seleccionada** — Highlight visual, toolbar acciones flotante o sticky
- **Loading** — Skeleton rows (ya tenemos, mejorar con shadcn)
- **Error** — Sin conexión a API

#### Toolbar Contextual (Row Seleccionada)
Cuando usuario selecciona 1 documento, aparecen acciones:
| Acción | Icono sugerido | Destino |
|---|---|---|
| Ver PDF | `FileText` | Modal/Sheet con iframe PDF |
| Enviar | `Share` | Pre-compose Gmail con link público |
| Editar | `Pencil` | `/update/[id]` |
| Cancelar | `Ban` | Modal motivo cancelación |

**Pain point hoy:** Toolbar usa `Collapse` MUI que empuja contenido hacia abajo. Mejor: **floating toolbar sticky bottom** o **dropdown inline en la fila** para no perder contexto de scroll.

---

### Pantalla Secundaria: Crear Nuevo Documento (`/documento/nuevo`)

**Objetivo:** Wizard de 5 pasos que capture toda la operación logística sin errores de validación. Usuario necesita sentir progreso claro.

#### Flujo de Pasos (Stepper)
| Paso | Contenido | Validación |
|---|---|---|
| 1. Tipo y Vehículo | Select tipo (Traslado/Flete/Renta), selector vehículo, selector plan, folio consecutivo auto | Tipo + vehículo obligatorios |
| 2. Cliente y Fechas | Cliente destino, asunto, fecha solicitud, fecha entrega/dispersión | Cliente + asunto + fechas obligatorios |
| 3. Detalles Operativos | Conductor, ruta, recorrido KM, KM salida, link Google Maps | Conductor + ruta obligatorios |
| 4. Facturación | Subtotal, casetas (toggle + campos condicionales), combustible slider, tarjeta, carga, folios | Subtotal obligatorio. Slider combustible 0-100% |
| 5. Resumen | Grid resumen de todo. CTA Guardar | Solo lectura, confirmación final |

#### Componentes UI Necesarios
- **Stepper horizontal** con labels (shadcn no tiene nativo, custom con flex + circles)
- **Selects con search** (vehículos, clientes, planes — listas largas)
- **DatePicker** con locale español
- **Toggle switch** para "Incluir casetas"
- **Slider** 0-100 para nivel combustible
- **Input currency** para montos (subtotal, casetas, tarjeta)
- **Resumen grid** 2-columnas label/valor antes de guardar

#### Pain Points Actuales a Resolver
1. **Validación tras bambalinas** — Errores zod aparecen solo al avanzar paso. Mejor: inline validation inmediata + resumen errores en stepper
2. **Plan de vehículo** — Select plan aparece solo después de elegir vehículo. Carga async con spinner. Mejor: skeleton placeholder mientras carga, mejorar feedback
3. **Fechas MUI X DatePicker** — Calendario MUI difícil en mobile. Migrar a `shadcn Calendar + Popover`
4. **Renta/Flete desglose** — `RentaConceptsBreakdown` inyecta campos extra dinámicos. UI confusa hoy. Mejor: acordeón por concepto (operador, viáticos, gasolina, renta)
5. **Resumen paso 5** — Grid denso. Mejor: cards agrupados por categoría (Operativo, Facturación, Vehículo)

---

### Modal: Vista Previa PDF

**Objetivo:** Ver documento generado sin salir de contexto.

**Diseño:** Sheet lateral (shadcn) o modal grande. Header con título + botón cerrar. Body: iframe PDF. Loading state con skeleton.
**Pain point hoy:** Modal centrado MUI rígido. Mejor: **Sheet full-width derecha** para aprovechar espacio de lectura PDF.

---

### Modal: Cancelar Documento

**Objetivo:** Capturar motivo de cancelación con confirmación.

**Diseño:** Dialog (shadcn) centrado. Textarea motivo. Botón "Cancelar documento" destructive (rojo). Si documento ya cancelado, modo solo-lectura mostrando motivo.
**Pain point hoy:** Usa `forwardRef` + `useImperativeHandle` patrón antiguo. Mejor: manejar estado con `useState` directo en página padre.

---

### Micro-interacción: Compartir

**Objetivo:** Generar email pre-componido con link público al PDF.

**Diseño:** Botón con icono `Share`. Click → abre Gmail en nueva tab con subject/body/url prellenados. Toast "Link copiado al portapapeles" como fallback.
**Oportunidad:** Agregar "Copiar link" como opción secundaria dropdown.

---

### Paleta & Tipografía Sugerida (ya configurada)
- **Primario:** `#3f51b5` (Intecsa azul)
- **Destructivo/Cancelar:** Rojo estándar
- **Éxito/Guardar:** Verde
- **Tipografía:** Barlow (ya en app)
- **Espaciado:** Tailwind spacing scale

---

### Responsive Consideraciones
- **Desktop:** Tabla full-width, toolbar contextual sticky bottom, wizard 2-columnas en pasos 4/5
- **Tablet:** Tabla horizontal scroll, wizard 1 columna
- **Mobile:** Cards en vez de tabla para documentos (crítico — DataGrid MUI X no funciona bien en mobile). Wizard pasos con stepper vertical colapsado

---

### Oportunidades de Mejora UX (No implementadas hoy)
1. **Bulk actions** — Seleccionar múltiples filas para cancelar/compartir lote
2. **Search global** — Buscar por folio, asunto, vehículo, conductor
3. **Filtros guardados** — "Ver solo Rentas de esta semana"
4. **Empty states ilustrados** — Primera empresa sin documentos
5. **Atajos de teclado** — `n` = nuevo, `esc` = cerrar modal, `cmd+k` = búsqueda
6. **Notificaciones inline** — Toast al guardar/cancelar, mejor que `react-toastify` genérico

---

### Entregables de Diseño Sugeridos
1. Wireframe desktop/tablet/mobile de `[empresaId]`
2. Wireframe 5 pasos wizard (mobile-first)
3. Estados de componentes: empty, loading, error, success
4. Design system tokens: colores, tipografía, spacing, sombras
5. Prototipo interactivo Figma del flujo "Crear documento → Ver en tabla → Ver PDF"

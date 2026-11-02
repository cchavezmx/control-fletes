# Auditoría: inputs numéricos/de porcentaje que pierden el foco

## Causa raíz

El foco se pierde cuando un `<input>` se renderiza como **controlado totalmente por React** (`value={...}` + `onChange={...}`) y el valor que recibe cambia en cada pulsación. Si el padre se re-renderiza, React sincroniza el `value` con el DOM y, dependiendo de cómo se construya la cadena de re-renders, el cursor salta o el input se reemplaza.

En este proyecto el patrón problemático aparece con frecuencia en formularios que usan `react-hook-form`:

```jsx
// ❌ Mal: input controlado por watch + setValue
<input
  value={watch('campo') || ''}
  onChange={(e) => setValue('campo', e.target.value)}
/>
```

Esto contradice el modo de trabajo de `react-hook-form`: los campos deberían registrarse con `register(...)` o, si es necesario un control total, usar `<Controller />` (que internamente maneja el ref y evita que el input se reconstruya).

## Patrones seguros

### 1. Inputs numéricos simples: `register` con `setValueAs`

```jsx
const { register } = useFormContext()

<input
  type="text"
  inputMode="decimal"
  {...register('monto', {
    setValueAs: (v) => {
      const cleaned = String(v).replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
      return cleaned === '' ? 0 : Number(cleaned)
    }
  })}
/>
```

Ventajas:
- El input es no controlado para React: el foco nunca se pierde.
- `setValueAs` limpia y convierte el valor antes de guardarlo en RHF.
- Funciona para monedas, porcentajes, kilómetros, días, etc.

### 2. Inputs dinámicos (arrays): `useFieldArray`

Para listas que crecen o se reducen (p. ej. paradas de ruta), usar `useFieldArray` en lugar de `value={watch('stops')[idx]}`.

### 3. Casos donde sí se necesita valor externo: `defaultValue` + ref

Si el input no está dentro de un `FormProvider`, usar `defaultValue` y leer el valor al enviar/blur mediante una `ref`. Nunca usar `value={estado}` como única fuente del input.

## Archivos auditados y estado

| Archivo | Inputs afectados | Estado |
|---------|------------------|--------|
| `utils/costBreakdown.js` | Defaults de utilidad 8 %, indirectos 12 %, IVA 16 % | ✅ Centralizado; editable via `getStoredRates` / `setStoredRates` |
| `Components/Modal/RentaConceptsBreakdown.jsx` | Montos de conceptos, días, utilidad %, indirectos % | ✅ Refactorizado a `register` + `setValueAs` |
| `Components/Modal/NewPlan.jsx` | `planPrice` | ✅ `type="text"` + `inputMode="decimal"` + `setValueAs` |
| `pages/ita-utils.js` | Utilidad %, indirectos %, IVA %, selector de catálogo | ✅ Refactorizado a `defaultValue` + `ref` |
| `pages/control-vehicular/index.js` | `modelo`, `placa`, `soat`, `tarjetaCirculacion`, selects de estado, input numérico de combustible | ✅ Refactorizado a `register` / `Controller` |
| `Components/DocumentWizard/index.jsx` | Paradas (`stops`), selects de cliente/plan, combustible | ✅ Usa `Controller` y `register` (no `watch` + `setValue` directo) |
| `Components/flotilla/NewPlateModal.jsx` | Placa del nuevo vehículo | ✅ `defaultValue` + `ref` |
| `Components/Modal/CancelModalDocument.jsx` | Motivo de cancelación | ✅ `defaultValue` + `ref` |
| `Components/Modal/PlanesDrawer.jsx` | Nombre/descripción/costo del plan y confirmación de eliminación | ✅ `defaultValue` + `ref` |
| `Components/Modal/DocumentoRelacionado.jsx` | Fechas, selects de tipo/unidad | ✅ Fechas via `register`; selects `defaultValue` |
| `Components/Modal/EditVehicle.jsx` | Fechas de tarjeta/verificación | ✅ `register` con `defaultValues` formateados |
| `Components/flotilla/TableDocuments.jsx` | Búsqueda de vehículos | ✅ `defaultValue` + `ref` |
| `pages/[empresaId].js` | Búsqueda de documentos | ✅ `defaultValue` + `ref` |
| `Components/paqueteria/Form.jsx` | Dirección de envío (Autocomplete) | ✅ Input visible no controlado; campo `direccion` registrado con RHF |
| `Components/VehiclesSelector.jsx` | Búsqueda de unidad | ✅ `defaultValue` + `ref` |
| `components/qa/QABoard.jsx` | Nombre/sección inline, nombre de stage, query, fechas | ✅ `defaultValue` + `ref` |
| `pages/update/[objectId].js` | `recorrido_km`, `subtotal_travel`, `fuel_level` | ℹ️ Ya usa `{...register(...)}`; no hay foco perdido |
| `Components/flotilla/DatePickerValue.jsx` | Fechas en DataGrid | ℹ️ Componente MUI controlado; fuera del alcance de foco de teclado |
| `Components/Modal/FuelLevelSlider.jsx` | Slider de combustible | ℹ️ Controlado por diseño; no aplica el bug de escritura |

## Recomendación para futuros formularios

1. **No usar** `value={watch('campo')}` en inputs de texto/numéricos.
2. **Preferir** `register('campo')` y limpiar con `setValueAs`.
3. Para arrays dinámicos, usar `useFieldArray`.
4. Si un componente reutilizable necesita mostrar el valor actual (p. ej. slider de combustible), que el padre pase `defaultValue` y el componente interno use una `ref` o su propio estado local aislado.

## Notas de implementación

- `type="number"` nativo es aceptable visualmente, pero permite caracteres como `e`, `-`, `.` de formas no deseadas. Para monedas y porcentajes es mejor `type="text"` + `inputMode="decimal"` + sanitización en `setValueAs`.
- La sanitización no debe sobreescribir el `value` del input mientras el usuario está escribiendo. `setValueAs` solo afecta el valor que RHF almacena; el DOM conserva lo que el usuario teclea.
- Cuando un campo depende de otro (p. ej. seleccionar vehículo rellena modelo/placa), usar `setValue` solo en el evento que dispara el cambio, no en cada render.

---

*Auditoría actualizada el 31 de octubre de 2026.*

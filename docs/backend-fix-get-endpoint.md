# Fix backend: `GET /flotilla/get/:id` responde 400 para todos los documentos

> El endpoint **ya existe**. No hay que rehacerlo — hay que arreglar el handler actual, que está reventando y devolviendo un error vacío.

## Síntoma

```bash
# id real de un traslado que SÍ existe (aparece en /flotilla/documentos)
curl "https://api-control-inventario-production.up.railway.app/api/v1/flotilla/get/6297d7f4d553f000480dc370?type=traslado"

# Respuesta:
HTTP/2 400
{"message":{}}
```

- Pasa con **todos** los documentos (probado con ids reales de `traslado` y `flete`).
- El cuerpo `{"message":{}}` es un objeto de error serializado vacío → el `catch` está mandando el error de Mongoose/JS tal cual, y al serializarlo a JSON queda `{}` (los errores no exponen sus props en `JSON.stringify`).

## Lo que el front espera

El handler debe devolver **200** con el documento, envuelto bajo la clave del tipo (igual que ya lo consume el front):

```json
// GET /flotilla/get/:id?type=traslado  -> 200
{ "traslado": { "_id": "...", "folio": 13, "type": "traslado", "subject": "...", "request_date": "...", "...": "..." } }
```

El documento debe tener la misma forma que cada item dentro de los buckets de
`GET /flotilla/documentos/:empresaId?type=` (ese endpoint **sí funciona** y de
ahí saca el front los mismos campos).

## Causa probable (revisar en este orden)

1. **El `catch` oculta el error real.** Cambiar temporalmente:
   ```js
   } catch (err) {
     console.error('GET /flotilla/get error:', err); // <-- agregar
     return res.status(400).json({ message: err });
   }
   ```
   Loguear `err.message`/`err.stack` revela la causa exacta en Railway logs.

2. **Mapeo `type` → Modelo roto.** El handler probablemente elige el modelo
   según `req.query.type`. Si el mapa no contempla `'traslado'` (singular,
   minúscula) el modelo queda `undefined` y `undefined.findById(id)` truena.
   Verificar que el mapa acepte exactamente los valores que manda el front:
   `traslado`, `flete`, `renta` (singular, minúscula — el front hace
   `type.toLowerCase()`).

3. **Query equivocada.** Confirmar que busca por `_id`:
   `Model.findById(req.params.id)` (o `findOne({ _id: id })`), no por otro campo.

4. **`populate` que falla.** Si hace `.populate('description'/'vehicle_info'/...)`
   sobre una ref inexistente, puede lanzar. Probar sin populate primero.

## Contrato esperado (resumen)

| | |
|---|---|
| Método/ruta | `GET /flotilla/get/:id?type=<traslado\|flete\|renta>` |
| Param ruta | `:id` = `_id` del documento |
| Query | `type` en minúscula y singular |
| 200 | `{ "<type>": { ...documento } }` |
| 404 | si el `_id` no existe (no 400) |
| 400 | solo si falta/!válido `type` o `id` |

## Nota

Mientras tanto el front **no depende** de este endpoint: `pages/update/[objectId].js`
hace fallback a `GET /flotilla/documentos/:empresaId` y encuentra el doc por `_id`.
Cuando arreglen `get`, el intento directo (primario) vuelve a funcionar solo.

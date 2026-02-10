---
description: Guía paso a paso para que el Agente añada nuevos workflows al proyecto
---

// turbo-all

Este workflow automatiza la integración de nuevos flujos de ComfyUI. Sigue estos pasos estrictamente cada vez que el usuario proporcione un nuevo archivo `.json` de workflow.

## 1. Análisis del Workflow
1. Lee el archivo JSON proporcionado por el usuario.
2. Identifica los nodos clave:
   - `SaveImage` (generalmente el nodo de salida final).
   - `LoadImage` (entradas de imagen del usuario).
   - `PrimitiveString` o `MultilineString` (entrada de prompt).
   - `KSampler` (control de seed y parámetros).
   - `LoraLoader` (identifica qué Lora específico usa el flujo).

## 2. Creación del Template
1. Abre `src/config/workflows.js`.
2. Si el flujo es compatible con el ayudante `createSingleImageTemplate`, úsalo definiendo la constante al principio de la sección de templates:
   ```javascript
   const nombreTemplate = createSingleImageTemplate("RUTA\\LORA.safetensors", "Prompt por defecto");
   ```
3. Si el flujo es complejo, crea un objeto de template completo replicando la estructura del JSON pero parametrizando los inputs.

## 3. Registro en la Lista
1. Añade la entrada al array `export const workflows`.
2. Genera un `id` único.
3. Redacta una descripción "Premium" y añade al menos 3 `tips` útiles para el usuario.
4. Asegúrate de que los `target` de los `inputs` coincidan con los `nodeId` encontrados en el paso 1.

## 4. Verificación técnica
1. Ejecuta `npm run build` para asegurar que el archivo `workflows.js` no tiene errores de sintaxis.
2. Verifica que el nuevo workflow aparece en la categoría correcta de la UI.

## 5. Documentación
1. Actualiza el `walkthrough.md` mencionando el nuevo modo añadido.
2. Notifica al usuario resaltando el valor del nuevo flujo.

# Guía de Integración de Workflows (ComfyUI)

Este documento explica cómo añadir nuevos flujos de trabajo (workflows) de ComfyUI a nuestra interfaz personalizada de forma manual.

## 1. Preparar el JSON de la API
En ComfyUI, usa la opción **"Save (API Format)"**. Si no ves esta opción, activa "Enable Dev mode" en los ajustes de ComfyUI.
El archivo JSON resultante contiene la estructura que el motor necesita.

## 2. Definir el Template en `workflows.js`
Abre `src/config/workflows.js`. Aquí es donde ocurre la magia.

### Caso A: Flujo Estándar de una Imagen (Basado en QWEN)
Si tu flujo usa un solo input de imagen y un prompt (como la mayoría de nuestros filtros QWEN), usa el ayudante `createSingleImageTemplate`:

```javascript
const miNuevoTemplate = createSingleImageTemplate(
    "RUTA\\HACIA\\TU\\LORA.safetensors", 
    "Prompt por defecto para esta función"
);
```

### Caso B: Flujo Personalizado / Complejo
Si el flujo es único, copia el JSON de la API y conviértelo en un objeto constante (mira `anime2realismTemplate` para ver un ejemplo de estructura). Asegúrate de limpiar valores variables como `seed` (ponlo a 0) o nombres de archivo de imagen temporales.

## 3. Añadir a la Lista de Workflows
Añade un objeto a la constante `workflows`:

```javascript
{
    id: 'mi-nuevo-id', // Único y en minúsculas
    name: 'Nombre Amigable', 
    category: 'Stylization', // 'Stylization', 'Face', 'Characters', 'Utility'
    tags: ['tag1', 'tag2'],
    description: "Explicación breve de qué hace.",
    triggerWords: ["Lista de palabras clave"],
    tips: [
        "Consejo 1",
        "Consejo 2"
    ],
    inputs: [
        { 
            id: 'input_image', 
            type: 'image', 
            label: 'Imagen Origen', 
            target: { nodeId: '78', field: 'image' } // Mapeo al nodo LoadImage
        },
        { 
            id: 'prompt', 
            type: 'text', 
            label: 'Instrucciones', 
            defaultValue: '...', 
            target: { nodeId: '435', field: 'value' } // Mapeo al nodo de Texto/Prompt
        }
    ],
    apiTemplate: miNuevoTemplate
}
```

## 4. Puntos Críticos de Mapeo
Para que la UI hable con ComfyUI, los `target` deben ser correctos:
- **Imágenes**: Normalmente `nodeId: '78'` (Load Image).
- **Prompt**: Normalmente `nodeId: '435'` (Primitive String).
- **Semilla (Seed)**: Normalmente `nodeId: '433:3'` (KSampler).

## 5. Verificar
Reinicia o refresca la App y busca tu nuevo workflow en la categoría correspondiente. ¡Listo! 🚀

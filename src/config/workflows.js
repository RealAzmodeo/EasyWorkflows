/**
 * Workflow Configuration
 * Maps UI inputs to specific node fields in the ComfyUI workflow.
 */

import anime2realismTemplate from './templates/anime2realism.json';
import anything2ColorMangaTemplate from './templates/anything2colormanga.json';
import anything2ColoringBookTemplate from './templates/anything2coloringbook.json';
import anything2ComicTemplate from './templates/anything2comic.json';
import anything2RealTemplate from './templates/anything2real.json';
import character2CosplayTemplate from './templates/character2cosplay.json';
import character2FigureTemplate from './templates/character2figure.json';
import extractProductImageTemplate from './templates/extractproduct.json';
import faceSwapTemplate from './templates/faceswap.json';
import tryOnTemplate from './templates/tryon.json';
import removeObjectsTemplate from './templates/remove_objects.json';
import styleTransferTemplate from './templates/style_transfer.json';
import cameraAngleTemplate from './templates/camera_angle.json';

// --- WORKFLOW LIST ---

export const workflows = [
    {
        id: 'anime2realism',
        name: 'Anime to Realism',
        category: 'Stylization',
        tags: ['anime', 'photo', 'realistic'],
        description: "Convert anime illustrations into hyper-realistic photos while maintaining character and pose.",
        triggerWords: ["changed the image into realistic photo"],
        tips: [
            "Works best with clear anime lineart or flats.",
            "Describe the character's features to aid the realism transform.",
            "Maintain the original aspect ratio for best results."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'changed the image into realistic photo', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: anime2realismTemplate
    },
    {
        id: 'anything2colormanga',
        name: 'Anything to Color Manga',
        category: 'Stylization',
        tags: ['manga', 'art', 'color'],
        description: "Apply a vibrant colored manga filter to any image, preserving details with a clean look.",
        triggerWords: ["make this image into colormanga style"],
        tips: [
            "Inherits tones from the original image; use bright source images for vibrant results.",
            "Can turn simple line drawings into fully colored illustrations.",
            "Excellent for creating consistent character art."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'make this image into colormanga style', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: anything2ColorMangaTemplate
    },
    {
        id: 'anything2coloringbook',
        name: 'Anything to Coloring Book',
        category: 'Stylization',
        tags: ['coloring', 'sketch', 'bw'],
        description: "Turn any image into a detailed black and white coloring book page with clean outlines.",
        triggerWords: ["Turn into a black and white coloring book page"],
        tips: [
            "Standard: 'Turn the [subject] into a black and white coloring book page with a plain white background.'",
            "Cartoon: 'Turn this [subject] doing [action] into a cartoon coloring book... thick lines... playful style.'",
            "Worksheet: 'Turn [subject] into a black and white coloring book page. Medium-thick outlines... centered playful font.'"
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'Turn into a black and white coloring book page with a plain white background', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: anything2ColoringBookTemplate
    },
    {
        id: 'qwen-camera',
        name: 'Dynamic Camera',
        category: 'Experiments',
        tags: ['camera', '3d', 'crop'],
        description: "Change the camera perspective of any subject with visual cropping and 3D angle control.",
        triggerWords: [", turn into realistic style"],
        tips: [
            "Use the Crop tool to focus the attention on the subject.",
            "Visual angle selector: Left-Right for rotation, Up-Down for vertical tilt.",
            "Higher zoom values focus more tightly on the selected area."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '41', field: 'image' } },
            {
                id: 'camera_angle',
                type: 'camera_angle',
                label: 'Camera Orientation',
                target: { nodeId: '93', fields: ['horizontal_angle', 'vertical_angle', 'zoom'] }
            },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '89:65', field: 'seed' } }
        ],
        apiTemplate: cameraAngleTemplate
    },
    {
        id: 'anything2comic',
        name: 'Anything to Comic',
        category: 'Stylization',
        tags: ['comic', 'sketch', 'art'],
        description: "Transform your photos into a classic comic book style with bold lines and dynamic shading.",
        triggerWords: ["changed the image into realcomic style"],
        tips: [
            "Highly compatible with 3D models and hand-drawn sketches.",
            "You can edit image content while converting style (e.g., 'turn the car into a tank').",
            "Better results with 'sgm' scheduler if available."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'changed the image into realcomic style', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: anything2ComicTemplate
    },
    {
        id: 'anything2real',
        name: 'Anything to Real',
        category: 'Stylization',
        tags: ['photo', 'hq', 'realistic'],
        description: "The ultimate realism filter. Turn any input into a high-end, studio-quality photograph.",
        triggerWords: ["transform into realistic photography"],
        tips: [
            "Try changing the prompt to switch the scene entirely (e.g., 'in a neon street').",
            "Works great with Chinese character prompts as well.",
            "High-resolution upscale (1.5x) is highly recommended for textures."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'transform into realistic photography', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: anything2RealTemplate
    },
    {
        id: 'character2cosplay',
        name: 'Character to Cosplay',
        category: 'Characters',
        tags: ['character', 'outfit', 'cosplay'],
        description: 'Turn fictional characters into real-life people as if they were wearing a high-quality costume.',
        triggerWords: [
            "generate a real photo, a model wearing the clothes and accessories from the image, keeping the hairstyle, bangs, expression, clothing, and accessories unchanged"
        ],
        tips: [
            "Describe the material of the costume (leather, silk, plastic) for better realism.",
            "Specify 'natural lighting' to avoid a studio-lit look.",
            "Portrait orientations usually yield higher facial detail."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Character Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'generate a real photo, a model wearing the clothes...', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: character2CosplayTemplate
    },
    {
        id: 'character2figure',
        name: 'Character to Figure',
        category: 'Characters',
        tags: ['figure', 'toy', '3d'],
        description: "Digitize your subject into a collectible 3D PVC figurine with realistic plastic textures.",
        triggerWords: ["complete the body, keep the pose and facial features unchanged, turn the subject into a realistic 3D PVC figurine"],
        tips: [
            "Specify the background, like 'inside a display case' or 'held in a hand'.",
            "Emphasize 'pvc plastic texture' for that authentic glossy look.",
            "Describe the packaging box behind the figure for a complete 'new-in-box' look."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Character Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'Turn the subject into a realistic 3D PVC figurine...', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: character2FigureTemplate
    },
    {
        id: 'extractproduct',
        name: 'Extract Product',
        category: 'Utility',
        tags: ['product', 'ecommerce', 'hq'],
        description: 'Studio lighting and background cleanup for products. Perfect for creating professional catalog imagery.',
        triggerWords: [
            "make a product image for <object>",
            "make a product image for his entire outfit",
            "make a product image for her top",
            "make a product image for her pants",
            "make a product image for the held object"
        ],
        tips: [
            "Use general terms (e.g., 'outfit', 'guitar') rather than hyper-specific names.",
            "Works for held objects, worn objects, or items sitting on a surface.",
            "Avoid overly long descriptions to prevent the model from misinterpreting details."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Product Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'make a product image...', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: extractProductImageTemplate
    },
    {
        id: 'faceswap',
        name: 'Face Swap',
        category: 'Face',
        tags: ['face', 'swap', 'composite'],
        description: "Extract a face from one image and seamlessly blend it onto another's body.",
        triggerWords: [
            "h34d_sw4p: replace the head of Picture 1 by the head from Picture 2, strictly preserving the identity, facial features (eyes, nose, mouth), and skin texture of Picture 2. Ensure the new head mimics the identical expression, angle, and rotation found in Picture 1.",
            "h34d_sw4p: replace the head of Picture 1 by the head from Picture 2, ensuring the new head mimics the identical expression, angle, and rotation found in Picture 1."
        ],
        tips: [
            "Ensure both faces are at similar angles for the most seamless blend.",
            "Higher quality source images lead to significantly better feature preservation.",
            "Personal notes: Use the Lightning-4steps model for speed."
        ],
        inputs: [
            { id: 'body_image', type: 'image', label: 'Target Body Image', target: { nodeId: '78', field: 'image' } },
            { id: 'face_image', type: 'image', label: 'Face Source Image', target: { nodeId: '438', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'h34d_sw4p: replace the head...', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: faceSwapTemplate
    },
    {
        id: 'tryon',
        name: 'Virtual Try-On',
        category: 'Characters',
        tags: ['outfit', 'clothes', 'person'],
        description: "Virtually try on outfits from one image onto a person in another image.",
        triggerWords: [
            "attach the outfit in Image 2 to the person in Image 1",
            "attach the outfit in Image 2 to the man in Image 1",
            "attach the outfit in Image 2 to the woman in Image 1"
        ],
        tips: [
            "Works best when the person's xpose is simple (standing, front-facing).",
            "The outfit image should be clear and ideally on a mannequin or flat lay.",
            "Supports changing entire outfits or specific parts like 'top' or 'pants'."
        ],
        inputs: [
            { id: 'person_image', type: 'image', label: 'Person Image', target: { nodeId: '78', field: 'image' } },
            { id: 'outfit_image', type: 'image', label: 'Outfit Image', target: { nodeId: '438', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'attach the outfit in Image 2 to the person in Image 1', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: tryOnTemplate
    },
    {
        id: 'remove-objects',
        name: 'Remove Objects',
        category: 'Utility',
        tags: ['utility', 'cleanup', 'delete'],
        description: "Remove unwanted objects from your images using descriptive prompts.",
        triggerWords: ["remove the jacket"],
        tips: [
            "Be specific about what you want to remove (e.g., 'remove the person on the left').",
            "Describe the background to help the model fill the gap better.",
            "Higher seed variety can help if the removal isn't perfect on the first try."
        ],
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '41', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'remove the jacket', target: { nodeId: '89:68', field: 'prompt' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '89:65', field: 'seed' } }
        ],
        apiTemplate: removeObjectsTemplate
    },
    {
        id: 'style-transfer',
        name: 'Style Transfer',
        category: 'Generation',
        tags: ['generation', 'style', 'art'],
        description: "Transfer the style from a reference image to your source image using a prompt.",
        triggerWords: ["convert the image to the style of the reference"],
        tips: [
            "Use a high-contrast style reference for dramatic results.",
            "The prompt helps the model understand how to apply the style.",
            "Works best when both images have similar brightness levels."
        ],
        inputs: [
            { id: 'source_image', type: 'image', label: 'Source Image', target: { nodeId: '78', field: 'image' } },
            { id: 'style_reference', type: 'image', label: 'Style Reference', target: { nodeId: '438', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'convert the image to the style of the reference', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: styleTransferTemplate
    }
];

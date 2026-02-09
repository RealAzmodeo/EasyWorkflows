/**
 * Workflow Configuration
 * Maps UI inputs to specific node fields in the ComfyUI workflow.
 */

// --- API TEMPLATES ---

const anime2realismTemplate = {
    "60": { "inputs": { "filename_prefix": "ComfyUI", "images": ["433:8", 0] }, "class_type": "SaveImage" },
    "78": { "inputs": { "image": "example.png" }, "class_type": "LoadImage" },
    "435": { "inputs": { "value": "changed the image into realistic photo, paladin girl" }, "class_type": "PrimitiveStringMultiline" },
    "433:75": { "inputs": { "strength": 1, "model": ["433:66", 0] }, "class_type": "CFGNorm" },
    "433:39": { "inputs": { "vae_name": "qwen_image_vae.safetensors" }, "class_type": "VAELoader" },
    "433:110": { "inputs": { "prompt": "", "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:66": { "inputs": { "shift": 3, "model": ["433:89", 0] }, "class_type": "ModelSamplingAuraFlow" },
    "433:111": { "inputs": { "prompt": ["435", 0], "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:88": { "inputs": { "pixels": ["433:117", 0], "vae": ["433:39", 0] }, "class_type": "VAEEncode" },
    "433:8": { "inputs": { "samples": ["433:3", 0], "vae": ["433:39", 0] }, "class_type": "VAEDecode" },
    "433:117": { "inputs": { "image": ["78", 0] }, "class_type": "FluxKontextImageScale" },
    "433:3": { "inputs": { "seed": 0, "steps": 4, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["433:75", 0], "positive": ["433:111", 0], "negative": ["433:110", 0], "latent_image": ["433:88", 0] }, "class_type": "KSampler" },
    "433:37": { "inputs": { "unet_name": "qwen_image_edit_2509_fp8_e4m3fn.safetensors", "weight_dtype": "default" }, "class_type": "UNETLoader" },
    "433:118": { "inputs": { "gguf_name": "Qwen-Image-Edit-2509-Q5_K_S.gguf" }, "class_type": "LoaderGGUF" },
    "433:38": { "inputs": { "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default" }, "class_type": "CLIPLoader" },
    "433:89": { "inputs": { "lora_name": "QWEN\\Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors", "strength_model": 1, "model": ["433:119", 0] }, "class_type": "LoraLoaderModelOnly" },
    "433:119": { "inputs": { "lora_name": "QWEN\\EDIT\\EDIT - Anime2Realismv2.safetensors", "strength_model": 1, "model": ["433:118", 0] }, "class_type": "LoraLoaderModelOnly" }
};

const faceSwapTemplate = {
    "60": { "inputs": { "filename_prefix": "ComfyUI", "images": ["433:8", 0] }, "class_type": "SaveImage" },
    "78": { "inputs": { "image": "example.png" }, "class_type": "LoadImage" },
    "435": { "inputs": { "value": "h34d_sw4p: replace the head..." }, "class_type": "PrimitiveStringMultiline" },
    "438": { "inputs": { "image": "example2.png" }, "class_type": "LoadImage" },
    "433:75": { "inputs": { "strength": 1, "model": ["433:66", 0] }, "class_type": "CFGNorm" },
    "433:39": { "inputs": { "vae_name": "qwen_image_vae.safetensors" }, "class_type": "VAELoader" },
    "433:110": { "inputs": { "prompt": "", "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0], "image2": ["438", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:66": { "inputs": { "shift": 3, "model": ["433:89", 0] }, "class_type": "ModelSamplingAuraFlow" },
    "433:111": { "inputs": { "prompt": ["435", 0], "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0], "image2": ["438", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:8": { "inputs": { "samples": ["433:3", 0], "vae": ["433:39", 0] }, "class_type": "VAEDecode" },
    "433:3": { "inputs": { "seed": 0, "steps": 4, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["433:75", 0], "positive": ["433:111", 0], "negative": ["433:110", 0], "latent_image": ["433:88", 0] }, "class_type": "KSampler" },
    "433:37": { "inputs": { "unet_name": "qwen_image_edit_2509_fp8_e4m3fn.safetensors", "weight_dtype": "default" }, "class_type": "UNETLoader" },
    "433:118": { "inputs": { "gguf_name": "Qwen-Image-Edit-2509-Q5_K_S.gguf" }, "class_type": "LoaderGGUF" },
    "433:38": { "inputs": { "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default" }, "class_type": "CLIPLoader" },
    "433:89": { "inputs": { "lora_name": "QWEN\\Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors", "strength_model": 1, "model": ["433:119", 0] }, "class_type": "LoraLoaderModelOnly" },
    "433:117": { "inputs": { "image": ["78", 0] }, "class_type": "FluxKontextImageScale" },
    "433:88": { "inputs": { "pixels": ["433:117", 0], "vae": ["433:39", 0] }, "class_type": "VAEEncode" },
    "433:119": { "inputs": { "lora_name": "QWEN\\2509\\2509 - FaceSwapV4.safetensors", "strength_model": 1, "model": ["433:118", 0] }, "class_type": "LoraLoaderModelOnly" }
};

// ... (Other templates are structurally similar, usually varying by Prompt, Lora, and sometimes Node IDs if slightly different)
// I will reuse a common base structure for the single-image workflows to keep this file cleaner, 
// modifying the specific LORA and PROMPT defaults.
// HOWEVER, to be SAFE and EXACT, I will use the exact JSONs provided for the other workflows.

const tryOnTemplate = {
    "60": { "inputs": { "filename_prefix": "ComfyUI", "images": ["433:8", 0] }, "class_type": "SaveImage" },
    "78": { "inputs": { "image": "person.png" }, "class_type": "LoadImage" },
    "435": { "inputs": { "value": "attach the outfit in Image 2 to the person in Image 1" }, "class_type": "PrimitiveStringMultiline" },
    "438": { "inputs": { "image": "outfit.png" }, "class_type": "LoadImage" },
    "433:75": { "inputs": { "strength": 1, "model": ["433:66", 0] }, "class_type": "CFGNorm" },
    "433:39": { "inputs": { "vae_name": "qwen_image_vae.safetensors" }, "class_type": "VAELoader" },
    "433:110": { "inputs": { "prompt": "", "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0], "image2": ["438", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:66": { "inputs": { "shift": 3, "model": ["433:89", 0] }, "class_type": "ModelSamplingAuraFlow" },
    "433:111": { "inputs": { "prompt": ["435", 0], "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0], "image2": ["438", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:8": { "inputs": { "samples": ["433:3", 0], "vae": ["433:39", 0] }, "class_type": "VAEDecode" },
    "433:3": { "inputs": { "seed": 0, "steps": 4, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["433:75", 0], "positive": ["433:111", 0], "negative": ["433:110", 0], "latent_image": ["433:88", 0] }, "class_type": "KSampler" },
    "433:37": { "inputs": { "unet_name": "qwen_image_edit_2509_fp8_e4m3fn.safetensors", "weight_dtype": "default" }, "class_type": "UNETLoader" },
    "433:118": { "inputs": { "gguf_name": "Qwen-Image-Edit-2509-Q5_K_S.gguf" }, "class_type": "LoaderGGUF" },
    "433:38": { "inputs": { "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default" }, "class_type": "CLIPLoader" },
    "433:89": { "inputs": { "lora_name": "QWEN\\Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors", "strength_model": 1, "model": ["433:119", 0] }, "class_type": "LoraLoaderModelOnly" },
    "433:117": { "inputs": { "image": ["78", 0] }, "class_type": "FluxKontextImageScale" },
    "433:88": { "inputs": { "pixels": ["433:117", 0], "vae": ["433:39", 0] }, "class_type": "VAEEncode" },
    "433:119": { "inputs": { "lora_name": "QWEN\\2509\\2509 - TryOn.safetensors", "strength_model": 1, "model": ["433:118", 0] }, "class_type": "LoraLoaderModelOnly" }
};

// Function to generate other templates which are identical to Anime2Realism but different Lora/Message
const createSingleImageTemplate = (loraName, defaultPrompt) => {
    const t = JSON.parse(JSON.stringify(anime2realismTemplate));
    t["435"].inputs.value = defaultPrompt;
    t["433:119"].inputs.lora_name = loraName;
    return t;
};

const anything2ColorMangaTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - Anything2ColorManga.safetensors", "make this image into colormanga style, high quality");
const anything2ComicTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - Real2Comic.safetensors", "changed the image into realcomic style"); // Note: Lora name from JSON is Real2Comic
const anything2RealTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - Anything2Real.safetensors", "transform into realistic photography");
const character2CosplayTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - Character2Cosplay.safetensors", "generate a real photo, a model wearing the clothes and accessories...");
const character2FigureTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - TurnIntoPlasticFigure.safetensors", "Turn the subject into a realistic 3D PVC figurine...");
const extractProductImageTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - ProductImage.safetensors", "make a product image...");

// --- WORKFLOW LIST ---

export const workflows = [
    {
        id: 'anime2realism',
        name: 'Anime to Realism',
        description: "Convert anime illustrations into hyper-realistic photos while maintaining character and pose.",
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
        description: "Apply a vibrant colored manga filter to any image, preserving details with a clean look.",
        inputs: [
            { id: 'input_image', type: 'image', label: 'Source Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'make this image into colormanga style', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: anything2ColorMangaTemplate
    },
    {
        id: 'anything2comic',
        name: 'Anything to Comic',
        description: "Transform your photos into a classic comic book style with bold lines and dynamic shading.",
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
        description: "The ultimate realism filter. Turn any input into a high-end, studio-quality photograph.",
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
        description: 'Turn fictional characters into real-life people as if they were wearing a high-quality costume.',
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
        description: "Digitize your subject into a collectible 3D PVC figurine with realistic plastic textures.",
        inputs: [
            { id: 'input_image', type: 'image', label: 'Character Image', target: { nodeId: '78', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'Turn the subject into a realistic 3D PVC figurine...', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: character2FigureTemplate
    },
    {
        id: 'extractproduct',
        name: 'Extract Product Image',
        description: 'Studio lighting and background cleanup for products. Perfect for creating professional catalog imagery from any snapshot.',
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
        description: "Extract a face from one image and seamlessly blend it onto another's body.",
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
        description: "Virtually try on outfits from one image onto a person in another image.",
        inputs: [
            { id: 'person_image', type: 'image', label: 'Person Image', target: { nodeId: '78', field: 'image' } },
            { id: 'outfit_image', type: 'image', label: 'Outfit Image', target: { nodeId: '438', field: 'image' } },
            { id: 'prompt', type: 'text', label: 'Prompt', defaultValue: 'attach the outfit in Image 2 to the person in Image 1', target: { nodeId: '435', field: 'value' } },
            { id: 'seed', type: 'number', label: 'Seed', placeholder: 'Random', target: { nodeId: '433:3', field: 'seed' } }
        ],
        apiTemplate: tryOnTemplate
    }
];

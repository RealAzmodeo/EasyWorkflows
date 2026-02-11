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
    "433:119": { "inputs": { "lora_name": "QWEN\\EDIT\\2509 - Face Swap.safetensors", "strength_model": 1, "model": ["433:118", 0] }, "class_type": "LoraLoaderModelOnly" }
};

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
    "433:119": { "inputs": { "lora_name": "QWEN\\EDIT\\EDIT - clothes_tryon.safetensors", "strength_model": 1, "model": ["433:118", 0] }, "class_type": "LoraLoaderModelOnly" }
};

const removeObjectsTemplate = {
    "9": { "inputs": { "filename_prefix": "Qwen_Edit_2511", "images": ["89:8", 0] }, "class_type": "SaveImage" },
    "41": { "inputs": { "image": "example.png" }, "class_type": "LoadImage" },
    "89:67": { "inputs": { "shift": 3.1, "model": ["89:91", 0] }, "class_type": "ModelSamplingAuraFlow" },
    "89:10": { "inputs": { "vae_name": "qwen_image_vae.safetensors" }, "class_type": "VAELoader" },
    "89:12": { "inputs": { "unet_name": "qwen_image_edit_2511_bf16.safetensors", "weight_dtype": "default" }, "class_type": "UNETLoader" },
    "89:71": { "inputs": { "reference_latents_method": "index_timestep_zero", "conditioning": ["89:69", 0] }, "class_type": "FluxKontextMultiReferenceLatentMethod" },
    "89:70": { "inputs": { "reference_latents_method": "index_timestep_zero", "conditioning": ["89:68", 0] }, "class_type": "FluxKontextMultiReferenceLatentMethod" },
    "89:64": { "inputs": { "strength": 1, "model": ["89:67", 0] }, "class_type": "CFGNorm" },
    "89:69": { "inputs": { "prompt": "", "clip": ["89:61", 0], "vae": ["89:10", 0], "image1": ["89:88", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "89:8": { "inputs": { "samples": ["89:65", 0], "vae": ["89:10", 0] }, "class_type": "VAEDecode" },
    "89:68": { "inputs": { "prompt": "remove the jacket", "clip": ["89:61", 0], "vae": ["89:10", 0], "image1": ["89:88", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "89:75": { "inputs": { "pixels": ["89:88", 0], "vae": ["89:10", 0] }, "class_type": "VAEEncode" },
    "89:88": { "inputs": { "image": ["41", 0] }, "class_type": "FluxKontextImageScale" },
    "89:61": { "inputs": { "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default" }, "class_type": "CLIPLoader" },
    "89:92": { "inputs": { "lora_name": "QWEN\\2511\\2511 - RemoveObject.safetensors", "strength_model": 1, "model": ["89:90", 0] }, "class_type": "LoraLoaderModelOnly" },
    "89:65": { "inputs": { "seed": 0, "steps": 8, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["89:64", 0], "positive": ["89:70", 0], "negative": ["89:71", 0], "latent_image": ["89:75", 0] }, "class_type": "KSampler" },
    "89:90": { "inputs": { "gguf_name": "qwen-image-edit-2511-Q6_K.gguf" }, "class_type": "LoaderGGUF" },
    "89:91": { "inputs": { "lora_name": "QWEN\\Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors", "strength_model": 1, "model": ["89:92", 0] }, "class_type": "LoraLoaderModelOnly" }
};

// Function to generate other templates which are identical to Anime2Realism but different Lora/Message
const createSingleImageTemplate = (loraName, defaultPrompt) => {
    const t = JSON.parse(JSON.stringify(anime2realismTemplate));
    t["435"].inputs.value = defaultPrompt;
    t["433:119"].inputs.lora_name = loraName;
    return t;
};

const anything2ColorMangaTemplate = createSingleImageTemplate("QWEN\\Base\\Base - Anything2ColorManga.safetensors", "make this image into colormanga style, high quality");
const styleTransferTemplate = {
    "60": { "inputs": { "filename_prefix": "ComfyUI", "images": ["433:8", 0] }, "class_type": "SaveImage" },
    "78": { "inputs": { "image": "source.png" }, "class_type": "LoadImage" },
    "435": { "inputs": { "value": "convert the image to the style of the reference" }, "class_type": "PrimitiveStringMultiline" },
    "438": { "inputs": { "image": "reference.png" }, "class_type": "LoadImage" },
    "433:75": { "inputs": { "strength": 1, "model": ["433:66", 0] }, "class_type": "CFGNorm" },
    "433:39": { "inputs": { "vae_name": "qwen_image_vae.safetensors" }, "class_type": "VAELoader" },
    "433:110": { "inputs": { "prompt": "", "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0], "image2": ["438", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:66": { "inputs": { "shift": 3, "model": ["433:89", 0] }, "class_type": "ModelSamplingAuraFlow" },
    "433:111": { "inputs": { "prompt": ["435", 0], "clip": ["433:38", 0], "vae": ["433:39", 0], "image1": ["433:117", 0], "image2": ["438", 0] }, "class_type": "TextEncodeQwenImageEditPlus" },
    "433:8": { "inputs": { "samples": ["433:3", 0], "vae": ["433:39", 0] }, "class_type": "VAEDecode" },
    "433:3": { "inputs": { "seed": 0, "steps": 4, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": ["433:75", 0], "positive": ["433:111", 0], "negative": ["433:110", 0], "latent_image": ["433:88", 0] }, "class_type": "KSampler" },
    "433:38": { "inputs": { "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image", "device": "default" }, "class_type": "CLIPLoader" },
    "433:117": { "inputs": { "image": ["78", 0] }, "class_type": "FluxKontextImageScale" },
    "433:88": { "inputs": { "pixels": ["433:117", 0], "vae": ["433:39", 0] }, "class_type": "VAEEncode" },
    "433:37": { "inputs": { "unet_name": "qwen_image_edit_2509_fp8_e4m3fn.safetensors", "weight_dtype": "default" }, "class_type": "UNETLoader" },
    "433:118": { "inputs": { "gguf_name": "qwen-image-edit-2511-Q6_K.gguf" }, "class_type": "LoaderGGUF" },
    "433:89": { "inputs": { "lora_name": "QWEN\\Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors", "strength_model": 1, "model": ["433:119", 0] }, "class_type": "LoraLoaderModelOnly" },
    "433:119": { "inputs": { "lora_name": "QWEN\\2511\\2511 - Style Transfer.safetensors", "strength_model": 1, "model": ["433:118", 0] }, "class_type": "LoraLoaderModelOnly" }
};

const anything2ComicTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - Real2Comic.safetensors", "changed the image into realcomic style"); // Note: Lora name from JSON is Real2Comic
const anything2RealTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - Anything2Real.safetensors", "transform into realistic photography");
const character2CosplayTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - Character2Cosplay.safetensors", "generate a real photo, a model wearing the clothes and accessories...");
const character2FigureTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - TurnIntoPlasticFigure.safetensors", "Turn the subject into a realistic 3D PVC figurine...");
const extractProductImageTemplate = createSingleImageTemplate("QWEN\\2509\\2509 - ProductImage.safetensors", "make a product image...");
const anything2ColoringBookTemplate = createSingleImageTemplate("QWEN\\Base\\Base - Anything2ColoringBook.safetensors", "Turn into a black and white coloring book page with a plain white background");

const cameraAngleTemplate = {
    "41": {
        "inputs": {
            "image": "example.png"
        },
        "class_type": "LoadImage",
        "_meta": {
            "title": "Load Image"
        }
    },
    "93": {
        "inputs": {
            "horizontal_angle": 131,
            "vertical_angle": -30,
            "zoom": 5,
            "default_prompts": "",
            "camera_view": false,
            "image": [
                "41",
                0
            ]
        },
        "class_type": "QwenMultiangleCameraNode",
        "_meta": {
            "title": "Qwen Multiangle Camera"
        }
    },
    "89:67": {
        "inputs": {
            "shift": 3.1,
            "model": [
                "89:74",
                0
            ]
        },
        "class_type": "ModelSamplingAuraFlow",
        "_meta": {
            "title": "ModelSamplingAuraFlow"
        }
    },
    "89:10": {
        "inputs": {
            "vae_name": "qwen_image_vae.safetensors"
        },
        "class_type": "VAELoader",
        "_meta": {
            "title": "Load VAE"
        }
    },
    "89:12": {
        "inputs": {
            "unet_name": "qwen_image_edit_2511_bf16.safetensors",
            "weight_dtype": "default"
        },
        "class_type": "UNETLoader",
        "_meta": {
            "title": "Load Diffusion Model"
        }
    },
    "89:71": {
        "inputs": {
            "reference_latents_method": "index_timestep_zero",
            "conditioning": [
                "89:69",
                0
            ]
        },
        "class_type": "FluxKontextMultiReferenceLatentMethod",
        "_meta": {
            "title": "Edit Model Reference Method"
        }
    },
    "89:70": {
        "inputs": {
            "reference_latents_method": "index_timestep_zero",
            "conditioning": [
                "89:68",
                0
            ]
        },
        "class_type": "FluxKontextMultiReferenceLatentMethod",
        "_meta": {
            "title": "Edit Model Reference Method"
        }
    },
    "89:64": {
        "inputs": {
            "strength": 1,
            "model": [
                "89:67",
                0
            ]
        },
        "class_type": "CFGNorm",
        "_meta": {
            "title": "CFGNorm"
        }
    },
    "89:69": {
        "inputs": {
            "prompt": "",
            "clip": [
                "89:93",
                1
            ],
            "vae": [
                "89:10",
                0
            ],
            "image1": [
                "89:88",
                0
            ]
        },
        "class_type": "TextEncodeQwenImageEditPlus",
        "_meta": {
            "title": "TextEncodeQwenImageEditPlus"
        }
    },
    "89:8": {
        "inputs": {
            "samples": [
                "89:65",
                0
            ],
            "vae": [
                "89:10",
                0
            ]
        },
        "class_type": "VAEDecode",
        "_meta": {
            "title": "VAE Decode"
        }
    },
    "89:68": {
        "inputs": {
            "prompt": [
                "93",
                0
            ],
            "clip": [
                "89:93",
                1
            ],
            "vae": [
                "89:10",
                0
            ],
            "image1": [
                "89:88",
                0
            ]
        },
        "class_type": "TextEncodeQwenImageEditPlus",
        "_meta": {
            "title": "TextEncodeQwenImageEditPlus (Positive)"
        }
    },
    "89:75": {
        "inputs": {
            "pixels": [
                "89:88",
                0
            ],
            "vae": [
                "89:10",
                0
            ]
        },
        "class_type": "VAEEncode",
        "_meta": {
            "title": "VAE Encode"
        }
    },
    "89:88": {
        "inputs": {
            "image": [
                "41",
                0
            ]
        },
        "class_type": "FluxKontextImageScale",
        "_meta": {
            "title": "FluxKontextImageScale"
        }
    },
    "89:65": {
        "inputs": {
            "seed": 0,
            "steps": 8,
            "cfg": 1,
            "sampler_name": "euler",
            "scheduler": "simple",
            "denoise": 1,
            "model": [
                "89:64",
                0
            ],
            "positive": [
                "89:70",
                0
            ],
            "negative": [
                "89:71",
                0
            ],
            "latent_image": [
                "89:75",
                0
            ]
        },
        "class_type": "KSampler",
        "_meta": {
            "title": "KSampler"
        }
    },
    "60": {
        "inputs": {
            "filename_prefix": "ComfyUI",
            "images": [
                "89:8",
                0
            ]
        },
        "class_type": "SaveImage",
        "_meta": {
            "title": "Save Image"
        }
    },
    "89:74": {
        "inputs": {
            "lora_name": "QWEN\\Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors",
            "strength_model": 1,
            "model": [
                "89:93",
                0
            ]
        },
        "class_type": "LoraLoaderModelOnly",
        "_meta": {
            "title": "LoraLoaderModelOnly"
        }
    },
    "89:89": {
        "inputs": {
            "gguf_name": "qwen-image-edit-2511-Q6_K.gguf"
        },
        "class_type": "LoaderGGUF",
        "_meta": {
            "title": "GGUF Loader"
        }
    },
    "89:61": {
        "inputs": {
            "clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors",
            "type": "qwen_image",
            "device": "default"
        },
        "class_type": "CLIPLoader",
        "_meta": {
            "title": "Load CLIP"
        }
    },
    "89:93": {
        "inputs": {
            "PowerLoraLoaderHeaderWidget": {
                "type": "PowerLoraLoaderHeaderWidget"
            },
            "lora_1": {
                "on": true,
                "lora": "QWEN\\2511\\2511 - MultipleAngles.safetensors",
                "strength": 1
            },
            "➕ Add Lora": "",
            "model": [
                "89:89",
                0
            ],
            "clip": [
                "89:61",
                0
            ]
        },
        "class_type": "Power Lora Loader (rgthree)",
        "_meta": {
            "title": "Power Lora Loader (rgthree)"
        }
    }
};

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

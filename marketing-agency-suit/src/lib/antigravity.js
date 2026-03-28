/**
 * Antigravity API Service - LIVE PRODUCTION
 * Integates with OpenAI (Text) and Fal.ai (Image/Video)
 */

import { fal } from "@fal-ai/client";

// Configure fal client with API key
fal.config({ credentials: () => process.env.FAL_KEY });

async function fetchOpenAI(messages, model = "gpt-4o") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.replace(/\"/g, "").trim()}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI Error:", err);
    throw new Error("Failed to generate OpenAI content");
  }

  const json = await res.json();
  return json.choices[0].message.content;
}

async function fetchFal(endpoint, bodyData) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY is missing");

  const res = await fetch(`https://fal.run/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${apiKey.replace(/\"/g, "").trim()}`
    },
    body: JSON.stringify(bodyData)
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Fal.ai Error:", err);
    throw new Error("Failed to generate Fal.ai content");
  }

  return await res.json();
}

// Upload base64 image to Fal storage and get a hosted URL
async function uploadToFalStorage(base64Data, mimeType) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY is missing");

  // Convert base64 to binary buffer
  const binaryData = Buffer.from(base64Data, "base64");
  const ext = mimeType?.includes("png") ? "png" : "jpg";

  const res = await fetch("https://fal.run/fal-ai/any/upload", {
    method: "PUT",
    headers: {
      "Authorization": `Key ${apiKey.replace(/\"/g, "").trim()}`,
      "Content-Type": mimeType || "image/jpeg",
    },
    body: binaryData,
  });

  if (!res.ok) {
    // Fallback: return data URI if storage upload fails
    return `data:${mimeType || "image/jpeg"};base64,${base64Data}`;
  }

  const result = await res.json();
  return result.url || result.file_url;
}

// Queue-based Fal call for long-running tasks (video generation)
async function fetchFalQueue(endpoint, bodyData) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY is missing");
  const authHeader = `Key ${apiKey.replace(/\"/g, "").trim()}`;

  // Submit the job to the queue
  const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify(bodyData),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    console.error("Fal.ai Queue Submit Error:", err);
    throw new Error("Failed to submit video generation job");
  }

  const { request_id } = await submitRes.json();

  // Poll for the result (check every 5 seconds, up to 3 minutes)
  const maxAttempts = 36;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const statusRes = await fetch(
      `https://queue.fal.run/${endpoint}/requests/${request_id}/status`,
      { headers: { "Authorization": authHeader } }
    );

    if (!statusRes.ok) continue;
    const status = await statusRes.json();

    if (status.status === "COMPLETED") {
      // Fetch the actual result
      const resultRes = await fetch(
        `https://queue.fal.run/${endpoint}/requests/${request_id}`,
        { headers: { "Authorization": authHeader } }
      );
      if (!resultRes.ok) throw new Error("Failed to fetch video result");
      return await resultRes.json();
    }

    if (status.status === "FAILED") {
      throw new Error("Video generation failed on the AI server");
    }
  }

  throw new Error("Video generation timed out");
}

export const antigravity = {
  // IMAGE: Fal.ai Bria Product Shot - TRUE Image-to-Image Product Photography
  async generateImage(params) {
    // Build scene description based on selected visual style
    const styleScenes = {
      studio: "Ultra-clean minimalist studio. White seamless background. Professional three-point lighting with soft shadows. Subtle gradient reflection on polished surface. Commercial product photography.",
      lifestyle: "Natural lifestyle setting. Warm golden-hour sunlight streaming through a window. Product placed on a textured wooden surface with linen fabric. Soft bokeh greenery in background.",
      "3d_render": "Floating on a glossy black reflective surface. Dramatic rim lighting with purple and blue gradient background. Soft ambient occlusion shadows. High-end 3D render look.",
      luxury: "Placed on elegant dark marble surface. Gold and champagne accent lighting. Crystal-clear reflections. Rich velvet fabric draped nearby. Magazine editorial luxury aesthetic.",
      outdoor: "Stunning tropical beach setting. Warm golden sunlight with natural cast shadows. Turquoise ocean in the soft-focus background. Product sitting on a smooth rock near the shore.",
      neon: "Dark moody setting with vibrant neon lighting in pink, blue, and purple. Glowing reflections on glossy surface. Cyberpunk futuristic tech aesthetic. Dramatic color contrast.",
    };

    const scenePrompt = styleScenes[params.style] || styleScenes.studio;
    let fullPrompt = scenePrompt;
    if (params.additional_context) {
      fullPrompt += ` ${params.additional_context}.`;
    }

    // Generate multiple variations by calling the API multiple times if needed
    const numImages = params.num_images || 1;
    const imageUrls = [];

    for (let i = 0; i < numImages; i++) {
      const payload = {
        image_url: `data:${params.imageMimeType || "image/png"};base64,${params.imageBase64}`,
        scene_description: fullPrompt,
        optimize_description: true,
      };

      const falResult = await fetchFal("fal-ai/bria/product-shot", payload);
      
      if (falResult.image?.url) {
        imageUrls.push(falResult.image.url);
      } else if (falResult.images?.[0]?.url) {
        imageUrls.push(falResult.images[0].url);
      }
    }

    return {
      success: true,
      url: imageUrls[0],
      variants: imageUrls,
    };
  },

  // VIDEO: Peak-quality pipeline — Auto-enhance image → Kling Pro animation
  async submitVideo(params) {
    // PEAK-LEVEL style prompts with hyper-specific camera motion & lighting
    const stylePrompts = {
      cinematic: "The camera starts with a wide establishing shot of the product centered on a reflective dark surface. It slowly pushes in with a smooth dolly movement while orbiting 45 degrees to the right. Studio key light gradually intensifies from the left side creating dramatic shadows. Subtle volumetric fog drifts through the scene. Lens flare appears as the camera reaches a medium close-up. Depth of field shifts to isolate the product. Professional commercial cinematography. 4K film grain.",
      ugc: "Handheld camera movement, slightly shaky like a real person filming on their phone. The camera approaches the product from above at a casual angle, moves down to eye level, then slowly circles it. Natural window light creates soft shadows. The product catches light as the camera moves. Authentic TikTok creator aesthetic. Warm color temperature. Casual but engaging.",
      social_ad: "Fast energetic camera movement. Quick zoom-in from wide to extreme close-up of the product. Dynamic lighting pulses between warm and cool tones. The product rotates smoothly on a turntable. Quick cut angles showing the product from multiple dramatic perspectives. Bold rim lighting creates a glowing outline. High contrast. Social media ad energy. Eye-catching motion.",
      lifestyle: "Ultra slow motion footage at 120fps. The product sits in a beautiful golden-hour lit scene. Camera glides smoothly from left to right in a slow tracking shot. Soft wind causes subtle movement in the background. Warm sunlight creates long cinematic shadows. Particles of dust float through light beams. Dreamy shallow depth of field. Premium brand aesthetic. Aspirational lifestyle commercial.",
      product_demo: "Extreme macro close-up shot starting on a product detail. The camera slowly pulls back revealing the full product with smooth mechanical precision. It then rotates 180 degrees showing every angle and texture. Clean white studio background. Even, shadowless lighting that highlights surface materials and textures. Technical precision camera path. Product showcase perfection.",
    };

    const basePrompt = stylePrompts[params.style] || stylePrompts.cinematic;
    let enhancedPrompt = `${basePrompt}`;
    if (params.creative_prompt) {
      enhancedPrompt += ` ${params.creative_prompt}.`;
    }

    // Step 1: Upload the raw image to Fal CDN
    const imageBuffer = Buffer.from(params.imageBase64, "base64");
    const imageBlob = new Blob([imageBuffer], { type: params.imageMimeType || "image/png" });
    const imageFile = new File([imageBlob], "product.png", { type: params.imageMimeType || "image/png" });
    const uploadedUrl = await fal.storage.upload(imageFile);

    // Step 2: Auto-enhance — Run through Bria to get a clean studio shot
    let enhancedImageUrl = uploadedUrl;
    try {
      const briaResult = await fal.run("fal-ai/bria/product-shot", {
        input: {
          image_url: uploadedUrl,
          scene_description: "Ultra-clean professional studio. Solid neutral background. Perfect three-point lighting with soft diffused shadows. High-end commercial product photography.",
          optimize_description: true,
        },
      });
      if (briaResult.data?.image?.url) {
        enhancedImageUrl = briaResult.data.image.url;
      } else if (briaResult.data?.images?.[0]?.url) {
        enhancedImageUrl = briaResult.data.images[0].url;
      }
    } catch (e) {
      console.log("Bria enhance skipped, using original image:", e.message);
      // Continue with the original uploaded image
    }

    // Step 3: Submit to Kling Standard via queue (best quality that actually finishes)
    const { request_id } = await fal.queue.submit("fal-ai/kling-video/v1/standard/image-to-video", {
      input: {
        prompt: enhancedPrompt,
        image_url: enhancedImageUrl,
        duration: params.duration || "5",
        aspect_ratio: params.aspect_ratio || "9:16",
      },
    });

    return { request_id };
  },

  // VIDEO: Check the status of a submitted video job
  async checkVideoStatus(requestId) {
    const endpoint = "fal-ai/kling-video/v1/standard/image-to-video";

    try {
      const statusResult = await fal.queue.status(endpoint, {
        requestId: requestId,
        logs: false,
      });

      if (statusResult.status === "COMPLETED") {
        const result = await fal.queue.result(endpoint, { requestId });
        return {
          status: "COMPLETED",
          url: result.data?.video?.url || result.data?.video_url,
        };
      }

      if (statusResult.status === "FAILED") {
        return { status: "FAILED" };
      }

      return { status: statusResult.status || "IN_PROGRESS" };
    } catch (err) {
      console.error("Status check error:", err.message);
      return { status: "IN_PROGRESS" };
    }
  },

  // TEXT SERVICES: OpenAI
  async generateCopy(params) {
    const prompt = `Write high-converting, punchy performance marketing ad copy (with hooks and headlines) for a product named "${params.product_name}" in the "${params.category}" category. The target audience is: ${params.audience}. Include emojis.`;
    const text = await fetchOpenAI([{ role: "user", content: prompt }]);
    return { success: true, text };
  },

  async generateSEO(params) {
    const prompt = `Write a comprehensive, SEO-optimized blog article about "${params.product_name}". Incorporate these keywords naturally: ${params.keywords}. Structure with H1, H2s, bullet points, and a strong conclusion.`;
    const text = await fetchOpenAI([{ role: "user", content: prompt }]);
    return { success: true, text };
  },

  async generateDescription(params) {
    const prompt = `Write a compelling e-commerce product description for "${params.product_name}". The features are: ${params.features}. Organize it with an attention-grabbing overview paragraph, followed by a bulleted list of 5 key benefits, and ending with a call to action.`;
    const text = await fetchOpenAI([{ role: "user", content: prompt }]);
    return { success: true, text };
  },

  async generateScript(params) {
    const prompt = `Write a 30-to-60-second UGC (User Generated Content) video script for a product named "${params.product_name}". The tone/style should be: ${params.style}. Include timestamps and visual directions in brackets (e.g., [Hold product close to camera - 0:05]), followed by the spoken dialogue. Make sure it has a strong hook in the first 3 seconds, clear visual instructions, and a compelling Call to Action at the end.`;
    const text = await fetchOpenAI([{ role: "user", content: prompt }]);
    return { success: true, text };
  }
};

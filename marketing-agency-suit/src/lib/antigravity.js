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

  // VIDEO: Submit job using official Fal SDK (handles upload + queue properly)
  async submitVideo(params) {
    // Build cinematic prompt based on selected video style
    const stylePrompts = {
      cinematic: "Dramatic cinematic product reveal. Camera slowly orbits around the product. Studio lighting shifts from cool blue to warm gold. Volumetric light rays. Shallow depth of field. Professional commercial quality.",
      ugc: "Authentic UGC-style product video. Slightly handheld camera movement. Natural daylight. Product examined from multiple angles. Warm relatable feel. TikTok native aesthetic.",
      social_ad: "High-energy social media advertisement. Dynamic camera movements. Bold dramatic lighting. Product hero shot. Fast zoom transitions. Attention-grabbing commercial.",
      lifestyle: "Dreamy aspirational lifestyle video. Slow motion footage. Beautiful real-world setting. Golden hour sunlight. Gentle breeze. Cinematic depth of field. Premium brand aesthetic.",
      product_demo: "Detailed product close-up showcase. Macro camera slowly revealing product details and textures. Smooth controlled camera path. Clean neutral background with professional lighting.",
    };

    const basePrompt = stylePrompts[params.style] || stylePrompts.cinematic;
    let enhancedPrompt = `${basePrompt}`;
    if (params.creative_prompt) {
      enhancedPrompt += ` ${params.creative_prompt}.`;
    }
    enhancedPrompt += ` Smooth stable camera movement. High production value.`;

    // Step 1: Upload image to Fal CDN (the SDK handles this properly)
    const imageBuffer = Buffer.from(params.imageBase64, "base64");
    const imageBlob = new Blob([imageBuffer], { type: params.imageMimeType || "image/png" });
    const imageFile = new File([imageBlob], "product.png", { type: params.imageMimeType || "image/png" });
    const uploadedUrl = await fal.storage.upload(imageFile);

    // Step 2: Submit to Fal queue using MiniMax (returns instantly with request_id)
    const { request_id } = await fal.queue.submit("fal-ai/minimax/video-01/image-to-video", {
      input: {
        prompt: enhancedPrompt,
        image_url: uploadedUrl,
      },
    });

    return { request_id };
  },

  // VIDEO: Check the status of a submitted video job
  async checkVideoStatus(requestId) {
    const endpoint = "fal-ai/minimax/video-01/image-to-video";

    try {
      const statusResult = await fal.queue.status(endpoint, {
        requestId: requestId,
        logs: false,
      });

      if (statusResult.status === "COMPLETED") {
        // Fetch the actual result
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

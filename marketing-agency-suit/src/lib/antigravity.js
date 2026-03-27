/**
 * Antigravity API Service - LIVE PRODUCTION
 * Integates with OpenAI (Text) and Fal.ai (Image/Video)
 */

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

  // VIDEO: Fal.ai Kling Pro - Image-to-Video Pipeline
  async generateVideo(params) {
    // Build cinematic prompt based on selected video style
    const stylePrompts = {
      cinematic: "Dramatic cinematic product reveal. Camera slowly orbits 360 degrees around the product. Dramatic studio lighting shifts from cool blue to warm gold. Volumetric light rays. Shallow depth of field with beautiful bokeh. Film grain. Professional commercial quality.",
      ugc: "Authentic UGC-style product video. Slightly handheld camera movement. Natural daylight. Product is picked up, examined, and shown from multiple angles. Warm, relatable feel. TikTok native aesthetic.",
      social_ad: "High-energy social media advertisement. Quick dynamic camera movements. Bold dramatic lighting with color shifts. Product hero shot with particle effects. Fast zoom transitions. Attention-grabbing commercial.",
      lifestyle: "Dreamy aspirational lifestyle video. Slow motion footage. Product in a beautiful real-world setting. Golden hour sunlight. Gentle breeze causing subtle movement. Cinematic depth of field. Premium brand aesthetic.",
      product_demo: "Detailed product close-up showcase. Macro camera slowly revealing product details and textures. Smooth controlled camera path. Clean neutral background with professional lighting. Feature-focused demonstration.",
    };

    const basePrompt = stylePrompts[params.style] || stylePrompts.cinematic;
    let enhancedPrompt = `${basePrompt}`;
    if (params.creative_prompt) {
      enhancedPrompt += ` Additional creative direction: ${params.creative_prompt}.`;
    }
    enhancedPrompt += ` Smooth, stable, professional camera movement. High production value. 4K cinematic quality.`;

    // Build payload for Kling Pro image-to-video
    const payload = {
      prompt: enhancedPrompt,
      image_url: `data:${params.imageMimeType || "image/png"};base64,${params.imageBase64}`,
      duration: params.duration || "5",
      aspect_ratio: params.aspect_ratio || "9:16",
    };

    const falResult = await fetchFal("fal-ai/kling-video/v1/pro/image-to-video", payload);

    return {
      success: true,
      url: falResult.video?.url || falResult.video_url,
    };
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

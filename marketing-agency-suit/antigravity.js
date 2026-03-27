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
  // IMAGE: Fal.ai Flux - Final Boss Multi-Option Pipeline
  async generateImage(params) {
    // Build a rich, detailed prompt based on the selected visual style
    const stylePrompts = {
      studio: "Ultra-clean minimalist studio product photography. White or light gray seamless background. Professional three-point lighting with key light creating defined highlights. Subtle gradient reflection on surface. Shot in 8K, photorealistic, commercial quality.",
      lifestyle: "Lifestyle product photography in a natural, aspirational real-world setting. Warm golden-hour lighting. Product placed naturally on a textured surface (wood, linen, stone). Shallow depth of field with beautiful bokeh background.",
      "3d_render": "Hyper-realistic 3D product render. Floating product with soft ambient occlusion shadows. Glossy reflective surface. Dramatic rim lighting with subtle color gradients in the background. Cinema 4D / Octane quality.",
      luxury: "Luxury high-end product photography. Marble or dark velvet surface. Gold and champagne accent lighting. Crystal-clear reflections. Magazine editorial quality. Vogue / Harper's Bazaar aesthetic.",
      outdoor: "Product placed in a stunning outdoor setting. Natural scenery - tropical beach, mountain vista, or lush garden. Golden sunlight with natural shadows. Product is the hero with nature as the backdrop.",
      neon: "Cyberpunk-inspired product photography with vibrant neon lighting in pink, blue, and purple. Dark moody background with glowing reflections. Futuristic tech aesthetic. Blade Runner vibes.",
    };

    const basePrompt = stylePrompts[params.style] || stylePrompts.studio;
    let enhancedPrompt = `Professional e-commerce product image. ${basePrompt}`;
    if (params.additional_context) {
      enhancedPrompt += ` Additional creative direction: ${params.additional_context}.`;
    }
    enhancedPrompt += ` The product must be the central hero of the image, perfectly lit and in sharp focus. Ultra high resolution, 8K.`;

    // If the user uploaded a base64 image, use image_url for image-to-image
    const payload = {
      prompt: enhancedPrompt,
      image_size: params.aspect_ratio || "square_hd",
      num_images: params.num_images || 1,
      enable_safety_checker: true,
    };

    // If user provided a product photo, attach it as the image reference
    if (params.imageBase64) {
      payload.image_url = `data:${params.imageMimeType || "image/png"};base64,${params.imageBase64}`;
    }

    const falResult = await fetchFal("fal-ai/flux/schnell", payload);

    return {
      success: true,
      url: falResult.images[0].url,
      variants: falResult.images.map(img => img.url),
    };
  },

  // VIDEO: Fal.ai Luma or Kling
  async generateVideo(params) {
    const prompt = `A highly engaging cinematic promotional video featuring this product: ${params.product_name}. ${params.text_prompt}. Video style: ${params.style}. Smooth, stable camera movement.`;
    
    // Using fal-ai Kling video endpoint as an example of a fast text-to-video for products
    const falResult = await fetchFal("fal-ai/kling-video/v1/standard/text-to-video", {
      prompt: prompt,
      aspect_ratio: "16:9",
      duration: "5"
    });

    return {
      success: true,
      url: falResult.video.url || falResult.video_url
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

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
  // IMAGE: Ideogram V3 Replace-Background — Best text/label preservation in the industry
  async generateImage(params) {
    // $1M PRODUCTION PROMPTS — every scene protects product details, name, text, labels
    const styleScenes = {
      studio: "Professional e-commerce product photography studio. Solid pure white seamless background. The product sits perfectly centered on a clean white surface. Soft diffused three-point studio lighting eliminates harsh shadows. A subtle soft reflection appears on the surface below. Even, balanced illumination ensures every label, text, and detail on the product is perfectly sharp, crisp, and fully readable. Magazine-quality commercial product photo. Shot on Phase One IQ4 150MP. 8K resolution.",
      lifestyle: "The product sits naturally on a beautiful textured light oak wood table near a large window. Warm morning golden-hour sunlight streams in from the left, creating soft warm shadows. A small potted eucalyptus plant sits slightly out of focus in the background. Neutral linen fabric is casually draped nearby. All product text, labels, and branding remain perfectly sharp and readable. Aspirational lifestyle editorial photography. Shot on Canon EOS R5.",
      "3d_render": "The product floats centered above a perfectly reflective obsidian black surface. Deep navy blue gradient background transitioning to black. Precise rim lighting in cool electric blue outlines the product edges. Subtle ambient occlusion grounds the product. A faint purple accent light adds depth from behind. All product labels, text, and branding details remain razor-sharp and fully legible. Ultra-premium 3D product visualization. Cinema 4D and Octane render quality.",
      luxury: "The product sits elegantly on a polished dark Emperador marble surface with gold veining. A soft champagne-gold key light from above creates refined highlights. Dark moody background with rich burgundy velvet fabric draped artfully to one side. Subtle crystal light refractions add sophistication. All product text, labels, and branding are perfectly preserved and readable. Luxury fashion house product campaign. Vogue editorial quality.",
      outdoor: "The product sits on a smooth flat stone near a pristine beach shore. Crystal-clear turquoise water is beautifully blurred in the background. Warm golden sunset light wraps around the product from behind, creating a natural rim light. Soft ocean breeze feel. Clean natural sand texture nearby. All product labels, text, and details remain crisp and readable. Premium travel lifestyle brand photography. Shot on Hasselblad X2D.",
      neon: "The product centered on a glossy jet-black surface in a dark environment. Dramatic neon lighting: vivid magenta from the left and electric cyan from the right, creating striking color-split illumination on the product. Subtle neon reflections shimmer on the surface below. Dark atmospheric background with faint purple haze. All product text, branding, and labels remain perfectly sharp and readable. Cyberpunk premium brand aesthetic. High-end tech product launch photography.",
    };

    const scenePrompt = styleScenes[params.style] || styleScenes.studio;
    let fullPrompt = scenePrompt;
    if (params.additional_context) {
      fullPrompt += ` ${params.additional_context}.`;
    }

    // Upload image to Fal CDN first for reliable processing
    const imageBuffer = Buffer.from(params.imageBase64, "base64");
    const imageBlob = new Blob([imageBuffer], { type: params.imageMimeType || "image/png" });
    const imageFile = new File([imageBlob], "product.png", { type: params.imageMimeType || "image/png" });
    const uploadedUrl = await fal.storage.upload(imageFile);

    // Generate with Ideogram V3 — best at preserving product text and labels
    const numImages = params.num_images || 1;
    const result = await fal.run("fal-ai/ideogram/v3/replace-background", {
      input: {
        image_url: uploadedUrl,
        prompt: fullPrompt,
        num_images: numImages,
        rendering_speed: "QUALITY",
      },
    });

    // Extract image URLs from result
    const imageUrls = [];
    if (result.data?.images) {
      result.data.images.forEach((img) => imageUrls.push(img.url));
    } else if (result.data?.image?.url) {
      imageUrls.push(result.data.image.url);
    }

    return {
      success: true,
      url: imageUrls[0],
      variants: imageUrls,
    };
  },

  // VIDEO: Veo 3.1 Fast — Google's latest image-to-video model
  async submitVideo(params) {
    // $1M PRODUCTION PROMPTS — protect product, subtle motion, cinematic quality
    // Rule: Product stays SHARP. Camera does the work. Less is more.
    const stylePrompts = {
      cinematic: "The product remains perfectly still, sharp, and centered in frame with all labels and text fully readable. Camera performs a very slow, smooth dolly push-in from a medium shot to a close-up over the full duration. Subtle studio lighting gradually shifts from cool to warm. A faint reflection shimmers on the surface beneath the product. Extremely shallow depth of field keeps the product razor-sharp while the background gently blurs. No morphing, no distortion. Professional TV commercial quality. Photorealistic.",
      ugc: "The product stays perfectly still on a clean surface with all details and text readable. Camera has subtle natural handheld micro-movements as if filmed on a phone at close range. Warm natural window light casts a soft shadow that shifts slightly. The perspective slowly changes from straight-on to a gentle 15-degree angle. Authentic, unfiltered, real feel. No dramatic effects. The product is the star. TikTok product review aesthetic.",
      social_ad: "The product remains centered and perfectly sharp with all labels readable. Camera starts tight on the product and smoothly zooms out to reveal a clean styled surface. A subtle light sweep moves across the product from left to right, creating a premium highlight gleam on the packaging. Minimal motion, maximum impact. Clean, bold, scroll-stopping. High contrast. Social media ad with premium brand energy. Product details must stay crisp.",
      lifestyle: "The product sits perfectly still in a beautiful natural setting. All product text and labels remain sharp and readable. Camera performs a very slow lateral tracking movement from left to right. Golden hour warm sunlight gently shifts across the scene. Subtle atmospheric depth in the background. Soft natural bokeh. The product catches a warm highlight. Aspirational, premium, editorial quality. Photorealistic lifestyle commercial.",
      product_demo: "Extreme close-up of the product filling the frame. All text, labels, and details are perfectly sharp and readable throughout. Camera performs a very slow, controlled pull-back revealing the full product on a clean white surface. Lighting is even and professional with soft shadows. No dramatic effects. The focus is purely on showcasing the product details, materials, and craftsmanship. Technical product photography in motion. Clean, precise, premium.",
    };

    const basePrompt = stylePrompts[params.style] || stylePrompts.cinematic;
    let finalPrompt = basePrompt;
    if (params.creative_prompt) {
      finalPrompt += ` ${params.creative_prompt}.`;
    }

    // Step 1: Upload raw product image to Fal CDN (preserves original quality)
    const imageBuffer = Buffer.from(params.imageBase64, "base64");
    const imageBlob = new Blob([imageBuffer], { type: params.imageMimeType || "image/png" });
    const imageFile = new File([imageBlob], "product.png", { type: params.imageMimeType || "image/png" });
    const uploadedUrl = await fal.storage.upload(imageFile);

    // Step 2: Submit to Veo 3.1 Fast (Google's best — 4K cinematic realism)
    const { request_id } = await fal.queue.submit("fal-ai/veo3.1/fast/image-to-video", {
      input: {
        prompt: finalPrompt,
        image_url: uploadedUrl,
      },
    });

    return { request_id };
  },

  // VIDEO: Check Veo 3.1 job status
  async checkVideoStatus(requestId) {
    const endpoint = "fal-ai/veo3.1/fast/image-to-video";

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

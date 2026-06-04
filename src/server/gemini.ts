import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

export const isGeminiEnabled = !!(
  (geminiApiKey && geminiApiKey.trim() !== "" && geminiApiKey !== "YOUR_GEMINI_API_KEY") ||
  (groqApiKey && groqApiKey.trim() !== "")
);

const apiKey = groqApiKey || geminiApiKey;
const isGroq = !!(apiKey && apiKey.startsWith("gsk_"));

let genAI: GoogleGenerativeAI | null = null;
if (isGeminiEnabled && !isGroq) {
  genAI = new GoogleGenerativeAI(apiKey!);
}

/**
 * Generate text content using Gemini 1.5 Flash or Groq Llama 3.3.
 */
export async function generateAiText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  if (!isGeminiEnabled || !apiKey) {
    console.warn("AI API KEY is not set. Using simulated response fallback.");
    return `[FALLBACK SIMULATION] In a live environment with an API Key, this response is generated dynamically. Response to: "${prompt.slice(0, 50)}..."`;
  }

  if (isGroq) {
    try {
      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as any;
      return data.choices[0].message.content || "";
    } catch (error) {
      console.error("Error generating text with Groq:", error);
      throw error;
    }
  }

  // Fallback to Gemini
  if (!genAI) {
    throw new Error("Gemini AI client is not initialized.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw error;
  }
}

/**
 * Generate structured JSON content using Gemini 1.5 Flash or Groq Llama 3.3.
 */
export async function generateAiJson<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  if (!isGeminiEnabled || !apiKey) {
    console.warn("AI API KEY is not set. Using simulated JSON fallback.");
    throw new Error("AI is not configured. Fallback required.");
  }

  if (isGroq) {
    try {
      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq JSON API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as any;
      const text = data.choices[0].message.content || "";
      return JSON.parse(text) as T;
    } catch (error) {
      console.error("Error generating JSON with Groq:", error);
      throw error;
    }
  }

  // Fallback to Gemini
  if (!genAI) {
    throw new Error("Gemini AI client is not initialized.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Error generating JSON with Gemini:", error);
    throw error;
  }
}

/**
 * Helper to start a multi-turn chat session with Gemini or Groq Llama 3.3.
 */
export function startGeminiChat(
  history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  systemInstruction?: string
): any {
  if (!isGeminiEnabled || !apiKey) {
    return null;
  }

  if (isGroq) {
    const conversationHistory = history.map(h => ({
      role: h.role === "model" ? "assistant" as const : "user" as const,
      content: h.parts.map(p => p.text).join("\n"),
    }));

    return {
      sendMessage: async (message: string) => {
        conversationHistory.push({ role: "user", content: message });

        const messages: any[] = [];
        if (systemInstruction) {
          messages.push({ role: "system", content: systemInstruction });
        }
        messages.push(...conversationHistory);

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq Chat error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as any;
        const reply = data.choices[0].message.content || "";

        conversationHistory.push({ role: "assistant", content: reply });

        return {
          response: {
            text: () => reply,
          },
        };
      }
    };
  }

  // Fallback to Gemini
  if (!genAI) {
    return null;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction,
  });

  return model.startChat({
    history,
  });
}

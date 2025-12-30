import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // In a real app, handle missing key gracefully
const ai = new GoogleGenAI({ apiKey });

export const generateCreativeSuggestion = async (
  context: string,
  modelName: string = 'gemini-3-pro-preview'
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: context,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for deeper musical reasoning
      }
    });
    return response.text || "No suggestion generated.";
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    return "Error generating suggestion.";
  }
};

export const generateAnalysis = async (
  context: string,
  imageBase64?: string
): Promise<string> => {
  try {
    const parts: any[] = [{ text: context }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
      }
    });
    return response.text || "Analysis complete.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error analyzing content.";
  }
};

export const transcribeAudio = async (
  audioBase64: string,
  mimeType: string = 'audio/wav'
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          { text: "Transcribe this audio exactly." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    return "Error transcribing audio.";
  }
};

export const generateCoverArt = async (
  prompt: string,
  size: '1K' | '2K' | '4K' = '1K'
): Promise<string | null> => {
  try {
    const model = size === '1K' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
    
    // Using generateContent for nano banana series as per guidelines
    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: {
                aspectRatio: '1:1',
                imageSize: size
            }
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const generateLyrics = async (
  topic: string,
  genre: string,
  mood: string
): Promise<string> => {
  try {
    const prompt = `Write song lyrics. 
    Topic: ${topic}
    Genre: ${genre}
    Mood: ${mood}
    
    Structure the response with Verse 1, Chorus, Verse 2, Chorus, Bridge, Outro.
    Include chords in brackets if appropriate for the genre.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Higher budget for creative writing
        temperature: 1.2 // Higher creativity
      }
    });
    return response.text || "Could not generate lyrics.";
  } catch (error) {
    console.error("Gemini Lyrics Error:", error);
    return "Error generating lyrics. Please try again.";
  }
};
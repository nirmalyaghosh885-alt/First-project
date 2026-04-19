import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getCoachingCue(
  userName: string,
  exerciseName: string,
  currentStatus: string,
  repCount: number
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are AuraGym AI, a motivating and precise fitness coach. 
      The user ${userName} is doing ${exerciseName}. 
      Current status: ${currentStatus}. 
      Completed reps: ${repCount}.
      
      Generate a short (max 10 words) coaching cue. 
      If status is "POOR_FORM", give a technical correction. 
      If status is "GOOD", give encouragement. 
      Be concise, energetic, and call the user by name sometimes.`,
    });

    return response.text.replace(/["']/g, "") || "Keep pushing, " + userName + "!";
  } catch (error) {
    console.error("Gemini Coaching Cue Error:", error);
    return "Great job, keep going!";
  }
}

export async function analyzeProp(objectName: string): Promise<{ weight: number; reasoning: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Estimate the full weight in kilograms for a typical Indian household item: "${objectName}". 
      Return JSON format: { "weight": number, "reasoning": "string" }.
      For example, a 5L Bisleri bottle is 5.2kg (including plastic). A full standard school backpack is around 8-10kg.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    return { weight: 5, reasoning: "Standard estimation for medium heavy object." };
  }
}
